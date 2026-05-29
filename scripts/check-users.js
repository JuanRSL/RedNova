require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.URI || process.env.URI_mongodb;

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const users = await User.find({}).select('email roles password');
    
    console.log('📋 Usuarios en DB:');
    users.forEach(u => {
      console.log(`- ${u.email}`);
      console.log(`  Roles: ${u.roles.join(', ')}`);
      console.log(`  Password hash: ${u.password.substring(0, 30)}...`);
      console.log(`  Longitud hash: ${u.password.length}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error al consultar usuarios:', error.message);
    process.exit(1);
  }
}

checkUsers();