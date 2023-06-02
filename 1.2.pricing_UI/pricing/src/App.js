import "./App.css"

import { Route, Routes } from "react-router-dom"

import CustomAlert from "../src/components/CustomAlert/CustomAlert"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { IntlProvider } from "react-intl"
import Login from "./pages/Login/Login"
import MenuPage from "./pages/MenuPage/MenuPage"
import MonitoringPage from "./pages/MonitoringPage/MonitoringPage"
import OrderPage from "./pages/OrderPage/OrderPage"
import { Provider } from "react-redux"
import React from "react"
import Register from "./pages/Register/Register"
import UserProfile from "./pages/UserProfile/UserProfile"
import store from "./redux/store"

const App = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID

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
              </Routes>
            </React.StrictMode>
          </GoogleOAuthProvider>
        </IntlProvider>
      </div>
    </Provider>
  )
}

export default App
