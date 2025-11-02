const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth"); // middleware to protect routes
const {
  profileForm,
  saveProfile
} = require("../controllers/profileController");

// GET → show profile setup form
router.get("/setup", ensureAuthenticated, profileForm);

// POST → save profile
router.post("/setup", ensureAuthenticated, saveProfile);


module.exports = router;
