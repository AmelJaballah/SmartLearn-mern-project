const mongoose = require("mongoose");

/**
 * Enrollment - Many-to-Many junction table between User (students) and Course
 * Provides additional metadata about the enrollment relationship
 */
const enrollmentSchema = new mongoose.Schema(
    {
        // Many-to-Many: Student reference
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Many-to-Many: Course reference
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },

        // Enrollment metadata
        enrolledAt: {
            type: Date,
            default: Date.now,
        },

        // Progress tracking
        progress: {
            completedExercises: {
                type: Number,
                default: 0,
                min: 0,
            },
            totalExercises: {
                type: Number,
                default: 0,
                min: 0,
            },
            percentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
            lastAccessedAt: {
                type: Date,
                default: Date.now,
            },
        },

        // Enrollment status
        status: {
            type: String,
            enum: ["active", "completed", "dropped", "pending"],
            default: "active",
            index: true,
        },

        // Certificate (if course is completed)
        certificate: {
            issued: { type: Boolean, default: false },
            issuedAt: Date,
            certificateId: String,
        },

        // Grade/Score
        finalGrade: {
            type: Number,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

// Compound index to ensure a student can only enroll once per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Query indexes
enrollmentSchema.index({ student: 1, enrolledAt: -1 });
enrollmentSchema.index({ course: 1, enrolledAt: -1 });
enrollmentSchema.index({ status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
