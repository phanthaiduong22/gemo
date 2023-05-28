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
app.use(cors({ origin: "*" }));
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

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
