// routes/auth.js
const express = require("express");
const router = express.Router();
const { signupForm, signupUser, loginForm, loginUser, logoutUser } = require("../controllers/authController");

// Signup routes
router.get("/signup", signupForm);
router.post("/signup", signupUser);

// Login routes
router.get("/login", loginForm);
router.post("/login", loginUser);

// Logout
router.get("/logout", logoutUser);

module.exports = router;
