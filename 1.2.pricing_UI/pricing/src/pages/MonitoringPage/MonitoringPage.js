import React from "react";
import BarChartComponent from "../../components/BarChartComponent/BarChartComponent";
import { Container } from "react-bootstrap";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import axios from "axios";

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8005/api";

class MonitoringPage extends React.Component {
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
    } catch (error) {}
  };

  render() {
    const { user } = this.state;
    return (
      <>
        <CustomNavbar className="mb-2" />
        <Container className="mt-5">
          <h2 className="mb-3">Your Performance</h2>
          <BarChartComponent key={user._id} userId={user._id} />
        </Container>
      </>
    );
  }
}

export default MonitoringPage;
