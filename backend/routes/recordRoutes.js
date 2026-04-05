const express = require("express")
const router = express.Router();

const {
    createRecord,
    getRecords,
    updateRecord,
    deleteRecord
} = require("../controllers/recordController");

// router.post("/", createRecord);
// router.get("/", getRecords);
// router.put("/:id", updateRecord);
// router.delete("/:id", deleteRecord);

const checkRole = require("../middleware/roleMiddleware");
const verifyToken = require("../middleware/authMiddleware");
router.get("/", verifyToken, checkRole(["viewer", "analyst", "admin"]), getRecords);
router.post("/", verifyToken, checkRole(["viewer", "analyst", "admin"]), createRecord);
router.put("/:id", verifyToken, checkRole(["viewer", "analyst", "admin"]), updateRecord);
router.delete("/:id", verifyToken, checkRole(["viewer", "analyst", "admin"]), deleteRecord);
module.exports = router;