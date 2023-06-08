const express = require("express");
const User = require("../models/user");
const Cart = require("../models/cart");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// GET Cart by userId
router.get("/cart", verifyToken, async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(200).json({ cart: { items: [] } });
    res.json({ cart: cart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST UpdateCart by userId
router.post("/cart", verifyToken, async (req, res) => {
  const userId = req.user._id;
  const item = req.body.item;

  try {
    let cart = await Cart.findOne({ user: userId });

    const totalCartPrice = item.price;
    const tax = totalCartPrice * 0.0725;
    const totalCartPriceAfterTax = totalCartPrice + tax;

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [item],
        cartPrice: { totalCartPrice, tax, totalCartPriceAfterTax },
      });
    } else {
      cart.items.push(item);
      cart.cartPrice.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
      cart.cartPrice.tax = cart.cartPrice.totalCartPrice * 0.0725;
      cart.cartPrice.totalCartPriceAfterTax =
        cart.cartPrice.totalCartPrice + cart.cartPrice.tax;
    }

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove Item from Cart by userId
router.delete("/cart/:itemId", verifyToken, async (req, res) => {
  const userId = req.user._id;
  const itemId = req.params.itemId;
  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.cartPrice.totalCartPrice = cart.items.reduce(
      (total, item) => total + item.price,
      0
    );
    cart.cartPrice.tax = cart.cartPrice.totalCartPrice * 0.0725;
    cart.cartPrice.totalCartPriceAfterTax =
      cart.cartPrice.totalCartPrice + cart.cartPrice.tax;
    const updatedCart = await cart.save();
    res.json({ cart: updatedCart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Clear Cart by userId
router.delete("/cart", verifyToken, async (req, res) => {
  const userId = req.user._id;

  try {
    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
