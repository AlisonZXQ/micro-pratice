import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Requirement from '@pages/receipt/components/full_link/Requirement';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'requirement',
  }

  componentDidMount() {
    if (Object.keys(this.props.adviseDetail).length) {
      this.getFullLink(this.props.adviseDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.adviseDetail, nextProps.adviseDetail)) {
      this.getFullLink(nextProps.adviseDetail);
    }
  }

  getFullLink = (adviseDetail) => {
    const advise = adviseDetail.advise || {};
    const params = {
      type: connTypeMap.advise,
      id: advise.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, adviseDetail } = this.props;
    const { activeItem } = this.state;
    const advise = adviseDetail.advise || {};

    return (<span className={styles.container}>
      <Row>
        <Col span={20} className={styles.tabs}>
          <span
            className={activeItem === 'requirement' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'requirement' })}
          >
            关联需求({fullLinkData.requirementSet ? fullLinkData.requirementSet.length : 0})
          </span>
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'requirement' &&
          <Requirement
            {...this.props}
            dataSource={fullLinkData.requirementSet || []}
            issueType="advise"
            parentIssueId={advise.id}
          />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    adviseDetail: state.advise.adviseDetail,
  };
};

export default connect(mapStateToProps)(index);
