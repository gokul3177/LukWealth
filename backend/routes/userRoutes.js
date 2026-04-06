const express = require("express");
const router = express.Router();

const { createUser, getUsers, loginUser, registerUser, updateUserStatus, deleteUser } = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Admin and Analyst user management routes
router.post("/", verifyToken, checkRole(["admin"]), createUser); // Admin and Analyst can list all users
router.get("/", verifyToken, checkRole(["admin", "analyst"]), getUsers);

// NEW: Admin only can DELETE users
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteUser);

// NEW: Allow Analyst/Admin to ban/status users
router.put("/:id/status", verifyToken, checkRole(["admin", "analyst"]), updateUserStatus);

module.exports = router;