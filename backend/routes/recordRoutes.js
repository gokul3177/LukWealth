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

router.get("/", checkRole(["viewer", "analyst", "admin"]), getRecords);
router.post("/", checkRole(["admin"]), createRecord);
router.put("/:id", checkRole(["admin"]), updateRecord);
router.delete("/:id", checkRole(["admin"]), deleteRecord);
module.exports = router;