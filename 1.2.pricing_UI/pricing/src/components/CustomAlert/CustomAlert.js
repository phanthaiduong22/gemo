import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Alert as BootstrapAlert } from "react-bootstrap";
import { dismissAlert } from "../../redux/actions/alertActions";
import "./CustomAlert.css";

const CustomAlert = ({ alert, dismissAlert }) => {
  useEffect(() => {
    if (alert.show) {
      setTimeout(() => {
        dismissAlert();
      }, 2000); // Automatically dismiss after 3 seconds
    }
  }, [alert.show, dismissAlert]);

  const { type, message } = alert;

  return alert.show ? (
    <BootstrapAlert variant={type} dismissible onClose={dismissAlert}>
      {message}
    </BootstrapAlert>
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    alert: state.alert,
  };
};

export default connect(mapStateToProps, { dismissAlert })(CustomAlert);
