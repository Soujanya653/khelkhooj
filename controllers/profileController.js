const CandidateProfile = require("../models/CandidateProfile");
const AcademyProfile = require("../models/AcademyProfile");

exports.profileForm = (req, res) => {
  // Render Candidate or Academy form based on role
  if (req.user.role === "candidate") {
    res.render("profileCandidate");
  } else if (req.user.role === "academy") {
    res.render("profileAcademy");
  } else {
    req.flash("error_msg", "Invalid role");
    res.redirect("/dashboard");
  }
};

exports.saveProfile = async (req, res) => {
  try {
    if (req.user.role === "candidate") {
      const { sport, age, awards, media, distancePreference, budget } = req.body;
      const profile = new CandidateProfile({
        user: req.user._id,
        sport, age, awards, media, distancePreference, budget
      });
      await profile.save();
    } else if (req.user.role === "academy") {
      const { location, sportsOffered, fees, facilities, description } = req.body;
      const profile = new AcademyProfile({
        user: req.user._id,
        location, sportsOffered, fees, facilities, description
      });
      await profile.save();
    }
    req.flash("success_msg", "Profile saved successfully!");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error saving profile");
    res.redirect("/profile/setup");
  }
};
