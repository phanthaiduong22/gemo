import React, { useState, useEffect } from "react";
import { Button, Card, Col, Container, Row, Form } from "react-bootstrap";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import coffeeImage from "../../images/coffee.png";
import milkteaImage from "../../images/milktea.png";
import bagelImage from "../../images/bagel.png";
import sandwichImage from "../../images/sandwich.png";
import axios from "axios";
import "./Order.css";
import { showAlert } from "../../redux/actions/alertActions";
import { connect } from "react-redux";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { Rating } from "react-simple-star-rating";
import WebSocketComment from "./WebSocketComment/WebSocketComment";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

const Order = ({ order, user, showAlert }) => {
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    confirmOrderId: null,
    confirmStatus: "",
  });
  const [showCommentSection, setShowCommentSection] = useState(false);

  const renderItemImage = (item) => {
    switch (item.drink || item.food) {
      case "Coffee":
        return coffeeImage;
      case "Milk Tea":
        return milkteaImage;
      case "Bagel":
        return bagelImage;
      case "Sandwich":
        return sandwichImage;
      default:
        return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setConfirmModal({
      show: true,
      confirmOrderId: orderId,
      confirmStatus: status,
    });
  };

  const recreateOrder = (orderId) => {
    setConfirmModal({
      show: true,
      confirmOrderId: orderId,
      confirmStatus: "Recreate",
    });
  };

  const callUpdateOrderStatus = async (orderId, status) => {
    const userId = user._id;
    try {
      await axios.put(
        `${backendUrl}/users/${userId}/orders/${orderId}/status`,
        {
          status,
        }
      );
      showAlert("success", "Order status updated successfully");
      // Call the appropriate method to update orders
    } catch (error) {
      showAlert("danger", `Error updating order status: ${error.message}`);
    }
  };

  const callRecreateOrder = async (orderId) => {
    const userId = user._id;
    try {
      await axios.post(
        `${backendUrl}/users/${userId}/orders/${orderId}/recreate`
      );
      showAlert("success", "Order recreated successfully");
      // Call the appropriate method to update orders
    } catch (error) {
      console.log(error);
      showAlert(
        "danger",
        `Error recreating order: ${error.response.data.message}`
      );
    }
  };

  const handleConfirmation = (confirmed) => {
    const { confirmOrderId, confirmStatus } = confirmModal;

    if (confirmed) {
      if (confirmStatus === "Recreate") {
        callRecreateOrder(confirmOrderId);
      } else {
        callUpdateOrderStatus(confirmOrderId, confirmStatus);
      }
    }

    setConfirmModal({
      show: false,
      confirmOrderId: null,
      confirmStatus: "",
    });
  };

  const handleRating = async (rate) => {
    const { _id: orderId } = order;
    const userId = user._id;

    try {
      await axios.put(`${backendUrl}/users/${userId}/orders/${orderId}/rate`, {
        rating: rate,
      });
      // Update the order state with the new rating
      showAlert("success", "Order rating updated successfully");
    } catch (error) {
      showAlert(
        "danger",
        `Error updating order rating: ${error.response.data.message}`
      );
    }
  };

  const toggleCommentSection = () => {
    setShowCommentSection((prevShowCommentSection) => !prevShowCommentSection);
  };

  return (
    <div>
      <div key={order._id} className="col-lg-10 col-xl-12 p-6 mb-4">
        <Card>
          <Card.Header className="bg-light d-flex flex-wrap justify-content-between align-items-center">
            <h5 className="text-muted mb-2 mb-lg-0">Order #{order._id}</h5>
            <h4 className="text-primary mb-0 flex-grow-1">
              Ordered by {order.username}
            </h4>
          </Card.Header>

          <Card.Body>
            <Card className="mb-4">
              <Card.Body>
                {order.items.map((item) => (
                  <Row className="border rounded mb-2" key={item._id}>
                    <Col xs={2}>
                      <img
                        src={renderItemImage(item)}
                        className="image-item"
                        alt="Item"
                      />
                    </Col>
                    <Col xs={10} className="mt-2 text-left">
                      <div className="text-muted mb-0 fs-4">
                        <h2 className="fw-bold fs-6">
                          {item.drink || item.food}
                        </h2>
                      </div>
                      <div>
                        {item.drink !== undefined ? (
                          <p>
                            Topping: {item.type}, size {item.size}
                            {item.hasWhippingCream && ", has whipping cream"}
                            {item.milkOption !== "None" &&
                              `, ${item.milkOption}`}
                            {item.chocolateSaucePumps > 0 &&
                              `, ${item.chocolateSaucePumps} chocolate sauce`}
                          </p>
                        ) : (
                          <p>
                            {item.selectedCustomizations.length > 0 &&
                              "Topping: "}
                            {item.selectedCustomizations.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="mb-0">
                          <span className="fw-bold">Price:</span> $
                          {item.price.toFixed(2)}
                        </p>
                      </div>
                    </Col>
                  </Row>
                ))}
                <hr className="mb-4 mt-4" />
                <ProgressBar status={order.status} />
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-between pt-2">
              <p className="fw-bold mb-0"></p>
              <p className="text-muted mb-0">
                <span className="fw-bold me-4">Total</span> $
                {order.cartPrice.totalCartPrice.toFixed(2)}
              </p>
            </div>

            <div className="d-flex justify-content-between pt-2">
              <p className="text-muted mb-0"></p>
              <p className="text-muted mb-0">
                <span className="fw-bold me-4">Tax</span> $
                {order.cartPrice.tax.toFixed(2)}
              </p>
            </div>
          </Card.Body>

          <Card.Footer className="bg-grey text-black">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {(user.role === "staff" || user.role === "barista") &&
                  order.status === "Pending" && (
                    <Button
                      variant="warning"
                      className="m-2"
                      onClick={() =>
                        updateOrderStatus(order._id, "In Progress")
                      }
                    >
                      In Progress
                    </Button>
                  )}
                {(user.role === "staff" || user.role === "barista") &&
                  order.status === "In Progress" && (
                    <Button
                      variant="success"
                      className="m-2"
                      onClick={() => updateOrderStatus(order._id, "Completed")}
                    >
                      Complete Order
                    </Button>
                  )}
                {order.status !== "Completed" &&
                  order.status !== "Cancelled" && (
                    <Button
                      variant="danger"
                      className="m-2"
                      onClick={() => updateOrderStatus(order._id, "Cancelled")}
                    >
                      Cancel Order
                    </Button>
                  )}
                {order.status === "Completed" && (
                  <Button
                    variant="success"
                    className="m-2"
                    onClick={() => recreateOrder(order._id)}
                  >
                    Order Again
                  </Button>
                )}
              </div>
              <h5 className="d-flex align-items-center justify-content-end text-uppercase mb-0">
                Total paid:{"  "}
                <span className="ml-2 h2 mb-0 ms-2">
                  ${order.cartPrice.totalCartPriceAfterTax.toFixed(2)}
                </span>
              </h5>
            </div>
          </Card.Footer>
          <Card.Footer className="bg-grey text-black">
            <div className="d-flex justify-content-between align-items-center ml-2">
              <div>
                Rate this order:
                <Rating
                  onClick={handleRating}
                  initialValue={order.rating}
                  key={order.rating}
                  readonly={user._id !== order.user}
                />
              </div>
              <Button variant="primary" onClick={toggleCommentSection}>
                {showCommentSection ? "Hide Comments" : "Add Comment"}
              </Button>
            </div>
          </Card.Footer>
        </Card>
        {showCommentSection && (
          <WebSocketComment user={user} orderId={order._id} key={order._id} />
        )}
      </div>
    </div>
  );
};

export default connect(null, { showAlert })(Order);
