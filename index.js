require('dotenv').config(); // 1. Lee la configuración del archivo .env (Importante antes de traer los datos del archivo)

const express = require('express'); // 2. Importar express
const app = express();              // 3. Crear la instancia de la app
const PORT = process.env.PORT || 3000; // 4. Definir el puerto desde archivo .env                  

const mongoose = require('mongoose'); // 5. Conecta con la BBDD

// ... después de los middlewares de express
app.use(express.json()); // ¡Súper importante para recibir datos del body!

//Conexión a MongoDB
mongoose.connect(process.env.URI)
  .then(()=> console.log("Conectado a BBDD"))
  .catch(err => console.error("Error al conectar a BBDD", err));
  
//Conexión al Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Usar rutas
app.use('/api/usuarios', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comentarios', commentRoutes);

