const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Le username est obligatoire."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Format d'email invalide."],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // recommended so it doesn't leak in queries
    },
    // One-to-One: Reference to UserProfile
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
    },
    // Courses the user is enrolled in (for students) or created (legacy, prefer Enrollment)
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password (login)
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);