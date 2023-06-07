import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/actions/alertActions";
import callAPI from "../../utils/apiCaller";

const FeedbackModal = ({ orderId, onFeedbackUpdate }) => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const handleToggleModal = () => {
    setIsOpen(!isOpen);
    onFeedbackUpdate(!isOpen);
    setMessage(""); // Clear the message when the modal is toggled
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();

    if (feedback === "") {
      dispatch(showAlert("warning", "Please provide your feedback"));
      return;
    }

    callAPI("/feedback", "POST", { orderId, feedback })
      .then((res) => {
        if (res.data.success) {
          setFeedback("");
          setMessage(res.data.message); // Set the message received from the backend
          dispatch(showAlert("success", "Feedback submitted successfully"));
        }
      })
      .catch((error) => {
        dispatch(showAlert("danger", "Error submitting feedback"));
      });
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={handleToggleModal}>
        {isOpen ? "Close Feedback" : "Submit Feedback"}
      </button>
      {isOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Feedback</h5>
                <button
                  type="button"
                  className="close"
                  onClick={handleToggleModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitFeedback}>
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      value={feedback}
                      onChange={handleFeedbackChange}
                      placeholder="Please provide your feedback..."
                      rows={5}
                    />
                  </div>
                  {message && (
                    <div className="my-3 p-3 bg-info text-white rounded">
                      <p>{message}</p>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Submit Feedback
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
