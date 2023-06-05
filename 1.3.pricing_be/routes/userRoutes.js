const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

const baristaImage =
  "https://img.freepik.com/premium-vector/young-smiling-man-barista-wearing-apron-standing-whipped-milk-into-coffee-mug-coffee-shop-coffee-time-take-away-concept-3d-vector-people-character-illustrationcartoon-minimal-style_365941-811.jpg";
const staffImage =
  "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-Vector-No-Background.png";
const customerImage =
  "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp";

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

    const userToken = {
      _id: user._id,
      role: user.role,
      username: user.username,
    };

    const token = jwt.sign(userToken, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // TODO: May remove in future
    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      picture: user.picture,
    };

    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  // Perform any additional logout operations

  res.status(200).json({ message: "Logout successful" });
});

// Register
router.post("/register", async (req, res, next) => {
  try {
    const {
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

    const existingUser = googleId
      ? await User.findOne({ googleId })
      : await User.findOne({ username });

    if (existingUser) {
      return res.json({
        message: "User already exists",
        userId: existingUser._id,
      });
    }

    const hashedPassword = googleId ? "" : await bcrypt.hash(password, 10);
    const defaultPicture = {
      barista: baristaImage,
      staff: staffImage,
      customer: customerImage,
    }[role];

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      fullName,
      email,
      phone,
      address,
      googleId,
      picture: picture || defaultPicture,
    });

    const savedUser = await newUser.save();

    res.json({ message: "Registration successful", userId: savedUser._id });
  } catch (error) {
    next(error);
  }
});

// Get User Info
router.get("/users", verifyToken, async (req, res, next) => {
  try {
    const { _id, username, role, fullName, email, phone, address, picture } =
      req.user;
    res.json({
      _id,
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
router.put("/users", verifyToken, async (req, res, next) => {
  const { username, password, role, fullName, email, phone, address } =
    req.body;
  const user = req.user;

  try {
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

/// Get all baristas Id and Username
router.get(
  "/users/baristas",
  verifyToken,
  authorize(["staff"]),
  async (req, res) => {
    try {
      // Find all users with the "barista" role and retrieve their IDs and names
      const baristas = await User.find({ role: "barista" }, "_id username");

      res.json(baristas);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
