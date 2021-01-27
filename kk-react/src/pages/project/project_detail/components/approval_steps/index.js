import React, { Component } from 'react';
import { Steps } from 'antd';
import MyIcon from '@components/MyIcon';
import { approvalStatusMap, approvalColorMap, PROJECT_AUDIT_TYPE, PROJECT_AUDIT_NODETYPE } from '@shared/ProjectConfig';
import styles from './index.less';

const { Step } = Steps;

class ApprovalSteps extends Component {
  state = {

  };

  getStepsIcon = (status) => {
    return (<span
      style={{ color: approvalColorMap[status] }}>
      <MyIcon type={approvalStatusMap[status]} className={styles.icon} />
    </span>);
  }

  customDot = (dot, { status, index }) => {
    const { data } = this.props;
    const dataSource = (data && data.workflowQueryDetailVOList) || [];
    return this.getStepsIcon(dataSource[index].state);
  }

  overFlowLength = (text) => {
    return text.length > 60 ? `${text.slice(0, 60)}...` : text;
  }

  // 针对会签的审批特殊处理
  handleShowAuditUser = (it, arr) => {
    const nodeType = it.nodeType;
    if (nodeType === PROJECT_AUDIT_NODETYPE.ALL) {
      return arr.map((it, index) => <span>
        <span className={it.state === PROJECT_AUDIT_TYPE.TODO ? styles.greyName : ''}>{it.name}</span>
        {index !== arr.length - 1 && <span>,</span>}
      </span>);
    } else {
      return this.overFlowLength(arr.map(it => it.name).join(','));
    }
  }

  getDetail = (it) => {
    const userList = it.userList || [];
    const arr = userList;

    // 待审核
    if (it.state === PROJECT_AUDIT_TYPE.TODO) {
      return (<span>
        <div>{this.handleShowAuditUser(it, arr)}</div>
      </span>);
      // 未到达
    } else if (it.state === PROJECT_AUDIT_TYPE.NEW) {
      return (<span className="u-thirdtitle">
        <div>{this.overFlowLength(arr.map(it => it.name).join(','))}</div>
      </span>);
      // 审批通过的节点
    } else if (it.state === PROJECT_AUDIT_TYPE.PASS) {
      return (<span className="u-thirdtitle">
        <div>{this.overFlowLength(arr.filter(it => it.state === PROJECT_AUDIT_TYPE.PASS).map(it => it.name).join(','))}</div>
        <div style={{ width: '150px' }}>{it.updateTime}</div>
      </span>);
      // 审批未通过的节点
    } else if (it.state === PROJECT_AUDIT_TYPE.FAIL) {
      return (<span className="u-thirdtitle">
        <div>{this.overFlowLength(arr.filter(it => it.state === PROJECT_AUDIT_TYPE.FAIL).map(it => it.name).join(','))}</div>
        <div style={{ width: '150px' }}>{it.updateTime}</div>
      </span>);
      // 取消的节点
    } else {
      return (<span className="u-thirdtitle">
        <div>{this.overFlowLength(arr.map(it => it.name).join(','))}</div>
        <div style={{ width: '150px' }}>{it.updateTime}</div>
      </span>);
    }
  }

  render() {
    const { data } = this.props;
    const dataSource = (data && data.workflowQueryDetailVOList) || [];
    let index = dataSource.findIndex(it => it.state === PROJECT_AUDIT_TYPE.TODO || it.state === PROJECT_AUDIT_TYPE.FAIL);
    if (dataSource[dataSource.length - 1] && dataSource[dataSource.length - 1].state === PROJECT_AUDIT_TYPE.PASS) {
      index = dataSource.length - 1;
    }

    return (
      <Steps
        current={index}
        progressDot={this.customDot}
        className={`u-mgt30 ${styles.stepsStyle}`}>
        {
          dataSource.map(it => (
            <Step
              title={it.workflowNodeSnapshotName}
              description={<p className="u-mgt5" style={{ wordBreak: 'break-all' }}>
                {this.getDetail(it)}
              </p>}
            />
          ))
        }
      </Steps>);
  }
}

export default ApprovalSteps;
