// routes/orderRoutes.js
const express = require("express");
const { Order } = require("../models/order");
const User = require("../models/user");
const Cart = require("../models/cart");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new order
router.post("/orders", verifyToken, async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  // Create a new order using the cart items
  const order = new Order({
    user: userId,
    username: req.user.username,
    items: cart.items,
    cartPrice: cart.cartPrice,
  });

  try {
    // Save the order to the database
    const savedOrder = await order.save();

    // Empty the cart by removing all items
    cart.items = [];
    cart.cartPrice = {
      totalCartPrice: 0,
      tax: 0,
      totalCartPriceAfterTax: 0,
    };
    await cart.save();

    // Return the saved order as the response
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
});

// Get orders by user ID
router.get("/orders", verifyToken, async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    let orders;

    switch (userRole) {
      case "staff":
        orders = await Order.find();
        break;
      case "customer":
        orders = await Order.find({ user: req.user._id });
        break;
      case "barista":
        orders = await Order.find({
          $or: [
            { status: "Pending" },
            { assignedUser: req.user._id },
            { user: req.user._id },
          ],
        });
        break;
      default:
        throw new Error("Invalid user role");
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Update order status
router.put("/orders/:orderId/status", verifyToken, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled" || order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot update a cancelled or completed order" });
    }

    if (userRole === "customer") {
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
    } else if (userRole === "staff" || userRole === "barista") {
      const validStatusTransitions = {
        Pending: ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
      };

      if (
        validStatusTransitions[order.status] &&
        validStatusTransitions[order.status].includes(status)
      ) {
        order.status = status;
        const assignedUser = await User.findById(userId);
        if (!assignedUser) {
          return res.status(404).json({ message: "Assigned user not found" });
        }
        order.assignedUser = userId;
        order.assignedUsername = assignedUser.username;
      } else {
        return res.status(400).json({ message: "Invalid status for staff" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    await order.save();
    return res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    next(error);
  }
});

// Recreate order with orderId and userId
router.post(
  "/orders/:orderId/recreate",
  verifyToken,
  async (req, res, next) => {
    const { orderId } = req.params;
    const userId = req.user._id;

    try {
      // Load order from database
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the userId matches the order's user
      if (!order.user.equals(userId)) {
        return res
          .status(403)
          .json({ message: "Cannot recreate order from other users" });
      }

      // Create a new order based on the existing order
      const newOrder = new Order({
        user: order.user,
        username: order.username,
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

module.exports = router;
