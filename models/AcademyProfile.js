// models/AcademyProfile.js
const mongoose = require("mongoose");

const AcademyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: String,
  sportsOffered: String,
  fees: String,
  facilities: String,
  description: String,
});

module.exports = mongoose.model("AcademyProfile", AcademyProfileSchema);
