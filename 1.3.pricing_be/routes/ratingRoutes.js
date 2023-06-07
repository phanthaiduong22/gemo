const express = require("express");
const Order = require("../models/order");
const { verifyToken } = require("../middleware/authMiddleware");
const { ChatCompletionResponseMessageRoleEnum } = require("openai");

const router = express.Router();

// Calculate product ratings and average rating for a user's orders
router.get("/rating/users/:userId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Find all orders assigned to the user and populate the 'items' field
    const orders = await Order.find({ assignedUser: userId }).populate("items");

    console.log(orders);

    const fetchedRatings = calculateRatings(orders);

    res.json(fetchedRatings);
  } catch (error) {
    next(error);
  }
});

// Calculate product ratings and average rating for all orders by baristas
router.get("/rating/orders", verifyToken, async (req, res, next) => {
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

// Update order rating
router.put("/orders/:orderId/rate", verifyToken, async (req, res, next) => {
  const userId = req.user._id;
  const { orderId } = req.params;
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

router.get("/rating/item", verifyToken, async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate("items");
    const ratings = calculateRatings(orders);
    res.json(ratings);
  } catch (error) {
    next(error);
  }
});

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
    if (order.rating == 0) return;
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

module.exports = {
  ratingRoutes: router,
  calculateRatings: calculateRatings,
};
