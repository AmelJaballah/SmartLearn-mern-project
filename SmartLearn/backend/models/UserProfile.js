const mongoose = require("mongoose");

/**
 * UserProfile - One-to-One relationship with User
 * Stores additional profile information for each user
 */
const userProfileSchema = new mongoose.Schema(
    {
        // One-to-One: Each profile belongs to exactly one user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Ensures one-to-one relationship
            index: true,
        },

        // Personal Information
        firstName: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        bio: {
            type: String,
            maxlength: 1000,
        },
        avatar: {
            type: String, // URL to avatar image
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 20,
        },
        address: {
            street: String,
            city: String,
            country: String,
            postalCode: String,
        },

        // Learning Preferences (for students)
        preferences: {
            language: {
                type: String,
                enum: ["fr", "en", "ar"],
                default: "fr",
            },
            difficulty: {
                type: String,
                enum: ["easy", "medium", "hard"],
                default: "medium",
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
            },
        },

        // Professional Info (for professors)
        department: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        specialization: {
            type: String,
            trim: true,
            maxlength: 200,
        },
    },
    { timestamps: true }
);

// Index for fast user lookup
userProfileSchema.index({ user: 1 });

module.exports = mongoose.model("UserProfile", userProfileSchema);
