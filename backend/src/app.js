require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { startCronJob } = require("./cron/cronScheduler");
const logger = require("./utils/logger");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SpellFolio API Running");
});

// Attempt database connection but don't crash if it fails
pool.query("SELECT 1")
  .then(() => {
    logger.success("Database connected");
    // Start cron job only after DB is ready
    startCronJob();
  })
  .catch(err => {
    logger.error(`Database connection failed (running in offline mode): ${err.message}`);
    logger.warn("Cron job scraper will NOT start — no database connection");
  });

// Routes for auth
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Routes for resume management
const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

// Manual trigger endpoint for job fetching (admin use)
app.post("/api/admin/scrape-jobs", async (req, res) => {
  try {
    const { runFetcher } = require("./cron/cronScheduler");
    logger.cron("Manual fetch triggered via API");
    runFetcher(); // fire-and-forget
    res.json({ message: "Job fetching started — check server logs for progress" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
