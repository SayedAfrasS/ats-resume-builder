const roleSkills = {
  "Software Engineer": [
    "javascript",
    "react",
    "node",
    "api",
    "database",
    "docker",
    "git",
    "system design"
  ],
  "Data Analyst": [
    "python",
    "sql",
    "excel",
    "power bi",
    "statistics",
    "visualization"
  ]
};


exports.detectSkillGaps = (jobRole, aiContent) => {

  const expectedSkills = roleSkills[jobRole] || [];
  const resumeText = JSON.stringify(aiContent).toLowerCase();

  const missingSkills = [];

  expectedSkills.forEach(skill => {
    if (!resumeText.includes(skill)) {
      missingSkills.push(skill);
    }
  });

  return missingSkills;
};

exports.generateSuggestions = (atsResult, missingSkills) => {

  let suggestions = [];

  if (atsResult.breakdown.keyword < 70) {
    suggestions.push(
      "Increase role-specific keywords in project descriptions."
    );
  }

  if (atsResult.breakdown.formatting < 80) {
    suggestions.push(
      "Use strong action verbs at the beginning of bullet points."
    );
  }

  if (atsResult.breakdown.readability < 70) {
    suggestions.push(
      "Reduce long sentences and improve clarity."
    );
  }

  if (missingSkills.length > 0) {
    suggestions.push(
      `Consider adding these skills: ${missingSkills.join(", ")}`
    );
  }

  return suggestions;
};


exports.sectionsToImprove = (atsResult) => {
  let weakAreas = [];

  if (atsResult.breakdown.keyword < 70)
    weakAreas.push("projects");

  if (atsResult.breakdown.readability < 70)
    weakAreas.push("summary");

  return weakAreas;
};
