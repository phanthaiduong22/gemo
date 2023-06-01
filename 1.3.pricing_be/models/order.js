const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  items: [
    {
      drink: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
      size: {
        type: String,
        required: false,
      },
      hasWhippingCream: {
        type: Boolean,
        required: false,
      },
      milkOption: {
        type: String,
        required: false,
      },
      chocolateSaucePumps: {
        type: Number,
        required: false,
      },
      food: {
        type: String,
        required: false,
      },
      selectedCustomizations: {
        type: [String],
        required: false,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: false,
    min: 0,
    max: 5,
    default: 0,
  },
  cartPrice: {
    totalCartPrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    totalCartPriceAfterTax: {
      type: Number,
      required: true,
    },
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      picture: {
        type: String,
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
  ],
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
