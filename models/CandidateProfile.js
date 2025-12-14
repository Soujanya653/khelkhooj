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


recommendedAcademies: [
  {
    academy: { type: mongoose.Schema.Types.ObjectId, ref: "AcademyProfile" },
    score: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now },
  },
],
});

module.exports = mongoose.model("CandidateProfile", CandidateProfileSchema);
