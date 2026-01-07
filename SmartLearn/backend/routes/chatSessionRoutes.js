const express = require("express");
const {
  createChatSession,
  getChatSessions,
  getChatSessionById,
  updateChatSession,
  deleteChatSession,
} = require("../controllers/chatSessionController");

const router = express.Router();

router.post("/", createChatSession);
router.get("/", getChatSessions);
router.get("/:id", getChatSessionById);
router.put("/:id", updateChatSession);
router.patch("/:id", updateChatSession);
router.delete("/:id", deleteChatSession);

module.exports = router;
