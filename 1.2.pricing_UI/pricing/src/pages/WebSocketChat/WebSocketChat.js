import React, { useEffect, useState } from "react";

const WebSocketChat = () => {
  const [socket, setSocket] = useState(null);
  const [commentsData, setCommentsData] = useState({});
  const [userId, setUserId] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const orderId = "6478c9fe9bfcd0faf6e55bce";

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(`ws://localhost:8005?orderId=${orderId}`);

    // Set up event handlers
    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { orderId, comments } = data;

      setCommentsData((prevData) => ({ ...prevData, [orderId]: comments }));
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      newComment &&
      newComment.trim() !== ""
    ) {
      const data = { orderId, userId, comment: newComment };
      socket.send(JSON.stringify(data));
      setCommentsData((prevData) => ({
        ...prevData,
        [orderId]: [...(prevData[orderId] || []), newComment],
      }));
      setNewComment("");
    }
  };

  return (
    <div>
      <div>
        <h3>Order ID: {orderId}</h3>
        <ul>
          {commentsData[orderId] &&
            commentsData[orderId].map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
        </ul>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={sendMessage}>Add Comment</button>
        {commentStatus && <p>{commentStatus}</p>}
      </div>
    </div>
  );
};

export default WebSocketChat;
