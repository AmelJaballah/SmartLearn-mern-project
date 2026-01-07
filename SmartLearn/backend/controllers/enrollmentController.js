const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

/**
 * Enrollment Controller
 * Handles Many-to-Many relationship between User and Course
 */

// Enroll current user in a course
exports.enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.body;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error("Course not found");
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        if (existingEnrollment) {
            res.status(400);
            throw new Error("Already enrolled in this course");
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: courseId,
        });

        // Also add to course.students for backward compatibility
        await Course.findByIdAndUpdate(courseId, {
            $addToSet: { students: req.user._id },
        });

        return res.status(201).json(enrollment);
    } catch (err) {
        return next(err);
    }
};

// Get all enrollments for current user
exports.getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate("course", "title description category isPublished professor")
            .sort({ enrolledAt: -1 });

        return res.json(enrollments);
    } catch (err) {
        return next(err);
    }
};

// Get all students enrolled in a course (for professors)
exports.getCourseEnrollments = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Verify course exists and user is the professor
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error("Course not found");
        }

        if (course.professor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorized - only course professor can view enrollments");
        }

        const enrollments = await Enrollment.find({ course: courseId })
            .populate("student", "username email role")
            .sort({ enrolledAt: -1 });

        return res.json(enrollments);
    } catch (err) {
        return next(err);
    }
};

// Update enrollment progress
exports.updateEnrollmentProgress = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const { completedExercises, totalExercises, percentage } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            res.status(404);
            throw new Error("Enrollment not found");
        }

        // Only the enrolled student can update their own progress
        if (enrollment.student.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("Not authorized");
        }

        if (completedExercises !== undefined) enrollment.progress.completedExercises = completedExercises;
        if (totalExercises !== undefined) enrollment.progress.totalExercises = totalExercises;
        if (percentage !== undefined) enrollment.progress.percentage = percentage;
        enrollment.progress.lastAccessedAt = new Date();

        // Check if course is completed
        if (enrollment.progress.percentage >= 100) {
            enrollment.status = "completed";
        }

        await enrollment.save();

        return res.json(enrollment);
    } catch (err) {
        return next(err);
    }
};

// Unenroll from a course
exports.unenrollFromCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOneAndDelete({
            student: req.user._id,
            course: courseId,
        });

        if (!enrollment) {
            res.status(404);
            throw new Error("Enrollment not found");
        }

        // Remove from course.students for backward compatibility
        await Course.findByIdAndUpdate(courseId, {
            $pull: { students: req.user._id },
        });

        return res.json({ message: "Successfully unenrolled from course" });
    } catch (err) {
        return next(err);
    }
};

// Get enrollment status for a specific course
exports.getEnrollmentStatus = async (req, res, next) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        return res.json({
            isEnrolled: !!enrollment,
            enrollment: enrollment || null,
        });
    } catch (err) {
        return next(err);
    }
};
