const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ATS Resume Builder API Running");
});

module.exports = app;

require("dotenv").config();
const pool = require("./config/db");

// Attempt database connection but don't crash if it fails
pool.connect()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection failed (running in offline mode):", err.message));

// Routes for resume management

const resumeRoutes = require("./routes/resumeRoutes");

app.use("/api/resume", resumeRoutes);
