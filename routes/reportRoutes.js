// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, verifyModerator } = require('../middlewares/auth');

// Route to create a new report (accessible by any authenticated user)
router.post('/', verifyToken, reportController.createReport);

// Route to get all reports (accessible only by moderators or admins)
router.get('/', verifyToken, verifyModerator, reportController.getReports);

// Route to mark a specific report as resolved (accessible only by moderators or admins)
router.put('/:id/resolve', verifyToken, verifyModerator, reportController.resolveReport);
// Route to delete a report (accessible only by admins)
router.delete('/:id', verifyToken, verifyAdmin, reportController.deleteReport);
module.exports = router;
