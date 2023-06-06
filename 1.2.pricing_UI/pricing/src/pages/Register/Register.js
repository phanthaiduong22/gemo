import React from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import callAPI from "../../utils/apiCaller";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      role: "customer",
      showError: false,
      errorText: "",
    };
  }

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value });
  };

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value });
  };

  handleRoleChange = (e) => {
    this.setState({ role: e.target.value });
  };
  handleFormSubmit = async (e) => {
    e.preventDefault();

    const { username, password, role } = this.state;

    // Check if username or password is empty
    if (!username || !password) {
      this.setState({
        showError: true,
        errorText: "Please enter both username and password",
        showSuccess: false,
        successText: "",
      });
      return;
    }

    try {
      await callAPI("/register", "POST", {
        username,
        password,
        role,
      });

      // Registration success
      this.setState({
        username: "",
        password: "",
        role: "customer",
        showError: false,
        errorText: "",
        showSuccess: true,
        successText: "Registration successful!",
      });
    } catch (error) {
      console.error("Error during registration:", error);

      let errorMessage = "Registration failed";

      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      this.setState({
        showError: true,
        errorText: errorMessage,
        showSuccess: false,
        successText: "",
      });
    }
  };

  render() {
    const { showError, errorText, showSuccess, successText } = this.state;

    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-header">
                <h4>Register</h4>
              </div>
              <div className="card-body">
                {showError && (
                  <Alert
                    variant="danger"
                    onClose={() => this.setState({ showError: false })}
                  >
                    {errorText}
                  </Alert>
                )}
                {showSuccess && (
                  <Alert
                    variant="success"
                    onClose={() => this.setState({ showSuccess: false })}
                  >
                    {successText}
                  </Alert>
                )}
                <form onSubmit={this.handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter your username"
                      value={this.state.username}
                      onChange={this.handleUsernameChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={this.state.password}
                      onChange={this.handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      className="form-control"
                      id="role"
                      value={this.state.role}
                      onChange={this.handleRoleChange}
                    >
                      <option value="customer">Customer</option>
                      <option value="barista">Barista</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary">
                      Register
                    </button>
                    <Link to="/login" className="btn btn-secondary ml-2">
                      Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
