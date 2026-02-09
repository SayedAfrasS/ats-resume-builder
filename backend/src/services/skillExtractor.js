const knownSkills = [
  "javascript",
  "react",
  "node",
  "node.js",
  "sql",
  "docker",
  "api",
  "rest api",
  "git",
  "database",
  "system design"
];

exports.extractSkills = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();

  return knownSkills.filter(skill =>
    lowerText.includes(skill)
  );
};
