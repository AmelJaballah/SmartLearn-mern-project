const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    action: {
      type: String,
      required: true,
      enum: [
        "viewed_course",
        "viewed_lesson",
        "generated_exercise",
        "started_exercise",
        "submitted_exercise",
        "received_feedback",
        "login",
        "logout",
      ],
      index: true,
    },

    timestamp: { type: Date, default: Date.now, index: true },

    // Keep this flexible for BI (subject, difficulty, score, sentiment, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Useful indexes for BI queries
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ "metadata.courseId": 1, timestamp: -1 });
activityLogSchema.index({ "metadata.exerciseId": 1, timestamp: -1 });
activityLogSchema.index({ "metadata.subject": 1, "metadata.difficulty": 1, timestamp: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);