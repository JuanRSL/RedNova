const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [emailRegex, 'Email inválido'],
        validate: {
            validator: function (value) {
                return typeof value === 'string' && value.trim().length > 0;
            },
            message: 'Email no puede estar vacío',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate: {
            validator: function (value) {
                if (!this.isModified('password')) return true;
                if (typeof value !== 'string') return false;
                if (/^\$2[aby]\$/.test(value)) return true;
                return /(?=.*[A-Z])(?=.*\d)/.test(value);
            },
            message: 'La contraseña debe contener al menos una mayúscula y un número',
        },
    },
    roles: {
        type: [{ type: String, enum: ['user', 'admin', 'moderator'] }],
        default: ['user'],
    },
    followingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followingSubforums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subforum' }],
    followingForums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }],
    moderatedSubforums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subforum' }],
    moderatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    moderatedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);