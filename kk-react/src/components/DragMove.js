import React, { Component } from 'react';
import DragM from 'dragm';
import uuid from 'uuid';

class ModalDrag extends Component {

  state = {
    modalDom: '',
  }

  updateTransform = (transformStr) => {
    const { modalDom } = this.state;
    modalDom.style.transform = transformStr;
  };

  componentDidMount() {
    const newModalDom = document.getElementsByClassName(
      "ant-modal-wrap" // modal的class是ant-modal-wrap
    )[0];

    this.setState({ modalDom: newModalDom });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.title !== this.props.title) {
      const newModalDom = document.getElementsByClassName(
        "ant-modal-wrap" // modal的class是ant-modal-wrap
      )[0];
      this.setState({ modalDom: newModalDom });
    }
  }

  componentWillUnmount() {
    this.setState({ modalDom: '' });
  }

  render() {
    const { title } = this.props;

    return (
      <DragM updateTransform={this.updateTransform}>
        <div id={uuid()}>{title}</div>
      </DragM>
    );
  }
}

export default ModalDrag;
