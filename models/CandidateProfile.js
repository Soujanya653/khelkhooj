// models/CandidateProfile.js
const mongoose = require("mongoose");

const CandidateProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sport: String,
  age: Number,
  awards: String,
  media: String,
  distancePreference: String,
  budget: String,
});

module.exports = mongoose.model("CandidateProfile", CandidateProfileSchema);
