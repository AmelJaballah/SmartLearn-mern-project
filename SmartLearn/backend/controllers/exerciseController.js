const Exercise = require("../models/Exercise");

// CREATE
exports.createExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.create(req.body);
    return res.status(201).json(exercise);
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getExercises = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const exercises = await Exercise.find(filter).sort({ createdAt: -1 });
    return res.json(exercises);
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found");
    }
    return res.json(exercise);
  } catch (err) {
    return next(err);
  }
};

// UPDATE
exports.updateExercise = async (req, res, next) => {
  try {
    const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Exercise not found");
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteExercise = async (req, res, next) => {
  try {
    const deleted = await Exercise.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Exercise not found");
    }
    return res.json({ message: "Exercise deleted" });
  } catch (err) {
    return next(err);
  }
};
