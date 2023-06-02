const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const WebSocket = require("ws");
const http = require("http");

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const Order = require("./models/order.js");
const User = require("./models/user.js");

// Connect to MongoDB
connectDB();

// Middleware
const origin =
  process.env.NODE_ENV === "production"
    ? "https://restaurant.duongphan.com"
    : "*";
app.use(cors({ origin }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use(morgan("dev"));

// Routes
app.use("/api", userRoutes);
app.use("/api", orderRoutes);

// Store WebSocket connections and comments for each order
const orderConnections = {};
const orderComments = {};

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  // Extract the orderId from query parameters
  const params = new URLSearchParams(req.url.split("?")[1]);
  const orderId = params.get("orderId");

  ws.on("message", async (message) => {
    try {
      const { userId, comment } = JSON.parse(message);

      if (!orderId || !userId || !comment) {
        throw new Error("Invalid data provided");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const newComment = {
        user: userId,
        username: user.username,
        picture: user.picture,
        content: comment,
        createdAt: new Date(),
      };

      if (!orderComments[orderId]) {
        orderComments[orderId] = [];
      }
      orderComments[orderId].push(newComment);

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $push: { comments: newComment } },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found");
      }

      broadcastComments(orderId, updatedOrder.comments);
    } catch (error) {
      console.error("Error updating order comments:", error);
    }
  });

  ws.on("close", () => {
    if (orderConnections[orderId]) {
      const index = orderConnections[orderId].indexOf(ws);
      if (index !== -1) {
        orderConnections[orderId].splice(index, 1);
      }
    }
  });

  if (!orderConnections[orderId]) {
    orderConnections[orderId] = [];
  }
  orderConnections[orderId].push(ws);

  (async () => {
    try {
      const order = await Order.findById(orderId);
      if (order) {
        const comments = order.comments.map((comment) => ({
          ...comment.toObject(),
          _id: comment._id.toString(),
        }));
        ws.send(JSON.stringify({ orderId, comments }));
      }
    } catch (error) {
      console.error("Error retrieving order comments:", error);
    }
  })();
});

function broadcastComments(orderId, comments) {
  if (orderConnections[orderId]) {
    const message = JSON.stringify({ orderId, comments });
    orderConnections[orderId].forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Error handling middleware
app.use(errorHandler);

const port = process.env.PORT || 8005;

app.get("/", (req, res) => {
  const message = `Hello, world! Server is running on port ${port}`;
  res.send(message);
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
