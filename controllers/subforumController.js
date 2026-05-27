const Subforum = require('../models/Subforum');
const Forum = require('../models/Forum');

// Create a new subforum
exports.createSubforum = async (req, res) => {
    try {
        const { name, slug, description, forum: forumId, isPrivate } = req.body;
        if (!name || !slug || !forumId) return res.status(400).json({ message: 'name, slug y forum son requeridos' });

        const forum = await Forum.findById(forumId);
        if (!forum) return res.status(404).json({ message: 'Forum no encontrado' });

        const existing = await Subforum.findOne({ $or: [{ name }, { slug }] });
        if (existing) return res.status(409).json({ message: 'Subforum con ese nombre o slug ya existe' });

        const subforum = new Subforum({
            name,
            slug,
            description,
            forum: forumId,
            isPrivate,
            moderators: req.user?.id ? [req.user.id] : []
        });
        await subforum.save();

        // push to forum.subforums
        forum.subforums = forum.subforums || [];
        forum.subforums.push(subforum._id);
        await forum.save();

        res.status(201).json({ message: 'Subforum creado', subforum });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear subforum', error: error.message });
    }
};

// Get subforum by id
exports.getSubforumById = async (req, res) => {
    try {
        const { id } = req.params;
        const subforum = await Subforum.findById(id).populate('forum', 'name slug');
        if (!subforum) return res.status(404).json({ message: 'Subforum no encontrado' });
        res.status(200).json(subforum);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener subforum', error: error.message });
    }
};

// Get all subforums or filter by forum
exports.getSubforums = async (req, res) => {
    try {
        const { forumId } = req.query;
        const filter = forumId ? { forum: forumId } : {};
        const subforums = await Subforum.find(filter).sort({ createdAt: -1 });
        res.status(200).json(subforums);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener subforums', error: error.message });
    }
};

// Update subforum (moderator/admin)
exports.updateSubforum = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const subforum = await Subforum.findByIdAndUpdate(id, updates, { new: true });
        if (!subforum) return res.status(404).json({ message: 'Subforum no encontrado' });
        res.status(200).json({ message: 'Subforum actualizado', subforum });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar subforum', error: error.message });
    }
};

// Delete subforum
exports.deleteSubforum = async (req, res) => {
    try {
        const { id } = req.params;
        const subforum = await Subforum.findById(id);
        if (!subforum) return res.status(404).json({ message: 'Subforum no encontrado' });

        // remove from parent forum
        await Forum.findByIdAndUpdate(subforum.forum, { $pull: { subforums: subforum._id } });
        await Subforum.findByIdAndDelete(id);
        res.status(200).json({ message: 'Subforum eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar subforum', error: error.message });
    }
};
