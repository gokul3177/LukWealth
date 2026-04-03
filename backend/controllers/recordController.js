const db = require("../db");

exports.createRecord = (req, res) => {

    if (!req.body){
        return res.status(400).json({message: "Body missing"});
    }
    
    const { amount, type, category, date, notes } = req.body;

    if(!amount || !type || !category || !date){
        return res.status(400).json({message: "Require all fields"});
    }

    const query = `
        INSERT INTO records (amount, type, category, date, notes)
        VALUES (?,?,?,?,?)
    `;

    db.run(query, [amount, type, category, date, notes], function (err){
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
    db.all("SELECT * FROM records", [], (err, rows)=>{
        if (err) return res.status(500).json(err);

        res.json(rows);
    });
};

exports.updateRecord = (req, res)=>{
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    const query =`
    UPDATE records
    SET amount =?, type=?, category=?, date=?, notes=?
    WHERE id=?
    `;

    db.run(query, [amount, type, category, date, notes, id], function(err){
        if (err) return res.status(500).json(err);

        res.json({message: "Record updated"});
    });
};

exports.deleteRecord = (req, res)=>{
    const { id } = req.params;

    db.run("DELETE FROM records WHERE id=?", [id], function(err){
        if (err) return res.status(500).json(err);

        res.json({message: "Record deleted"});
    });
};