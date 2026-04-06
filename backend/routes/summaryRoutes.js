const express = require("express");
const router = express.Router();

const {
    getSummary,
    getCategorySummary,
    getTrends
}= require("../controllers/summaryController");

const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.get("/", verifyToken, checkRole(["analyst", "admin", "user"]), getSummary);

router.get("/category", verifyToken, checkRole(["analyst", "admin", "user"]), getCategorySummary);

router.get("/trends", verifyToken, checkRole(["analyst", "admin", "user"]), getTrends);

module.exports = router;