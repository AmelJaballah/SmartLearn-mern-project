const UserProfile = require("../models/UserProfile");
const User = require("../models/User");

/**
 * UserProfile Controller
 * Handles One-to-One relationship with User
 */

// GET profile for current user
exports.getMyProfile = async (req, res, next) => {
    try {
        let profile = await UserProfile.findOne({ user: req.user._id });

        // If no profile exists, create a default one
        if (!profile) {
            profile = await UserProfile.create({ user: req.user._id });
            // Link profile to user
            await User.findByIdAndUpdate(req.user._id, { profile: profile._id });
        }

        return res.json(profile);
    } catch (err) {
        return next(err);
    }
};

// GET profile by user ID
exports.getProfileByUserId = async (req, res, next) => {
    try {
        const profile = await UserProfile.findOne({ user: req.params.userId }).populate("user", "username email role");

        if (!profile) {
            res.status(404);
            throw new Error("Profile not found");
        }

        return res.json(profile);
    } catch (err) {
        return next(err);
    }
};

// CREATE or UPDATE profile for current user
exports.updateMyProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, bio, avatar, phone, address, preferences, department, specialization } = req.body;

        let profile = await UserProfile.findOne({ user: req.user._id });

        if (!profile) {
            // Create new profile
            profile = await UserProfile.create({
                user: req.user._id,
                firstName,
                lastName,
                bio,
                avatar,
                phone,
                address,
                preferences,
                department,
                specialization,
            });
            // Link profile to user
            await User.findByIdAndUpdate(req.user._id, { profile: profile._id });
        } else {
            // Update existing profile
            if (firstName !== undefined) profile.firstName = firstName;
            if (lastName !== undefined) profile.lastName = lastName;
            if (bio !== undefined) profile.bio = bio;
            if (avatar !== undefined) profile.avatar = avatar;
            if (phone !== undefined) profile.phone = phone;
            if (address !== undefined) profile.address = address;
            if (preferences !== undefined) profile.preferences = { ...profile.preferences, ...preferences };
            if (department !== undefined) profile.department = department;
            if (specialization !== undefined) profile.specialization = specialization;

            await profile.save();
        }

        return res.json(profile);
    } catch (err) {
        return next(err);
    }
};

// DELETE profile
exports.deleteMyProfile = async (req, res, next) => {
    try {
        const profile = await UserProfile.findOneAndDelete({ user: req.user._id });

        if (!profile) {
            res.status(404);
            throw new Error("Profile not found");
        }

        // Remove profile reference from user
        await User.findByIdAndUpdate(req.user._id, { $unset: { profile: 1 } });

        return res.json({ message: "Profile deleted" });
    } catch (err) {
        return next(err);
    }
};
