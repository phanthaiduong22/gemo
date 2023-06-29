import React, { Component } from "react";
import Order from "../../components/Order/Order";

import { Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

import "./OrderPage.css";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import callAPI from "../../utils/apiCaller";

class OrderPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      filteredOrders: [],
      displayOrders: [],
      currentPage: 1,
      ordersPerPage: 3,
      pageNumbers: 1,
      user: null,
      tab: "Pending",
      displayOrdersKey: 1,
      allowFetchingNewOrders: true,
    };
  }

  componentDidMount = () => {
    this.fetchUserData();
    // setInterval(this.refreshOrders, 3000);
  };

  refreshOrders = () => {
    if (this.state.allowFetchingNewOrders) {
      this.getOrdersByUserId();
    }
  };

  updateAllowFetchingNewOrders = (value) => {
    this.setState({ allowFetchingNewOrders: value });
  };

  fetchUserData = async () => {
    callAPI("users", "GET", null)
      .then((res) => {
        this.setState(
          {
            user: res.data.user,
          },
          () => {
            this.getOrdersByUserId();
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleTabListChange = (event, newValue) => {
    this.setState({ tab: newValue, currentPage: 1 }, () => {
      this.filteredOrdersUpdate();
    });
  };

  filteredOrdersUpdate = () => {
    const { ordersPerPage, orders, tab } = this.state;
    let filteredOrders = orders;
    if (tab === "Pending") {
      filteredOrders = orders.filter((order) => order.status === "Pending");
    } else if (tab === "In Progress") {
      filteredOrders = orders.filter((order) => order.status === "In Progress");
    } else if (tab === "Completed") {
      filteredOrders = orders.filter((order) => order.status === "Completed");
    } else if (tab === "Cancelled") {
      filteredOrders = orders.filter((order) => order.status === "Cancelled");
    }
    const pageNumbers = Math.ceil(filteredOrders.length / ordersPerPage);
    this.setState({ filteredOrders, pageNumbers }, () => {
      this.updateDisplayOrders();
    });
  };

  updateDisplayOrders = () => {
    const { currentPage, ordersPerPage, filteredOrders, displayOrdersKey } =
      this.state;
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const displayOrders = filteredOrders.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    );
    this.setState(
      {
        displayOrders,
        displayOrdersKey: displayOrdersKey + 1,
      },
      () => {}
    );
  };

  getOrdersByUserId = async () => {
    callAPI(`/orders`, "GET", null)
      .then((res) => {
        const orders = res.data;
        orders.reverse();
        this.setState({ orders }, () => {
          this.filteredOrdersUpdate();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  renderPagination = () => {
    const { currentPage, pageNumbers } = this.state;
    return (
      <div className="mt-4">
        <ul className="pagination">
          {Array.from({ length: pageNumbers }).map((_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => this.handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  handlePageChange = (pageNumber) => {
    pageNumber = Math.max(1, pageNumber);
    this.setState({ currentPage: pageNumber }, () => {
      this.updateDisplayOrders();
    });
  };

  render() {
    const { tab, displayOrders, displayOrdersKey, user } = this.state;
    return (
      <div>
        <CustomNavbar className="mb-2" />
        <div className="container border rounded mt-2">
          <h2 className="text-2xl align-items-center font-bold mb-4 mt-4">
            Orders
          </h2>
          <div>
            <Box sx={{ width: "100%", typography: "body1" }}>
              <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={this.handleTabListChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="All" value="All" />
                    <Tab label="Pending" value="Pending" />
                    <Tab label="In Progress" value="In Progress" />
                    <Tab label="Completed" value="Completed" />
                    <Tab label="Cancelled" value="Cancelled" />
                  </TabList>
                </Box>
                {displayOrders.length === 0 ? (
                  <h3 className="mt-4 mr-4">No orders available</h3>
                ) : (
                  displayOrders.map((order) => (
                    <div key={order._id}>
                      <TabPanel value={tab} key={displayOrdersKey}>
                        <Order
                          order={order}
                          user={user}
                          getOrdersByUserId={this.getOrdersByUserId}
                          updateAllowFetchingNewOrders={
                            this.updateAllowFetchingNewOrders
                          }
                        />
                      </TabPanel>
                    </div>
                  ))
                )}
              </TabContext>
            </Box>
          </div>
          {this.renderPagination()}
        </div>
      </div>
    );
  }
}

export default OrderPage;
