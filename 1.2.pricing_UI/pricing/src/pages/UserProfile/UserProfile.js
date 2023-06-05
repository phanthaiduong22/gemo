import React from "react";
import { showAlert } from "../../redux/actions/alertActions";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import { connect } from "react-redux";
import callAPI from "../../utils/apiCaller";

class UserProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isEditing: false,
      isEmailEditable: false,
    };
  }

  componentDidMount() {
    this.fetchUserData();
  }

  fetchUserData = async () => {
    try {
      const response = await callAPI("/users", "GET");

      if (response) {
        this.setState({
          user: response.data.user,
        });
      }
    } catch (error) {
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

      try {
        const response = await callAPI("/users", "PUT", updatedUser);

        if (response.data && response.data.message) {
          this.setState({ isEditing: false, isEmailEditable: false });
          this.props.showAlert(
            "success",
            "User information saved successfully"
          );
        } else {
          throw new Error("Failed to update user information");
        }
      } catch (error) {
        this.props.showAlert("danger", "Failed to update user information");
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
      this.props.showAlert("danger", "Invalid phone number");
    }

    if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      isValid = false;
      this.props.showAlert("danger", "Invalid email address");
    }

    if (fullName === "" && fullName.trim() === "") {
      isValid = false;
      this.props.showAlert("danger", "Full name cannot be empty");
    }

    if (fullName === "" && address.trim() === "") {
      isValid = false;
      this.props.showAlert("danger", "Address cannot be empty");
    }

    return isValid;
  };

  render() {
    const { username, role, fullName, email, phone, address, picture } =
      this.state.user || "";
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
                  {!picture || picture === "" ? (
                    <></>
                  ) : (
                    <img
                      src={picture}
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
                          <option value="barista">Barista</option>
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
