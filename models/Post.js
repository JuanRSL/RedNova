const moongose = require('mongoose');

const PostSchema = new moongose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subforum: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'subforum',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    uptvotes: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    downtvotes: [{
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    score: {
        type: Number,
        default: 0,
    },
});

module.exports = moongose.model('Post', PostSchema);