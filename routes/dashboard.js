// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const CandidateProfile = require("../models/CandidateProfile");
const AcademyProfile = require("../models/AcademyProfile");

// GET Dashboard
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let profile = null;

    if (req.user.role === "candidate") {
      profile = await CandidateProfile.findOne({ user: req.user._id });
    } else if (req.user.role === "academy") {
      profile = await AcademyProfile.findOne({ user: req.user._id });
    }

    res.render("dashboard", { user: req.user, profile });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error loading dashboard");
    res.redirect("/");
  }
});

module.exports = router;
