import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";
import callAPI from "../../utils/apiCaller";

const ChatBot = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userMessage = {
      user: "User",
      text: userInput,
    };
    setMessages((messages) => [...messages, userMessage]);
    await botResponse(userInput);
    setUserInput(""); // Clear the user input
  };

  const botResponse = async (prompt) => {
    setIsLoading(true);
    try {
      callAPI("/chat", "POST", {
        prompt: prompt,
      })
        .then((response) => {
          const botMessage = {
            user: "Bot",
            text: response.data.response,
          };
          setMessages((messages) => [...messages, botMessage]);
          setUserInput("");
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    } catch (error) {
      const botMessage = {
        user: "Bot",
        text: error.message,
      };
      setMessages((messages) => [...messages, botMessage]);
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  useEffect(() => {
    const initialBotMessage = {
      user: "Bot",
      text: "Hello! How can I assist you today?",
    };
    setMessages([initialBotMessage]);
  }, []);

  useEffect(() => {
    if (showChatbot) {
      inputRef.current.focus();
    }
  }, [showChatbot]);

  return (
    <div>
      {showChatbot ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>ChatBot</h3>
            <button className="close-button" onClick={toggleChatbot}>
              X
            </button>
          </div>
          <div className="chatbot-body">
            <ul className="list-unstyled">
              {messages.map((message, index) => (
                <li key={index}>
                  {message.user === "User" ? (
                    <div className="user-message">
                      <img
                        src={user.picture}
                        alt="User"
                        className="user-avatar"
                      />
                      <span className="message-text">{message.text}</span>
                    </div>
                  ) : (
                    <div className="chatbot-message">
                      <img
                        src={
                          "https://media.istockphoto.com/id/1010001882/vector/%C3%B0%C3%B0%C2%B5%C3%B1%C3%B0%C3%B1%C3%B1.jpg?s=612x612&w=0&k=20&c=1jeAr9KSx3sG7SKxUPR_j8WPSZq_NIKL0P-MA4F1xRw="
                        }
                        alt="Chatbot"
                        className="chatbot-avatar"
                      />
                      <span className="message-text">{message.text}</span>
                    </div>
                  )}
                </li>
              ))}
              {isLoading && (
                <li className="loading-message">
                  <div className="chatbot-message">
                    <div className="loading-skeleton"></div>
                    <div className="loading-skeleton"></div>
                    <div className="loading-skeleton"></div>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <div className="chatbot-footer">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSubmit(event);
                }
              }}
              ref={inputRef}
            />
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary rounded-pill chatbot-button"
          onClick={toggleChatbot}
        >
          ChatBot
        </button>
      )}
    </div>
  );
};

export default ChatBot;
