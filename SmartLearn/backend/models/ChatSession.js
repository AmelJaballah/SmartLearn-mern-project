const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
	{
		role: {
			type: String,
			enum: ["user", "assistant", "system"],
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false }
);

const chatSessionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		title: {
			type: String,
			trim: true,
			maxlength: 200,
			default: "Chat Session",
		},
		messages: {
			type: [chatMessageSchema],
			default: [],
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{ timestamps: true }
);

chatSessionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);

