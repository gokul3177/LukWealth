const express = require("express");
const router = express.Router();

const {
    getSummary,
    getCategorySummary
}= require("../controllers/summaryController");

const checkRole = require("../middleware/roleMiddleware");

router.get("/", checkRole(["analyst", "admin"]), getSummary);

router.get("/category", checkRole(["analyst", "admin"]), getCategorySummary);


module.exports = router;