import React from "react"
import { tw } from "twind"

const TYPE_DRINKS_BASE_PRICES = {
  Coffee: 2,
  "Milk Tea": 2.25,
}

const TYPE_ADJUSTMENTS = {
  Hot: 0,
  Cold: 0,
  Blended: 1,
}

const SIZE_ADJUSTMENTS = {
  S: 0,
  M: 0.5,
  L: 1,
  XL: 1.5,
}

const MILK_OPTION_ADJUSTMENTS = {
  None: 0,
  "Whole Milk": 0,
  "Almond Milk": 0.5,
}

const WHIPPING_CREAM_ADJUSTMENT = 0.5

const CHOCOLATE_SAUCE_PUMP_PRICE = 0.5
const MAX_CHOCOLATE_SAUCE_PUMPS = 6

class DrinkOptionModal extends React.Component {
  state = {
    drink: this.props.item.name,
    type: "Hot",
    size: "S",
    milkOption: "None",
    hasWhippingCream: false,
    chocolateSaucePumps: 0,
    price: 0,
    showError: false,
    errorText: "",
    image: this.props.item.image,
  }

  componentDidMount() {
    this.setPrice()
  }

  handleOptionChange = (event) => {
    const { name, value, checked } = event.target
    this.setState({ showError: false })

    if (name === "hasWhippingCream") {
      this.setState({ hasWhippingCream: checked }, this.setPrice)
    } else {
      this.setState({ [name]: value }, this.setPrice)
    }
  }

  handleChocolateSaucePumpUpdate = (value) => {
    this.setState(
      (prevState) => ({
        chocolateSaucePumps: Math.min(
          Math.max(0, prevState.chocolateSaucePumps + value),
          MAX_CHOCOLATE_SAUCE_PUMPS
        ),
      }),
      this.setPrice
    )
  }

  handleConfirm = () => {
    if (!this.state.showError) {
      this.props.onConfirm(this.state)
    }
  }

  getBasePriceByDrink() {
    if (TYPE_DRINKS_BASE_PRICES[this.state.drink] === undefined) {
      this.showError(
        `Invalid drink ${this.state.drink} selected. Please choose a valid drink.`
      )
      this.setState({ drink: "Coffee" })
      return 0
    }
    return TYPE_DRINKS_BASE_PRICES[this.state.drink]
  }

  getTypeAdjustment() {
    if (TYPE_ADJUSTMENTS[this.state.type] === undefined) {
      this.showError(
        `Invalid drink ${this.state.type} selected. Please choose a valid type.`
      )
      this.setState({ type: "Hot" })
      return 0
    }
    return TYPE_ADJUSTMENTS[this.state.type]
  }

  getSizeAdjustment() {
    if (this.state.size === "L" && this.state.type === "Hot") {
      this.showError(
        `Invalid size ${this.state.size} for ${this.state.type} drink. Please choose a valid size.`
      )
      this.setState({ size: "S" })
      return 0
    }
    if (SIZE_ADJUSTMENTS[this.state.size] === undefined) {
      this.showError("Invalid drink size selected. Please choose a valid size.")
      this.setState({ size: "S" })
      return 0
    }
    return SIZE_ADJUSTMENTS[this.state.size]
  }

  getWhippingCreamAdjustment() {
    return this.state.hasWhippingCream ? WHIPPING_CREAM_ADJUSTMENT : 0
  }

  getMilkOptionAdjustment() {
    if (MILK_OPTION_ADJUSTMENTS[this.state.milkOption] === undefined) {
      this.showError(
        `Invalid milk option: ${this.state.milkOption}. Please choose a valid option.`
      )
      this.setState({ milkOption: "None" })
      return 0
    }
    return MILK_OPTION_ADJUSTMENTS[this.state.milkOption]
  }

  getChocolateSauceAdjustment() {
    if (this.state.chocolateSaucePumps > 0 && this.state.type !== "Hot") {
      this.showError(
        `Chocolate sauce pumps cannot be added to a ${this.state.type} drink.`
      )
      this.setState({ chocolateSaucePumps: 0 })
      return 0
    }
    if (this.state.chocolateSaucePumps > MAX_CHOCOLATE_SAUCE_PUMPS) {
      this.showError(
        `Invalid number of chocolate sauce pumps: ${this.state.chocolateSaucePumps}. Please choose a valid number.`
      )
      this.setState({ chocolateSaucePumps: 0 })
      return 0
    }
    return this.state.chocolateSaucePumps <= 2
      ? 0
      : (this.state.chocolateSaucePumps - 2) * CHOCOLATE_SAUCE_PUMP_PRICE
  }

  setPrice() {
    const basePrice = this.getBasePriceByDrink()
    const typeAdjustment = this.getTypeAdjustment()
    const sizeAdjustment = this.getSizeAdjustment()
    const whippingCreamAdjustment = this.getWhippingCreamAdjustment()
    const milkOptionAdjustment = this.getMilkOptionAdjustment()
    const chocolateSauceAdjustment = this.getChocolateSauceAdjustment()

    const totalPrice =
      basePrice +
      typeAdjustment +
      sizeAdjustment +
      whippingCreamAdjustment +
      milkOptionAdjustment +
      chocolateSauceAdjustment

    this.setState({ price: totalPrice }, () => {
      // this.props.onChange(this.state);
    })

    return totalPrice
  }

  showError(errorText) {
    this.setState({ showError: true, errorText }, () => {
      setTimeout(() => {
        this.setState({ showError: false, errorText: "" })
      }, 3000)
    })
  }

  render() {
    const { open, onClose, item } = this.props
    const { showError, errorText, size, type, chocolateSaucePumps } = this.state

    if (!open) {
      return null
    }

    return (
      <div className={tw`modal fixed inset-0 flex items-center justify-center`}>
        <div
          className={tw`modal-content bg-white rounded-lg p-6 max-w-md mt-10`}
        >
          <div className={tw`flex items-center mb-4`}>
            <img
              className={tw`inset-0 object-cover w-20 h-20 transition duration-300 transform hover:scale-110`}
              src={item.image}
              alt="Item"
            />
            <h2 className={tw`ml-4 text-2xl font-bold`}>Additional Options</h2>
          </div>
          {showError && (
            <div className={tw`bg-yellow-500 text-white p-4 rounded`}>
              {errorText}
            </div>
          )}
          <p className={tw`mb-2`}>Select additional options for {item.name}:</p>
          <div className={tw`mb-4`}>
            <label className={tw`mr-2`}>Type:</label>
            <div className={tw`flex items-center`}>
              {Object.keys(TYPE_ADJUSTMENTS).map((type) => {
                const isDisabled =
                  (size === "L" && type === "Hot") ||
                  ((type === "Cold" || type === "Blended") &&
                    chocolateSaucePumps > 0)
                return (
                  <label key={type} className={tw`mr-4 flex items-center`}>
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={this.state.type === type}
                      onChange={this.handleOptionChange}
                      disabled={isDisabled}
                      className={tw`form-radio h-4 w-4 mr-2`}
                    />
                    {type}
                  </label>
                )
              })}
            </div>
          </div>

          <div className={tw`mb-4`}>
            <label className={tw`mr-2`}>Size:</label>
            <div className={tw`flex items-center`}>
              {Object.keys(SIZE_ADJUSTMENTS).map((size) => {
                const isDisabled = size === "L" && this.state.type === "Hot"
                return (
                  <label key={size} className={tw`mr-4 flex items-center`}>
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={this.state.size === size}
                      onChange={this.handleOptionChange}
                      disabled={isDisabled}
                      className={tw`form-radio h-4 w-4 mr-2`}
                    />
                    {size}
                  </label>
                )
              })}
            </div>
          </div>

          <div className={tw`mb-4`}>
            <label className={tw`mr-2`}>Whipping Cream:</label>
            <div className={tw`flex items-center`}>
              <label className={tw`mr-4 flex items-center`}>
                <input
                  type="checkbox"
                  name="hasWhippingCream"
                  checked={this.state.hasWhippingCream}
                  onChange={this.handleOptionChange}
                  className={tw`form-checkbox h-4 w-4 mr-2`}
                />
                Add Whipping Cream
              </label>
            </div>
          </div>

          <div className={tw`mb-4`}>
            <label className={tw`mr-2`}>Milk Option:</label>
            <div className={tw`flex items-center`}>
              {Object.keys(MILK_OPTION_ADJUSTMENTS).map((milkOption) => (
                <label key={milkOption} className={tw`mr-4 flex items-center`}>
                  <input
                    type="radio"
                    name="milkOption"
                    value={milkOption}
                    checked={this.state.milkOption === milkOption}
                    onChange={this.handleOptionChange}
                    className={tw`form-radio h-4 w-4 mr-2`}
                  />
                  {milkOption.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>

          <div className={tw`mb-4`}>
            <label className={tw`mr-2`}>Chocolate Sauce Pumps:</label>
            <div className={tw`flex items-center`}>
              <button
                onClick={() => this.handleChocolateSaucePumpUpdate(-1)}
                disabled={chocolateSaucePumps === 0 || type !== "Hot"}
                className={tw`bg-gray-200 text-gray-700 px-2 py-1 rounded-l ${
                  chocolateSaucePumps === 0 || type !== "Hot"
                    ? "cursor-not-allowed"
                    : ""
                }`}
              >
                -
              </button>
              <div className={tw`form-input px-2 w-16 text-center`}>
                {chocolateSaucePumps}
              </div>
              <button
                onClick={() => this.handleChocolateSaucePumpUpdate(1)}
                disabled={type !== "Hot" || chocolateSaucePumps === 6}
                className={tw`bg-gray-200 text-gray-700 px-2 py-1 rounded-r ${
                  type !== "Hot" || chocolateSaucePumps === 6
                    ? "cursor-not-allowed"
                    : ""
                }`}
              >
                +
              </button>
            </div>
          </div>

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
    )
  }
}

export default DrinkOptionModal
