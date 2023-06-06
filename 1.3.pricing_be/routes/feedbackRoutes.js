const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const Order = require("../models/order");
const { evaluateFeedback } = require("../routes/chatBotRoutes");
const { verifyToken, authorize } = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/nodeMailer");

// GET /api/feedback
router.get("/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      sentimentScore: { $lt: 0 },
    }).populate({
      path: "order",
      select: "assignedUser user",
      populate: [
        {
          path: "user",
          select: "username fullName email",
        },
        {
          path: "assignedUser",
          select: "username fullName email",
        },
      ],
    });

    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
    if (!sentimentScore && !evaluation) {
      res
        .status(201)
        .json({ success: true, message: "Thank you for your feedback!" });
    }

    let priority = 0;
    if (sentimentScore) {
      if (sentimentScore < -0.5) priority = 3;
      else if (sentimentScore < -0.25) priority = 2;
      else if (sentimentScore < 0) priority = 1;
    }

    // Create a new feedback document
    const newFeedback = new Feedback({
      order: orderId,
      feedback,
      sentimentScore,
      priority,
    });

    // Save the feedback to the database
    await newFeedback.save();

    res.status(201).json({ success: true, message: evaluation });

    if (sentimentScore < 0) {
      sendEmail("phanthaiduong2000@gmail.com");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put(
  "/feedback/:id",
  verifyToken,
  // authorize(["admin", "barista"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, feedback, status, priority } = req.body;

      // Check if the feedback exists
      const existingFeedback = await Feedback.findById(id).populate({
        path: "order",
        select: "assignedUser user",
        populate: [
          {
            path: "user",
            select: "username fullName email",
          },
          {
            path: "assignedUser",
            select: "username fullName email",
          },
        ],
      });

      if (!existingFeedback) {
        return res
          .status(404)
          .json({ success: false, message: "Feedback not found" });
      }

      // Update the feedback
      existingFeedback.title = title || existingFeedback.title;
      existingFeedback.feedback = feedback || existingFeedback.feedback;
      existingFeedback.status = status || existingFeedback.status;
      existingFeedback.priority = priority || existingFeedback.priority;
      existingFeedback.updatedAt = Date.now();

      await existingFeedback.save();

      // Fetch and return the updated feedbacks
      res.status(200).json({
        success: true,
        message: "Feedback updated",
        feedback: existingFeedback,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
