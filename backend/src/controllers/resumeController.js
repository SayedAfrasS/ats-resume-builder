const pool = require("../config/db");
const aiService = require("../services/aiService");
const atsService = require("../services/atsService");
const improvementService = require("../services/improvementService");
const companyService = require("../services/companyService");
const atsEngine = require("../services/atsEngineService");
const { PDFParse } = require("pdf-parse");




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
    let result = { rows: [] };
    try {
      result = await pool.query(
        `INSERT INTO resumes
    (user_id, job_role, raw_input, ai_generated, ats_score, ats_breakdown, improvements, company_matches)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

        RETURNING *`,
        [user_id, job_role, raw_input, aiContent, atsResult.totalScore,
          JSON.stringify(atsResult.breakdown),
          JSON.stringify({ missingSkills, suggestions }),
          JSON.stringify(hiringPredictions)]
      );
    } catch (dbError) {
      console.error("Database error:", dbError.message);
      // Continue without saving to DB
    }

    res.status(201).json({
      message: "Resume created with AI + ATS + Company Match",

      ats: atsResult,

      improvements: {
        missingSkills,
        suggestions
      },

      companyMatches: hiringPredictions,

      data: result.rows[0] || { ai_generated: JSON.stringify(aiContent) }, // Fallback if DB fails
      warning: result.rows.length === 0 ? "Failed to save to database" : null
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

exports.analyzeResume = async (req, res) => {
  try {
    const jobRole = req.body.job_role;
    let resumeText = "";

    // ── Extract text from uploaded file or fallback to body content ──
    if (req.file) {
      const buffer = req.file.buffer;
      const mime = req.file.mimetype;

      if (mime === "application/pdf") {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        resumeText = pdfData.text || "";
      } else if (
        mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mime === "application/msword"
      ) {
        // Simple DOCX extraction — pull text content from XML inside zip
        resumeText = buffer.toString("utf-8").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      } else {
        // Plain text / fallback
        resumeText = buffer.toString("utf-8");
      }
    } else if (req.body.content) {
      resumeText = typeof req.body.content === "string"
        ? req.body.content
        : JSON.stringify(req.body.content);
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({ error: "Resume content is too short or empty. Upload a valid file." });
    }

    if (!jobRole) {
      return res.status(400).json({ error: "Job role is required." });
    }

    // ── Fetch company_roles from database ──
    let companyRolesData = [];
    try {
      const dbResult = await pool.query(
        "SELECT company_name, role, job_description, extracted_skills, apply_link, location FROM company_roles WHERE LOWER(role) = LOWER($1)",
        [jobRole]
      );
      companyRolesData = dbResult.rows;
    } catch (dbErr) {
      console.error("company_roles DB fetch failed:", dbErr.message);
    }

    // ── Run comprehensive ATS Engine ──
    const analysis = atsEngine.analyzeResume(jobRole, resumeText, companyRolesData);

    // ── Build improvement suggestions via AI (optional, non-blocking) ──
    let aiSuggestions = [];
    try {
      const missingSkills = improvementService.detectSkillGaps(jobRole, resumeText);
      const legacyAts = atsService.calculateATSScore(jobRole, resumeText);
      aiSuggestions = improvementService.generateSuggestions(legacyAts, missingSkills);
    } catch (_) { /* non-critical */ }

    // ── Save analysis to user_analyses table ──
    const userId = req.body.user_id;
    const fileName = req.file ? req.file.originalname : "manual_input";
    if (userId) {
      try {
        await pool.query(
          `INSERT INTO user_analyses
           (user_id, job_role, file_name, ats_score, grade, breakdown, benefits, issues, keywords, skills, company_matches, ai_suggestions)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            userId,
            jobRole,
            fileName,
            analysis.totalScore,
            analysis.grade,
            JSON.stringify(analysis.breakdown || {}),
            JSON.stringify(analysis.benefits || []),
            JSON.stringify(analysis.issues || []),
            JSON.stringify(analysis.keywords || {}),
            JSON.stringify(analysis.skills || {}),
            JSON.stringify(companyRolesData || []),
            JSON.stringify(aiSuggestions || []),
          ]
        );
      } catch (dbErr) {
        console.error("Failed to save analysis:", dbErr.message);
      }
    }

    res.json({
      success: true,
      analysis,
      aiSuggestions,
      supportedRoles: atsEngine.getSupportedRoles(),
    });

  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({ error: "Analysis failed: " + error.message });
  }
};


// GET all resumes for a user
exports.getUserResumes = async (req, res) => {
  try {
    const { userId } = req.params;

    let resumes = [];
    try {
      const result = await pool.query(
        "SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      resumes = result.rows;
    } catch (dbErr) {
      console.error("DB error fetching user resumes:", dbErr.message);
    }

    res.json({ resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
};


// GET all analyses for a user (for dashboard)
exports.getUserAnalyses = async (req, res) => {
  try {
    const { userId } = req.params;

    let analyses = [];
    try {
      const result = await pool.query(
        "SELECT * FROM user_analyses WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      analyses = result.rows;
    } catch (dbErr) {
      console.error("DB error fetching user analyses:", dbErr.message);
    }

    res.json({ analyses });
  } catch (error) {
    console.error("Failed to fetch user analyses:", error);
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
};


// POST job match analysis (company matching without creating a resume)
exports.jobMatch = async (req, res) => {
  try {
    const { job_role, content } = req.body;

    if (!job_role) {
      return res.status(400).json({ error: "job_role is required" });
    }

    // Use existing content or a minimal structure
    const resumeContent = content || { summary: "", projects: [], experience: [] };

    const atsResult = atsService.calculateATSScore(job_role, resumeContent);

    const missingSkills = improvementService.detectSkillGaps(job_role, resumeContent);

    const suggestions = improvementService.generateSuggestions(atsResult, missingSkills);

    const companyMatches = companyService.calculateCompanyMatches(job_role, resumeContent);

    const hiringPredictions = companyService.calculateHiringProbability(
      atsResult.totalScore,
      companyMatches
    );

    res.json({
      ats: atsResult,
      improvements: {
        missingSkills,
        suggestions,
      },
      companyMatches: hiringPredictions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Job match analysis failed" });
  }
};


// GET user-specific job match data with real company links
exports.getJobMatchData = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobRole = req.query.role || "Software Engineer";

    // ── 1. Fetch user's latest analysis from DB ──
    let latestAnalysis = null;
    try {
      const analysisResult = await pool.query(
        "SELECT * FROM user_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );
      if (analysisResult.rows.length > 0) latestAnalysis = analysisResult.rows[0];
    } catch (e) { console.error("Analysis fetch:", e.message); }

    // ── 2. Extract ALL user skills from analysis (keywords + skills) ──
    let userSkills = [];
    if (latestAnalysis) {
      // Parse stored skills object: { matched: [...], missing: [...] }
      const skills = typeof latestAnalysis.skills === "string"
        ? JSON.parse(latestAnalysis.skills)
        : latestAnalysis.skills;
      if (skills?.matched && Array.isArray(skills.matched)) {
        userSkills.push(...skills.matched);
      }

      // Also pull all found keywords (critical + important + bonus)
      const kw = typeof latestAnalysis.keywords === "string"
        ? JSON.parse(latestAnalysis.keywords)
        : latestAnalysis.keywords;
      if (kw) {
        if (kw.criticalFound) userSkills.push(...kw.criticalFound);
        if (kw.importantFound) userSkills.push(...kw.importantFound);
        if (kw.bonusFound) userSkills.push(...kw.bonusFound);
      }

      // Deduplicate
      userSkills = [...new Set(userSkills.map(s => s.toLowerCase().trim()))].filter(Boolean);
    }

    // ── 3. Fallback: extract skills from resume's ai_generated content ──
    if (userSkills.length === 0) {
      try {
        const resumeResult = await pool.query(
          "SELECT ai_generated FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
          [userId]
        );
        if (resumeResult.rows.length > 0) {
          const aiGen = typeof resumeResult.rows[0].ai_generated === "string"
            ? JSON.parse(resumeResult.rows[0].ai_generated)
            : resumeResult.rows[0].ai_generated;
          if (aiGen?.skills && Array.isArray(aiGen.skills)) {
            userSkills = aiGen.skills.map(s => s.toLowerCase().trim());
          }
        }
      } catch (e) { console.error("Resume skills fetch:", e.message); }
    }

    console.log(`[JobMatch] User ${userId} | Role: ${jobRole} | Skills found: ${userSkills.length}`, userSkills.slice(0, 10));

    // ── 4a. Ultimate fallback: use skills sent from frontend (builder context) ──
    if (userSkills.length === 0 && req.query.skills) {
      userSkills = req.query.skills.split(",").map(s => s.toLowerCase().trim()).filter(Boolean);
      console.log(`[JobMatch] Using frontend fallback skills:`, userSkills);
    }

    // ── 4b. Fetch matching company roles from DB with scores ──
    const companyMatches = await companyService.calculateCompanyMatchesFromDB(jobRole, userSkills);

    // ── 5. Build ATS score data ──
    const atsScore = latestAnalysis?.ats_score || 0;
    const grade = latestAnalysis?.grade || "N/A";
    const breakdown = typeof latestAnalysis?.breakdown === "string"
      ? JSON.parse(latestAnalysis.breakdown) : (latestAnalysis?.breakdown || {});
    const issues = typeof latestAnalysis?.issues === "string"
      ? JSON.parse(latestAnalysis.issues) : (latestAnalysis?.issues || []);

    // ── 6. Get improvements (keyword gaps from analysis) ──
    const analysisSkills = typeof latestAnalysis?.skills === "string"
      ? JSON.parse(latestAnalysis.skills) : (latestAnalysis?.skills || {});
    const keywordData = typeof latestAnalysis?.keywords === "string"
      ? JSON.parse(latestAnalysis.keywords) : (latestAnalysis?.keywords || {});

    // skills.missing + keywords criticalMissing + importantMissing
    const missingSkills = [
      ...(analysisSkills?.missing || []),
      ...(keywordData?.criticalMissing || []),
      ...(keywordData?.importantMissing || []),
    ].filter((v, i, a) => a.indexOf(v) === i);

    // skills.matched + all found keywords
    const foundSkills = userSkills.length > 0 ? userSkills : [
      ...(analysisSkills?.matched || []),
      ...(keywordData?.criticalFound || []),
      ...(keywordData?.importantFound || []),
      ...(keywordData?.bonusFound || []),
    ].filter((v, i, a) => a.indexOf(v) === i);

    // ── 7. Get improvement suggestions ──
    const aiSuggestions = typeof latestAnalysis?.ai_suggestions === "string"
      ? JSON.parse(latestAnalysis.ai_suggestions) : (latestAnalysis?.ai_suggestions || []);

    // ── 8. Calculate hiring likelihood from top matches ──
    const avgMatchScore = companyMatches.length > 0
      ? Math.round(companyMatches.reduce((sum, m) => sum + m.matchScore, 0) / companyMatches.length)
      : 0;
    const hiringScore = Math.round((atsScore * 0.4) + (avgMatchScore * 0.6));
    const hiringLevel = hiringScore >= 75 ? "High" : hiringScore >= 50 ? "Medium" : "Low";

    // ── 9. Generate real job search links ──
    const jobSearchLinks = companyService.generateJobSearchLinks(jobRole);

    // ── 10. Fetch available roles from DB ──
    const availableRoles = await companyService.getAvailableRoles();

    res.json({
      success: true,
      atsScore,
      grade,
      breakdown,
      issues,
      hiringLikelihood: { level: hiringLevel, score: hiringScore },
      companyMatches,
      missingSkills,
      foundSkills,
      suggestions: aiSuggestions,
      jobSearchLinks,
      availableRoles,
      totalOpenings: companyMatches.length,
      analyzedRole: jobRole,
    });
  } catch (error) {
    console.error("Job match data error:", error);
    res.status(500).json({ error: "Failed to fetch job match data" });
  }
};


// DELETE a resume
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM resumes WHERE id = $1", [id]);
    res.json({ message: "Resume deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete resume" });
  }
};


// POST generate ATS-friendly suggestions mapped to each resume section
exports.generateATSSuggestions = async (req, res) => {
  try {
    const { resumeData, jobRole } = req.body;
    if (!resumeData || !jobRole) {
      return res.status(400).json({ error: "resumeData and jobRole are required" });
    }

    const Groq = require("groq-sdk");
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    }
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an ATS resume optimization specialist.

Job Role: ${jobRole}

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

Analyze every section of this resume and generate ATS-friendly replacement suggestions.

Rules:
- Use strong action verbs (Led, Engineered, Optimized, Spearheaded, Implemented, Designed)
- Include quantifiable metrics where possible (%, $, numbers)
- Each bullet must be max 20 words
- Focus on keywords an ATS system for "${jobRole}" would scan for
- Make suggestions that are direct replacements for the existing content

Return ONLY valid JSON with this exact structure:
{
  "summary": "An ATS-optimized professional summary replacement",
  "experience": [
    {
      "index": 0,
      "title": "optimized job title if needed or original",
      "bullets": ["ATS-optimized bullet 1", "ATS-optimized bullet 2"]
    }
  ],
  "projects": [
    {
      "index": 0,
      "description": "ATS-optimized project description",
      "bullets": ["ATS-optimized bullet 1"]
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Only include sections that exist in the resume data. If experience has 2 entries, return 2 objects in the experience array with matching index values.`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You generate ATS-optimized resume content. Return ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    });

    const rawOutput = response.choices[0].message.content;

    // Parse JSON from response
    let suggestions;
    try {
      const firstBrace = rawOutput.indexOf("{");
      const lastBrace = rawOutput.lastIndexOf("}");
      suggestions = JSON.parse(rawOutput.slice(firstBrace, lastBrace + 1));
    } catch (parseErr) {
      console.error("ATS suggestions JSON parse failed:", rawOutput);
      return res.status(500).json({ error: "AI returned invalid response. Try again." });
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("ATS suggestions error:", error);
    res.status(500).json({ error: "Failed to generate ATS suggestions" });
  }
};


// POST generate PDF from resume data
exports.generatePDF = async (req, res) => {
  try {
    const { resumeData, template } = req.body;

    if (!resumeData) {
      return res.status(400).json({ error: "resumeData is required" });
    }

    // Build a clean HTML resume
    const html = buildResumeHTML(resumeData, template || "the-zurich");

    // Return HTML for client-side PDF rendering
    res.json({
      html,
      message: "Resume HTML generated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF generation failed" });
  }
};


// ──────────────────────────────────────────────────────────
// Helper: Build resume HTML — dispatches per template
// ──────────────────────────────────────────────────────────
function buildResumeHTML(data, template) {
  switch (template) {
    case "tokyo-pro": return buildTokyoPro(data);
    case "austin-creative": return buildAustinCreative(data);
    case "oslo-clean": return buildOsloClean(data);
    default: return buildDefault(data);
  }
}

/* ─── shared helpers ─── */
function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function bullets(arr) { return (arr || []).filter(b => b && b.trim()); }
function extras(data) {
  const parts = [];
  if (data.internships) parts.push(`<strong>Internships:</strong> ${esc(data.internships)}`);
  if (data.hobbies) parts.push(`<strong>Hobbies:</strong> ${esc(data.hobbies)}`);
  if (data.extraCurricular) parts.push(`<strong>Extra-Curricular:</strong> ${esc(data.extraCurricular)}`);
  return parts;
}
function projectsBlock(data, headStyle, bulletChar) {
  if (!data.projects || data.projects.length === 0) return "";
  let h = headStyle.open + "Projects" + headStyle.close;
  data.projects.forEach(p => {
    const bl = bullets(p.bullets);
    h += `<div style="margin-bottom:8px;">
      <strong style="font-size:12px;">${esc(p.name)}</strong>
      ${p.technologies ? `<span style="font-size:10px;color:#64748b;"> — ${esc(p.technologies)}</span>` : ""}
      ${p.description ? `<p style="font-size:11px;color:#334155;margin:2px 0;">${esc(p.description)}</p>` : ""}
      ${bl.length ? `<ul style="margin:4px 0 0 16px;padding:0;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;">${bulletChar || ""}${esc(b)}</li>`).join("")}</ul>` : ""}
    </div>`;
  });
  return h;
}

/* ══════════ TOKYO PRO — two-column dark sidebar ══════════ */
function buildTokyoPro(data) {
  const name = data.name || "Your Name";
  const initial = name.charAt(0).toUpperCase();
  const contact = [data.location, data.email, data.phone, data.linkedin].filter(Boolean);

  let sidebarSkills = "";
  if (data.skills && data.skills.length)
    sidebarSkills = `<div style="margin-bottom:14px;"><h4 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#818cf8;margin:0 0 6px;">Skills</h4><div style="display:flex;flex-wrap:wrap;gap:4px;">${data.skills.map(s => `<span style="padding:2px 6px;background:#1e293b;border-radius:3px;font-size:9px;color:#cbd5e1;">${esc(s)}</span>`).join("")}</div></div>`;

  let sidebarEdu = "";
  if (data.education && data.education.length)
    sidebarEdu = `<div><h4 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#818cf8;margin:0 0 6px;">Education</h4>${data.education.map(e => `<div style="margin-bottom:6px;"><div style="font-size:10px;color:#cbd5e1;">${esc(e.degree)}</div><div style="font-size:9px;color:#94a3b8;">${esc(e.school)}</div><div style="font-size:9px;color:#64748b;">${e.startDate} – ${e.endDate}</div></div>`).join("")}</div>`;

  let rightExp = "";
  if (data.experience && data.experience.length) {
    rightExp = `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#4f46e5;margin:0 0 8px;">Experience</h3>`;
    data.experience.forEach(exp => {
      const bl = bullets(exp.bullets);
      rightExp += `<div style="padding-left:10px;border-left:2px solid #c7d2fe;margin-bottom:12px;position:relative;">
        <div style="position:absolute;left:-5px;top:2px;width:8px;height:8px;border-radius:50%;background:#6366f1;"></div>
        <div><strong style="font-size:11px;color:#0f172a;">${esc(exp.title)}</strong><span style="font-size:9px;color:#94a3b8;margin-left:8px;">${exp.startDate} – ${exp.endDate}</span></div>
        <div style="font-size:10px;color:#64748b;">${esc(exp.company)}${exp.location ? ' • ' + esc(exp.location) : ''}</div>
        ${bl.length ? `<ul style="margin:4px 0 0 14px;padding:0;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;">${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
  }

  let rightProjects = "";
  if (data.projects && data.projects.length) {
    rightProjects = `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#4f46e5;margin:14px 0 8px;">Projects</h3>`;
    data.projects.forEach(p => {
      const bl = bullets(p.bullets);
      rightProjects += `<div style="padding-left:10px;border-left:2px solid #c7d2fe;margin-bottom:10px;position:relative;">
        <div style="position:absolute;left:-5px;top:2px;width:8px;height:8px;border-radius:50%;background:#6366f1;"></div>
        <strong style="font-size:11px;">${esc(p.name)}</strong>${p.technologies ? `<span style="font-size:9px;color:#64748b;"> — ${esc(p.technologies)}</span>` : ""}
        ${p.description ? `<div style="font-size:10px;color:#334155;margin:2px 0;">${esc(p.description)}</div>` : ""}
        ${bl.length ? `<ul style="margin:4px 0 0 14px;padding:0;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;">${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
  }

  const ex = extras(data);
  const extrasBlock = ex.length ? `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#4f46e5;margin:14px 0 6px;">Additional</h3><div style="font-size:11px;color:#334155;">${ex.join("<br/>")}</div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(name)} - Resume</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;">
<div style="display:flex;min-height:100vh;">
  <div style="width:36%;background:#0f172a;color:#fff;padding:32px 20px;">
    <div style="width:48px;height:48px;border-radius:50%;background:#6366f1;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;color:#fff;margin-bottom:8px;">${initial}</div>
    <h1 style="font-size:16px;font-weight:bold;margin:0;">${esc(name)}</h1>
    <p style="font-size:10px;color:#818cf8;margin:2px 0 16px;">${esc(data.jobRole || "")}</p>
    <div style="margin-bottom:14px;">
      <h4 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#818cf8;margin:0 0 4px;">Contact</h4>
      <div style="font-size:10px;color:#cbd5e1;line-height:1.6;">${contact.map(c => esc(c)).join("<br/>")}</div>
    </div>
    ${sidebarSkills}${sidebarEdu}
  </div>
  <div style="flex:1;padding:32px 24px;">
    ${data.summary ? `<h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#4f46e5;margin:0 0 6px;">Profile</h3><p style="font-size:11px;color:#334155;margin:0 0 14px;">${esc(data.summary)}</p>` : ""}
    ${rightExp}${rightProjects}${extrasBlock}
  </div>
</div></body></html>`;
}

/* ══════════ AUSTIN CREATIVE — gradient header banner ══════════ */
function buildAustinCreative(data) {
  const name = data.name || "Your Name";
  const contact = [data.location, data.email, data.phone, data.linkedin].filter(Boolean).join(" • ");

  let expHTML = "";
  if (data.experience && data.experience.length) {
    expHTML = `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:18px 0 8px;">Experience</h2>`;
    data.experience.forEach(exp => {
      const bl = bullets(exp.bullets);
      expHTML += `<div style="background:rgba(255,241,242,0.5);border:1px solid #fecdd3;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12px;">${esc(exp.title)}</strong><span style="font-size:9px;color:#fb7185;font-weight:500;">${exp.startDate} – ${exp.endDate}</span></div>
        <div style="font-size:10px;color:#64748b;">${esc(exp.company)}${exp.location ? ' • ' + esc(exp.location) : ''}</div>
        ${bl.length ? `<ul style="margin:4px 0 0 0;padding:0;list-style:none;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;"><span style="color:#fb7185;">▸</span> ${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
  }

  let projHTML = "";
  if (data.projects && data.projects.length) {
    projHTML = `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:18px 0 8px;">Projects</h2>`;
    data.projects.forEach(p => {
      const bl = bullets(p.bullets);
      projHTML += `<div style="background:rgba(255,241,242,0.5);border:1px solid #fecdd3;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <strong style="font-size:12px;">${esc(p.name)}</strong>${p.technologies ? `<span style="font-size:10px;color:#64748b;"> — ${esc(p.technologies)}</span>` : ""}
        ${p.description ? `<p style="font-size:11px;color:#334155;margin:2px 0;">${esc(p.description)}</p>` : ""}
        ${bl.length ? `<ul style="margin:4px 0 0 0;padding:0;list-style:none;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;"><span style="color:#fb7185;">▸</span> ${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
  }

  let skillsHTML = "";
  if (data.skills && data.skills.length)
    skillsHTML = `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:18px 0 8px;">Core Skills</h2>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${data.skills.map(s => `<span style="padding:3px 10px;background:#fff1f2;color:#be123c;border:1px solid #fecdd3;border-radius:50px;font-size:10px;font-weight:500;">${esc(s)}</span>`).join("")}</div>`;

  let eduHTML = "";
  if (data.education && data.education.length) {
    eduHTML = `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:18px 0 8px;">Education</h2>`;
    data.education.forEach(e => { eduHTML += `<div style="margin-bottom:4px;"><strong style="font-size:11px;">${esc(e.degree)}</strong><div style="font-size:10px;color:#64748b;">${esc(e.school)} — ${e.startDate} – ${e.endDate}</div></div>`; });
  }

  const ex = extras(data);
  const extrasBlock = ex.length ? `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:18px 0 8px;">Additional</h2><div style="font-size:11px;color:#334155;">${ex.join("<br/>")}</div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(name)} - Resume</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;">
  <div style="background:linear-gradient(to right,#f43f5e,#fb923c);padding:28px 32px;color:#fff;">
    <h1 style="font-size:22px;font-weight:800;margin:0;letter-spacing:-0.5px;">${esc(name)}</h1>
    <p style="font-size:10px;color:rgba(255,255,255,0.8);margin:4px 0 0;">${esc(contact)}</p>
  </div>
  <div style="max-width:700px;margin:0 auto;padding:20px 32px 40px;">
    ${data.summary ? `<h2 style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#e11d48;margin:0 0 6px;">About Me</h2><p style="font-size:11px;color:#334155;font-style:italic;margin:0 0 10px;">${esc(data.summary)}</p>` : ""}
    ${skillsHTML}${expHTML}${projHTML}${eduHTML}${extrasBlock}
  </div>
</body></html>`;
}

/* ══════════ OSLO CLEAN — timeline dots, left-aligned ══════════ */
function buildOsloClean(data) {
  const name = data.name || "Your Name";
  const contact = [data.location, data.email, data.phone, data.linkedin].filter(Boolean).join(" • ");
  const headOpen = `<h2 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#94a3b8;margin:18px 0 8px;">`;
  const headClose = `</h2>`;

  let expHTML = "";
  if (data.experience && data.experience.length) {
    expHTML = headOpen + "Experience" + headClose + `<div style="padding-left:14px;position:relative;">`;
    expHTML += `<div style="position:absolute;left:5px;top:6px;bottom:0;width:1px;background:#e2e8f0;"></div>`;
    data.experience.forEach(exp => {
      const bl = bullets(exp.bullets);
      expHTML += `<div style="margin-bottom:12px;position:relative;">
        <div style="position:absolute;left:-12px;top:4px;width:9px;height:9px;border-radius:50%;border:2px solid #94a3b8;background:#fff;"></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12px;color:#1e293b;">${esc(exp.title)}</strong><span style="font-size:9px;color:#94a3b8;font-family:monospace;">${exp.startDate} – ${exp.endDate}</span></div>
        <div style="font-size:10px;color:#94a3b8;">${esc(exp.company)}${exp.location ? ' · ' + esc(exp.location) : ''}</div>
        ${bl.length ? `<ul style="margin:4px 0 0 0;padding:0;list-style:none;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;"><span style="color:#cbd5e1;">—</span> ${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
    expHTML += `</div>`;
  }

  let projHTML = "";
  if (data.projects && data.projects.length) {
    projHTML = headOpen + "Projects" + headClose + `<div style="padding-left:14px;position:relative;">`;
    projHTML += `<div style="position:absolute;left:5px;top:6px;bottom:0;width:1px;background:#e2e8f0;"></div>`;
    data.projects.forEach(p => {
      const bl = bullets(p.bullets);
      projHTML += `<div style="margin-bottom:10px;position:relative;">
        <div style="position:absolute;left:-12px;top:4px;width:9px;height:9px;border-radius:50%;border:2px solid #94a3b8;background:#fff;"></div>
        <strong style="font-size:12px;color:#1e293b;">${esc(p.name)}</strong>${p.technologies ? `<span style="font-size:9px;color:#94a3b8;font-family:monospace;"> — ${esc(p.technologies)}</span>` : ""}
        ${p.description ? `<div style="font-size:11px;color:#334155;margin:2px 0;">${esc(p.description)}</div>` : ""}
        ${bl.length ? `<ul style="margin:4px 0 0 0;padding:0;list-style:none;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;"><span style="color:#cbd5e1;">—</span> ${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    });
    projHTML += `</div>`;
  }

  let skillsHTML = "";
  if (data.skills && data.skills.length)
    skillsHTML = headOpen + "Skills" + headClose + `<p style="font-size:11px;color:#1e293b;font-family:monospace;">${data.skills.map(s => esc(s)).join("  |  ")}</p>`;

  let eduHTML = "";
  if (data.education && data.education.length) {
    eduHTML = headOpen + "Education" + headClose;
    data.education.forEach(e => { eduHTML += `<div style="margin-bottom:4px;"><strong style="font-size:11px;color:#1e293b;">${esc(e.degree)}</strong><div style="font-size:10px;color:#94a3b8;font-family:monospace;">${esc(e.school)} — ${e.startDate} – ${e.endDate}</div></div>`; });
  }

  const ex = extras(data);
  const extrasBlock = ex.length ? headOpen + "Additional" + headClose + `<div style="font-size:11px;color:#334155;">${ex.join("<br/>")}</div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(name)} - Resume</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;max-width:700px;margin:0 auto;padding:40px 32px;">
  <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #0f172a;">
    <h1 style="font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px;color:#0f172a;">${esc(name)}</h1>
    <p style="font-size:10px;color:#94a3b8;font-family:monospace;margin:4px 0 0;">${esc(contact)}</p>
  </div>
  ${data.summary ? `<p style="font-size:11px;color:#334155;margin:0 0 12px;">${esc(data.summary)}</p>` : ""}
  ${expHTML}${projHTML}${skillsHTML}${eduHTML}${extrasBlock}
</body></html>`;
}

/* ══════════ DEFAULT — classic single-column centered ══════════ */
function buildDefault(data) {
  const name = data.name || "Your Name";
  const contactParts = [data.location, data.email, data.phone, data.linkedin, data.github].filter(Boolean);
  const contact = contactParts.join(" | ");
  const headStyle = { open: `<h2 style="font-size:13px;font-weight:bold;color:#1e40af;text-transform:uppercase;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin:16px 0 8px;">`, close: `</h2>` };

  let experienceHTML = "";
  if (data.experience && data.experience.length > 0) {
    experienceHTML = headStyle.open + "Experience" + headStyle.close;
    data.experience.forEach((exp) => {
      const bl = bullets(exp.bullets);
      experienceHTML += `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:baseline;"><strong style="font-size:12px;">${esc(exp.title)}</strong><span style="font-size:10px;color:#94a3b8;">${exp.startDate || ""} – ${exp.endDate || ""}</span></div><div style="font-size:10px;color:#64748b;">${esc(exp.company)}${exp.location ? ", " + esc(exp.location) : ""}</div>${bl.length ? `<ul style="margin:4px 0 0 16px;padding:0;font-size:11px;color:#334155;">${bl.map(b => `<li style="margin-bottom:2px;">${esc(b)}</li>`).join("")}</ul>` : ""}</div>`;
    });
  }

  let educationHTML = "";
  if (data.education && data.education.length > 0) {
    educationHTML = headStyle.open + "Education" + headStyle.close;
    data.education.forEach((edu) => {
      educationHTML += `<div style="margin-bottom:6px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:12px;">${esc(edu.degree)}</strong><span style="font-size:10px;color:#94a3b8;">${edu.startDate || ""} – ${edu.endDate || ""}</span></div><div style="font-size:10px;color:#64748b;">${esc(edu.school)}${edu.gpa ? " • GPA: " + esc(edu.gpa) : ""}</div></div>`;
    });
  }

  let skillsHTML = "";
  if (data.skills && data.skills.length > 0) {
    skillsHTML = headStyle.open + "Skills" + headStyle.close + `<p style="font-size:11px;color:#334155;">${data.skills.map(s => esc(s)).join(", ")}</p>`;
  }

  const projBlock = projectsBlock(data, headStyle, "");

  const ex = extras(data);
  const extrasBlock = ex.length ? headStyle.open + "Additional" + headStyle.close + `<div style="font-size:11px;color:#334155;">${ex.join("<br/>")}</div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(name)} - Resume</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;padding:40px 32px;color:#0f172a;line-height:1.5;">
  <div style="text-align:center;margin-bottom:16px;"><h1 style="font-size:22px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0;">${esc(name)}</h1><p style="font-size:10px;color:#64748b;margin:6px 0 0;">${esc(contact)}</p></div>
  ${data.summary ? headStyle.open + "Professional Summary" + headStyle.close + `<p style="font-size:11px;color:#334155;">${esc(data.summary)}</p>` : ""}
  ${experienceHTML}${educationHTML}${skillsHTML}${projBlock}${extrasBlock}
</body></html>`;
}
