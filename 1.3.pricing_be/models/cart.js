const mongoose = require("mongoose");
const { orderItemSchema } = require("./order.js");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  cartPrice: {
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalCartPriceAfterTax: {
      type: Number,
      default: 0,
    },
  },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
