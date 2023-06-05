import React, { useState } from "react";

const FeedbackModal = ({ orderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleToggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = (event) => {
    event.preventDefault();
    // Perform the submission logic here
    console.log("Feedback submitted:", feedback);
    setFeedback("");
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={handleToggleModal}>
        {isOpen ? "Close Feedback" : "Open Feedback"}
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
