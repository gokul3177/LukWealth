const db = require("../db");

exports.createRecord = (req, res) => {

    if (!req.body){
        return res.status(400).json({message: "Body missing"});
    }
    
    const { amount, type, category, date, notes, userId } = req.body;

    if(!amount || !type || !category || !date){
        return res.status(400).json({message: "Require all fields"});
    }
    
    if (isNaN(amount)) return res.status(400).json({message: "Amount must be a number"});
    if (type !== 'income' && type !== 'expense') return res.status(400).json({message: "Type must be either income or expense"});

    const query = `
        INSERT INTO records (userId, amount, type, category, date, notes)
        VALUES (?,?,?,?,?,?)
    `;

    // Normal users ONLY create for themselves. Admins can create for others.
    const targetUserId = (req.user.role === 'admin' && userId) ? userId : req.user.id;

    db.run(query, [targetUserId, amount, type, category, date, notes], function (err){
        if (err){
            console.log("DB Error: ", err.message);
            return res.status(500).json(err);
        }
        res.json({
            message: "Record created",
            recordId: this.lastID
        });
    });
};

exports.getRecords = (req, res)=>{
    const { id, role } = req.user;
    const { type, category, startDate, endDate } = req.query;
    
    let query = "SELECT * FROM records WHERE 1=1";
    let params = [];

    // Multi-user Audit & Global Logic
    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    
    const targetUserId = isAudit ? req.query.userId : id;

    // Security: Analyst cannot audit another Analyst
    if (role === 'analyst' && isAudit && targetUserId != id) {
        return db.get("SELECT role FROM users WHERE id = ?", [targetUserId], (err, targetUser) => {
            if (targetUser && targetUser.role === 'analyst') {
                return res.status(403).json({message: "Privacy Guard: Analysts cannot audit other analysts."});
            }
            // Proceed with filtering
            query += " AND userId = ?";
            params.push(targetUserId);
            return db.all(query, params, (err, rows) => {
                if (err) return res.status(500).json(err);
                res.json(rows);
            });
        });
    }

    // Role-based restrict: Default to targetUserId (self or audit) UNLESS global is explicitly requested
    if (!isGlobalRequested) {
        query += " AND userId = ?";
        params.push(targetUserId);
    }

    db.all(query, params, (err, rows)=>{
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};

exports.updateRecord = (req, res)=>{
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    if(!amount || !type || !category || !date){
        return res.status(400).json({message: "Require all fields"});
    }
    if (isNaN(amount)) return res.status(400).json({message: "Amount must be a number"});
    if (type !== 'income' && type !== 'expense') return res.status(400).json({message: "Type must be either income or expense"});

    let query =`
    UPDATE records
    SET amount =?, type=?, category=?, date=?, notes=?
    WHERE id=?
    `;
    
    let params = [amount, type, category, date, notes, id];
    
    // STRICT SELF-UPDATE: No user (even Admin) can tampered with another's recorded logs
    query += " AND userId=?";
    params.push(req.user.id);

    db.run(query, params, function(err){
        if (err) return res.status(500).json(err);
        
        if (this.changes === 0) return res.status(403).json({message: "Record not found or unauthorized"});

        res.json({message: "Record updated"});
    });
};

exports.deleteRecord = (req, res)=>{
    const { id } = req.params;

    let query = "DELETE FROM records WHERE id=?";
    let params = [id];
    
    // ENFORCE SELF-DELETION ONLY: Admin/Analyst can manage registry but NOT tamper with records
    query += " AND userId=?";
    params.push(req.user.id);

    db.run(query, params, function(err){
        if (err) return res.status(500).json(err);
        if (this.changes === 0) return res.status(403).json({message: "Record not found or unauthorized"});

        res.json({message: "Record deleted"});
    });
};