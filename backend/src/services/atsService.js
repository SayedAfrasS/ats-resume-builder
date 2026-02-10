const actionVerbs = [
  "developed",
  "designed",
  "implemented",
  "optimized",
  "built",
  "engineered",
  "created",
  "improved",
  "integrated",
  "automated"
];


function checkFormatting(aiContent) {
  let score = 100;
  let issues = [];

  // Guard: if aiContent is a string, try to parse it
  if (typeof aiContent === "string") {
    try { aiContent = JSON.parse(aiContent); } catch { aiContent = {}; }
  }

  const projects = aiContent?.projects || [];
  projects.forEach(project => {
    const bullets = project.bullets || [];
    bullets.forEach(bullet => {

      if (bullet.split(" ").length > 25) {
        score -= 5;
        issues.push("Bullet too long");
      }

      const firstWord = bullet.split(" ")[0].toLowerCase();

      if (!actionVerbs.includes(firstWord)) {
        score -= 3;
        issues.push("Weak action verb");
      }

    });
  });

  return { formattingScore: Math.max(score, 0), issues };
}


const roleKeywords = {
  "Software Engineer": [
    "javascript",
    "react",
    "node",
    "api",
    "backend",
    "database"
  ],
  "Data Analyst": [
    "python",
    "sql",
    "excel",
    "visualization",
    "analysis"
  ]
};

function keywordScore(jobRole, aiContent) {
  const keywords = roleKeywords[jobRole] || [];

  const text = JSON.stringify(aiContent).toLowerCase();

  let matched = 0;

  keywords.forEach(keyword => {
    if (text.includes(keyword)) matched++;
  });

  const score = keywords.length > 0 ? (matched / keywords.length) * 100 : 50;

  return { keywordScore: score };
}

function readabilityScore(aiContent) {
  const text = JSON.stringify(aiContent);

  const avgSentenceLength =
    text.split(" ").length / text.split(".").length;

  let score = 100;

  if (avgSentenceLength > 25) score -= 20;
  if (avgSentenceLength > 30) score -= 30;

  return { readabilityScore: Math.max(score, 0) };
}


exports.calculateATSScore = (jobRole, aiContent) => {

  const format = checkFormatting(aiContent);
  const keyword = keywordScore(jobRole, aiContent);
  const readability = readabilityScore(aiContent);

  const totalScore =
    (keyword.keywordScore * 0.4) +
    (format.formattingScore * 0.2) +
    (readability.readabilityScore * 0.15) +
    25; // base skill score for MVP

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      keyword: keyword.keywordScore,
      formatting: format.formattingScore,
      readability: readability.readabilityScore
    },
    issues: format.issues
  };
};
