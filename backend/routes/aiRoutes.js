const express = require('express');
const router = express.Router();
const { getInsights, checkFraud } = require('../controllers/aiController');
const checkRole = require('../middleware/roleMiddleware');
const verifyToken = require('../middleware/authMiddleware');

router.get('/insights', verifyToken, checkRole(['admin', 'analyst', 'user']), getInsights);
router.get('/fraud-check', verifyToken, checkRole(['admin', 'analyst', 'user']), checkFraud);

module.exports = router;
