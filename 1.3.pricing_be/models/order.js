const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
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
});

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
  items: [orderItemSchema],
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
    max: 5,
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
  assignedUsername: {
    type: String,
    required: false,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
