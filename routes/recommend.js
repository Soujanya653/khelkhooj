const express = require("express");
const router = express.Router();

const CandidateProfile = require("../models/CandidateProfile");
const AcademyProfile = require("../models/AcademyProfile");

// -----------------------------
// ✔ Google Gemini SDK Integration
// -----------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw new Error("Gemini model error");
  }
}

// -----------------------------
// ✔ Deterministic Fallback Score
// -----------------------------
function deterministicScore(candidate, academy) {
  let score = 0;

  // Sport match
  if (candidate.sport && academy.sportsOffered) {
    if (academy.sportsOffered.toLowerCase().includes(candidate.sport.toLowerCase())) {
      score += 50;
    }
  }

  // Budget match (simple)
  const candBudget = parseInt(candidate.budget?.replace(/\D/g, "")) || 0;
  const academyFee = parseInt(academy.fees?.replace(/\D/g, "")) || 0;
  if (candBudget && academyFee) {
    const diff = Math.abs(candBudget - academyFee);
    score += Math.max(0, 30 - Math.min(30, Math.floor((diff / candBudget) * 30)));
  }

  // Distance preference (simple)
  if (candidate.distancePreference?.toLowerCase().includes("near")) {
    score += 10;
  }

  // Facilities
  if (academy.facilities) score += 10;

  return Math.min(score, 100);
}

// -----------------------------
// ✔ Build Prompt for Gemini
// -----------------------------
function buildPromptForCandidate(candidate, academies) {
  const candidateTxt = `
Candidate:
- Sport: ${candidate.sport}
- Age: ${candidate.age}
- Awards: ${candidate.awards}
- Budget: ${candidate.budget}
- Distance Preference: ${candidate.distancePreference}
- Media: ${candidate.media}
`;

  const academiesTxt = academies.map(a => {
    return `
{
  "id": "${a._id}",
  "name": "${a.user?.name || ""}",
  "location": "${a.location}",
  "sportsOffered": "${a.sportsOffered}",
  "fees": "${a.fees}",
  "facilities": "${a.facilities}",
  "description": "${a.description}"
}
`;
  }).join("\n");

  return `
Given the candidate information and academy list below, return ONLY a JSON array of the top 5 recommended academies.

Each element must be:
{
  "academyId": "...",
  "score": number,
  "reason": "..."
}

Candidate Info:
${candidateTxt}

Academies:
${academiesTxt}

Return ONLY the JSON array.
`;
}

// -----------------------------
// ✔ POST: Recommend Academies For Candidate
// -----------------------------
router.post("/academies-for-candidate", async (req, res) => {
  try {
    const { candidateId } = req.body;

    const candidate = await CandidateProfile.findById(candidateId).populate("user");
    const academies = await AcademyProfile.find().limit(30).populate("user").lean();

    const prompt = buildPromptForCandidate(candidate, academies);

    let modelText;
    let recommendations = [];

    try {
      modelText = await callGemini(prompt);

      const start = modelText.indexOf("[");
      const end = modelText.lastIndexOf("]");

      if (start !== -1 && end !== -1) {
        const jsonStr = modelText.substring(start, end + 1);
        const parsed = JSON.parse(jsonStr);

        recommendations = parsed.map(r => ({
          academy: r.academyId,
          score: r.score,
          reason: r.reason
        }));
      } else {
        throw new Error("Invalid model output");
      }
    } catch (err) {
      console.log("Gemini failed — Using fallback scoring");

      recommendations = academies.map(a => ({
        academy: a._id,
        score: deterministicScore(candidate, a),
        reason: "Fallback scoring based on sport/budget/distance/facilities"
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    }

    candidate.recommendedAcademies = recommendations;
    await candidate.save();

    return res.json({ ok: true, recommendations });

  } catch (err) {
    console.error(err);
    return res.json({ ok: false, error: err.message });
  }
});

module.exports = router;

