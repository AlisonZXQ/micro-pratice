import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { connect } from 'dva';
import Task from '@pages/receipt/components/full_link/Task';
import Objective from '@pages/receipt/components/full_link/Objective';
import Advise from '@pages/receipt/components/full_link/Advise';
import Bug from '@pages/receipt/components/full_link/Bug';
import TreeCharts from '@pages/receipt/components/tree_charts';
import { equalsObj } from '@utils/helper';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    activeItem: 'task',
  }

  componentDidMount() {
    if (Object.keys(this.props.requirementDetail).length) {
      this.getFullLink(this.props.requirementDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.requirementDetail, nextProps.requirementDetail)) {
      this.getFullLink(nextProps.requirementDetail);
    }
  }

  getFullLink = (requirementDetail) => {
    const requirement = requirementDetail.requirement || {};
    const params = {
      type: connTypeMap.requirement,
      id: requirement.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  render() {
    const { fullLinkData, requirementDetail } = this.props;
    const { activeItem } = this.state;
    const requirement = requirementDetail.requirement || {};

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
            className={activeItem === 'task' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'task' })}
          >
            下级任务({fullLinkData.taskSet ? fullLinkData.taskSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'advise' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'advise' })}
          >
            关联建议({fullLinkData.adviseSet ? fullLinkData.adviseSet.length : 0})
          </span>
          /
          <span
            className={activeItem === 'bug' ? styles.activeItem : styles.item}
            onClick={() => this.setState({ activeItem: 'bug' })}
          >
            关联缺陷({fullLinkData.bugSet ? fullLinkData.bugSet.length : 0})
          </span>
        </Col>

        <Col span={4} className="f-tar">
          {/* <a>查看完整链路</a> */}
          <TreeCharts type="requirement" parentIssueKey={`Feature-${requirement.id}`} />
        </Col>
      </Row>

      <Row>
        {
          activeItem === 'task' && <Task {...this.props} dataSource={fullLinkData.taskSet || []} issueType="requirement" parentIssueId={requirement.id} />
        }
        {
          activeItem === 'objective' && <Objective {...this.props} dataSource={fullLinkData.objectiveSet || []} issueType="requirement" parentIssueId={requirement.id} />
        }
        {
          activeItem === 'advise' && <Advise {...this.props} dataSource={fullLinkData.adviseSet || []} issueType="requirement" parentIssueId={requirement.id} />
        }
        {
          activeItem === 'bug' && <Bug {...this.props} dataSource={fullLinkData.bugSet || []} issueType="requirement" parentIssueId={requirement.id} />
        }
      </Row>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    fullLinkData: state.receipt.fullLinkData,
    requirementDetail: state.requirement.requirementDetail,
  };
};

export default connect(mapStateToProps)(index);
