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

// Store WebSocket connections and comments for each order
const orderConnections = {};
const orderComments = {};

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  // Extract the query parameters from the request URL
  const { searchParams } = new URL(req.url, "http://localhost:8005");
  const orderId = searchParams.get("orderId");

  // Handle incoming messages from the client
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const { userId, comment } = data;

    // Check if orderId, userId, and comment are provided
    if (!orderId || !userId || !comment) {
      console.error("Error updating order comments: Invalid data provided");
      return;
    }

    console.log(orderId, userId, comment);

    // Update comments for the order
    if (!orderComments[orderId]) {
      orderComments[orderId] = [];
    }
    orderComments[orderId].push(comment);

    // Store the comment in the database (example using Mongoose)
    Order.findByIdAndUpdate(
      orderId,
      {
        $push: {
          comments: {
            user: userId,
            content: comment,
          },
        },
      },
      { new: true }
    )
      .then((updatedOrder) => {
        if (updatedOrder) {
          // Broadcast the updated comment data to all clients with the specific orderId
          broadcastComments(orderId, orderComments[orderId]);
        } else {
          console.error("Error updating order comments: Order not found");
        }
      })
      .catch((error) => {
        console.error("Error updating order comments:", error);
      });
  });

  // Handle WebSocket connection close
  ws.on("close", () => {
    // Clean up the WebSocket connection for the order
    if (orderConnections[orderId]) {
      const index = orderConnections[orderId].indexOf(ws);
      if (index !== -1) {
        orderConnections[orderId].splice(index, 1);
      }
    }
  });

  // Store the WebSocket connection for the order
  if (!orderConnections[orderId]) {
    orderConnections[orderId] = [];
  }
  orderConnections[orderId].push(ws);
});

// Handle initial connection and send existing comments for the order
wss.on("connection", (ws, req) => {
  // Extract the query parameters from the request URL
  const { searchParams } = new URL(req.url, "http://localhost:8005");
  const orderId = searchParams.get("orderId");

  // Retrieve the existing comments for the order from the database
  Order.findById(orderId)
    .then((order) => {
      if (order) {
        const comments = order.comments.map((comment) => comment.content);
        ws.send(JSON.stringify({ orderId, comments }));
      }
    })
    .catch((error) => {
      console.error("Error retrieving order comments:", error);
    });
});

// Broadcast the comment data to all connected clients for a specific order
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

app.get("/helloworld", (req, res) => {
  const message = `Hello, world! Server is running on port ${port}`;
  res.send(message);
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
