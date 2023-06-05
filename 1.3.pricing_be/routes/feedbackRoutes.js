const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const Order = require("../models/order");
const { evaluateFeedback } = require("../routes/chatBotRoutes");
const { verifyToken } = require("../middleware/authMiddleware");

// POST /api/feedback
router.post("/feedback", verifyToken, async (req, res) => {
  try {
    const { orderId, feedback } = req.body;

    // Check if the order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Perform sentiment analysis
    const { sentimentScore, evaluation } = await evaluateFeedback(feedback);
    console.log(sentimentScore, evaluation);

    // Create a new feedback document
    const newFeedback = new Feedback({
      order: orderId,
      feedback,
      sentimentScore,
    });

    // Save the feedback to the database
    await newFeedback.save();

    res.status(201).json({ success: true, message: evaluation });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
