// controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User');

// Controlador para eliminar un post con validación de permisos
exports.deletePost = async (req, res) => {
    try {
        const { postId, userId } = req.body;
        //Buscar el post y el usuario
        const post = await Post.findById(postId);
        const user = await User.findById(userId);

        //Validar que el post y el usuario existan
        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        //Definir permisos
        const isAuthor = post.author.toString() === userId;
        // Usamos optional chaining (?.) por si roles no está definido
        const isModerator = user.roles?.includes('moderator');
        const isAdmin = user.roles?.includes('admin');

        //Ejecutar acción
        if (isAuthor || isModerator || isAdmin) {
            await Post.findByIdAndDelete(postId);
            return res.status(200).json({ message: 'Post eliminado exitosamente' }); // Agregado return para evitar errores
        } else {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este post' });
        }

    } catch (error) { // Manejo de errores
        res.status(500).json({ message: 'Error al eliminar el post', error: error.message });
    }

    // Controlador para votar un post
    exports.votePost = async (req, res) => {
        try {
            // Extraer datos del cuerpo de la solicitud
            const { postId, userId, voteType } = req.body;
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post no encontrado' });
            }
            // Eliminar el voto anterior del usuario (si existe)
            post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
            post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

            // Agregar el nuevo voto
            if (voteType === 'up') {
                post.upvotes.push(userId);
            } else if (voteType === 'down') {
                post.downvotes.push(userId);
            }
            post.score = post.upvotes.length - post.downvotes.length;

            // Guardar el post actualizado
            await post.save();
            res.status(200).json({ message: 'Voto registrado', score: post.score });
        } catch (error) {
            res.status(500).json({ message: 'Error al votar el post', error: error.message });
        }
    };

};