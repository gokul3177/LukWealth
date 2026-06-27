const db = require('../db');

/**
 * Fire-and-forget audit logger.
 * Does not block the main request flow.
 */
async function logAudit({ action, actorId, targetUserId = null, actorRole = null, ipAddress = null, metadata = null }) {
    try {
        const query = `
            INSERT INTO audit_logs (action, actor_id, target_user_id, actor_role, ip_address, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            action,
            actorId,
            targetUserId,
            actorRole,
            ipAddress,
            metadata ? JSON.stringify(metadata) : null
        ];
        
        // Fire and forget
        db.query(query, values).catch(err => {
            console.error('Audit Log DB Error:', err);
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
}

module.exports = { logAudit };
