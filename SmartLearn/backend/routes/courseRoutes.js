const express = require("express");
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addReview,
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

// Review routes
router.post("/:id/reviews", protect, addReview);

module.exports = router;
