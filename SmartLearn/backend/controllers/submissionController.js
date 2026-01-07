const Submission = require("../models/Submission");
const axios = require("axios");

const SENTIMENT_URL = process.env.SENTIMENT_URL || "http://localhost:5003";

// CREATE with AI feedback
exports.createSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.create(req.body);
    
    // If submission has text feedback, analyze sentiment
    if (req.body.feedback && typeof req.body.feedback === 'string') {
      try {
        const sentimentResponse = await axios.post(
          `${SENTIMENT_URL}/analyze`,
          { text: req.body.feedback },
          { timeout: 5000 }
        );
        
        // Add sentiment metadata to submission
        submission.sentimentAnalysis = {
          sentiment: sentimentResponse.data.sentiment,
          label: sentimentResponse.data.label,
          confidence: sentimentResponse.data.confidence,
        };
        
        await submission.save();
      } catch (sentimentError) {
        console.error("Sentiment analysis failed:", sentimentError.message);
        // Continue without sentiment analysis
      }
    }
    
    return res.status(201).json(submission);
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getSubmissions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.exercise) filter.exercise = req.query.exercise;
    if (req.query.student) filter.student = req.query.student;
    if (req.query.status) filter.status = req.query.status;

    const submissions = await Submission.find(filter).sort({ createdAt: -1 });
    return res.json(submissions);
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      res.status(404);
      throw new Error("Submission not found");
    }
    return res.json(submission);
  } catch (err) {
    return next(err);
  }
};

// UPDATE with AI feedback sentiment
exports.updateSubmission = async (req, res, next) => {
  try {
    // If updating feedback, analyze sentiment
    if (req.body.feedback && typeof req.body.feedback === 'string') {
      try {
        const sentimentResponse = await axios.post(
          `${SENTIMENT_URL}/analyze`,
          { text: req.body.feedback },
          { timeout: 5000 }
        );
        
        req.body.sentimentAnalysis = {
          sentiment: sentimentResponse.data.sentiment,
          label: sentimentResponse.data.label,
          confidence: sentimentResponse.data.confidence,
        };
      } catch (sentimentError) {
        console.error("Sentiment analysis failed:", sentimentError.message);
      }
    }
    
    const updated = await Submission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Submission not found");
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteSubmission = async (req, res, next) => {
  try {
    const deleted = await Submission.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Submission not found");
    }
    return res.json({ message: "Submission deleted" });
  } catch (err) {
    return next(err);
  }
};

// GET submissions for professor's courses
exports.getProfessorSubmissions = async (req, res, next) => {
  try {
    const professorId = req.query.professorId || req.user._id;
    const Course = require("../models/Course");
    const Exercise = require("../models/Exercise");
    
    // Get all courses by this professor
    const courses = await Course.find({ professor: professorId });
    const courseIds = courses.map(c => c._id);
    
    // Get all exercises for these courses
    const exercises = await Exercise.find({ course: { $in: courseIds } });
    const exerciseIds = exercises.map(e => e._id);
    
    // Get all submissions for these exercises
    const submissions = await Submission.find({ exercise: { $in: exerciseIds } })
      .populate('student', 'username email')
      .populate('exercise', 'title course type difficulty points')
      .sort({ submittedAt: -1 });
    
    // Add course information to each submission
    const submissionsWithCourse = submissions.map(sub => {
      const exercise = exercises.find(e => e._id.toString() === sub.exercise._id.toString());
      const course = courses.find(c => c._id.toString() === exercise.course.toString());
      return {
        ...sub.toObject(),
        courseName: course?.title || 'Unknown Course',
        courseId: course?._id
      };
    });
    
    return res.json(submissionsWithCourse);
  } catch (err) {
    return next(err);
  }
};
