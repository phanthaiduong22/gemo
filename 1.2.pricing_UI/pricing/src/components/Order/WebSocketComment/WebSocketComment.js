import React, { useState, useEffect } from "react";
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardImage,
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBTextArea,
} from "mdb-react-ui-kit";
import { Button, Container } from "react-bootstrap";

const backendWsUrl =
  process.env.REACT_APP_BACKEND_WS_URL || "ws://localhost:8005";

const WebSocketComment = ({ user, orderId }) => {
  const [socket, setSocket] = useState(null);
  const [commentsData, setCommentsData] = useState([]);
  const [newComment, setNewComment] = useState("");
  const userId = user._id;

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`${backendWsUrl}?orderId=${orderId}`);

      ws.onopen = () => {
        // console.log("Connected to server");
      };

      console.log(userId, orderId);

      ws.onmessage = (event) => {
        // console.log("Received message from server");
        const data = JSON.parse(event.data);
        const { orderId: receivedOrderId, comments } = data;

        if (receivedOrderId === orderId) {
          setCommentsData(comments);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from server");
      };

      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [orderId]);

  const sendMessage = () => {
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      newComment &&
      newComment.trim() !== ""
    ) {
      const data = { orderId, userId, comment: newComment };
      socket.send(JSON.stringify(data));
      setNewComment("");
    }
  };

  return (
    <section style={{ backgroundColor: "#eee" }}>
      <Container className="container-fluid" style={{ maxWidth: "100% " }}>
        <MDBRow className="justify-content-center w-100">
          <MDBCol md="12" lg="10" xl="8">
            <MDBCard style={{ maxWidth: "100%" }}>
              <MDBCardBody>
                {commentsData.length > 0 ? (
                  <div>
                    {commentsData.map((comment, index) => (
                      <div
                        key={comment._id}
                        className="d-flex flex-start align-items-center"
                      >
                        <MDBCardImage
                          className="rounded-circle shadow-1-strong me-3"
                          src={comment.picture}
                          alt="avatar"
                          width="60"
                          height="60"
                          style={{ marginTop: "-60px" }} // Add margin top to move the image up
                        />
                        <div className="ml-2">
                          <h6 className="fw-bold text-primary mb-1">
                            {comment.username}
                          </h6>
                          <p className="text-muted small mb-0">
                            Shared publicly -{" "}
                            {new Date(comment.createdAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              }
                            )}
                          </p>
                          <p className="pb-2">{comment.content}</p>
                          {index !== commentsData.length - 1 && (
                            <hr className="my-3" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No comments yet.</p>
                )}
              </MDBCardBody>

              <MDBCardFooter
                className="py-3 border-0"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <div className="d-flex flex-start w-100">
                  <MDBCardImage
                    className="rounded-circle shadow-1-strong me-3"
                    src={user.picture}
                    alt="avatar"
                    width="40"
                    height="40"
                  />
                  <MDBTextArea
                    id="textAreaExample"
                    rows={4}
                    style={{ backgroundColor: "#fff" }}
                    wrapperClass="w-100"
                    value={newComment}
                    className="ml-2"
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <div className="float-end pt-1 ml-5">
                  <Button onClick={sendMessage}>Post comment</Button>
                </div>
              </MDBCardFooter>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </Container>
    </section>
  );
};

export default WebSocketComment;
