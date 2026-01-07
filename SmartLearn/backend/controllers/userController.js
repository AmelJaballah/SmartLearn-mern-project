const User = require("../models/User");

function sanitizeUser(userDoc) {
  if (!userDoc) return userDoc;
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete obj.password;
  return obj;
}

// CREATE
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
};

// READ (list)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (err) {
    return next(err);
  }
};

// READ (detail)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    return res.json(sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
};

// UPDATE
exports.updateUser = async (req, res, next) => {
  try {
    // If password is being changed, use save() to trigger hashing pre-save hook
    if (Object.prototype.hasOwnProperty.call(req.body, "password")) {
      const user = await User.findById(req.params.id).select("+password");
      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      const { username, email, courses, password } = req.body;
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (courses !== undefined) user.courses = courses;
      user.password = password;

      const saved = await user.save();
      return res.json(sanitizeUser(saved));
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updated) {
      res.status(404);
      throw new Error("User not found");
    }

    return res.json(sanitizeUser(updated));
  } catch (err) {
    return next(err);
  }
};

// DELETE
exports.deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("User not found");
    }
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
};
