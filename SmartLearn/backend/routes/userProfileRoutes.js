const express = require("express");
const {
    getMyProfile,
    getProfileByUserId,
    updateMyProfile,
    deleteMyProfile,
} = require("../controllers/userProfileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get/Update/Delete my profile
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.patch("/me", updateMyProfile);
router.delete("/me", deleteMyProfile);

// Get profile by user ID (public within authenticated users)
router.get("/user/:userId", getProfileByUserId);

module.exports = router;
