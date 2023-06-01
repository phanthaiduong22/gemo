import React from "react";
import BarChartComponent from "../../components/BarChartComponent/BarChartComponent";
import { Container } from "react-bootstrap";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";

class MonitoringPage extends React.Component {
  render() {
    return (
      <>
        <CustomNavbar className="mb-2" />
        <Container className="mt-5">
          <h2 className="mb-3">Your Performance</h2>
          <BarChartComponent />
        </Container>
      </>
    );
  }
}

export default MonitoringPage;
