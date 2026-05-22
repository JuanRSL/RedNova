const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    subforums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subforum',
    }],
    isPrivate: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Forum', ForumSchema);
