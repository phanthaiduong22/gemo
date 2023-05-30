import React from "react";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import MenuPage from "./pages/MenuPage/MenuPage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import OrderPage from "./pages/OrderPage/OrderPage";
import store from "./redux/store";
import CustomAlert from "../src/components/CustomAlert/CustomAlert";
import { IntlProvider } from "react-intl";
import UserProfile from "./pages/UserProfile/UserProfile";

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <CustomAlert />
        <IntlProvider locale="en">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="profile" element={<UserProfile />} />
          </Routes>
        </IntlProvider>
      </div>
    </Provider>
  );
};

export default App;
