const Post = require('../models/Post');
const User = require('../models/User');
const Subforum = require('../models/Subforum');

// --- CONTROLADOR PARA ELIMINAR UN POST ---
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        
        const post = await Post.findById(postId);
        const user = await User.findById(userId);

        if (!post) return res.status(404).json({ message: 'Post no encontrado' });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        const isAuthor = post.author.toString() === userId;
        const isModerator = user.roles?.includes('moderator');
        const isAdmin = user.roles?.includes('admin');

        if (isAuthor || isModerator || isAdmin) {
            await Post.findByIdAndDelete(postId);
            return res.status(200).json({ message: 'Post eliminado exitosamente' });
        } else {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este post' });
        }

    } catch (error) { 
        res.status(500).json({ message: 'Error al eliminar el post', error: error.message });
    }
}; 

// --- CONTROLADOR PARA VOTAR UN POST ---
exports.votePost = async (req, res) => {
    try {
        const { postId, voteType } = req.body;
        const userId = req.user.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post no encontrado' });
        }

        // Eliminar el voto anterior del usuario
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

        // Agregar el nuevo voto
        if (voteType === 'up') {
            post.upvotes.push(userId);
        } else if (voteType === 'down') {
            post.downvotes.push(userId);
        }

        // Recalcular el puntaje
        post.score = post.upvotes.length - post.downvotes.length;
        await post.save();

        // Respuesta segura: No enviamos upvotes/downvotes para mantener la privacidad
        res.status(200).json({ 
            message: 'Voto registrado', 
            score: post.score 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al votar el post', error: error.message });
    }
}; 

// CONTROLADOR PARA CREAR UN POST
exports.createPost = async (req, res) => {
    try {
        const { title, content, subforum, forum } = req.body;
        const author = req.user.id;
        let forumId = forum;

        if (!title || !content || !subforum) {
            return res.status(400).json({ message: 'title, content y subforum son requeridos' });
        }

        // If forum not provided but subforum is, derive forum from subforum
        if (!forumId && subforum) {
            const sf = await Subforum.findById(subforum);
            if (sf) forumId = sf.forum;
        }

        const newPost = new Post({ title, content, author, subforum, forum: forumId });
        await newPost.save();
        res.status(201).json({ message: 'Publicación creada', newPost });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear post', error: error.message });
    }
};

// CONTROLADOR PARA OBTENER TODOS LOS POSTS
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener posts' });
    }
};
; 
