// models/AcademyProfile.js
const mongoose = require("mongoose");


const AcademyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  location: String,
  sportsOffered: String,
  fees: String,
  facilities: String,
  description: String,

  
  recommendedCandidates: [
    {
      candidate: { type: mongoose.Schema.Types.ObjectId, ref: "CandidateProfile" },
      score: Number,
      reason: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});


module.exports = mongoose.model("AcademyProfile", AcademyProfileSchema);
