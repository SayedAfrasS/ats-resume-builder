const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // Don't let the pool keep retrying indefinitely
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

// Handle background pool errors so they don't crash the process
pool.on("error", (err) => {
  console.error("Unexpected pool error (non-fatal):", err.message);
});

module.exports = pool;
