const express = require("express");
const router = express.Router();

const {
    getSummary,
    getCategorySummary
}= require("../controllers/summaryController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/", verifyToken, checkRole(["analyst", "admin"]), getSummary);

router.get("/category", verifyToken, checkRole(["analyst", "admin"]), getCategorySummary);


module.exports = router;