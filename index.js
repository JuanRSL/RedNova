const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.URI)
  .then(() => console.log("¡Conexión exitosa a MongoDB Atlas!"))
  .catch(err => console.error(" Error de conexión:", err));

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando y conectado a MongoDB!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
