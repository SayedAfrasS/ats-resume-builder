const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"));
  },
});

const resumeController = require("../controllers/resumeController");

router.post("/create", resumeController.createResume);
router.post("/analyze", upload.single("resume"), resumeController.analyzeResume);
router.post("/job-match", resumeController.jobMatch);
router.post("/generate-pdf", resumeController.generatePDF);
router.post("/ats-suggestions", resumeController.generateATSSuggestions);
router.get("/supported-roles", (req, res) => {
  const atsEngine = require("../services/atsEngineService");
  res.json({ roles: atsEngine.getSupportedRoles() });
});
router.get("/user/:userId", resumeController.getUserResumes);
router.get("/analyses/user/:userId", resumeController.getUserAnalyses);
router.get("/job-match-data/:userId", resumeController.getJobMatchData);
router.get("/:id", resumeController.getResume);
router.delete("/:id", resumeController.deleteResume);

module.exports = router;
