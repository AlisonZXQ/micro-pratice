import React, { Component } from 'react';
import { connect } from 'dva';
import BusinessHOC from '@components/BusinessHOC';
import { showRelateIssueFun } from '@shared/CommonFun';
import BasicForm from './components/BasicForm';
import RelateIssue from './components/RelateIssue';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.child = null;
  }

  componentDidMount() {
  }

  render() {
    const { isBusiness, form: { getFieldValue } } = this.props;
    const subProductId = getFieldValue('subProductId');

    return (<span>
      <BasicForm {...this.props} getThis={ref => this.child = ref} />
      {
        !isBusiness && showRelateIssueFun(this.child, subProductId, 'Task') && <RelateIssue {...this.props} />
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    projectBasic: state.project.projectBasic,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(BusinessHOC()(index));
