import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Task from '@pages/receipt/components/full_link/Task';
import Requirement from '@pages/receipt/components/full_link/Requirement';
import TreeCharts from '@pages/receipt/components/tree_charts';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'requirement',
  }

  componentDidMount() {
    if (Object.keys(this.props.objectiveDetail).length) {
      this.getFullLink(this.props.objectiveDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.objectiveDetail, nextProps.objectiveDetail)) {
      this.getFullLink(nextProps.objectiveDetail);
    }
  }

  getFullLink = (objectiveDetail) => {
    const objective = objectiveDetail.objective || {};
    const params = {
      type: connTypeMap.objective,
      id: objective.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, objectiveDetail } = this.props;
    const { activeItem } = this.state;
    const objective = objectiveDetail.objective || {};

    return (<span className={styles.container}>
      <Row>
        <Col span={20} className={styles.tabs}>
          <span
            className={activeItem === 'requirement' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'requirement' })}
          >
            下级需求({fullLinkData.requirementSet ? fullLinkData.requirementSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'task' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'task' })}
          >
            下级任务({fullLinkData.taskSet ? fullLinkData.taskSet.length : 0})
          </span>
        </Col>

        <Col span={4} className="f-tar">
          {/* <a>查看完整链路</a> */}
          <TreeCharts type="objective" parentIssueKey={`Objective-${objective.id}`} />
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'task' &&
          <Task
            {...this.props}
            dataSource={fullLinkData.taskSet || []}
            issueType="objective"
            parentIssueId={objective.id}
          />
        }
        {
          activeItem === 'requirement' &&
          <Requirement
            {...this.props}
            dataSource={fullLinkData.requirementSet || []}
            issueType="objective"
            parentIssueId={objective.id}
          />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    objectiveDetail: state.objective.objectiveDetail,
  };
};

export default connect(mapStateToProps)(index);
