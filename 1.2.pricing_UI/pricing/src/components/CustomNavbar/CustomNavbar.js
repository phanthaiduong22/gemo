import React, { Component } from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { Navigate } from "react-router-dom";
import Cart from "../Cart/Cart";
import gemoLogo from "../../images/gemologo.png";
import ChatBot from "../ChatBot/ChatBot";
import axios from "axios";

class CustomNavbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      user: JSON.parse(localStorage.getItem("user")),
    };
  }

  handleLogout = () => {
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/logout`, null, {
        withCredentials: true,
      })
      .then(() => {
        // Clear the token cookie from the client-side
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Remove user from local storage or perform any additional cleanup
        localStorage.removeItem("user");

        // Redirect the user to the desired logout page or home page
        window.location.href = "/";
      })
      .catch((error) => {
        // Handle the error
        console.log(error);
      });
  };

  setOpenModal = (value) => {
    this.setState({ isModalOpen: value });
  };

  render() {
    const { user } = this.state;
    if (!user) {
      return <Navigate to="/login" />;
    }

    const { isModalOpen } = this.state;
    return (
      <>
        <Navbar bg="light" expand="lg" className="mb-4">
          <div className="container-fluid">
            <Navbar.Brand href="/menu">
              <img
                src={gemoLogo}
                height="auto"
                width="70px"
                alt="Logo"
                loading="lazy"
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarSupportedContent" />
            <Navbar.Collapse id="navbarSupportedContent">
              <Nav className="me-auto mb-2 mb-lg-0">
                <Nav.Link href="/menu">Menu</Nav.Link>
                <Nav.Link href="/orders">Orders</Nav.Link>
                <Nav.Link href="/profile">Profile</Nav.Link>
                {user.role !== "customer" && (
                  <Nav.Link href="/monitor">Monitoring</Nav.Link>
                )}
                {user.role !== "customer" && (
                  <Nav.Link href="/tasks">Tasks</Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
            <div className="d-flex align-items-center">
              <button
                className="text-reset me-3"
                onClick={() => {
                  this.setOpenModal(true);
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
              </button>
              <NavDropdown title={user.username} id="basic-nav-dropdown">
                <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item href="#action2" onClick={this.handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          </div>
        </Navbar>
        {isModalOpen && (
          <Cart
            isModalOpen={isModalOpen}
            handleClose={() => this.setOpenModal(false)}
          />
        )}
        <ChatBot user={this.state.user} />
      </>
    );
  }
}

export default CustomNavbar;
