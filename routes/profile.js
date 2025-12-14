const express = require("express");
const router = express.Router();

const profileController = require('../controllers/profileController');


const { ensureAuthenticated } = require("../config/auth"); // middleware to protect routes
const {
  profileForm,
  saveProfile
} = require("../controllers/profileController");

// GET → show profile setup form
router.get("/setup", ensureAuthenticated, profileController.profileForm);

// POST → save profile
router.post("/setup", ensureAuthenticated, profileController.saveProfile);


// Route to display all candidates
router.get("/discover/academies", ensureAuthenticated, profileController.getAcademies);
router.get('/discover/candidates', ensureAuthenticated, profileController.getCandidates);


module.exports = router;
