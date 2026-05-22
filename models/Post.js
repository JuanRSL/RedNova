const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
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
        ref: 'Subforum',
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
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    score: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Post', PostSchema);