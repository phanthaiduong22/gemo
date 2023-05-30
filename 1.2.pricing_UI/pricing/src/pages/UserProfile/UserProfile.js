import React from "react";
import { showAlert } from "../../redux/actions/alertActions";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import { connect } from "react-redux";
import axios from "axios";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8005/api";

class UserProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        _id: "",
        username: "",
        role: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        picture: "",
      },
      isEditing: false,
      isEmailEditable: false,
    };
  }

  componentDidMount() {
    this.fetchUserData();
  }

  fetchUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await axios.get(`${backendUrl}/users/${user._id}`);

      if (response.data) {
        const {
          _id,
          username,
          role,
          fullName,
          email,
          phone,
          address,
          picture,
        } = response.data;

        this.setState({
          user: {
            _id,
            username,
            role,
            fullName,
            email,
            phone,
            address,
            picture,
          },
        });
      }
    } catch (error) {
      // this.props.showAlert("error", "Failed to fetch user information");
      console.log(error);
    }
  };

  handleRoleChange = (e) => {
    this.setState({
      user: {
        ...this.state.user,
        role: e.target.value,
      },
    });
  };

  handleEdit = () => {
    this.setState({ isEditing: true, isEmailEditable: true });
  };

  handleSave = async () => {
    if (this.validateInputs()) {
      const { user } = this.state;
      const { role, fullName, email, phone, address } = user;
      const updatedUser = {
        ...user,
        role,
        fullName,
        email,
        phone,
        address,
      };

      console.log(user);

      try {
        const response = await axios.put(
          `${backendUrl}/users/${user._id}/update`,
          updatedUser
        );

        if (response.data && response.data.message) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
          this.setState({ isEditing: false, isEmailEditable: false });
          this.props.showAlert(
            "success",
            "User information saved successfully"
          );
        } else {
          throw new Error("Failed to update user information");
        }
      } catch (error) {
        this.props.showAlert("error", "Failed to update user information");
      }
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
    });
  };

  validateInputs = () => {
    const { phone, email, fullName, address } = this.state.user;
    let isValid = true;

    if (phone !== "" && !/^\d+$/.test(phone)) {
      isValid = false;
      this.props.showAlert("error", "Invalid phone number");
    }

    if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      isValid = false;
      this.props.showAlert("error", "Invalid email address");
    }

    if (fullName.trim() === "") {
      isValid = false;
      this.props.showAlert("error", "Full name cannot be empty");
    }

    if (address.trim() === "") {
      isValid = false;
      this.props.showAlert("error", "Address cannot be empty");
    }

    return isValid;
  };

  render() {
    const { username, role, fullName, email, phone, address, picture } =
      this.state.user;
    console.log(picture);
    const { isEditing, isEmailEditable } = this.state;

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
                  {picture !== "" ? (
                    <img
                      src={picture}
                      alt="avatar"
                      className="rounded-circle img-fluid"
                      style={{ width: "150px" }}
                    />
                  ) : (
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                      alt="avatar"
                      className="rounded-circle img-fluid"
                      style={{ width: "150px" }}
                    />
                  )}

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
                    {isEditing && isEmailEditable ? (
                      <>
                        <div className="col-sm-3">
                          <p className="mb-0">Email</p>
                        </div>
                        <div className="col-sm-9">
                          <input
                            type="text"
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={this.handleInputChange}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-sm-3">
                          <p className="mb-0">Email</p>
                        </div>
                        <div className="col-sm-9">
                          <p className="text-muted mb-0">{email}</p>
                        </div>
                      </>
                    )}
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
                  {isEditing ? (
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
                  ) : null}
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
