import React from "react";
import BarChartComponent from "../../components/BarChartComponent/BarChartComponent";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import "./MonitoringPage.css";
import callAPI from "../../utils/apiCaller";

class MonitoringPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      baristas: [], // Barista data
      showModal: false,
      selectedPerformance: null,
    };
  }

  componentDidMount() {
    this.fetchUserData();
    this.fetchBaristas();
  }

  fetchUserData = async () => {
    callAPI("/users", "GET")
      .then((response) => {
        const user = response.data.user;
        this.setState({ user });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  fetchBaristas = async () => {
    callAPI("/users/baristas", "GET")
      .then((response) => {
        const baristas = response.data;

        this.setState({ baristas });
      })
      .catch((error) => {
        // Handle any errors
        console.log(error);
      });
  };

  handlePerformanceClick = (performance) => {
    this.setState({ showModal: true, selectedPerformance: performance });
  };

  handleModalClose = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { user, baristas, showModal, selectedPerformance } = this.state;
    if (user == null) return null;
    const isStaff = user.role === "staff";

    return (
      <>
        <CustomNavbar className="mb-2" />
        <Container className="mt-5">
          <h2 className="mb-3">Performance</h2>
          {isStaff && (
            <>
              {baristas.map((barista, index) => {
                if (index % 2 === 0) {
                  return (
                    <Row key={index} className="mb-3">
                      <Col>
                        <p>Barista's Name: {barista.username}</p>
                        <div
                          onClick={() => this.handlePerformanceClick(barista)}
                        >
                          <BarChartComponent
                            key={barista._id}
                            userId={barista._id}
                          />
                        </div>
                      </Col>
                      {baristas[index + 1] ? (
                        <Col>
                          <p>Barista's Name: {baristas[index + 1].username}</p>
                          <div
                            onClick={() =>
                              this.handlePerformanceClick(baristas[index + 1])
                            }
                          >
                            <BarChartComponent
                              key={baristas[index + 1]._id}
                              userId={baristas[index + 1]._id}
                            />
                          </div>
                        </Col>
                      ) : (
                        <Col></Col>
                      )}
                    </Row>
                  );
                } else {
                  return null;
                }
              })}
            </>
          )}

          {!isStaff && <BarChartComponent key={user._id} userId={user._id} />}
        </Container>
        <Container>
          <Modal
            show={showModal}
            onHide={this.handleModalClose}
            dialogClassName="custom-modal-dialog"
          >
            <Modal.Header closeButton>
              <Modal.Title>Full Size Chart</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedPerformance && (
                <div className="chart-container">
                  <BarChartComponent
                    key={selectedPerformance._id}
                    userId={selectedPerformance._id}
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleModalClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </>
    );
  }
}

export default MonitoringPage;
