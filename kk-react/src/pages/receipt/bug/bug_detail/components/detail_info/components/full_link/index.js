import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Task from '@pages/receipt/components/full_link/Task';
import Requirement from '@pages/receipt/components/full_link/Requirement';
import Ticket from '@pages/receipt/components/full_link/Ticket';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'task',
  }

  componentDidMount() {
    if (Object.keys(this.props.bugDetail).length) {
      this.getFullLink(this.props.bugDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.bugDetail, nextProps.bugDetail)) {
      this.getFullLink(nextProps.bugDetail);
    }
  }

  getFullLink = (bugDetail) => {
    const bug = bugDetail.bug || {};
    const params = {
      type: connTypeMap.bug,
      id: bug.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, bugDetail } = this.props;
    const { activeItem } = this.state;
    const bug = bugDetail.bug || {};

    return (<span className={styles.container}>
      <Row>
        <Col span={20} className={styles.tabs}>
          <span
            className={activeItem === 'task' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'task' })}
          >
            关联任务({fullLinkData.taskSet ? fullLinkData.taskSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'requirement' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'requirement' })}
          >
            关联需求({fullLinkData.requirementSet ? fullLinkData.requirementSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'ticket' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'ticket' })}
          >
            关联工单({fullLinkData.ticketSet ? fullLinkData.ticketSet.length : 0})
          </span>
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'task' && <Task {...this.props} dataSource={fullLinkData.taskSet || []} issueType="bug" parentIssueId={bug.id} />
        }
        {
          activeItem === 'requirement' && <Requirement {...this.props} dataSource={fullLinkData.requirementSet || []} issueType="bug" parentIssueId={bug.id} />
        }
        {
          activeItem === 'ticket' && <Ticket {...this.props} dataSource={fullLinkData.ticketSet || []} issueType="bug" parentIssueId={bug.id} />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    bugDetail: state.bug.bugDetail,
  };
};

export default connect(mapStateToProps)(index);
