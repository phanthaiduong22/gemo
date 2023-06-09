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
import MonitoringPage from "./pages/MonitoringPage/MonitoringPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import TaskPage from "./pages/TaskPage/TaskPage";

const App = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <Provider store={store}>
      <div>
        <CustomAlert />
        <IntlProvider locale="en">
          <GoogleOAuthProvider clientId={googleClientId}>
            <React.StrictMode>
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="orders" element={<OrderPage />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="monitor" element={<MonitoringPage />} />
                <Route path="tasks" element={<TaskPage />} />
              </Routes>
            </React.StrictMode>
          </GoogleOAuthProvider>
        </IntlProvider>
      </div>
    </Provider>
  );
};

export default App;
