// Action Types
export const ADD_TO_CART = "ADD_TO_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const CLEAR_CART = "CLEAR_CART";

export const addToCart = (item) => {
  return {
    type: "ADD_TO_CART",
    item: item,
  };
};

export const removeFromCart = (itemId) => {
  return {
    type: "REMOVE_FROM_CART",
    itemId: itemId,
  };
};

export const clearCart = () => {
  return {
    type: "CLEAR_CART",
  };
};
