const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: 5000,
    },

    // Teacher/owner
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Enrollments
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    category: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    reviews: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
          maxlength: 1000,
        },
        sentimentAnalysis: {
          sentiment: String,
          label: String,
          confidence: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

courseSchema.index({ professor: 1, createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);
