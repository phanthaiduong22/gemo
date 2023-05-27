import React, { Component } from "react";
import ProgressBar from "../../components/ProgressBar/ProgressBar";

import coffeeImage from "../../images/coffee.png";
import milkteaImage from "../../images/milktea.png";
import bagelImage from "../../images/bagel.png";
import sandwichImage from "../../images/sandwich.png";
import axios from "axios";
import "./Order.css";
import { showAlert } from "../../redux/actions/alertActions";
import { connect } from "react-redux"; // Import connect from react-redux

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

class Order extends Component {
  constructor(props) {
    super(props);

    this.state = {
      order: this.props.order,
      user: JSON.parse(localStorage.getItem("user")),
    };
  }

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
    const userId = JSON.parse(localStorage.getItem("user"))._id;
    try {
      await axios.put(
        `${backendUrl}/users/${userId}/orders/${orderId}/status`,
        {
          status,
        }
      );
      // Show success alert
      this.props.showAlert("success", "Order status updated successfully");
      this.props.getOrdersByUserId();
    } catch (error) {
      // Show error alert
      this.props.showAlert(
        "danger",
        `Error updating order status: ${error.message}`
      );
    }
  };

  reCreateOrder = async (orderId) => {
    const userId = JSON.parse(localStorage.getItem("user"))._id;
    try {
      await axios.post(
        `${backendUrl}/users/${userId}/orders/${orderId}/recreate`
      );
      // Show success alert
      this.props.showAlert("success", "Order recreated successfully");
      this.props.getOrdersByUserId();
    } catch (error) {
      // Show error alert
      this.props.showAlert(
        "danger",
        `Error recreating order: ${error.message}`
      );
    }
  };

  alertDismiss = () => {
    this.setState({ alert: { show: false, message: "", type: "" } });
  };

  render() {
    const user = JSON.parse(localStorage.getItem("user"));
    const { order } = this.state;
    console.log(order.status);
    const { items } = order;
    return (
      <div>
        <div key={order._id} className="col-lg-10 col-xl-12 p-6 mb-4">
          <div className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="text-muted mb-0">Order #{order._id}</h5>
              <h4 className="text-primary mb-0">
                Ordered by {order.username}
              </h4>{" "}
            </div>
            <div className="card-body">
              <div className="card mb-4">
                <div className="card-body">
                  {items.map((item) => (
                    <div className="row border rounded mb-2" key={item._id}>
                      <div className="col-md-2">
                        <div className="image-container">
                          <img
                            src={this.renderItemImage(item)}
                            className="img-fluid image-item"
                            alt="Item"
                          />
                        </div>
                      </div>
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
                <p className="fw-bold mb-0"></p>
                <p className="text-muted mb-0">
                  <span className="fw-bold me-4">Total</span> $
                  {order.cartPrice.totalCartPrice.toFixed(2)}
                </p>
              </div>

              <div className="d-flex justify-content-between pt-2">
                <p className="text-muted mb-0"></p>
                <p className="text-muted mb-0">
                  <span className="fw-bold me-4">Tax</span>
                  {" $"}
                  {order.cartPrice.tax.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="card-footer bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {user.role === "staff" ? (
                    <>
                      {order.status === "Pending" && (
                        <button
                          className="btn btn-warning"
                          onClick={() =>
                            this.updateOrderStatus(order._id, "In Progress")
                          }
                        >
                          In Progress
                        </button>
                      )}
                      {order.status === "In Progress" && (
                        <button
                          className="btn btn-success mr-2"
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
                            className="btn btn-danger mr-2"
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
                          onClick={() =>
                            this.reCreateOrder(order._id, order.userId)
                          }
                        >
                          Order Again
                        </button>
                      )}
                    </>
                  ) : (
                    <>
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
                          onClick={() =>
                            this.reCreateOrder(order._id, order.userId)
                          }
                        >
                          Order Again
                        </button>
                      )}
                    </>
                  )}
                </div>
                <h5 className="d-flex align-items-center justify-content-end text-uppercase mb-0">
                  Total paid:{"  "}
                  <span className="ml-2 h2 mb-0 ms-2">
                    ${order.cartPrice.totalCartPriceAfterTax.toFixed(2)}
                  </span>
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { showAlert })(Order);
