require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Forum = require('../models/Forum');
const Subforum = require('../models/Subforum');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

const userSpecs = [
  {
    username: 'rednova_demo',
    email: 'demo@rednova.local',
    roles: ['user'],
  },
  {
    username: 'techmentor',
    email: 'techmentor@rednova.local',
    roles: ['user'],
  },
  {
    username: 'studybuddy',
    email: 'studybuddy@rednova.local',
    roles: ['user'],
  },
  {
    username: 'admin_rednova',
    email: 'admin@rednova.local',
    roles: ['admin', 'moderator'],
  },
];

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
    authorEmail: 'techmentor@rednova.local',
    score: 12,
  },
  {
    title: 'Que tareas vale la pena automatizar con IA en un proyecto pequeno',
    content:
      'Documentacion, pruebas repetitivas, generacion de datos de ejemplo y revisiones de consistencia suelen dar buen retorno sin complicar la arquitectura.',
    subforumSlug: 'ia-herramientas',
    authorEmail: 'studybuddy@rednova.local',
    score: 9,
  },
  {
    title: 'Metodo simple para aprender una tecnologia nueva sin saturarse',
    content:
      'Elige un objetivo concreto, construye algo pequeno, escribe lo que no entiendes y vuelve a leer la documentacion solo cuando aparezca una duda real.',
    subforumSlug: 'metodos-estudio',
    authorEmail: 'rednova_demo@rednova.local',
    score: 15,
  },
  {
    title: 'Que deberia tener una buena publicacion en RedNova',
    content:
      'Un titulo claro, contexto suficiente y una pregunta concreta hacen que otros usuarios puedan responder sin adivinar el problema.',
    subforumSlug: 'preguntas-cotidianas',
    authorEmail: 'admin@rednova.local',
    score: 7,
  },
];

const commentSpecs = [
  {
    content:
      'Me gusta la idea de mantener el backend modular. Una carpeta de rutas y otra de controladores facilita los tests.',
    authorEmail: 'rednova_demo@rednova.local',
    postTitle: 'Como organizar un backend Express antes de que crezca demasiado',
  },
  {
    content:
      'Tambien yo prefiero tener un servicio separado para la conexion a Mongo y otro para la logica de negocio.',
    authorEmail: 'studybuddy@rednova.local',
    postTitle: 'Como organizar un backend Express antes de que crezca demasiado',
    parentCommentIndex: 0,
  },
  {
    content:
      'Una pregunta: ¿que estrategia usas para manejar errores de validacion en los endpoints?',
    authorEmail: 'techmentor@rednova.local',
    postTitle: 'Que deberia tener una buena publicacion en RedNova',
  },
  {
    content:
      'A veces vale la pena crear un helper que normalice errores antes de enviarlos al cliente.',
    authorEmail: 'admin@rednova.local',
    postTitle: 'Que deberia tener una buena publicacion en RedNova',
  },
];

const reportSpecs = [
  {
    contentType: 'Post',
    postTitle: 'Que deberia tener una buena publicacion en RedNova',
    reason: 'El contenido parece demasiado generico y no aporta una pregunta concreta.',
    reportedByEmail: 'studybuddy@rednova.local',
  },
  {
    contentType: 'Comment',
    commentIndex: 0,
    reason: 'Este comentario es demasiado vago y no responde directamente al tema.',
    reportedByEmail: 'techmentor@rednova.local',
  },
];

async function upsertDemoData() {
  if (!MONGO_URI) {
    throw new Error('Falta MONGO_URI, URI o URI_mongodb en .env');
  }

  await mongoose.connect(MONGO_URI);

  const password = await bcrypt.hash('RedNova123', 10);
  const usersByEmail = new Map();

  for (const userSpec of userSpecs) {
    const user = await User.findOneAndUpdate(
      { email: userSpec.email },
      {
        $setOnInsert: {
          username: userSpec.username,
          email: userSpec.email,
          password,
          roles: userSpec.roles,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    usersByEmail.set(user.email, user);
  }

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
          moderators: [usersByEmail.get('admin@rednova.local')._id],
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    await Forum.findByIdAndUpdate(forum._id, { $addToSet: { subforums: subforum._id } });
    subforumsBySlug.set(subforum.slug, subforum);
  }

  const postsByTitle = new Map();
  for (const postSpec of postSpecs) {
    const subforum = subforumsBySlug.get(postSpec.subforumSlug);
    const author = usersByEmail.get(postSpec.authorEmail);
    if (!subforum || !author) continue;

    const post = await Post.findOneAndUpdate(
      { title: postSpec.title },
      {
        $setOnInsert: {
          title: postSpec.title,
          content: postSpec.content,
          author: author._id,
          forum: subforum.forum,
          subforum: subforum._id,
          score: postSpec.score,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    postsByTitle.set(post.title, post);
  }

  const comments = [];
  for (const [index, commentSpec] of commentSpecs.entries()) {
    const post = postsByTitle.get(commentSpec.postTitle);
    const author = usersByEmail.get(commentSpec.authorEmail);
    if (!post || !author) continue;

    const commentData = {
      content: commentSpec.content,
      author: author._id,
      post: post._id,
    };

    if (typeof commentSpec.parentCommentIndex === 'number') {
      const parentComment = comments[commentSpec.parentCommentIndex];
      if (parentComment) commentData.parentComment = parentComment._id;
    }

    const comment = await Comment.findOneAndUpdate(
      { content: commentSpec.content, post: post._id },
      {
        $setOnInsert: commentData,
      },
      { upsert: true, returnDocument: 'after' }
    );

    comments.push(comment);
    await Post.findByIdAndUpdate(post._id, { $addToSet: { comments: comment._id } });
  }

  for (const reportSpec of reportSpecs) {
    let contentId = null;

    if (reportSpec.contentType === 'Post') {
      const post = postsByTitle.get(reportSpec.postTitle);
      if (post) contentId = post._id;
    } else if (reportSpec.contentType === 'Comment') {
      const comment = comments[reportSpec.commentIndex];
      if (comment) contentId = comment._id;
    }

    const reportedBy = usersByEmail.get(reportSpec.reportedByEmail);
    if (!contentId || !reportedBy) continue;

    await Report.findOneAndUpdate(
      { contentId, contentType: reportSpec.contentType, reportedBy: reportedBy._id },
      {
        $setOnInsert: {
          contentId,
          contentType: reportSpec.contentType,
          reportedBy: reportedBy._id,
          reason: reportSpec.reason,
          resolved: false,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const demoUser = usersByEmail.get('demo@rednova.local');
  await User.findByIdAndUpdate(demoUser._id, {
    $addToSet: {
      followingForums: forumsBySlug.get('tecnologia')._id,
      followingSubforums: subforumsBySlug.get('desarrollo-web')._id,
      followingUsers: usersByEmail.get('techmentor@rednova.local')._id,
    },
  });

  await Subforum.findByIdAndUpdate(subforumsBySlug.get('desarrollo-web')._id, {
    $addToSet: { followers: demoUser._id },
  });

  await Forum.findByIdAndUpdate(forumsBySlug.get('tecnologia')._id, {
    $addToSet: { moderators: usersByEmail.get('admin@rednova.local')._id },
  });

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
