const express = require("express");
const Order = require("../models/order");
const { verifyToken } = require("../middleware/authMiddleware");
const { calculateRatings } = require("../routes/ratingRoutes");

const router = express.Router();

const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

router.post("/chat", verifyToken, async (req, res) => {
  try {
    userId = req.user._id;
    const { prompt } = req.body;

    let messages = [];
    const performance = await getOrderCommentsAndRatingsByAssignedUserId(
      userId
    );

    const promptDictionary = {
      "/performance": {
        message: `I am a barista, assignedUsername is my username, comments is the conversation between me & other customers, ratingOfAssignedUser is my score, ratingOfAllBarista. If the rating is 0, it means I haven't done this drink/food. Give me an evaluation and advise on my comments and rating compared to all baristas. Data: ${JSON.stringify(
          performance
        )}`,
      },
      "/rating": {
        message: `Focusing on my rating, DON't mentioning about comments/attitude. My cafeteria performance: I am a barista, assignedUsername is my username, comments is the conversation between me & other customers, ratingOfAssignedUser is my score, ratingOfAllBarista. If the rating is 0, it means I haven't done this drink/food. Give me an evaluation and advise on my comments and rating compared to all baristas. Data: ${JSON.stringify(
          performance
        )}`,
      },
      "/comment": {
        message: `Focusing on my comment/attitude, DON't mentioning about rating. My cafeteria performance: I am a barista, assignedUsername is my username, comments is the conversation between me & other customers, ratingOfAssignedUser is my score, ratingOfAllBarista. If the rating is 0, it means I haven't done this drink/food. Give me an evaluation and advise on my comments and rating compared to all baristas. Data: ${JSON.stringify(
          performance
        )}`,
      },
    };

    messages.push({
      role: "system",
      content:
        "You are manager of a cafeteria. Give barista evaluation based on their performance",
    });

    if (prompt in promptDictionary) {
      const { message } = promptDictionary[prompt];
      messages.push({
        role: "user",
        content: message,
      });
    } else {
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });

    const response = completion.data.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.log(error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

const getOrderCommentsAndRatingsByAssignedUserId = async (assignedUserId) => {
  try {
    // Find all orders assigned to the user and populate the 'comments' and 'items' fields
    const orders = await Order.find({ assignedUser: assignedUserId })
      .populate("comments.user", ["username"])
      .populate("items");

    if (orders.length === 0) {
      return {
        comments: [],
        ratings: [],
      };
    }

    const fetchedRatings = calculateRatings(orders);
    let assignedUsername;

    let comments = [];
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].comments.length; j++) {
        const { user, picture, username, content } = orders[i].comments[j];
        comments = [...comments, { username, content }];
      }
      assignedUsername = orders[i].assignedUsername;
    }

    const ratingOfAssignedUser = fetchedRatings.reduce(
      (result, { product, rating }) => {
        result[product] = rating;
        return result;
      },
      {}
    );

    const allOrders = await Order.find({}).populate("items");
    const allRatings = calculateRatings(allOrders);

    const ratingOfAllBarista = allRatings.reduce(
      (result, { product, rating }) => {
        result[product] = rating;
        return result;
      },
      {}
    );

    return {
      assignedUsername,
      comments,
      ratingOfAssignedUser,
      ratingOfAllBarista,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = router;
