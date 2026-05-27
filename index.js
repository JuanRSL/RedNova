require('dotenv').config(); // 1. Lee la configuración del archivo .env (Importante antes de traer los datos del archivo)

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

const mongoose = require('mongoose');

app.use(express.json());

// CORS: permite usar redNovaTest.html desde file:// o otro puerto
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Importar rutas (antes de listen)
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const forumRoutes = require('./routes/forumRoutes');
const subforumRoutes = require('./routes/subforumRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/usuarios', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comentarios', commentRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/subforums', subforumRoutes);
app.use('/api/reports', reportRoutes);

// Tester en el mismo origen que la API (evita problemas de CORS)
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'redNovaTest.html'));
});

const startServer = async () => {
  if (!MONGO_URI) {
    console.error('Falta la variable MONGO_URI, URI o URI_mongodb en el archivo .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a BBDD');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Tester API: http://localhost:${PORT}/test`);
    });
  } catch (err) {
    console.error('Error al conectar a BBDD', err.message || err);
    process.exit(1);
  }
};

startServer();
