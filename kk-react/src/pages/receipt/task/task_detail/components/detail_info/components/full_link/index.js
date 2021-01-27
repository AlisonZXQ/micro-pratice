import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Objective from '@pages/receipt/components/full_link/Objective';
import Requirement from '@pages/receipt/components/full_link/Requirement';
import SubTask from '@pages/receipt/components/full_link/SubTask';
import Bug from '@pages/receipt/components/full_link/Bug';
import Ticket from '@pages/receipt/components/full_link/Ticket';
import TreeCharts from '@pages/receipt/components/tree_charts';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import { FST_TYPE_MAP } from '@shared/ProductSettingConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'requirement',
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
      type: connTypeMap.task,
      id: task.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, taskDetail } = this.props;
    const { activeItem } = this.state;
    const subProduct = taskDetail.subproduct || {};
    const fstType = subProduct.fstType;
    const task = taskDetail.task || {};

    return (<span className={styles.container}>
      <Row>
        <Col span={20} className={styles.tabs}>
          <span
            className={activeItem === 'objective' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'objective' })}
          >
            上级目标({fullLinkData.objectiveSet ? fullLinkData.objectiveSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'requirement' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'requirement' })}
          >
            上级需求({fullLinkData.requirementSet ? fullLinkData.requirementSet.length : 0})
          </span>
          {
            fstType === FST_TYPE_MAP.TASK &&
            <span>
              /
              <span
                className={activeItem === 'subTask' ? styles.activeItem : styles.item}
                onClick={() => this.setState({ activeItem: 'subTask' })}
              >
                下级子任务({fullLinkData.subTaskSet ? fullLinkData.subTaskSet.length : 0})
              </span>
            </span>
          }
          /
          <span
            className={activeItem === 'bug' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'bug' })}
          >
            关联缺陷({fullLinkData.bugSet ? fullLinkData.bugSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'ticket' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'ticket' })}
          >
            关联工单({fullLinkData.ticketSet ? fullLinkData.ticketSet.length : 0})
          </span>
        </Col>

        <Col span={4} className="f-tar">
          <TreeCharts type="task" parentIssueKey={`Task-${task.id}`} />
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'objective' && <Objective {...this.props} dataSource={fullLinkData.objectiveSet || []} issueType="task" parentIssueId={task.id} />
        }
        {
          activeItem === 'requirement' && <Requirement {...this.props} dataSource={fullLinkData.requirementSet || []} issueType="task" parentIssueId={task.id} />
        }
        {
          activeItem === 'subTask' && fstType === FST_TYPE_MAP.TASK && <SubTask {...this.props} dataSource={fullLinkData.subTaskSet || []} issueType="task" parentIssueId={task.id} />
        }
        {
          activeItem === 'bug' && <Bug {...this.props} dataSource={fullLinkData.bugSet || []} issueType="task" parentIssueId={task.id} />
        }
        {
          activeItem === 'ticket' && <Ticket {...this.props} dataSource={fullLinkData.ticketSet || []} issueType="task" parentIssueId={task.id} />
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
