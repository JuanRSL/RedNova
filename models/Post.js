<<<<<<< HEAD
const mongoose = require('mongoose'); // Corregido: 'mongoose' (antes moongose)
=======
const mongoose = require('mongoose');
>>>>>>> juanrodriguez

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true // Opcional: elimina espacios innecesarios
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subforum: {
        type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
        ref: 'Subforum', // Sugerido: Capitalizar si el modelo se llama 'Subforum'
=======
        ref: 'Subforum',
>>>>>>> juanrodriguez
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
<<<<<<< HEAD
    upvotes: [{ // Corregido: 'upvotes' (antes uptvotes)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    downvotes: [{ // Corregido: 'downvotes' (antes downtvotes)
=======
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    downvotes: [{
>>>>>>> juanrodriguez
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    score: {
        type: Number,
        default: 0,
    },
});

<<<<<<< HEAD
module.exports = mongoose.model('Post', PostSchema);
=======
module.exports = mongoose.model('Post', PostSchema);
>>>>>>> juanrodriguez
