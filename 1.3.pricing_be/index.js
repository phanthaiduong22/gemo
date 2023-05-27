const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const Order = require("./models/order");
const orderHandler = require("./services/orderHandler");
const bcrypt = require("bcrypt");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const port = process.env.PORT || 8005;

const app = express();

app.use(cors({ origin: "*" }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Database connection string
const dbConnectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
// Connect to MongoDB
mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.get("/api/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/api/login", async (req, res) => {
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
    console.error("Error during login:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.post("/api/register", async (req, res) => {
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
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Create a new order
app.post("/api/users/:userId/orders", async (req, res) => {
  try {
    const { userId } = req.params;
    const { items, status, cartPrice } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newOrder = new Order({
      user: userId,
      username: user.username,
      items: items,
      status: status,
      cartPrice: cartPrice,
    });

    const createdOrder = await newOrder.save();
    console.log("New order created:", createdOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /orders/:userId



app.get("/api/users/:userId/orders", async (req, res) => orderHandler.getOrdersOfUser(req, res));

app.put("/api/users/:userId/orders/:orderId/status", async (req, res) => {
  const { orderId, userId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (order.status === "Cancelled" || order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot update a cancelled or completed order" });
    }

    if (user.role === "customer") {
      if (order.status !== "Pending") {
        return res
          .status(400)
          .json({ message: "Customers can only cancel pending orders" });
      }
      if (status !== "Cancelled") {
        return res.status(400).json({ message: "Invalid status for customer" });
      }
      order.status = status;
      await order.save();
    } else if (user.role === "staff") {
      const validStatusTransitions = {
        Pending: ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
      };

      if (
        validStatusTransitions[order.status] &&
        validStatusTransitions[order.status].includes(status)
      ) {
        order.status = status;
        await order.save();
      } else {
        return res.status(400).json({ message: "Invalid status for staff" });
      }
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
