import React from "react";
import axios from "axios";
import { showAlert } from "../../redux/actions/alertActions";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import { connect } from "react-redux"; // Import connect from react-redux

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

class UserProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      role: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      isEditing: false,
    };
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem("user"));
    this.setState(
      {
        user,
      },
      () => {
        this.fetchUserInfo();
      }
    );
  }

  fetchUserInfo = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/users/${this.state.user._id}`
      );
      const { username, role, fullName, email, phone, address } = response.data;
      this.setState({
        username,
        role,
        fullName,
        email,
        phone,
        address,
      });
    } catch (error) {
      // Dispatch the showAlert action from Redux to show the error alert
      this.props.showAlert("error", "Error fetching user information");
    }
  };

  handleRoleChange = (e) => {
    this.setState({ role: e.target.value });
  };

  handleEdit = () => {
    this.setState({ isEditing: true });
  };
  handleSave = async () => {
    if (this.validateInputs()) {
      try {
        const { user, role, fullName, email, phone, address } = this.state;
        const updatedUser = { ...user, role, fullName, email, phone, address };

        await axios.put(`${backendUrl}/users/${user._id}/update`, updatedUser);

        this.setState({ isEditing: false });

        // Update user information in local storage
        const updatedUserData = {
          ...JSON.parse(localStorage.getItem("user")),
          ...updatedUser,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Show success alert
        this.props.showAlert("success", "User information saved successfully");
      } catch (error) {
        // Show error alert
        this.props.showAlert(
          "danger",
          `Error updating user information: ${error.message}`
        );
      }
    }
  };

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  validateInputs = () => {
    const { phone, email, fullName, address } = this.state;
    let isValid = true;

    // Phone validation: Allow only numbers
    if (!/^\d+$/.test(phone)) {
      isValid = false;
      // Dispatch an action to show the alert for invalid phone number
      this.props.showAlert("error", "Invalid phone number");
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      isValid = false;
      // Dispatch an action to show the alert for invalid email address
      this.props.showAlert("error", "Invalid email address");
    }

    // Full Name validation: Should not be empty
    if (fullName.trim() === "") {
      isValid = false;
      // Dispatch an action to show the alert for empty full name
      this.props.showAlert("error", "Full name cannot be empty");
    }

    // Address validation: Should not be empty
    if (address.trim() === "") {
      isValid = false;
      // Dispatch an action to show the alert for empty address
      this.props.showAlert("error", "Address cannot be empty");
    }

    return isValid;
  };

  render() {
    const { username, role, fullName, email, phone, address, isEditing } =
      this.state;

    return (
      <div>
        <CustomNavbar className="mb-2" />
        <section
          className="w-100 p-4"
          style={{ backgroundColor: "#eee", borderRadius: ".5rem .5rem 0 0" }}
        >
          <div className="row">
            <div className="col-lg-4">
              <div className="card mb-4">
                <div className="card-body text-center">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={{ width: "150px" }}
                  />
                  <h5 className="my-3">{username}</h5>
                  <p className="text-muted mb-1">{role}</p>
                  {!isEditing && (
                    <div className="d-flex justify-content-center mb-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={this.handleEdit}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card mb-4">
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Username</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-muted mb-0">{username}</p>
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Role</p>
                    </div>
                    <div className="col-sm-9">
                      {isEditing ? (
                        <select
                          className="form-select"
                          value={role}
                          onChange={this.handleRoleChange}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                        </select>
                      ) : (
                        <p className="text-muted mb-0">{role}</p>
                      )}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Full Name</p>
                    </div>
                    <div className="col-sm-9">
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="fullName"
                          value={fullName}
                          onChange={this.handleInputChange}
                        />
                      ) : (
                        <p className="text-muted mb-0">{fullName}</p>
                      )}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Email</p>
                    </div>
                    <div className="col-sm-9">
                      {isEditing ? (
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={email}
                          onChange={this.handleInputChange}
                        />
                      ) : (
                        <p className="text-muted mb-0">{email}</p>
                      )}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Phone</p>
                    </div>
                    <div className="col-sm-9">
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="phone"
                          value={phone}
                          onChange={this.handleInputChange}
                        />
                      ) : (
                        <p className="text-muted mb-0">{phone}</p>
                      )}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <p className="mb-0">Address</p>
                    </div>
                    <div className="col-sm-9">
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={address}
                          onChange={this.handleInputChange}
                        />
                      ) : (
                        <p className="text-muted mb-0">{address}</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={this.handleSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default connect(null, { showAlert })(UserProfilePage);
