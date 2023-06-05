import React from "react";
import Item from "../../components/Item/Item";

import coffeeImage from "../../images/coffee.png";
import milkteaImage from "../../images/milktea.png";
import bagelImage from "../../images/bagel.png";
import sandwichImage from "../../images/sandwich.png";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar.js";
import callAPI from "../../utils/apiCaller";

class MenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: "all",
      menuItems: [
        {
          id: 1,
          name: "Coffee",
          type: "drink",
          image: coffeeImage,
          price: 2,
        },
        {
          id: 2,
          name: "Milk Tea",
          type: "drink",
          image: milkteaImage,
          price: 2.25,
        },
        { id: 3, name: "Bagel", type: "food", image: bagelImage, price: 3 },
        {
          id: 4,
          name: "Sandwich",
          type: "food",
          image: sandwichImage,
          price: 3,
        },
      ],
      locale: "en",
    };
  }

  componentDidMount() {
    this.fetchItemRatings();
  }

  fetchItemRatings = async () => {
    callAPI("rating/item", "GET", null)
      .then((res) => {
        const ratings = res.data;
        const { menuItems } = this.state;
        for (const rating of ratings) {
          for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            if (rating.product === item.name) {
              menuItems[i] = { ...item, rating: rating.rating };
            }
          }
        }
        this.setState({ menuItems }, () => {});
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleTabChange = (tab) => {
    this.setState({ currentTab: tab });
  };

  handleAddToCart = (item) => {
    this.cart.addToCart(item);
  };

  // Language
  getLocaleMessages(locale) {
    switch (locale) {
      case "vn":
        return require("../../lang/vn.json");
      default:
        return require("../../lang/en.json");
    }
  }

  render() {
    const { currentTab, menuItems } = this.state;

    const filteredItems =
      currentTab === "all"
        ? menuItems
        : menuItems.filter((item) => item.type === currentTab);

    return (
      <>
        <CustomNavbar />
        <div>
          <div className="container-xl mx-auto px-6 py-8">
            <nav className="d-flex mb-4">
              <button
                className={`btn btn-outline-primary me-4 mr-2 ${
                  currentTab === "all" ? "active" : ""
                }`}
                onClick={() => this.handleTabChange("all")}
              >
                All Items
              </button>
              <button
                className={`btn btn-outline-primary me-4 mr-2 ${
                  currentTab === "drink" ? "active" : ""
                }`}
                onClick={() => this.handleTabChange("drink")}
              >
                Drinks
              </button>
              <button
                className={`btn btn-outline-primary ${
                  currentTab === "food" ? "active" : ""
                }`}
                onClick={() => this.handleTabChange("food")}
              >
                Food
              </button>
            </nav>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {filteredItems.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  onAddToCart={this.handleAddToCart}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default MenuPage;
