import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleConfirm = (confirmed) => {
    this.setState({ isOpen: false });
    this.props.onConfirm(confirmed);
  };

  render() {
    const { message, showModal } = this.props;

    return (
      <>
        <Modal show={showModal} onHide={() => this.setState({ isOpen: false })}>
          <Modal.Body>
            <p>{message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => this.handleConfirm(false)}
            >
              No
            </Button>
            <Button variant="primary" onClick={() => this.handleConfirm(true)}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default ConfirmModal;
