const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const passport = require('passport');

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

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
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

module.exports = router;