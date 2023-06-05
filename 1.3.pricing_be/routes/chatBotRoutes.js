const express = require("express");
const { getOrderCommentsAndRatingsByAssignedUserId } = require("./orderRoutes");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { assignedUserId, prompt } = req.body;

    let messages = [];
    const performance = await getOrderCommentsAndRatingsByAssignedUserId(
      assignedUserId
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

module.exports = router;
