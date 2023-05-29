import React from "react";
import { Alert } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8005/api";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      showError: false,
      errorText: "",
    };
  }

  componentDidMount = () => {
    console.log("backendUrl", process.env);
  };

  handleUsernameChange = (e) => {
    this.setState({ username: e.target.value });
  };

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value });
  };

  handleFormSubmit = (e) => {
    e.preventDefault();

    const { username, password } = this.state;

    // Check if username or password is empty
    if (!username || !password) {
      this.setState({
        showError: true,
        errorText: "Please enter both username and password",
      });
      return;
    }

    axios
      .post(`${backendUrl}/login`, { username, password })
      .then((response) => {
        const data = response.data;
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.reload();
        } else {
          this.setState({
            showError: true,
            errorText: "Wrong username or password. Please try again.",
          });
        }
      })
      .catch((error) => {
        let errorMessage = "Login: failed";

        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          errorMessage = error.response.data.error;
        }

        this.setState({
          showError: true,
          errorText: errorMessage,
        });
      });
  };

  handleLoginWithFacebook = async (e) => {
    e.preventDefault();

    await axios.get(`http://localhost:8005/auth/facebook`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  render() {
    const { showError, errorText } = this.state;
    const user = JSON.parse(localStorage.getItem("user"));

    return (
      <div className="container">
        {user ? <Navigate to="/" /> : null}
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card mt-5">
              <div className="card-header">
                <h4>Login</h4>
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
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary">
                      Login
                    </button>
                    <a href="http://localhost:8005/auth/facebook" className="btn btn-primary ml-2">
                      Login with Facebook
                    </a>
                    <Link to="/register" className="btn btn-primary ml-2">
                      Register
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

export default Login;
