require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SpellFolio API Running");
});

// Attempt database connection but don't crash if it fails
pool.query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection failed (running in offline mode):", err.message));

// Routes for auth
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Routes for resume management
const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

module.exports = app;
