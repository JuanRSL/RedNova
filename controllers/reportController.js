const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Crear un nuevo reporte
exports.createReport = async (req, res) => {
    try {
        const { contentId, contentType, reason } = req.body;
        const reportedBy = req.user.id;
        // Validar campos requeridos
        if (!contentId || !contentType || !reason) {
            return res.status(400).json({ message: 'contentId, contentType y reason son requeridos' });
        }

        // Validate that the content actually exists
        const Model = contentType === 'Post' ? Post : Comment;
        const exists = await Model.findById(contentId);
        if (!exists) {
            return res.status(404).json({ message: `${contentType} no encontrado` });
        }

        // Optional: Check if the user already reported this content to avoid spam
        const existingReport = await Report.findOne({ contentId, reportedBy });
        if (existingReport) {
            return res.status(409).json({ message: 'Ya has reportado este contenido anteriormente' });
        }

        const report = new Report({ contentId, contentType, reportedBy, reason });
        await report.save();

        res.status(201).json({ message: 'Reporte enviado exitosamente', report });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar el reporte', error: error.message });
    }
};

// Get all reports (Moderator/Admin only)
exports.getReports = async (req, res) => {
    try {
        const { resolved } = req.query;
        const filter = {};
        if (resolved !== undefined) filter.resolved = resolved === 'true';

        const reports = await Report.find(filter)
            .populate('reportedBy', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
    }
};

// Mark report as resolved
exports.resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findByIdAndUpdate(
            id,
            { resolved: true },
            { new: true }
        );

        if (!report) return res.status(404).json({ message: 'Reporte no encontrado' });

        res.status(200).json({ message: 'Reporte marcado como resuelto', report });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar reporte', error: error.message });
    }
};

// Delete report (Moderator/Admin)
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findByIdAndDelete(id);

        if (!report) return res.status(404).json({ message: 'Reporte no encontrado' });

        res.status(200).json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar reporte', error: error.message });
    }
};
