// index.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();

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
