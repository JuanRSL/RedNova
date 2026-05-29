require('dotenv').config();
const mongoose = require('mongoose');
const Forum = require('../models/Forum');

const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

async function checkForums() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const forums = await Forum.find({}).select('name slug description subforums');
    
    console.log('📋 Foros en DB:');
    forums.forEach(f => {
      console.log(`- Nombre: ${f.name}`);
      console.log(`  Slug: ${f.slug}`);
      console.log(`  Descripción: ${f.description}`);
      console.log(`  Cantidad de subforos: ${f.subforums ? f.subforums.length : 0}`);
      console.log('  ----------------------------');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error al consultar foros:', error.message);
    process.exit(1);
  }
}

checkForums();