/**
 * ═══════════════════════════════════════════════════════════
 *  SpellFolio ATS Score Engine v2.0
 *  A comprehensive, production-grade ATS scoring system
 *  Analyzes resumes across 8 scoring dimensions
 * ═══════════════════════════════════════════════════════════
 */

// ─── SCORING WEIGHTS ─────────────────────────────────────
const WEIGHTS = {
  keywordMatch:       0.20,   // Role-specific keyword density
  formatting:         0.12,   // Action verbs, bullet length, structure
  readability:        0.10,   // Sentence length, clarity
  sectionCompleteness:0.15,   // Presence of required sections
  contactInfo:        0.08,   // Email, phone, LinkedIn, location
  quantification:     0.10,   // Metrics, numbers, percentages
  skillAlignment:     0.15,   // Skills vs. job requirements
  companyFit:         0.10,   // Match against company_roles DB
};

// ─── ROLE KEYWORD DATABASE ───────────────────────────────
const ROLE_KEYWORDS = {
  "Software Engineer": {
    critical: ["javascript", "python", "java", "react", "node", "api", "backend", "frontend", "database", "sql", "git"],
    important: ["docker", "kubernetes", "aws", "microservices", "rest", "graphql", "typescript", "ci/cd", "agile", "testing"],
    bonus: ["system design", "scalability", "performance", "redis", "mongodb", "linux", "cloud", "devops", "algorithms", "data structures"],
  },
  "Data Analyst": {
    critical: ["python", "sql", "excel", "data analysis", "visualization", "statistics", "pandas"],
    important: ["power bi", "tableau", "r", "machine learning", "data cleaning", "reporting", "dashboards"],
    bonus: ["a/b testing", "regression", "hypothesis testing", "etl", "data warehouse", "bigquery", "spark"],
  },
  "Data Scientist": {
    critical: ["python", "machine learning", "statistics", "sql", "data analysis", "deep learning", "tensorflow"],
    important: ["pytorch", "scikit-learn", "pandas", "numpy", "nlp", "computer vision", "jupyter"],
    bonus: ["kubernetes", "mlops", "feature engineering", "a/b testing", "spark", "hadoop", "model deployment"],
  },
  "Frontend Developer": {
    critical: ["javascript", "react", "html", "css", "typescript", "responsive design", "ui"],
    important: ["next.js", "vue", "angular", "tailwind", "sass", "webpack", "testing", "accessibility"],
    bonus: ["figma", "performance optimization", "pwa", "graphql", "storybook", "animation", "seo"],
  },
  "Backend Developer": {
    critical: ["node", "python", "java", "api", "database", "sql", "rest", "backend"],
    important: ["docker", "microservices", "aws", "redis", "mongodb", "postgresql", "authentication"],
    bonus: ["kubernetes", "message queue", "caching", "load balancing", "grpc", "elasticsearch", "ci/cd"],
  },
  "Full Stack Developer": {
    critical: ["javascript", "react", "node", "api", "database", "html", "css", "sql"],
    important: ["typescript", "docker", "aws", "mongodb", "postgresql", "git", "rest", "testing"],
    bonus: ["graphql", "next.js", "redis", "ci/cd", "agile", "microservices", "devops", "cloud"],
  },
  "DevOps Engineer": {
    critical: ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform", "jenkins"],
    important: ["ansible", "monitoring", "prometheus", "grafana", "bash", "python", "git"],
    bonus: ["helm", "istio", "argo", "cloudformation", "azure", "gcp", "security", "networking"],
  },
  "Product Manager": {
    critical: ["product management", "roadmap", "strategy", "stakeholder", "user research", "analytics"],
    important: ["agile", "scrum", "jira", "a/b testing", "metrics", "kpi", "prioritization", "mvp"],
    bonus: ["sql", "data-driven", "competitive analysis", "go-to-market", "pricing", "retention", "growth"],
  },
  "UI/UX Designer": {
    critical: ["figma", "user research", "wireframe", "prototype", "usability", "design system"],
    important: ["sketch", "adobe xd", "user testing", "information architecture", "accessibility", "responsive"],
    bonus: ["html", "css", "motion design", "design thinking", "a/b testing", "analytics", "heuristic evaluation"],
  },
  "Cybersecurity Analyst": {
    critical: ["security", "firewall", "vulnerability", "incident response", "siem", "threat analysis"],
    important: ["penetration testing", "encryption", "network security", "compliance", "risk assessment", "ids"],
    bonus: ["soc", "osint", "malware analysis", "python", "bash", "cloud security", "zero trust"],
  },
  "Machine Learning Engineer": {
    critical: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "model training"],
    important: ["scikit-learn", "nlp", "computer vision", "feature engineering", "mlops", "docker"],
    bonus: ["kubernetes", "spark", "distributed computing", "gans", "reinforcement learning", "onnx", "triton"],
  },
};

// ─── ACTION VERBS ────────────────────────────────────────
const STRONG_ACTION_VERBS = [
  "developed", "designed", "implemented", "optimized", "built", "engineered",
  "created", "improved", "integrated", "automated", "deployed", "architected",
  "led", "managed", "delivered", "reduced", "increased", "launched",
  "streamlined", "refactored", "migrated", "configured", "established",
  "spearheaded", "orchestrated", "pioneered", "transformed", "mentored",
  "collaborated", "analyzed", "resolved", "scaled", "maintained", "secured",
  "tested", "documented", "executed", "achieved", "negotiated", "presented",
];

const WEAK_VERBS = [
  "helped", "assisted", "worked", "did", "made", "got", "was", "had",
  "responsible for", "involved in", "participated", "contributed",
];

// ─── REQUIRED SECTIONS ──────────────────────────────────
const REQUIRED_SECTIONS = ["summary", "experience", "education", "skills"];
const BONUS_SECTIONS = ["projects", "certifications", "internships", "awards"];

// ─── QUANTIFICATION PATTERNS ────────────────────────────
const QUANT_PATTERNS = [
  /\d+%/,           // percentages
  /\$[\d,]+/,       // dollar amounts
  /\d+\+?\s*(users|clients|customers|team|members|employees)/i,
  /\d+x/,           // multipliers like 3x, 10x
  /\d+\s*(projects|applications|apis|services|features)/i,
  /reduced.*\d+/i,
  /increased.*\d+/i,
  /improved.*\d+/i,
  /saved.*\d+/i,
  /\d+\s*(months|years|weeks|days|hours)/i,
];


// ═══════════════════════════════════════════════════════════
//  SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * 1. KEYWORD MATCH SCORE
 * Checks how many role-specific keywords appear in the resume
 */
function scoreKeywordMatch(jobRole, resumeText) {
  const roleData = ROLE_KEYWORDS[jobRole] || ROLE_KEYWORDS["Software Engineer"];
  const text = resumeText.toLowerCase();

  const criticalFound = [];
  const criticalMissing = [];
  roleData.critical.forEach(kw => {
    if (text.includes(kw)) criticalFound.push(kw);
    else criticalMissing.push(kw);
  });

  const importantFound = [];
  const importantMissing = [];
  roleData.important.forEach(kw => {
    if (text.includes(kw)) importantFound.push(kw);
    else importantMissing.push(kw);
  });

  const bonusFound = [];
  roleData.bonus.forEach(kw => {
    if (text.includes(kw)) bonusFound.push(kw);
  });

  const criticalScore = roleData.critical.length > 0
    ? (criticalFound.length / roleData.critical.length) * 50
    : 25;
  const importantScore = roleData.important.length > 0
    ? (importantFound.length / roleData.important.length) * 30
    : 15;
  const bonusScore = roleData.bonus.length > 0
    ? (bonusFound.length / roleData.bonus.length) * 20
    : 10;

  return {
    score: Math.min(Math.round(criticalScore + importantScore + bonusScore), 100),
    criticalFound,
    criticalMissing,
    importantFound,
    importantMissing,
    bonusFound,
  };
}

/**
 * 2. FORMATTING SCORE
 * Checks bullet quality, action verbs, structure
 */
function scoreFormatting(resumeText) {
  let score = 100;
  const issues = [];
  const benefits = [];

  const lines = resumeText.split("\n").filter(l => l.trim());
  const bulletLines = lines.filter(l => /^[\s]*[-•▪◦*]\s/.test(l) || /^[\s]*\d+[.)]\s/.test(l));

  // Check for action verbs
  let strongVerbCount = 0;
  let weakVerbCount = 0;
  bulletLines.forEach(line => {
    const words = line.replace(/^[\s]*[-•▪◦*\d.)]+\s*/, "").split(/\s+/);
    const firstWord = (words[0] || "").toLowerCase();
    if (STRONG_ACTION_VERBS.includes(firstWord)) strongVerbCount++;
    if (WEAK_VERBS.some(wv => line.toLowerCase().startsWith(wv) || firstWord === wv)) weakVerbCount++;
  });

  if (bulletLines.length > 0 && strongVerbCount / bulletLines.length >= 0.5) {
    benefits.push("Good use of strong action verbs across bullet points");
  } else if (bulletLines.length > 0) {
    score -= 10;
    issues.push("Many bullet points lack strong action verbs (use: developed, implemented, led, etc.)");
  }

  if (weakVerbCount > 2) {
    score -= 8;
    issues.push(`${weakVerbCount} bullet(s) use weak verbs (helped, assisted, worked). Replace with impact verbs.`);
  }

  // Check bullet length
  let longBullets = 0;
  let shortBullets = 0;
  bulletLines.forEach(line => {
    const wordCount = line.split(/\s+/).length;
    if (wordCount > 30) { longBullets++; score -= 3; }
    if (wordCount < 5) { shortBullets++; score -= 2; }
  });
  if (longBullets > 0) issues.push(`${longBullets} bullet(s) exceed 30 words — ATS parsers may truncate them`);
  if (shortBullets > 0) issues.push(`${shortBullets} bullet(s) are too short — add more detail and impact`);
  if (longBullets === 0 && bulletLines.length > 3) benefits.push("Bullet points are well-sized for ATS readability");

  // Check overall length
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 150) {
    score -= 15;
    issues.push("Resume is very short (<150 words). Most ATS systems expect 300-700 words.");
  } else if (wordCount >= 300 && wordCount <= 800) {
    benefits.push("Resume length is ideal for ATS parsing (300-800 words)");
  } else if (wordCount > 1000) {
    score -= 5;
    issues.push("Resume exceeds 1000 words — consider condensing for a 1-page format");
  }

  // Check for common ATS-unfriendly patterns
  if (/[^\x00-\x7F]/.test(resumeText) && !/[éèêëàáâãäåùúûüòóôõö]/i.test(resumeText)) {
    score -= 5;
    issues.push("Resume contains special characters that may confuse ATS parsers");
  }

  return { score: Math.max(score, 0), issues, benefits };
}

/**
 * 3. READABILITY SCORE
 */
function scoreReadability(resumeText) {
  let score = 100;
  const issues = [];
  const benefits = [];

  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim());
  const words = resumeText.split(/\s+/).length;
  const avgSentenceLen = sentences.length > 0 ? words / sentences.length : 0;

  if (avgSentenceLen <= 20) {
    benefits.push("Sentences are concise and ATS-friendly");
  } else if (avgSentenceLen > 25) {
    score -= 15;
    issues.push("Average sentence length is too high — aim for under 20 words per sentence");
  } else if (avgSentenceLen > 30) {
    score -= 30;
  }

  // Check for paragraph walls (lines > 100 chars without breaks)
  const longParagraphs = resumeText.split("\n").filter(l => l.length > 200);
  if (longParagraphs.length > 0) {
    score -= 10;
    issues.push("Found dense text blocks — break into bullet points for better ATS parsing");
  } else {
    benefits.push("Good use of line breaks and structure");
  }

  return { score: Math.max(score, 0), issues, benefits };
}

/**
 * 4. SECTION COMPLETENESS SCORE
 */
function scoreSectionCompleteness(resumeText) {
  let score = 0;
  const text = resumeText.toLowerCase();
  const found = [];
  const missing = [];

  REQUIRED_SECTIONS.forEach(section => {
    // Check for section headers in various formats
    const patterns = [
      new RegExp(`\\b${section}\\b`, "i"),
      new RegExp(`\\b${section}s?\\b`, "i"),
    ];
    if (section === "summary") patterns.push(/professional\s+summary|objective|profile|about/i);
    if (section === "experience") patterns.push(/work\s+experience|employment|professional\s+experience/i);
    if (section === "education") patterns.push(/academic|qualification|degree/i);
    if (section === "skills") patterns.push(/technical\s+skills|core\s+competencies|technologies/i);

    const isPresent = patterns.some(p => p.test(text));
    if (isPresent) { found.push(section); score += 20; }
    else missing.push(section);
  });

  // Bonus sections
  const bonusFound = [];
  BONUS_SECTIONS.forEach(section => {
    if (text.includes(section)) { bonusFound.push(section); score += 5; }
  });

  return {
    score: Math.min(score, 100),
    found,
    missing,
    bonusFound,
    benefits: found.length >= 3
      ? [`Resume includes ${found.length}/4 required sections`]
      : [],
    issues: missing.length > 0
      ? [`Missing sections: ${missing.join(", ")}. Add them for better ATS parsing.`]
      : [],
  };
}

/**
 * 5. CONTACT INFO SCORE
 */
function scoreContactInfo(resumeText) {
  let score = 0;
  const found = [];
  const missing = [];
  const text = resumeText;

  // Email
  if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) { found.push("Email"); score += 25; }
  else missing.push("Email");

  // Phone
  if (/(\+?\d[\d\s()-]{7,})/.test(text)) { found.push("Phone"); score += 25; }
  else missing.push("Phone");

  // LinkedIn
  if (/linkedin\.com|linkedin/i.test(text)) { found.push("LinkedIn"); score += 25; }
  else missing.push("LinkedIn");

  // Location
  if (/([A-Z][a-z]+,\s*[A-Z]{2})|(city|location|address)/i.test(text)) { found.push("Location"); score += 15; }
  else missing.push("Location");

  // GitHub/Portfolio (bonus)
  if (/github\.com|portfolio|website/i.test(text)) { found.push("GitHub/Portfolio"); score += 10; }

  return {
    score: Math.min(score, 100),
    found,
    missing,
    benefits: found.length >= 3 ? ["Contact information is comprehensive"] : [],
    issues: missing.length > 0 ? [`Missing contact info: ${missing.join(", ")}`] : [],
  };
}

/**
 * 6. QUANTIFICATION SCORE
 * Checks for metrics, numbers, and measurable impact
 */
function scoreQuantification(resumeText) {
  let score = 0;
  const benefits = [];
  const issues = [];
  let metricsFound = 0;

  QUANT_PATTERNS.forEach(pattern => {
    const matches = resumeText.match(new RegExp(pattern, "g"));
    if (matches) metricsFound += matches.length;
  });

  if (metricsFound >= 5) {
    score = 100;
    benefits.push(`Excellent — ${metricsFound} quantified achievements found (top 10% of resumes)`);
  } else if (metricsFound >= 3) {
    score = 75;
    benefits.push(`Good — ${metricsFound} metrics found. Consider adding 2-3 more for maximum impact.`);
  } else if (metricsFound >= 1) {
    score = 40;
    issues.push(`Only ${metricsFound} quantified achievement(s) found. Top resumes have 5+. Add numbers like "Increased performance by 40%".`);
  } else {
    score = 10;
    issues.push("No quantified achievements found. ATS-friendly resumes include metrics like \"reduced costs by 30%\", \"served 10k+ users\".");
  }

  return { score, metricsFound, benefits, issues };
}

/**
 * 7. SKILL ALIGNMENT SCORE (against role requirements)
 */
function scoreSkillAlignment(jobRole, resumeText) {
  const roleData = ROLE_KEYWORDS[jobRole] || ROLE_KEYWORDS["Software Engineer"];
  const text = resumeText.toLowerCase();

  const allRequired = [...roleData.critical, ...roleData.important];
  let matchCount = 0;
  const matched = [];
  const unmatched = [];

  allRequired.forEach(skill => {
    if (text.includes(skill)) { matchCount++; matched.push(skill); }
    else unmatched.push(skill);
  });

  const score = allRequired.length > 0 ? Math.round((matchCount / allRequired.length) * 100) : 50;

  return {
    score: Math.min(score, 100),
    matched,
    unmatched,
    benefits: score >= 70
      ? [`Strong skill alignment — ${matched.length}/${allRequired.length} required skills present`]
      : [],
    issues: score < 50
      ? [`Low skill alignment (${matched.length}/${allRequired.length}). Add these critical skills: ${unmatched.slice(0, 5).join(", ")}`]
      : score < 70
      ? [`Moderate skill alignment. Consider adding: ${unmatched.slice(0, 3).join(", ")}`]
      : [],
  };
}

/**
 * 8. COMPANY FIT SCORE
 * Matches resume against company_roles data
 */
function scoreCompanyFit(jobRole, resumeText, companyRolesData) {
  const text = resumeText.toLowerCase();
  const results = [];

  if (!companyRolesData || companyRolesData.length === 0) {
    // Fallback to built-in data
    return { score: 50, matches: [], benefits: [], issues: ["No company data available for comparison"] };
  }

  const roleCompanies = companyRolesData.filter(
    cr => cr.role.toLowerCase() === jobRole.toLowerCase()
  );

  if (roleCompanies.length === 0) {
    return { score: 50, matches: [], benefits: [], issues: [`No companies found hiring for "${jobRole}" in our database`] };
  }

  roleCompanies.forEach(company => {
    const skills = company.extracted_skills || [];
    let matched = 0;
    const matchedSkills = [];
    const missingSkills = [];

    skills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) { matched++; matchedSkills.push(skill); }
      else missingSkills.push(skill);
    });

    const matchScore = skills.length > 0 ? Math.round((matched / skills.length) * 100) : 0;
    results.push({
      company: company.company_name,
      matchScore,
      matchedSkills,
      missingSkills,
      applyLink: company.apply_link || null,
      location: company.location || "Remote",
    });
  });

  results.sort((a, b) => b.matchScore - a.matchScore);

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length)
    : 50;

  return {
    score: avgScore,
    matches: results,
    benefits: results.filter(r => r.matchScore >= 70).length > 0
      ? [`Strong fit for ${results.filter(r => r.matchScore >= 70).length} company(ies)`]
      : [],
    issues: results.filter(r => r.matchScore < 40).length > 0
      ? [`Low match for ${results.filter(r => r.matchScore < 40).length} company(ies) — review their required skills`]
      : [],
  };
}


// ═══════════════════════════════════════════════════════════
//  MAIN ENGINE
// ═══════════════════════════════════════════════════════════

/**
 * Run full ATS analysis on a resume
 * @param {string} jobRole - Target job role
 * @param {string} resumeText - Full plaintext of the resume
 * @param {Array} companyRolesData - Rows from company_roles table (optional)
 * @returns {Object} Complete ATS analysis result
 */
exports.analyzeResume = function analyzeResume(jobRole, resumeText, companyRolesData = []) {
  const keyword      = scoreKeywordMatch(jobRole, resumeText);
  const formatting   = scoreFormatting(resumeText);
  const readability  = scoreReadability(resumeText);
  const sections     = scoreSectionCompleteness(resumeText);
  const contact      = scoreContactInfo(resumeText);
  const quantify     = scoreQuantification(resumeText);
  const skillAlign   = scoreSkillAlignment(jobRole, resumeText);
  const companyFit   = scoreCompanyFit(jobRole, resumeText, companyRolesData);

  // ─── Weighted total ─────────────────────────────────
  const totalScore = Math.round(
    keyword.score      * WEIGHTS.keywordMatch +
    formatting.score   * WEIGHTS.formatting +
    readability.score  * WEIGHTS.readability +
    sections.score     * WEIGHTS.sectionCompleteness +
    contact.score      * WEIGHTS.contactInfo +
    quantify.score     * WEIGHTS.quantification +
    skillAlign.score   * WEIGHTS.skillAlignment +
    companyFit.score   * WEIGHTS.companyFit
  );

  // ─── Aggregate benefits & issues ────────────────────
  const allBenefits = [
    ...formatting.benefits,
    ...readability.benefits,
    ...sections.benefits,
    ...contact.benefits,
    ...quantify.benefits,
    ...skillAlign.benefits,
    ...companyFit.benefits,
  ].filter(Boolean);

  const allIssues = [
    ...formatting.issues,
    ...readability.issues,
    ...sections.issues,
    ...contact.issues,
    ...quantify.issues,
    ...skillAlign.issues,
    ...companyFit.issues,
  ].filter(Boolean);

  // ─── Grade ──────────────────────────────────────────
  let grade;
  if (totalScore >= 90) grade = "A+";
  else if (totalScore >= 80) grade = "A";
  else if (totalScore >= 70) grade = "B+";
  else if (totalScore >= 60) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 40) grade = "D";
  else grade = "F";

  return {
    totalScore: Math.min(totalScore, 100),
    grade,
    breakdown: {
      keywordMatch:        { score: keyword.score,     weight: WEIGHTS.keywordMatch,        label: "Keyword Match" },
      formatting:          { score: formatting.score,   weight: WEIGHTS.formatting,          label: "Formatting & Structure" },
      readability:         { score: readability.score,  weight: WEIGHTS.readability,         label: "Readability" },
      sectionCompleteness: { score: sections.score,     weight: WEIGHTS.sectionCompleteness, label: "Section Completeness" },
      contactInfo:         { score: contact.score,      weight: WEIGHTS.contactInfo,         label: "Contact Information" },
      quantification:      { score: quantify.score,     weight: WEIGHTS.quantification,      label: "Quantified Impact" },
      skillAlignment:      { score: skillAlign.score,   weight: WEIGHTS.skillAlignment,      label: "Skill Alignment" },
      companyFit:          { score: companyFit.score,    weight: WEIGHTS.companyFit,          label: "Company Fit" },
    },
    keywords: {
      criticalFound: keyword.criticalFound,
      criticalMissing: keyword.criticalMissing,
      importantFound: keyword.importantFound,
      importantMissing: keyword.importantMissing,
      bonusFound: keyword.bonusFound,
    },
    skills: {
      matched: skillAlign.matched,
      missing: skillAlign.unmatched,
    },
    sections: {
      found: sections.found,
      missing: sections.missing,
      bonus: sections.bonusFound,
    },
    contact: {
      found: contact.found,
      missing: contact.missing,
    },
    quantification: {
      metricsFound: quantify.metricsFound,
    },
    companyMatches: companyFit.matches,
    benefits: allBenefits,
    issues: allIssues,
  };
};

/**
 * Get list of supported job roles
 */
exports.getSupportedRoles = function() {
  return Object.keys(ROLE_KEYWORDS);
};
