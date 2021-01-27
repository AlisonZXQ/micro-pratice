import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Task from '@pages/receipt/components/full_link/Task';
import TreeCharts from '@pages/receipt/components/tree_charts';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'task',
  }

  componentDidMount() {
    if (Object.keys(this.props.taskDetail).length) {
      this.getFullLink(this.props.taskDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.taskDetail, nextProps.taskDetail)) {
      this.getFullLink(nextProps.taskDetail);
    }
  }

  getFullLink = (taskDetail) => {
    const task = taskDetail.task || {};
    const params = {
      type: connTypeMap.subTask,
      id: task.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, taskDetail } = this.props;
    const { activeItem } = this.state;
    const task = taskDetail.task || {};

    return (<span className={styles.container}>
      <Row>
        <Col span={20} className={styles.tabs}>
          <span
            className={activeItem === 'task' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'task' })}
          >
            上级任务({fullLinkData.taskSet ? fullLinkData.taskSet.length : 0})
          </span>
        </Col>

        <Col span={4} className="f-tar">
          <TreeCharts type="subTask" parentIssueKey={`Subtask-${task.id}`} />
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'task' && <Task {...this.props} dataSource={fullLinkData.taskSet || []} issueType="subTask" parentIssueId={task.id} />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    taskDetail: state.task.taskDetail,
  };
};

export default connect(mapStateToProps)(index);
