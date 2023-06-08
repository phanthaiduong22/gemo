const express = require("express");
const { Order } = require("../models/order");
const User = require("../models/user");
const { verifyToken } = require("../middleware/authMiddleware");
const { calculateRatings } = require("../routes/ratingRoutes");
const router = express.Router();

const delimiter = "####";

const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

router.post("/chat", verifyToken, async (req, res) => {
  try {
    user = req.user;
    const { prompt } = req.body;

    let messages = [];

    if (user.role === "customer") {
      const orders = await Order.find().limit(5).populate("items");
      messages.push(
        {
          role: "system",
          content: `You are manager of a cafeteria. You will be provided questions for recommendation, introduce our cafeteria, anything from customer
           I will provide you our past orders in ${delimiter}. You can reference them to answer the questions.
            ${delimiter} ${JSON.stringify(orders)} ${delimiter}
          `,
        },
        {
          role: "user",
          content: prompt,
        }
      );
    } else if (user.role === "barista") {
      const performance = await getOrderCommentsAndRatingsByAssignedUserId(
        user._id
      );
      messages.push(
        {
          role: "system",
          content: `You are manager of a cafeteria. You will be provide barista's performance. Can you evaluate the barista's performance?
            ${delimiter} ${JSON.stringify(performance)} ${delimiter}
          `,
        },
        {
          role: "user",
          content: prompt,
        }
      );
    } else if (user.role === "staff") {
      // Get all barista' ID
      const baristas = await User.find({ role: "barista" });
      const baristaIds = baristas.map((barista) => barista._id);
      let performances = [];
      for (let i = 0; i < baristaIds.length; i++) {
        const performance = await getOrderCommentsAndRatingsByAssignedUserId(
          baristaIds[i]
        );
        performances = performances.concat(performance);
      }
      messages.push(
        {
          role: "system",
          content: `You are manager of a cafeteria. You will be provide barista's performance. Can you evaluate the barista's performance?
            ${delimiter} ${JSON.stringify(performances)} ${delimiter}
          `,
        },
        {
          role: "user",
          content: prompt,
        }
      );
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
      // console.log(error.response.data);
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      // console.log(error.message);
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

const evaluateFeedback = async (feedback) => {
  try {
    const messages = [
      {
        role: "system",
        content: `You are manager of a cafeteria. You will be provided with customer feedback. The customer feedback will be delimited with ${delimiter} characters.
          You will evaluate the feedback and provide a response. Provide your output must in json format with the keys: sentimentScore, evaluation,.
          sentimentScore: is in range [-1, 1], -1 is most negative and 1 is most positive evaluation: is your evaluation in 20 words.
          Your output must be in json format with 2 keys (sentimentScore, evaluation).
          `,
      },
      {
        role: "user",
        content: `Your output must be in json format with 2 keys (sentimentScore, evaluation). ${delimiter} ${feedback} ${delimiter}`,
      },
    ];

    // console.log(messages);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
    });

    const response = completion.data.choices[0].message.content;

    const { sentimentScore, evaluation } = JSON.parse(response);
    return {
      sentimentScore,
      evaluation,
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  chatBotRoutes: router,
  evaluateFeedback: evaluateFeedback,
};
