const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const checkRole = require('../middleware/roleMiddleware');
const verifyToken = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, checkRole(['admin', 'analyst']), getAdminStats);

module.exports = router;
