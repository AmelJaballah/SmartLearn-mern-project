const ActivityLog = require("../models/ActivityLog");

// CREATE
exports.createActivityLog = async (req, res, next) => {
  try {
    const log = await ActivityLog.create(req.body);
    return res.status(201).json(log);
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getActivityLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.action) filter.action = req.query.action;

    const logs = await ActivityLog.find(filter).sort({ timestamp: -1, createdAt: -1 });
    return res.json(logs);
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getActivityLogById = async (req, res, next) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) {
      res.status(404);
      throw new Error("ActivityLog not found");
    }
    return res.json(log);
  } catch (err) {
    return next(err);
  }
};

// UPDATE
exports.updateActivityLog = async (req, res, next) => {
  try {
    const updated = await ActivityLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("ActivityLog not found");
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteActivityLog = async (req, res, next) => {
  try {
    const deleted = await ActivityLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("ActivityLog not found");
    }
    return res.json({ message: "ActivityLog deleted" });
  } catch (err) {
    return next(err);
  }
};
