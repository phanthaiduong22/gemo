const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

const http = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(
    cors({
      origin: "https://restaurant.duongphan.com", // Replace with your production frontend domain
      credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: "http://localhost:3000", // Replace with your development frontend domain
      credentials: true,
    })
  );
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { chatBotRoutes } = require("./routes/chatBotRoutes");
const { ratingRoutes } = require("./routes/ratingRoutes");
const setupChatWebSocket = require("./routes/chatWebSocket");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Routes
app.use("/api", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", chatBotRoutes);
app.use("/api", ratingRoutes);
app.use("/api", feedbackRoutes);

// Store WebSocket connections and comments for each order
setupChatWebSocket(server);

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
