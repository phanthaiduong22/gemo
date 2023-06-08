import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import "./Cart.css";
import { HiOutlineTrash } from "react-icons/hi";
import emptyCartImage from "../../images/empty_cart.png";
import { showAlert } from "../../redux/actions/alertActions";
import callAPI from "../../utils/apiCaller";
import coffeeImage from "../../images/coffee.png";
import milkteaImage from "../../images/milktea.png";
import bagelImage from "../../images/bagel.png";
import sandwichImage from "../../images/sandwich.png";

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: props.isModalOpen,
      cart: {
        items: [],
      },
    };
  }

  handleClose = () => {
    this.props.handleClose();
  };

  componentDidMount = () => {
    callAPI("/cart", "GET", null)
      .then((res) => {
        console.log(res);
        if (res.data) {
          this.setState({ cart: res.data.cart });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleRemoveCartItem = (itemId) => {
    callAPI(`/cart/${itemId}`, "DELETE", null)
      .then((res) => {
        if (res.data.cart) {
          this.setState({
            cart: res.data.cart,
          });
          this.props.showAlert("success", "Remove item from cart successfully");
        }
      })
      .catch((err) => {
        this.props.showAlert("danger", "Remove item from cart failed");
        console.log(err);
      });
  };

  handleClearCart = () => {
    callAPI("/cart", "DELETE", null)
      .then((res) => {
        this.props.showAlert("success", "Clear cart successfully");
        this.setState({ cart: { items: [] } });
      })
      .catch((err) => {
        this.props.showAlert("danger", "Clear cart failed");
        console.log(err);
      });
  };

  handleAddToOrder = async () => {
    callAPI("/orders", "POST", null)
      .then((res) => {
        this.props.showAlert("success", "Add to order successfully");
        if (res.data.cart) this.setState({ cart: res.data.cart });
      })
      .catch((err) => {
        this.props.showAlert("danger", "Add to order failed");
        console.log(err);
      });
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

  render() {
    const { cart } = this.state;
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
                        src={this.renderItemImage(item)}
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
                        onClick={() => this.handleRemoveCartItem(item._id)}
                        style={{ padding: 10, fontSize: 20 }}
                      >
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

const mapDispatchToProps = {
  showAlert,
};

export default connect(null, mapDispatchToProps)(injectIntl(Cart));
