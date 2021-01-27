import React, { Component } from 'react';
import { connect } from 'dva';
import BasicForm from './components/BasicForm';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  componentDidMount() {
  }

  render() {
    return (<span>
      <BasicForm {...this.props} />
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(index);
