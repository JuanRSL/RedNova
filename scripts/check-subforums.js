require('dotenv').config();
const mongoose = require('mongoose');
const Subforum = require('../models/Subforum');
const Forum = require('../models/Forum');

const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

async function checkSubforums() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Buscamos los subforos y traemos el nombre del foro padre
    const subforums = await Subforum.find({})
      .populate('forum', 'name')
      .select('name slug description forum');
    
    console.log('📋 Subforos en DB:');
    subforums.forEach(sf => {
      console.log(`- Nombre: ${sf.name}`);
      console.log(`  Slug: ${sf.slug}`);
      console.log(`  Foro Padre: ${sf.forum ? sf.forum.name : 'No asignado'}`);
      console.log(`  Descripción: ${sf.description}`);
      console.log('  ----------------------------');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error al consultar subforos:', error.message);
    process.exit(1);
  }
}

checkSubforums();
