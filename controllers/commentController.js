const Comment = require('../models/Comment');
const Post = require('../models/Post');


// CONTROLADOR PARA CREAR UN COMENTARIO
exports.createComment = async (req, res) => {
    try {
        const { content, authorId, postId } = req.body;
        // Verificar que el post exista
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }
        // Crear un nuevo comentario
        const newComment = new Comment({
            content,
            author: authorId,
            post: postId
        });
        // Guardar el comentario
        await newComment.save();
        res.status(201).json({ message: 'Comentario publicado', newComment });
    } catch (error) {
        res.status(500).json({ message: 'Error al comentar', error: error.message });
    }
};
// CONTROLADOR PARA OBTENER LOS COMENTARIOS DE UN POST
exports.getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comentarios' });
    }
};