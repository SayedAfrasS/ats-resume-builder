const pool = require("../config/db");
const aiService = require("../services/aiService");
const atsService = require("../services/atsService");
const improvementService =  require("../services/improvementService");
const companyService =  require("../services/companyService");




exports.createResume = async (req, res) => {
  try {
    const { user_id, job_role, raw_input } = req.body;

    // STEP 1 — Generate AI content
    const aiContent =
      await aiService.generateResumeContent(job_role, raw_input);

    const atsResult =
  atsService.calculateATSScore(job_role, aiContent);

    const missingSkills =
  improvementService.detectSkillGaps(job_role, aiContent);

const suggestions =
  improvementService.generateSuggestions(
    atsResult,
    missingSkills
  );

  const companyMatches =
  companyService.calculateCompanyMatches(
    job_role,
    aiContent
  );

const hiringPredictions =
  companyService.calculateHiringProbability(
    atsResult.totalScore,
    companyMatches
  );



    // STEP 2 — Store in database
    const result = await pool.query(
      `INSERT INTO resumes
(user_id, job_role, raw_input, ai_generated, ats_score)
VALUES ($1, $2, $3, $4, $5)

       RETURNING *`,
      [user_id, job_role, raw_input, aiContent, atsResult.totalScore]
    );

res.status(201).json({
  message: "Resume created with AI + ATS + Company Match",

  ats: atsResult,

  improvements: {
    missingSkills,
    suggestions
  },

  companyMatches: hiringPredictions,

  data: result.rows[0]
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI generation failed" });
  }
};


exports.getResume = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM resumes WHERE id = $1",
      [id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
