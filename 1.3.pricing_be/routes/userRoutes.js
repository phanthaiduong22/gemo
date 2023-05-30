// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const router = express.Router();

// Login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create a user object to be returned, excluding the password field
    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
});

// Register
router.post("/register", async (req, res, next) => {
  const { username, password, role } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with role
    const newUser = new User({ username, password: hashedPassword, role });

    // Save the user to the database
    await newUser.save();

    res.json({ message: "Registration successful" });
  } catch (error) {
    next(error);
  }
});

// Get User Info
router.get("/users/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user information
    const { username, role, fullName, email, phone, address } = user;
    res.json({
      id: user._id,
      username,
      role,
      fullName,
      email,
      phone,
      address,
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
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user fields if provided
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

    // Save the updated user to the database
    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
