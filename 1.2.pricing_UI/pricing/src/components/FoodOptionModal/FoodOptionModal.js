import React from "react";
import { tw } from "twind";
import sandwichImage from "../../images/sandwich.png";

const FOOD_BASE_PRICE = 3;

const FOOD_CUSTOMIZATIONS = {
  Sandwich: {
    Egg: 1,
    Turkey: 1,
  },
  Bagel: {
    Butter: 0.5,
    "Cream Cheese": 0.5,
  },
};

class FoodOptionModal extends React.Component {
  state = {
    food: this.props.item.name,
    selectedCustomizations: [],
    price: 0,
    showError: false,
    errorText: "",
    image: this.props.item.image,
  };

  componentDidMount() {
    this.setPrice();
  }

  getCustomizationPrice() {
    const foodCustomization = FOOD_CUSTOMIZATIONS[this.props.item.name];

    if (!foodCustomization) {
      this.setState({
        showError: true,
        errorText: `Invalid food: ${this.props.item.name}. Please choose a valid food.`,
      });
      return 0;
    }

    const { selectedCustomizations } = this.state;
    let additionalFoodsPrice = 0;

    for (let i = 0; i < selectedCustomizations.length; i++) {
      const additionalFood = selectedCustomizations[i];
      const additionalFoodPrice = foodCustomization[additionalFood];

      if (additionalFoodPrice === undefined) {
        this.setState({
          showError: true,
          errorText: `Invalid additionalFood: ${additionalFood} for food: ${this.props.item.name}. Please choose a valid additionalFood.`,
        });
        return 0;
      }

      additionalFoodsPrice += additionalFoodPrice;
    }

    return additionalFoodsPrice;
  }

  handleOptionChange = (event) => {
    const { name, checked } = event.target;
    const { selectedCustomizations } = this.state;

    let updatedCustomizations;

    if (checked) {
      updatedCustomizations = [...selectedCustomizations, name];
    } else {
      updatedCustomizations = selectedCustomizations.filter(
        (customization) => customization !== name
      );
    }

    this.setState({ selectedCustomizations: updatedCustomizations }, () =>
      this.setPrice()
    );
  };

  handleConfirm = () => {
    if (!this.state.showError) {
      this.props.onConfirm(this.state);
    }
  };

  getBasePrice() {
    return FOOD_BASE_PRICE;
  }

  handleAddToCart = () => {
    const { showError, errorText, ...itemCopy } = this.state;
    this.props.onAddToCart(itemCopy);
  };

  setPrice() {
    const basePrice = this.getBasePrice();
    const customizationPrice = this.getCustomizationPrice();
    const totalPrice = basePrice + customizationPrice;

    this.setState(
      {
        price: totalPrice,
      },
      () => {
        // this.props.onChange(this.state);
      }
    );
  }

  render() {
    const { open, onClose, item } = this.props;
    const { selectedCustomizations, showError, errorText } = this.state;

    if (!open) {
      return null;
    }

    return (
      <div className={tw`modal fixed inset-0 flex items-center justify-center`}>
        <div
          className={tw`modal-content bg-white rounded-lg p-6 max-w-md mt-10`}
        >
          <div className={tw`flex items-center mb-4`}>
            <img
              className={tw`object-cover w-30 h-20 transition duration-300 transform hover:scale-110`}
              src={item.image || sandwichImage}
              alt="item"
            />
            <h2 className={tw`ml-4 text-2xl font-bold`}>Additional Options</h2>
          </div>
          <p className={tw`mb-4`}>Select additional options for your food:</p>

          <div className={tw`mb-4`}>
            {Object.keys(FOOD_CUSTOMIZATIONS[item.name]).map(
              (customization) => (
                <label
                  key={customization}
                  className={tw`mr-4 flex items-center`}
                >
                  <input
                    type="checkbox"
                    name={customization}
                    checked={selectedCustomizations.includes(customization)}
                    onChange={this.handleOptionChange}
                    className={tw`form-checkbox mr-2`}
                  />
                  {customization}
                </label>
              )
            )}
          </div>

          {showError && <p className={tw`text-red-500 mb-4`}>{errorText}</p>}

          <div className={tw`flex justify-end items-center mt-4 space-x-4`}>
            <div className={tw`text-lg font-bold`}>
              <strong>Price:</strong> ${this.state.price.toFixed(2)}
            </div>
            <div>
              <button
                onClick={this.handleConfirm}
                className={tw`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
              >
                Confirm
              </button>
              <button
                onClick={onClose}
                className={tw`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 ml-2 rounded`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FoodOptionModal;
