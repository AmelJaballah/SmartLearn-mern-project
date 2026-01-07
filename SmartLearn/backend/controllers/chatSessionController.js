const ChatSession = require("../models/ChatSession");

// CREATE
exports.createChatSession = async (req, res, next) => {
  try {
    const session = await ChatSession.create(req.body);
    return res.status(201).json(session);
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getChatSessions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;

    const sessions = await ChatSession.find(filter).sort({ updatedAt: -1 });
    return res.json(sessions);
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getChatSessionById = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      res.status(404);
      throw new Error("ChatSession not found");
    }
    return res.json(session);
  } catch (err) {
    return next(err);
  }
};

// UPDATE
exports.updateChatSession = async (req, res, next) => {
  try {
    const updated = await ChatSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("ChatSession not found");
    }
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteChatSession = async (req, res, next) => {
  try {
    const deleted = await ChatSession.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("ChatSession not found");
    }
    return res.json({ message: "ChatSession deleted" });
  } catch (err) {
    return next(err);
  }
};
