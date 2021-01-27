import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Task from '@pages/receipt/components/full_link/Task';
import Bug from '@pages/receipt/components/full_link/Bug';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'task',
  }

  componentDidMount() {
    if (Object.keys(this.props.ticketDetail).length) {
      this.getFullLink(this.props.ticketDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.ticketDetail, nextProps.ticketDetail)) {
      this.getFullLink(nextProps.ticketDetail);
    }
  }

  getFullLink = (ticketDetail) => {
    const ticket = ticketDetail.ticket || {};
    const params = {
      type: connTypeMap.ticket,
      id: ticket.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, ticketDetail } = this.props;
    const { activeItem } = this.state;
    const ticket = ticketDetail.ticket || {};

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
            className={activeItem === 'bug' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'bug' })}
          >
            关联缺陷({fullLinkData.bugSet ? fullLinkData.bugSet.length : 0})
          </span>
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'task' &&
          <Task {...this.props}
            dataSource={fullLinkData.taskSet || []}
            issueType="ticket"
            parentIssueId={ticket.id} />
        }
        {
          activeItem === 'bug' &&
          <Bug {...this.props}
            dataSource={fullLinkData.bugSet || []}
            issueType="ticket"
            parentIssueId={ticket.id} />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    ticketDetail: state.ticket.ticketDetail,
  };
};

export default connect(mapStateToProps)(index);
