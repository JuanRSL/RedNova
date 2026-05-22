const Forum = require('../models/Forum');
const Subforum = require('../models/Subforum');

// Create a new forum (admin only)
exports.createForum = async (req, res) => {
    try {
        const { name, slug, description, isPrivate } = req.body;
        if (!name || !slug) return res.status(400).json({ message: 'name y slug son requeridos' });

        const existing = await Forum.findOne({ $or: [{ name }, { slug }] });
        if (existing) return res.status(409).json({ message: 'Forum con ese nombre o slug ya existe' });

        const forum = new Forum({ name, slug, description, isPrivate });
        await forum.save();
        res.status(201).json({ message: 'Forum creado', forum });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear forum', error: error.message });
    }
};

// Get all forums
exports.getAllForums = async (req, res) => {
    try {
        const forums = await Forum.find().sort({ createdAt: -1 });
        res.status(200).json(forums);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener forums', error: error.message });
    }
};

// Get single forum with its subforums
exports.getForumById = async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await Forum.findById(id).populate('subforums', 'name slug description');
        if (!forum) return res.status(404).json({ message: 'Forum no encontrado' });
        res.status(200).json(forum);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener forum', error: error.message });
    }
};

// Delete forum (admin)
exports.deleteForum = async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await Forum.findById(id);
        if (!forum) return res.status(404).json({ message: 'Forum no encontrado' });

        // Optionally remove related subforums
        await Subforum.deleteMany({ forum: id });
        await Forum.findByIdAndDelete(id);

        res.status(200).json({ message: 'Forum y sus subforums eliminados' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar forum', error: error.message });
    }
};
