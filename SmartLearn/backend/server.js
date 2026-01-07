require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const courseRoutes = require("./routes/courseRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const chatSessionRoutes = require("./routes/chatSessionRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
	res.json({ status: "OK", message: "SmartLearn API is running" });
});

// CRUD routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/chat-sessions", chatSessionRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", userProfileRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// AI service routes
app.use("/api/ai", aiRoutes);

// Error handler (must be last)
app.use(errorHandler);

const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Increase timeouts for long-running AI requests (Ollama first load can take 2+ minutes)
server.timeout = 300000; // 5 minutes
server.headersTimeout = 310000;
server.keepAliveTimeout = 120000;
