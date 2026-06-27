const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const checkRole = require('../middleware/roleMiddleware');
const verifyToken = require('../middleware/authMiddleware');

// Only admin can view full audit logs
router.get('/', verifyToken, checkRole(['admin']), getAuditLogs);

module.exports = router;
