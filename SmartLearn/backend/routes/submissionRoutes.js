const express = require("express");
const {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getProfessorSubmissions,
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", createSubmission);
router.get("/", getSubmissions);
router.get("/professor/submissions", getProfessorSubmissions);
router.get("/:id", getSubmissionById);
router.put("/:id", updateSubmission);
router.patch("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

module.exports = router;
