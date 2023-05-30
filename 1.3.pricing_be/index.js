// index.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const session  = require('express-session');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

dotenv.config();

const app = express();

// Init passport 
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: "http://localhost:8005/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, done) {
    // This function will be called when the user has authenticated successfully
    // You can use the user's profile information to create a new user in your database or log them in
    done(null, profile);
  }
));

app.use(session({
  secret: "cookie_secret",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Middleware
if (process.env.NODE_ENV === "production") {
  // Code specific to production environment
  app.use(cors({ origin: "https://restaurant.duongphan.com" }));
} else {
  // Code for other environments (e.g., development, testing)
  app.use(cors({ origin: "*" }));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use(morgan("dev"));

// Routes
app.use("/", authRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);

// Error handling middleware
app.use(errorHandler);

const port = process.env.PORT || 8005;

app.get("/helloworld", (req, res) => {
  const message = `Hello, world! Server is running on port ${port}`;
  res.send(message);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
