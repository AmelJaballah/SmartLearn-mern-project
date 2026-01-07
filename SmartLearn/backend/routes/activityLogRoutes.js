const express = require("express");
const {
  createActivityLog,
  getActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
} = require("../controllers/activityLogController");

const router = express.Router();

router.post("/", createActivityLog);
router.get("/", getActivityLogs);
router.get("/:id", getActivityLogById);
router.put("/:id", updateActivityLog);
router.patch("/:id", updateActivityLog);
router.delete("/:id", deleteActivityLog);

module.exports = router;
