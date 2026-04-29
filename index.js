const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.URI)
  .then(() => console.log("¡Conexión exitosa a MongoDB Atlas!"))
  .catch(err => console.error(" Error de conexión:", err));
//
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando y conectado a MongoDB!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// ... después de los middlewares de express
app.use(express.json()); // ¡Súper importante para recibir datos del body!

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Usar rutas
app.use('/api/usuarios', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comentarios', commentRoutes);
