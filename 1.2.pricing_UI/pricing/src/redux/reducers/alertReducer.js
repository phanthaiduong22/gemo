const initialState = {
  show: false,
  message: "",
  type: "",
};

const alertReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHOW_ALERT":
      return {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    case "DISMISS_ALERT":
      return {
        show: false,
        message: "",
        type: "",
      };
    default:
      return state;
  }
};

export default alertReducer;
