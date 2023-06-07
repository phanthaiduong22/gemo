import React, { useState } from "react";
import moment from "moment";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import callAPI from "../../utils/apiCaller";

const TaskItem = ({ task, onTaskUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [feedback, setFeedback] = useState(task.feedback);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [sentimentScore, setSentimentScore] = useState(task.sentimentScore);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleSaveChanges = () => {
    callAPI(`/feedback/${task._id}`, "PUT", {
      title,
      feedback,
      priority,
      status,
    })
      .then((res) => {
        onTaskUpdate(task._id, res.data.feedback);
      })
      .catch((err) => {
        console.log(err);
      });

    handleCloseModal();
  };

  const getPriorityName = () => {
    switch (priority) {
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        return "";
    }
  };

  console.log(task);
  if (!task) return null;

  return (
    <div className="">
      <div className={`card-body`}>
        <h5 className="card-title">{task.title}</h5>
        <p className="card-text">Feedback: {task.feedback}</p>
        <p className="card-text">Priority: {getPriorityName(task.priority)}</p>
        <p className="card-text">Created: {moment(task.createdAt).fromNow()}</p>
        <Button variant="primary" onClick={handleOpenModal}>
          See Details
        </Button>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formFeedback">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPriority">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Deleted">Deleted</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formSentimentScore">
              <Form.Label>Sentiment Score</Form.Label>
              <Form.Control
                type="number"
                min={-1}
                max={1}
                step={0.1}
                value={sentimentScore}
                readOnly
              />
              <Form.Text className="text-muted">
                -1 is most Negative, 1 is most Positive
              </Form.Text>
            </Form.Group>
            {/* Display user information */}
            {task.order && (
              <>
                <Form.Group controlId="formUser" className="mt-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-user">
                      User Info
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <p>Username: {task.order.user.username}</p>
                        <p>Full Name: {task.order.user.fullName}</p>
                        <p>Email: {task.order.user.email}</p>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                <Form.Group controlId="formUser" className="mt-2">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="primary"
                      id="dropdown-assignedUser"
                    >
                      Assigned User
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <p>Username: {task.order.assignedUser.username}</p>
                        <p>Full Name: {task.order.assignedUser.fullName}</p>
                        <p>Email: {task.order.assignedUser.email}</p>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskItem;
