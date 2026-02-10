const pool = require("../config/db");

/**
 * Fetch company roles from DB and calculate match scores against user skills
 */
exports.calculateCompanyMatchesFromDB = async (jobRole, userSkills) => {
  try {
    const result = await pool.query(
      "SELECT * FROM company_roles WHERE LOWER(role) = LOWER($1) ORDER BY company_name",
      [jobRole]
    );

    if (result.rows.length === 0) {
      // Fallback: return all roles if no exact match
      const allResult = await pool.query(
        "SELECT * FROM company_roles ORDER BY company_name"
      );
      return exports.scoreMatches(allResult.rows, userSkills);
    }

    return exports.scoreMatches(result.rows, userSkills);
  } catch (err) {
    console.error("DB company match fetch failed:", err.message);
    return [];
  }
};

/**
 * Score each company role against user's skills
 */
exports.scoreMatches = (companyRows, userSkills) => {
  const normalizedUserSkills = (userSkills || []).map(s => s.toLowerCase().trim()).filter(Boolean);

  return companyRows.map(row => {
    const requiredSkills = row.extracted_skills || [];
    let matchedCount = 0;
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(skill => {
      const normalized = skill.toLowerCase().trim();
      // Check: exact match, substring match, or partial token overlap
      const isMatch = normalizedUserSkills.some(us => {
        if (us === normalized) return true;                    // exact
        if (us.includes(normalized) || normalized.includes(us)) return true; // substring
        // Token overlap: "rest api" matches "rest" or "api"
        const skillTokens = normalized.split(/[\s\/,.-]+/);
        const userTokens = us.split(/[\s\/,.-]+/);
        return skillTokens.some(st => st.length > 1 && userTokens.includes(st));
      });

      if (isMatch) {
        matchedCount++;
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchedCount / requiredSkills.length) * 100)
      : 0;

    return {
      company: row.company_name,
      role: row.role,
      description: row.job_description,
      location: row.location || "Remote",
      applyLink: row.apply_link || null,
      matchScore,
      matchedSkills,
      missingSkills,
      totalSkills: requiredSkills.length,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Legacy in-memory match (kept for backward compat with createResume)
 */
exports.calculateCompanyMatches = (jobRole, aiContent) => {
  const resumeText = JSON.stringify(aiContent).toLowerCase();
  const hardcoded = [
    { company: "Google", role: "Software Engineer", requiredSkills: ["javascript", "data structures", "algorithms", "system design", "api"] },
    { company: "Zoho", role: "Software Engineer", requiredSkills: ["javascript", "node", "sql", "api", "backend"] },
    { company: "Freshworks", role: "Software Engineer", requiredSkills: ["react", "node", "database", "rest api", "git"] },
  ];
  let matches = [];
  hardcoded.forEach(c => {
    if (c.role !== jobRole) return;
    let matched = 0;
    c.requiredSkills.forEach(s => { if (resumeText.includes(s)) matched++; });
    matches.push({ company: c.company, matchScore: Math.round((matched / c.requiredSkills.length) * 100) });
  });
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

exports.calculateHiringProbability = (atsScore, companyMatches) => {
  return companyMatches.map(company => ({
    company: company.company,
    matchScore: company.matchScore,
    hiringProbability: Math.round((atsScore * 0.4) + (company.matchScore * 0.6)),
  }));
};

/**
 * Generate real job search URLs for a given role
 */
exports.generateJobSearchLinks = (jobRole, location) => {
  const encodedRole = encodeURIComponent(jobRole);
  const encodedLoc = location ? encodeURIComponent(location) : "";
  return {
    linkedin: `https://www.linkedin.com/jobs/search/?keywords=${encodedRole}${encodedLoc ? `&location=${encodedLoc}` : ""}`,
    indeed: `https://www.indeed.com/jobs?q=${encodedRole}${encodedLoc ? `&l=${encodedLoc}` : ""}`,
    glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedRole}`,
    naukri: `https://www.naukri.com/${jobRole.toLowerCase().replace(/\s+/g, "-")}-jobs`,
  };
};

/**
 * Fetch all distinct roles available in company_roles table
 */
exports.getAvailableRoles = async () => {
  try {
    const result = await pool.query("SELECT DISTINCT role FROM company_roles ORDER BY role");
    return result.rows.map(r => r.role);
  } catch (err) {
    console.error("Failed to fetch available roles:", err.message);
    return [];
};}
