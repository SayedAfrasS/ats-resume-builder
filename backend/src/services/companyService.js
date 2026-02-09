const companyRoles = [
  {
    company: "Google",
    role: "Software Engineer",
    requiredSkills: [
      "javascript",
      "data structures",
      "algorithms",
      "system design",
      "api"
    ]
  },
  {
    company: "Zoho",
    role: "Software Engineer",
    requiredSkills: [
      "javascript",
      "node",
      "sql",
      "api",
      "backend"
    ]
  },
  {
    company: "Freshworks",
    role: "Software Engineer",
    requiredSkills: [
      "react",
      "node",
      "database",
      "rest api",
      "git"
    ]
  }
];


exports.calculateCompanyMatches = (jobRole, aiContent) => {

  const resumeText = JSON.stringify(aiContent).toLowerCase();

  let matches = [];

  companyRoles.forEach(company => {

    if (company.role !== jobRole) return;

    let matchedSkills = 0;

    company.requiredSkills.forEach(skill => {
      if (resumeText.includes(skill)) matchedSkills++;
    });

    const score =
      (matchedSkills / company.requiredSkills.length) * 100;

    matches.push({
      company: company.company,
      matchScore: Math.round(score)
    });
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

exports.calculateHiringProbability = (
  atsScore,
  companyMatches
) => {

  return companyMatches.map(company => {

    const probability =
      (atsScore * 0.4) +
      (company.matchScore * 0.6);

    return {
      company: company.company,
      matchScore: company.matchScore,
      hiringProbability: Math.round(probability)
    };
  });
};
