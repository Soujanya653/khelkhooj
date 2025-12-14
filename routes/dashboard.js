// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

const CandidateProfile = require("../models/CandidateProfile");
const AcademyProfile = require("../models/AcademyProfile");

// ==============================
// Dashboard
// ==============================
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


// ============================================
// TOP 5 ACADEMIES FOR CANDIDATE (AI + fallback)
// ============================================
router.get("/discover", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.render("discoverAcademies", { academies: [] });
    }

    const candidate = await CandidateProfile.findOne({ user: req.user._id }).lean();
    if (!candidate) return res.render("discoverAcademies", { academies: [] });

    // If AI recommended → show top 5 AI recommendations
    if (candidate.recommendedAcademies && candidate.recommendedAcademies.length > 0) {
      const academyIds = candidate.recommendedAcademies.map(r => r.academy);

      let academies = await AcademyProfile.find({
        _id: { $in: academyIds }
      }).populate("user").lean();

      let ranked = academies.map(a => {
        const match = candidate.recommendedAcademies.find(
          r => r.academy.toString() === a._id.toString()
        );
        return {
          ...a,
          score: match?.score || 0,
          reason: match?.reason || "AI recommendation"
        };
      });

      ranked = ranked.sort((a, b) => b.score - a.score).slice(0, 5);

      return res.render("discoverAcademies", { academies: ranked });
    }

    // Fallback scoring
    let academies = await AcademyProfile.find().populate("user").lean();

    let ranked = academies
      .map(a => ({
        ...a,
        score: scoreAcademy(a, candidate),
        reason: "Matched by sport/budget/facilities"
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);  // 👉 TOP 5

    return res.render("discoverAcademies", { academies: ranked });

  } catch (err) {
    console.error("Discover Error:", err);
    return res.render("discoverAcademies", { academies: [] });
  }
});


// ============================================
// TOP 5 CANDIDATES FOR ACADEMY
// ============================================
router.get("/discover-candidates", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== "academy") {
      return res.render("discoverCandidates", { candidates: [] });
    }

    const academy = await AcademyProfile.findOne({ user: req.user._id }).lean();
    if (!academy) return res.render("discoverCandidates", { candidates: [] });

    let candidates = await CandidateProfile.find().populate("user").lean();

    let ranked = candidates
      .map(c => ({
        ...c,
        score: scoreCandidate(c, academy),
        reason: "Matched by sport/age/awards"
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);  // 

    return res.render("discoverCandidates", { candidates: ranked });

  } catch (err) {
    console.error("Discover Candidates Error:", err);
    return res.render("discoverCandidates", { candidates: [] });
  }
});


// ==============================
// SCORING FUNCTIONS
// ==============================

// Candidate → Academy scoring
function scoreAcademy(academy, candidate) {
  let score = 0;

  if (
    candidate.sport &&
    academy.sportsOffered &&
    academy.sportsOffered.toLowerCase().includes(candidate.sport.toLowerCase())
  ) score += 50;

  const candBudget = parseInt(candidate.budget?.replace(/\D/g, "")) || 0;
  const fee = parseInt(academy.fees?.replace(/\D/g, "")) || 0;

  if (candBudget && fee) {
    const diff = Math.abs(candBudget - fee);
    score += Math.max(0, 30 - Math.round((diff / candBudget) * 30));
  }

  if (academy.facilities) score += 10;

  if (candidate.distancePreference?.toLowerCase().includes("near")) score += 10;

  return Math.min(score, 100);
}


// Academy → Candidate scoring
function scoreCandidate(candidate, academy) {
  let score = 0;

  if (
    candidate.sport &&
    academy.sportsOffered?.toLowerCase().includes(candidate.sport.toLowerCase())
  ) score += 50;

  if (candidate.awards) score += 20;

  if (candidate.age && candidate.age >= 10 && candidate.age <= 25) score += 20;

  if (candidate.media) score += 10;

  return Math.min(score, 100);
}

//  Candidate clicks "Saved Academies"
// GET all academies (Saved Academies)
router.get("/saved-academies", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.redirect("/dashboard");
    }

    const academies = await AcademyProfile.find().populate("user");

    res.render("savedAcademies", {
      academies
    });

  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to load academies");
    res.redirect("/dashboard");
  }
});


//  Academy clicks "Saved Candidates"
// GET all candidates (Saved Candidates)
router.get("/saved-candidates", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== "academy") {
      return res.redirect("/dashboard");
    }

    const candidates = await CandidateProfile.find().populate("user");

    res.render("savedCandidates", {
      candidates
    });

  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Unable to load candidates");
    res.redirect("/dashboard");
  }
});


module.exports = router;

