const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'moderator'],
        default: ['user'],
    },
    moderatedSubforums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subforum' }],
    moderatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    moderatedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],  
});

module.exports = mongoose.model('User', userSchema);