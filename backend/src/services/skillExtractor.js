const knownSkills = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "haskell",
  "dart", "lua", "objective-c", "shell", "bash", "powershell", "sql", "html", "css",
  // Frontend
  "react", "react.js", "angular", "vue", "vue.js", "svelte", "next.js", "nextjs",
  "nuxt", "gatsby", "tailwind", "tailwindcss", "bootstrap", "sass", "less",
  "webpack", "vite", "redux", "mobx", "graphql", "apollo", "jquery",
  // Backend
  "node", "node.js", "express", "express.js", "django", "flask", "fastapi",
  "spring", "spring boot", "rails", "ruby on rails", "asp.net", ".net", "laravel",
  "nestjs", "koa", "hapi", "gin", "fiber", "actix", "rocket",
  // Databases
  "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
  "dynamodb", "cassandra", "sqlite", "oracle", "sql server", "mariadb",
  "neo4j", "couchdb", "firebase", "firestore", "supabase",
  // Cloud & DevOps
  "aws", "amazon web services", "azure", "gcp", "google cloud", "heroku", "vercel",
  "netlify", "digitalocean", "docker", "kubernetes", "k8s", "terraform",
  "ansible", "jenkins", "github actions", "gitlab ci", "circleci", "ci/cd",
  "nginx", "apache", "linux", "ubuntu",
  // Data & AI/ML
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "jupyter",
  "data science", "data analysis", "data engineering", "etl", "spark", "hadoop",
  "airflow", "kafka", "rabbitmq", "tableau", "power bi", "bigquery",
  "computer vision", "nlp", "natural language processing", "llm",
  // Mobile
  "react native", "flutter", "ios", "android", "swiftui", "jetpack compose",
  "xamarin", "ionic", "capacitor", "expo",
  // Tools & Practices
  "git", "github", "gitlab", "bitbucket", "jira", "confluence",
  "agile", "scrum", "kanban", "tdd", "unit testing", "jest", "mocha",
  "cypress", "selenium", "playwright", "postman", "swagger",
  "rest api", "restful", "api", "microservices", "system design",
  "design patterns", "oop", "functional programming",
  "figma", "sketch", "adobe xd",
  // Security
  "oauth", "jwt", "authentication", "authorization", "encryption", "ssl", "tls",
  "penetration testing", "cybersecurity", "soc2", "gdpr",
  // General
  "database", "full stack", "full-stack", "frontend", "backend", "devops",
  "cloud computing", "serverless", "saas", "blockchain", "web3",
  "communication", "leadership", "problem solving", "teamwork", "project management",
];

exports.extractSkills = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();

  return knownSkills.filter(skill =>
    lowerText.includes(skill)
  );
};

exports.knownSkills = knownSkills;
