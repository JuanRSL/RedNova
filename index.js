const express = require('express'); // 1. Importar express
const app = express();              // 2. Crear la instancia de la app
const PORT = 3000;                  // 3. Definir el puerto

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
