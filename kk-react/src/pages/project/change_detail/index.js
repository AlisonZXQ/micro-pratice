/***
 * @description 已弃用，改用v2
 */
import React, { Component } from 'react';
import { Card, Spin } from 'antd';
import { connect } from 'dva';
import ApprovalHeader from './components/approval_header';
import ApprovalSteps from '../project_detail/components/approval_steps';
import DetailContent from '../project_detail/components/detail_content/index';
import AimList from './components/aim_list';
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    const { id } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);
    if (id) {
      this.props.dispatch({ type: 'project/getProjectChange', payload: { projectId: id } });
      this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
      this.props.dispatch({ type: 'project/getOperationPerm', payload: { projectId: id } });
    }
  }

  getChangeAims = (diffObjectives) => {
    const objectives = [];
    diffObjectives && diffObjectives.forEach(it => {
      const obj = {
        action: it.action,
        ...JSON.parse(it.data),
      };
      objectives.push(obj);
    });

    return objectives;
  }

  render() {
    const { projectChange, loading } = this.props;
    return (<Spin spinning={loading}>
      <ApprovalHeader list={projectChange} {...this.props} title="变更申请" />

      <div style={{ padding: '0px 15px' }}>
        <div className="bbTitle">
          <span className="name">流程进度</span>
        </div>
        <Card
          className="u-mgt10"
        >
          <ApprovalSteps data={projectChange} />
        </Card>

        {/* <div className="bbTitle">
          <span className="name">项目目标</span>
        </div>
        <Card
          className={`${styles.cardStyle} u-mgt10`}
        >
          <AimList
            objectives={projectChange && projectChange.newObjectives}
            oldObjectives={projectChange && projectChange.oldObjectives}
            changeData={this.getChangeAims(projectChange && projectChange.diffObjectives)}
            type="approval"
          />
        </Card> */}

        {/* <div className="u-mgt10">
          <DetailContent
            projectBasic={projectChange}
            projectPlanning={projectChange}
            type="change"
          />
        </div> */}
      </div>
    </Spin>);
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading.effects['project/getProjectChange'],
    projectChange: state.project.projectChange,
    currentMemberInfo: state.user.currentMemberInfo,
    operationPerm: state.project.operationPerm,
  };
};

export default connect(mapStateToProps)(index);

