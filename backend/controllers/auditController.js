const db = require('../db');

exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT a.*, u.name as actor_name, t.name as target_name 
            FROM audit_logs a
            LEFT JOIN users u ON a.actor_id = u.id
            LEFT JOIN users t ON a.target_user_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (action) {
            params.push(action);
            query += ` AND a.action = $${params.length}`;
        }

        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await db.query(query, params);

        res.json({
            data: rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
