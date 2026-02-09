const express = require("express");
const router = express.Router();

const resumeController = require("../controllers/resumeController");

router.post("/create", resumeController.createResume);
router.post("/analyze", resumeController.analyzeResume);
router.get("/:id", resumeController.getResume);

module.exports = router;
