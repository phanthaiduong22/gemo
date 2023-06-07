const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  title: {
    type: String,
    required: false,
    default: "No Title Feedback",
  },
  feedback: {
    type: String,
    required: true,
  },
  sentimentScore: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Deleted"],
    default: "Pending",
  },
  priority: {
    type: Number, // 0: good Feedback, 1: Low, 2: Medium, 3: High
    required: true,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
