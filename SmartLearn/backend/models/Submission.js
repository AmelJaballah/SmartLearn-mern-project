const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    submittedAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    isCorrect: {
      type: Boolean,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    feedback: {
      type: String,
      maxlength: 5000,
    },

    sentimentAnalysis: {
      sentiment: {
        type: String,
        enum: ["positive", "negative", "neutral"],
      },
      label: String,
      confidence: Number,
    },

    status: {
      type: String,
      enum: ["pending", "graded", "reviewed"],
      default: "pending",
      index: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Common query patterns
submissionSchema.index({ student: 1, submittedAt: -1 });
submissionSchema.index({ exercise: 1, submittedAt: -1 });

// If you want to allow only ONE submission per student per exercise,
// uncomment the unique compound index below.
// submissionSchema.index({ student: 1, exercise: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
