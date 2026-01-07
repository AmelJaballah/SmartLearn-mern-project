const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Exercise title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Exercise description is required"],
      maxlength: 5000,
    },

    type: {
      type: String,
      enum: ["multiple-choice", "short-answer", "essay", "coding", "math"],
      default: "short-answer",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // The correct answer/solution for the exercise
    solution: {
      type: String,
      maxlength: 10000,
    },

    // For multiple-choice: array of options
    options: [{
      type: String,
      trim: true,
    }],

    // The correct answer (for MCQ, this is the correct option index or value)
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
    },

    points: {
      type: Number,
      default: 100,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    metadata: {
      generatedByRAG: { type: Boolean, default: false },
      sourceDocs: { type: Array, default: [] },
    },
  },
  { timestamps: true }
);

exerciseSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model("Exercise", exerciseSchema);
