const express = require("express");
const {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
    updateEnrollmentProgress,
    unenrollFromCourse,
    getEnrollmentStatus,
} = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student enrollment routes
router.post("/", enrollInCourse);
router.get("/my", getMyEnrollments);
router.get("/status/:courseId", getEnrollmentStatus);
router.delete("/course/:courseId", unenrollFromCourse);
router.patch("/:enrollmentId/progress", updateEnrollmentProgress);

// Professor routes - get students enrolled in a course
router.get("/course/:courseId", getCourseEnrollments);

module.exports = router;
