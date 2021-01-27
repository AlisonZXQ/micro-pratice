//顶部组件
//项目审批流组件
//项目内容
import React, { Component } from 'react';
import { Card, Spin } from 'antd';
import { connect } from 'dva';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import ApprovalHeader from './components/ApprovalHeader';
import DetailContent from '../project_detail/components/detail_content/index';
import DetailMileStones from '../project_detail/components/mile_stone';
import ApprovalSteps from '../project_detail/components/approval_steps';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    const { id, wfid, changeId } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);
    const params = {
      projectId: id,
      wfid: wfid || 0,
      changeId: changeId || 0
    };
    if (id) {
      this.props.dispatch({ type: 'project/getProjectFinish', payload: params });
      this.props.dispatch({ type: 'project/getOperationPerm', payload: params });
      this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
    }
    if (document.getElementsByClassName('approval_header')[0]) {
      document.getElementsByClassName('approval_header')[0].scrollIntoView();
    }
  }

  render() {
    const { id } = this.props.location.query;
    const { projectFinish, loading, drawerIssueId } = this.props;

    return (<Spin spinning={loading}>
      <span className="approval_header">
        <ApprovalHeader list={projectFinish} {...this.props} />
      </span>

      <div style={{ padding: '0px 15px' }}>
        <div className="bbTitle">
          <span className="name">流程进度</span>
        </div>
        <Card>
          <ApprovalSteps data={projectFinish} />
        </Card>

        <div className="bbTitle">
          <span className="name">项目里程碑</span>
          {
            projectFinish.milestoneTimeline && projectFinish.milestoneTimeline.timelineNodes && !!projectFinish.milestoneTimeline.timelineNodes.length &&
            !projectFinish.milestoneTimeline.allExpired &&
            <span className="f-fs1 u-mgl20 f-fwn">
              距下一个里程碑到期还有
              <span style={{ color: '#F04646' }}>{projectFinish && projectFinish.milestoneTimeline && projectFinish.milestoneTimeline.nextDueDate}</span>天
            </span>
          }
        </div>
        <Card className={`${styles.mileStone} u-mgt10`}>
          <DetailMileStones
            projectBasic={projectFinish}
            projectPlanning={projectFinish}
            {...this.props}
          />
        </Card>

        <DetailContent
          type="finish"
          projectObjective={projectFinish}
          projectBasic={projectFinish}
          projectPlanning={projectFinish}
          objectiveLoading={loading}
          planningLoading={loading}
          projectRiskList={projectFinish.projectRiskList || []}
        />

        {
          drawerIssueId &&
          <DrawerComponent
            refreshFun={() => {
              const params = {
                limit: 10,
                offset: 0,
                orderby: 'addtime',
                order: 'desc',
              };

              this.props.dispatch({ type: 'project/getProjectFinish', payload: { id } });
              this.props.dispatch({ type: 'risk/getRiskList', payload: params });
            }}
          />
        }
      </div>

    </Spin>);
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading.effects['project/getProjectFinish'],
    projectFinish: state.project.projectFinish,
    operationPerm: state.project.operationPerm,
    currentMemberInfo: state.user.currentMemberInfo,

    drawerIssueId: state.receipt.drawerIssueId,
  };
};
export default connect(mapStateToProps)(index);
