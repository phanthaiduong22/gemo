import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import axios from "axios";
import "./Cart.css";
import { HiOutlineTrash } from "react-icons/hi";
import emptyCartImage from "../../images/empty_cart.png";
import { removeFromCart, clearCart } from "../../redux/actions/cartActions";
import { showAlert } from "../../redux/actions/alertActions";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: props.isModalOpen,
      user: JSON.parse(localStorage.getItem("user")),
    };
  }

  handleClose = () => {
    this.props.handleClose();
  };

  handleRemoveCartItem = (itemId) => {
    this.props.removeFromCart(itemId);
  };

  handleClearCart = () => {
    this.props.clearCart();
  };

  handleAddToOrder = async () => {
    const { user } = this.state;
    const { cart } = this.props;
    const order = cart;
    const updatedOrder = {
      ...order,
      status: "Pending",
      items: order.items.map(({ id, ...item }) => item),
    };

    try {
      await axios.post(`${backendUrl}/users/${user._id}/orders`, updatedOrder);
      // const createdOrder = response.data;
      // clear cart
      this.handleClearCart();

      // show alert
      this.props.showAlert("success", "Order created successfully");
    } catch (error) {
      // show error alert
      this.props.showAlert("danger", `Error creating order: ${error.message}`);
    }
  };

  formatDrinkTopping(item) {
    let topping = "";
    if (!item.hasWhippingCream && item.milkOption === "None") topping = "None";
    else if (!item.hasWhippingCream && item.milkOption !== "None")
      topping = item.milkOption;
    else if (item.hasWhippingCream && item.milkOption === "None")
      topping = "Whipping cream";
    else topping = "Whipping cream, " + item.milkOption;

    if (item.chocolateSaucePumps && item.chocolateSaucePumps > 0)
      topping += ", Chocolate Sauce (" + item.chocolateSaucePumps + ")";
    return topping;
  }

  formatFoodTopping(item) {
    if (!item.selectedCustomizations.length) return "None";
    let topping = "";
    for (let i = 0; i < item.selectedCustomizations.length; i++) {
      if (i !== item.selectedCustomizations.length - 1)
        topping += item.selectedCustomizations[i] + ", ";
      else topping += item.selectedCustomizations[i];
    }

    return topping;
  }

  render() {
    const { cart } = this.props;
    const { items } = cart;

    return (
      <Modal
        show={this.state.isModalOpen}
        onHide={this.handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {items.length > 0 ? (
            <table className="table">
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ width: 150 }}>
                      <img
                        className="cart-image"
                        src={item.image}
                        alt={item.name}
                      />
                    </td>
                    <td>
                      {item.drink !== undefined ? (
                        <p>
                          <b>Drink:</b> {item.drink}
                        </p>
                      ) : (
                        <p>
                          <b>Food:</b> {item.food}
                        </p>
                      )}
                      {item.drink !== undefined ? (
                        <p>
                          <b>Type:</b> {item.type}
                        </p>
                      ) : (
                        <></>
                      )}
                      {item.drink !== undefined ? (
                        <p>
                          <b>Size:</b> {item.size}
                        </p>
                      ) : (
                        <></>
                      )}
                      {item.drink !== undefined ? (
                        <p style={{ wordWrap: "break-word" }}>
                          <b>Topping:</b> {this.formatDrinkTopping(item)}
                        </p>
                      ) : (
                        <p style={{ wordWrap: "break-word" }}>
                          <b>Topping:</b> {this.formatFoodTopping(item)}
                        </p>
                      )}
                    </td>
                    <td style={{ verticalAlign: "middle", width: 100 }}>
                      <b>${item.price.toFixed(2)}</b>
                    </td>
                    <td style={{ width: 150, verticalAlign: "middle" }}>
                      <button
                        className="btn btn-danger"
                        onClick={() => this.handleRemoveCartItem(item.id)}
                        style={{ padding: 10, fontSize: 20 }}
                      >
                        {/* <FormattedMessage
                            id="cart.remove"
                            defaultMessage="Remove"
                          /> */}
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td></td>
                  <td>
                    <b>Price:</b>
                  </td>
                  <td>
                    <b>${cart.cartPrice.totalCartPrice.toFixed(2)}</b>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <b>Tax:</b>
                  </td>
                  <td>
                    <b>${cart.cartPrice.tax.toFixed(2)}</b>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <b>Total Price:</b>
                  </td>
                  <td>
                    <b>${cart.cartPrice.totalCartPriceAfterTax.toFixed(2)}</b>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <>
              <div className="d-flex justify-content-center">
                <img style={{ width: 500 }} src={emptyCartImage} alt="empty" />
              </div>
              <div
                className="d-flex justify-content-center"
                style={{ fontSize: 25, fontWeight: 500, color: "#7290d4" }}
              >
                <FormattedMessage
                  id="cart.empty"
                  defaultMessage="No items in cart"
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <Button onClick={this.handleClose}>Cancel</Button> */}

          {items.length ? (
            <>
              <>
                <button
                  onClick={this.handleClearCart}
                  className="btn btn-warning"
                >
                  <FormattedMessage
                    id="cart.clear"
                    defaultMessage="Clear Cart"
                  />
                </button>
              </>
              <>
                <button
                  onClick={this.handleAddToOrder}
                  className="btn btn-success"
                >
                  <FormattedMessage
                    id="cart.addOrder"
                    defaultMessage="Place Order"
                  />
                </button>
              </>
            </>
          ) : (
            <></>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  cart: state.cart,
});

const mapDispatchToProps = {
  removeFromCart,
  clearCart,
  showAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Cart));
