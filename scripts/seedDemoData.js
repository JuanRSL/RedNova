require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Forum = require('../models/Forum');
const Subforum = require('../models/Subforum');
const User = require('../models/User');
const Post = require('../models/Post');

const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

const forumSpecs = [
  {
    name: 'Tecnologia',
    slug: 'tecnologia',
    description: 'Desarrollo, IA, hardware, seguridad y herramientas digitales.',
  },
  {
    name: 'Aprendizaje',
    slug: 'aprendizaje',
    description: 'Guias, dudas, recursos y conversaciones para estudiar mejor.',
  },
  {
    name: 'Vida diaria',
    slug: 'vida-diaria',
    description: 'Preguntas practicas, experiencias y consejos cotidianos.',
  },
];

const subforumSpecs = [
  {
    name: 'Desarrollo web',
    slug: 'desarrollo-web',
    forumSlug: 'tecnologia',
    description: 'Frontend, backend, bases de datos, despliegues y arquitectura.',
  },
  {
    name: 'IA y herramientas',
    slug: 'ia-herramientas',
    forumSlug: 'tecnologia',
    description: 'Prompts, automatizacion, modelos y flujos de trabajo con IA.',
  },
  {
    name: 'Metodos de estudio',
    slug: 'metodos-estudio',
    forumSlug: 'aprendizaje',
    description: 'Tecnicas para aprender, tomar notas y preparar proyectos.',
  },
  {
    name: 'Preguntas cotidianas',
    slug: 'preguntas-cotidianas',
    forumSlug: 'vida-diaria',
    description: 'Dudas rapidas con respuestas claras y utiles.',
  },
];

const postSpecs = [
  {
    title: 'Como organizar un backend Express antes de que crezca demasiado',
    content:
      'Separar rutas, controladores, modelos y middlewares ayuda a que el proyecto siga siendo facil de leer. Tambien conviene centralizar variables de entorno y errores comunes.',
    subforumSlug: 'desarrollo-web',
    score: 12,
  },
  {
    title: 'Que tareas vale la pena automatizar con IA en un proyecto pequeno',
    content:
      'Documentacion, pruebas repetitivas, generacion de datos de ejemplo y revisiones de consistencia suelen dar buen retorno sin complicar la arquitectura.',
    subforumSlug: 'ia-herramientas',
    score: 9,
  },
  {
    title: 'Metodo simple para aprender una tecnologia nueva sin saturarse',
    content:
      'Elige un objetivo concreto, construye algo pequeno, escribe lo que no entiendes y vuelve a leer la documentacion solo cuando aparezca una duda real.',
    subforumSlug: 'metodos-estudio',
    score: 15,
  },
  {
    title: 'Que deberia tener una buena publicacion en RedNova',
    content:
      'Un titulo claro, contexto suficiente y una pregunta concreta hacen que otros usuarios puedan responder sin adivinar el problema.',
    subforumSlug: 'preguntas-cotidianas',
    score: 7,
  },
];

async function upsertDemoData() {
  if (!MONGO_URI) {
    throw new Error('Falta MONGO_URI, URI o URI_mongodb en .env');
  }

  await mongoose.connect(MONGO_URI);

  const password = await bcrypt.hash('rednova123', 10);
  const demoUser = await User.findOneAndUpdate(
    { email: 'demo@rednova.local' },
    {
      $setOnInsert: {
        username: 'rednova_demo',
        email: 'demo@rednova.local',
        password,
        roles: ['user'],
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  const forumsBySlug = new Map();
  for (const forumSpec of forumSpecs) {
    const forum = await Forum.findOneAndUpdate(
      { slug: forumSpec.slug },
      { $setOnInsert: forumSpec },
      { upsert: true, returnDocument: 'after' }
    );
    forumsBySlug.set(forum.slug, forum);
  }

  const subforumsBySlug = new Map();
  for (const subforumSpec of subforumSpecs) {
    const forum = forumsBySlug.get(subforumSpec.forumSlug);
    if (!forum) continue;

    const subforum = await Subforum.findOneAndUpdate(
      { slug: subforumSpec.slug },
      {
        $setOnInsert: {
          name: subforumSpec.name,
          slug: subforumSpec.slug,
          description: subforumSpec.description,
          forum: forum._id,
          moderators: [demoUser._id],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Forum.findByIdAndUpdate(forum._id, { $addToSet: { subforums: subforum._id } });
    subforumsBySlug.set(subforum.slug, subforum);
  }

  for (const postSpec of postSpecs) {
    const subforum = subforumsBySlug.get(postSpec.subforumSlug);
    if (!subforum) continue;

    await Post.findOneAndUpdate(
      { title: postSpec.title },
      {
        $setOnInsert: {
          title: postSpec.title,
          content: postSpec.content,
          author: demoUser._id,
          forum: subforum.forum,
          subforum: subforum._id,
          score: postSpec.score,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  console.log('Datos demo de RedNova listos.');
}

upsertDemoData()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
