// routes/orderRoutes.js
const express = require("express");
const Order = require("../models/order");
const User = require("../models/user");

const router = express.Router();

// Create a new order
router.post("/users/:userId/orders", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { items, status, cartPrice } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newOrder = new Order({
      user: userId,
      username: user.username,
      items: items,
      status: status,
      cartPrice: cartPrice,
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
});

// Get orders by user ID
router.get("/users/:userId/orders", async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  const userRole = user ? user.role : null;

  try {
    let orders;

    if (userRole === "staff") {
      orders = await Order.find();
    } else if (userRole === "customer") {
      orders = await Order.find({ user: userId });
    } else {
      throw new Error("Invalid user role");
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Update order status
router.put("/users/:userId/orders/:orderId/status", async (req, res) => {
  const { orderId, userId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (order.status === "Cancelled" || order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot update a cancelled or completed order" });
    }

    if (user.role === "customer") {
      if (order.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Customers can only cancel pending orders" });
      }
      if (status !== "Cancelled") {
        return res.status(400).json({ message: "Invalid status for customer" });
      }
      order.status = status;
      await order.save();
    } else if (user.role === "staff") {
      const validStatusTransitions = {
        Pending: ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
      };

      if (
        validStatusTransitions[order.status] &&
        validStatusTransitions[order.status].includes(status)
      ) {
        order.status = status;
        await order.save();
      } else {
        return res.status(400).json({ message: "Invalid status for staff" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    next(error);
  }
});

// Recreate order with orderId and userId
router.post(
  "/users/:userId/orders/:orderId/recreate",
  async (req, res, next) => {
    const { orderId, userId } = req.params;

    try {
      // Load order from database
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the userId matches the order's user
      if (order.user.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "Can not recreate order from other users" });
      }

      // Load user from database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const newOrder = new Order({
        user: userId,
        username: user.username,
        items: order.items,
        status: "Pending",
        cartPrice: order.cartPrice,
      });

      const createdOrder = await newOrder.save();
      res.status(201).json(createdOrder);
    } catch (error) {
      next(error);
    }
  }
);

// Update order rating
router.put("/users/:userId/orders/:orderId/rate", async (req, res, next) => {
  const { orderId, userId } = req.params;
  const { rating } = req.body;

  console.log(orderId, userId, rating);

  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { rating },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Invalid user to update order rating" });
    }

    return res.json({ message: "Order rating updated successfully", order });
  } catch (error) {
    next(error);
  }
});

// Get comments for an order
router.get(
  "/users/:userId/orders/:orderId/comments",
  async (req, res, next) => {
    const { userId, orderId } = req.params;

    try {
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order.comments);
    } catch (error) {
      next(error);
    }
  }
);

// Add a comment to an order
router.post(
  "/users/:userId/orders/:orderId/comments",
  async (req, res, next) => {
    const { userId, orderId } = req.params;
    const { content } = req.body;

    try {
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const comment = {
        user: userId,
        username: user.username, // Include the username in the comment
        picture: user.picture,
        content: content,
      };

      order.comments.push(comment);
      await order.save();

      res.json(order.comments);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
