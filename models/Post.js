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
});

module.exports = moongose.model('Post', PostSchema);