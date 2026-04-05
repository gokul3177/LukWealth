const express = require("express");
const router = express.Router();

const { createUser, getUsers, loginUser, registerUser } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/", createUser);
router.get("/", getUsers);

module.exports = router;