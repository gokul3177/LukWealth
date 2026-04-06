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
router.get("/", verifyToken, checkRole(["analyst", "admin", "user"]), getRecords);
router.post("/", verifyToken, checkRole(["analyst", "admin", "user"]), createRecord);
router.put("/:id", verifyToken, checkRole(["analyst", "admin", "user"]), updateRecord);
router.delete("/:id", verifyToken, checkRole(["analyst", "admin", "user"]), deleteRecord);
module.exports = router;