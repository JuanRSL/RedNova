const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// CREAR COMENTARIO
exports.createComment = async (req, res) => {
    try {
        const { content, postId, parentComment } = req.body;
        const authorId = req.user.id;

        // Validar contenido
        if (!content || !content.trim()) {
            return res.status(400).json({
                message: 'El contenido del comentario es obligatorio'
            });
        }

        // Validar postId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'ID de post inválido'
            });
        }

        // Verificar que el usuario exista
        const user = await User.findById(authorId);

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el post exista
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post no encontrado'
            });
        }

        // Validar parentComment si existe
        if (parentComment) {
            if (!mongoose.Types.ObjectId.isValid(parentComment)) {
                return res.status(400).json({
                    message: 'ID de comentario padre inválido'
                });
            }

            const parentExists = await Comment.findById(parentComment);

            if (!parentExists) {
                return res.status(404).json({
                    message: 'Comentario padre no encontrado'
                });
            }
        }

        // Crear comentario
        const newComment = new Comment({
            content: content.trim(),
            author: authorId,
            post: postId,
            parentComment: parentComment || null
        });

        await newComment.save();

        // Populate para devolver info útil
        await newComment.populate('author', 'username roles');

        res.status(201).json({
            message: 'Comentario publicado exitosamente',
            comment: newComment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el comentario',
            error: error.message
        });
    }
};
// OBTENER COMENTARIOS DE UN POST
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: 'ID de post inválido'
            });
        }

        // Verificar que el post exista
        const postExists = await Post.findById(postId);

        if (!postExists) {
            return res.status(404).json({
                message: 'Post no encontrado'
            });
        }

        // Paginación básica
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Obtener comentarios
        const comments = await Comment.find({
            post: postId
        })
            .populate('author', 'username roles')
            .populate('parentComment')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Total de comentarios
        const totalComments = await Comment.countDocuments({
            post: postId
        });

        res.status(200).json({
            totalComments,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit),
            comments
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener comentarios',
            error: error.message
        });
    }
};
// ELIMINAR COMENTARIO
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: 'ID de comentario inválido'
            });
        }

        // Buscar comentario
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comentario no encontrado'
            });
        }

        // Buscar usuario
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Permisos
        const isAuthor = comment.author.toString() === userId;
        const isModerator = user.roles?.includes('moderator');
        const isAdmin = user.roles?.includes('admin');

        if (!isAuthor && !isModerator && !isAdmin) {
            return res.status(403).json({
                message: 'No tienes permiso para eliminar este comentario'
            });
        }

        // Eliminar respuestas hijas opcionalmente
        await Comment.deleteMany({
            parentComment: commentId
        });

        // Eliminar comentario principal
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            message: 'Comentario eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar el comentario',
            error: error.message
        });
    }
};
//Upvote un comentario (Likear)
exports.upvoteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: 'ID de comentario inválido'
            });
        }

        // Buscar comentario
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comentario no encontrado'
            });
        }

        const alreadyUpvoted = comment.upvotes
            .map(id => id.toString())
            .includes(userId);

        // Si ya dio upvote -> quitar
        if (alreadyUpvoted) {
            comment.upvotes.pull(userId);

            await comment.save();

            return res.status(200).json({
                message: 'Upvote removido',
                upvotes: comment.upvotes.length,
                downvotes: comment.downvotes.length
            });
        }

        // Quitar downvote si existe
        comment.downvotes.pull(userId);

        // Agregar upvote
        comment.upvotes.addToSet(userId);

        await comment.save();

        res.status(200).json({
            message: 'Upvote agregado',
            upvotes: comment.upvotes.length,
            downvotes: comment.downvotes.length
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al dar upvote',
            error: error.message
        });
    }
};
//Downvote comentario
exports.downvoteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({
                message: 'ID de comentario inválido'
            });
        }

        // Buscar comentario
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                message: 'Comentario no encontrado'
            });
        }

        const alreadyDownvoted = comment.downvotes
            .map(id => id.toString())
            .includes(userId);

        // Si ya dio downvote -> quitar
        if (alreadyDownvoted) {
            comment.downvotes.pull(userId);

            await comment.save();

            return res.status(200).json({
                message: 'Downvote removido',
                upvotes: comment.upvotes.length,
                downvotes: comment.downvotes.length
            });
        }

        // Quitar upvote si existe
        comment.upvotes.pull(userId);

        // Agregar downvote
        comment.downvotes.addToSet(userId);

        await comment.save();

        res.status(200).json({
            message: 'Downvote agregado',
            upvotes: comment.upvotes.length,
            downvotes: comment.downvotes.length
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al dar downvote',
            error: error.message
        });
    }
};
