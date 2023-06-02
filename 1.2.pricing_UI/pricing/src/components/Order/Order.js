import React, { Component } from "react";
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

class Order extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: this.props.order,
      user: this.props.user,
      confirmModal: {
        show: false,
        confirmOrderId: null,
        confirmStatus: "",
      },
      showCommentSection: false,
    };
  }

  componentDidMount = () => {
    setInterval(this.updateAllowFetchingNewOrders(), 3000);
  };

  renderItemImage(item) {
    if (item.drink) {
      if (item.drink === "Coffee") {
        return coffeeImage;
      } else if (item.drink === "Milk Tea") {
        return milkteaImage;
      }
    } else if (item.food) {
      if (item.food === "Bagel") {
        return bagelImage;
      } else if (item.food === "Sandwich") {
        return sandwichImage;
      }
    }
  }

  updateOrderStatus = async (orderId, status) => {
    this.setState(
      (prevState) => ({
        confirmModal: {
          ...prevState.confirmModal,
          show: true,
          confirmOrderId: orderId,
          confirmStatus: status,
        },
      }),
      () => {
        this.updateAllowFetchingNewOrders();
      }
    );
  };

  recreateOrder = (orderId) => {
    this.setState(
      (prevState) => ({
        confirmModal: {
          ...prevState.confirmModal,
          show: true,
          confirmOrderId: orderId,
          confirmStatus: "Recreate",
        },
      }),
      () => {
        this.updateAllowFetchingNewOrders();
      }
    );
  };

  callUpdateOrderStatus = async (orderId, status) => {
    const userId = this.state.user._id;
    try {
      await axios.put(
        `${backendUrl}/users/${userId}/orders/${orderId}/status`,
        {
          status,
        }
      );
      this.props.showAlert("success", "Order status updated successfully");
      this.props.getOrdersByUserId();
    } catch (error) {
      this.props.showAlert(
        "danger",
        `Error updating order status: ${error.message}`
      );
    }
  };

  callRecreateOrder = async (orderId) => {
    const userId = this.state.user._id;
    try {
      await axios.post(
        `${backendUrl}/users/${userId}/orders/${orderId}/recreate`
      );
      this.props.showAlert("success", "Order recreated successfully");
      this.props.getOrdersByUserId();
    } catch (error) {
      console.log(error);
      this.props.showAlert(
        "danger",
        `Error recreating order: ${error.response.data.message}`
      );
    }
  };

  handleConfirmation = (confirmed) => {
    const { confirmModal } = this.state;
    const { confirmOrderId, confirmStatus } = confirmModal;

    if (confirmed) {
      if (confirmStatus === "Recreate") {
        this.callRecreateOrder(confirmOrderId);
      } else {
        this.callUpdateOrderStatus(confirmOrderId, confirmStatus);
      }
    }

    this.setState(
      (prevState) => ({
        confirmModal: {
          ...prevState.confirmModal,
          show: false,
          confirmOrderId: null,
          confirmStatus: "",
        },
      }),
      () => {
        this.updateAllowFetchingNewOrders();
      }
    );
  };

  handleRating = async (rate) => {
    const { order, user } = this.state;
    const { _id: orderId } = order;
    const userId = user._id;

    try {
      await axios.put(`${backendUrl}/users/${userId}/orders/${orderId}/rate`, {
        rating: rate,
      });
      this.setState({
        order: {
          ...order,
          rating: rate,
        },
      });
      this.props.showAlert("success", "Order rating updated successfully");
    } catch (error) {
      this.setState({ order: order });
      this.props.showAlert(
        "danger",
        `Error updating order rating: ${error.response.data.message}`
      );
    }
  };

  toggleCommentSection = () => {
    this.setState(
      (prevState) => ({
        showCommentSection: !prevState.showCommentSection,
      }),
      () => {
        this.updateAllowFetchingNewOrders();
      }
    );
  };

  updateAllowFetchingNewOrders = () => {
    const { showCommentSection, confirmModal } = this.state;
    const { show } = confirmModal;
    const allowFetchingOrders = !(showCommentSection || show);
    this.props.updateAllowFetchingNewOrders(allowFetchingOrders);
  };

  render() {
    const { order, user, showCommentSection } = this.state;
    const { items } = order;
    const showConfirmModal = this.state.confirmModal.show;
    const isCurrentUserOrderUser = user._id === order.user;

    return (
      <div>
        <div key={order._id} className="col-lg-10 col-xl-12 p-6 mb-4">
          <div className="card">
            <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center">
              <h5 className="text-muted mb-2 mb-lg-0">Order #{order._id}</h5>
            </div>

            <div className="card-body">
              <div className="card mb-4">
                <div className="card-body">
                  {items.map((item) => (
                    <div className="row border rounded mb-2" key={item._id}>
                      <img
                        src={this.renderItemImage(item)}
                        className="image-item"
                        alt="Item"
                      />
                      <div className="col-md-10 mt-2 text-left">
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
                            <span className="fw-bold">Price:</span>
                            {" $"}
                            {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <hr className="mb-4 mt-4" />
                  <ProgressBar status={order.status} />
                </div>
              </div>

              <div className="d-flex justify-content-between pt-2">
                <p className="text-muted mb-0">Ordered by: {order.username}</p>
                <p className="text-muted mb-0">
                  <span className="fw-bold me-4">Total</span> $
                  {order.cartPrice.totalCartPrice.toFixed(2)}
                </p>
              </div>

              <div className="d-flex justify-content-between pt-2">
                {order.assignedUsername ? (
                  <p className="text-muted mb-0">
                    Assigned to: {order.assignedUsername}
                  </p>
                ) : (
                  <p className="text-muted mb-0"></p>
                )}

                <p className="text-muted mb-0">
                  <span className="fw-bold me-4">Tax</span>
                  {" $"}
                  {order.cartPrice.tax.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="card-footer bg-grey text-black">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {user.role === "staff" || user.role === "barista" ? (
                    <>
                      {/* Staff or barista specific buttons */}
                      {order.status === "Pending" && (
                        <button
                          className="btn btn-warning m-2"
                          onClick={() =>
                            this.updateOrderStatus(order._id, "In Progress")
                          }
                        >
                          In Progress
                        </button>
                      )}
                      {order.status === "In Progress" && (
                        <button
                          className="btn btn-success m-2"
                          onClick={() =>
                            this.updateOrderStatus(order._id, "Completed")
                          }
                        >
                          Complete Order
                        </button>
                      )}
                      {order.status !== "Completed" &&
                        order.status !== "Cancelled" && (
                          <button
                            className="btn btn-danger m-2"
                            onClick={() =>
                              this.updateOrderStatus(order._id, "Cancelled")
                            }
                          >
                            Cancel Order
                          </button>
                        )}
                      {order.status === "Completed" && (
                        <button
                          className="btn btn-success m-2"
                          onClick={() => this.recreateOrder(order._id)}
                        >
                          Order Again
                        </button>
                      )}
                    </>
                  ) : user.role === "customer" ? (
                    <>
                      {/* Customer specific buttons */}
                      {order.status === "Pending" && (
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            this.updateOrderStatus(order._id, "Cancelled")
                          }
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === "Completed" && (
                        <button
                          className="btn btn-success mr-2"
                          onClick={() => this.recreateOrder(order._id)}
                        >
                          Order Again
                        </button>
                      )}
                    </>
                  ) : null}
                </div>
                {showConfirmModal && (
                  <ConfirmModal
                    message="Are you sure to proceed?"
                    showModal={true}
                    onConfirm={this.handleConfirmation}
                  />
                )}
                <h5 className="d-flex align-items-center justify-content-end text-uppercase mb-0">
                  Total paid:{"  "}
                  <span className="ml-2 h2 mb-0 ms-2">
                    ${order.cartPrice.totalCartPriceAfterTax.toFixed(2)}
                  </span>
                </h5>
              </div>
            </div>
            <div className="card-footer bg-grey text-black">
              <div className="d-flex justify-content-between align-items-center ml-2">
                {order.status === "Completed" ? (
                  <div>
                    Rate this order:
                    <Rating
                      onClick={this.handleRating}
                      initialValue={order.rating}
                      key={order.rating}
                      readonly={!isCurrentUserOrderUser}
                    />
                  </div>
                ) : (
                  <div></div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={this.toggleCommentSection}
                >
                  {showCommentSection ? "Hide Comments" : "Add Comment"}
                </button>
              </div>
            </div>
          </div>
          {showCommentSection && (
            <WebSocketComment user={user} orderId={order._id} />
          )}
        </div>
      </div>
    );
  }
}

export default connect(null, { showAlert })(Order);
