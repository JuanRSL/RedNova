const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }

    exports.followUser = async (req, res) => {
        try {
            const { myId, targetId } = req.body;
            // Validar que ambos usuarios existan
            const user = await User.findById(myId);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

            // Si ya lo sigue, lo elimina (Unfollow). Si no, lo agrega (Follow).
            const isFollowing = user.followingUsers.includes(targetId);
            const action = isFollowing ? '$pull' : '$addToSet';

            await User.findByIdAndUpdate(myId, { [action]: { followingUsers: targetId } });

            res.status(200).json({ message: isFollowing ? "Dejaste de seguir" : "Siguiendo ahora" });
        } catch (error) {
            res.status(500).json({ message: "Error en la operación de seguimiento" });
        }
    };

    // Función para seguir o dejar de seguir un subforo
    exports.followSubforum = async (req, res) => {
        try {
            const { userId, subredditId } = req.body;

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

            // Verificamos si ya sigue al subforo
            const isFollowing = user.followingSubreddits.includes(subredditId);

            // Si ya lo sigue, usamos $pull (quitar). Si no, $addToSet (agregar sin duplicar).
            const action = isFollowing ? '$pull' : '$addToSet';

            await User.findByIdAndUpdate(userId, {
                [action]: { followingSubreddits: subredditId }
            });

            res.status(200).json({
                message: isFollowing ? "Has salido del subforo" : "Te has unido al subforo"
            });
        } catch (error) {
            res.status(500).json({ message: "Error al procesar la suscripción al subforo", error: error.message });
        }
    };

};
