const Course = require("../models/Course");
const axios = require("axios");

const SENTIMENT_URL = process.env.SENTIMENT_URL || "http://localhost:5003";

// CREATE
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }
    return res.json(course);
  } catch (err) {
    return next(err);
  }
};

// UPDATE (PUT/PATCH)
exports.updateCourse = async (req, res, next) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Course not found");
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteCourse = async (req, res, next) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Course not found");
    }
    return res.json({ message: "Course deleted" });
  } catch (err) {
    return next(err);
  }
};

// ADD REVIEW with sentiment analysis
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const courseId = req.params.id;
    const studentId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error("Course not found");
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      (r) => r.student.toString() === studentId.toString()
    );

    if (existingReview) {
      res.status(400);
      throw new Error("You have already reviewed this course");
    }

    const review = {
      student: studentId,
      rating,
      comment: comment || "",
    };

    // Analyze sentiment if comment exists
    if (comment && comment.trim()) {
      try {
        const sentimentResponse = await axios.post(
          `${SENTIMENT_URL}/analyze`,
          { text: comment },
          { timeout: 5000 }
        );

        review.sentimentAnalysis = {
          sentiment: sentimentResponse.data.sentiment,
          label: sentimentResponse.data.label,
          confidence: sentimentResponse.data.confidence,
        };
      } catch (sentimentError) {
        console.error("Sentiment analysis failed:", sentimentError.message);
        // Continue without sentiment analysis
      }
    }

    course.reviews.push(review);
    await course.save();

    return res.status(201).json(course);
  } catch (err) {
    return next(err);
  }
};
