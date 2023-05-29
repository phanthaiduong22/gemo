// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    if (!users) return res.status(404).json({ error: "No user found!" });
    return res.status(200).json({ users });
  } catch (error) {
    next(error)
  }
})

router.get('/user/:id', async (req, res, next) => {
  let { id } = req.params;
  if (!id) return res.status(400).json({ error: "No user id found!" });
  try {
    let user = await User.findById(id);
    return res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
})

module.exports = router;
