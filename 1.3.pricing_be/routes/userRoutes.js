const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const baristaImage =
  "https://img.freepik.com/premium-vector/young-smiling-man-barista-wearing-apron-standing-whipped-milk-into-coffee-mug-coffee-shop-coffee-time-take-away-concept-3d-vector-people-character-illustrationcartoon-minimal-style_365941-811.jpg";
const router = express.Router();

// Login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
});

// Register
router.post("/register", async (req, res, next) => {
  let {
    username,
    password,
    role,
    fullName,
    email,
    phone,
    address,
    googleId,
    picture,
  } = req.body;

  try {
    let existingUser,
      hashedPassword = "";

    if (googleId) {
      existingUser = await User.findOne({ googleId });
    } else {
      existingUser = await User.findOne({ username });
    }

    if (existingUser) {
      return res.json({
        message: "User already exists",
        userId: existingUser._id,
      });
    }

    if (!googleId) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (role == "barista" && (picture == "" || picture == undefined)) {
      picture = baristaImage;
    }

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      fullName,
      email,
      phone,
      address,
      googleId,
      picture,
    });

    const savedUser = await newUser.save();

    res.json({ message: "Registration successful", userId: savedUser._id });
  } catch (error) {
    next(error);
  }
});

// Get User Info
router.get("/users/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { username, role, fullName, email, phone, address, picture } = user;
    res.json({
      _id: user._id,
      username,
      role,
      fullName,
      email,
      phone,
      address,
      picture,
    });
  } catch (error) {
    next(error);
  }
});

// Update User
router.put("/users/:userId/update", async (req, res, next) => {
  const { userId } = req.params;
  const { username, password, role, fullName, email, phone, address } =
    req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (role) {
      user.role = role;
    }
    if (fullName) {
      user.fullName = fullName;
    }
    if (email) {
      user.email = email;
    }
    if (phone) {
      user.phone = phone;
    }
    if (address) {
      user.address = address;
    }

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
});

/// Barista

router.get("/users/:userId/baristas", async (req, res) => {
  try {
    // Check if the requesting user has the "staff" role
    const requestingUser = await User.findById(req.params.userId);
    if (requestingUser.role !== "staff") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find all users with the "barista" role and retrieve their IDs and names
    const baristas = await User.find({ role: "barista" }, "_id username");

    res.json(baristas);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
