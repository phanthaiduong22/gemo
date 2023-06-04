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
    } else if (userRole === "barista") {
      orders = await Order.find({
        $or: [
          { status: "Pending" },
          { assignedUser: userId },
          { user: userId },
        ],
      });
    } else {
      throw new Error("Invalid user role");
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Update order status
router.put("/users/:userId/orders/:orderId/status", async (req, res, next) => {
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
    } else if (user.role === "staff" || user.role === "barista") {
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

const calculateRatings = (orders) => {
  const ratings = {
    "Milk Tea": [],
    Coffee: [],
    Bagel: [],
    Sandwich: [],
  };

  let totalRating = 0,
    totalOrder = 0;

  // Iterate through each order
  orders.forEach((order) => {
    // Iterate through each item in the order
    order.items.forEach((item) => {
      if (order.rating == 0) return;
      const { drink, food } = item;

      // Calculate the total rating for each specific item
      if (drink && ratings.hasOwnProperty(drink)) {
        ratings[drink].push(order.rating);
      } else if (food && ratings.hasOwnProperty(food)) {
        ratings[food].push(order.rating);
      }
    });

    totalRating += order.rating;
    totalOrder += 1;
  });

  // Calculate the average ratings for each specific item
  const fetchedRatings = Object.entries(ratings).map(
    ([product, productRatings]) => {
      const averageRating =
        productRatings.length > 0
          ? productRatings.reduce((sum, rating) => sum + rating, 0) /
            productRatings.length
          : 0; // Set default value if no ratings available
      return { product, rating: averageRating };
    }
  );

  const averageRating = totalOrder > 0 ? totalRating / totalOrder : 0; // Set default value if no orders available

  fetchedRatings.push({
    product: "Average",
    rating: averageRating,
  });

  return fetchedRatings;
};

// Calculate product ratings and average rating for a user's orders
router.get("/users/:userId/rating", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find all orders assigned to the user and populate the 'items' field
    const orders = await Order.find({ assignedUser: userId }).populate("items");

    const fetchedRatings = calculateRatings(orders);

    res.json(fetchedRatings);
  } catch (error) {
    next(error);
  }
});

// Calculate product ratings and average rating for all orders by baristas
router.get("/orders/rating", async (req, res, next) => {
  try {
    // Find all orders with a rating and populate the 'items' field
    const orders = await Order.find({ rating: { $exists: true } }).populate(
      "items"
    );

    const fetchedRatings = calculateRatings(orders);

    res.json(fetchedRatings);
  } catch (error) {
    next(error);
  }
});

const getOrderCommentsAndRatingsByAssignedUserId = async (assignedUserId) => {
  try {
    // Find all orders assigned to the user and populate the 'comments' and 'items' fields
    const orders = await Order.find({ assignedUser: assignedUserId })
      .populate("comments.user", ["username"])
      .populate("items");

    if (orders.length === 0) {
      return {
        comments: [],
        ratings: [],
      };
    }

    const fetchedRatings = calculateRatings(orders);
    let assignedUsername;

    let comments = [];
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].comments.length; j++) {
        const { user, picture, username, content } = orders[i].comments[j];
        comments = [...comments, { username, content }];
      }
      assignedUsername = orders[i].assignedUsername;
    }

    const ratingOfAssignedUser = fetchedRatings.reduce(
      (result, { product, rating }) => {
        result[product] = rating;
        return result;
      },
      {}
    );

    const allOrders = await Order.find({}).populate("items");
    const allRatings = calculateRatings(allOrders);

    const ratingOfAllBarista = allRatings.reduce(
      (result, { product, rating }) => {
        result[product] = rating;
        return result;
      },
      {}
    );

    return {
      assignedUsername,
      comments,
      ratingOfAssignedUser,
      ratingOfAllBarista,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// API route to get comments and ratings for assigned user's orders
router.get("/users/:userId/comments-ratings", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await getOrderCommentsAndRatingsByAssignedUserId(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/itemRating", async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("items");
    const ratings = calculateRatings(orders);
    res.json(ratings);
  } catch (error) {
    next(error);
  }
});

module.exports = {
  orderRoutes: router,
  getOrderCommentsAndRatingsByAssignedUserId,
};
