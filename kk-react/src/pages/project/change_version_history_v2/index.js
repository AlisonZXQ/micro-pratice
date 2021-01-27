import React, { useEffect } from 'react';
import { Spin, Card } from 'antd';
import { connect } from 'dva';
import ChangeTable from '../change_form_v2/components/ChangeTable';
import ApprovalHeader from './approval_header';
import ApprovalSteps from '../project_detail/components/approval_steps';

function Index(props) {
  const { id, changeId } = props.location.query;
  const { projectChange, loading, changeDetail } = props;

  useEffect(() => {
    sessionStorage.setItem('currentPid', id);
    if (id) {
      props.dispatch({ type: 'project/getProjectChange', payload: { projectId: id, changeId } });
      props.dispatch({ type: 'project/getChangeDetailById', payload: { id: changeId } });
    }
  }, [id, changeId]);

  return (<span>
    <Spin spinning={loading}>
      <ApprovalHeader list={projectChange} {...props} title="项目变更历史" />

      <div style={{ padding: '0px 15px' }}>
        <div className="bbTitle">
          <span className="name">流程进度</span>
        </div>
        <Card
          className="u-mgt10"
        >
          <ApprovalSteps data={projectChange} />
        </Card>

        <div className="bbTitle">
          <span className="name">变更详情</span>
        </div>
        <Card
          className="u-mgt10"
        >
          <ChangeTable projectId={id} changeDetail={changeDetail} />
        </Card>
      </div>
    </Spin>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading.effects['project/getProjectChange'],
    projectChange: state.project.projectChange,
    currentMemberInfo: state.user.currentMemberInfo,
    operationPerm: state.project.operationPerm,
    changeDetail: state.project.changeDetail,
  };
};

export default connect(mapStateToProps)(Index);
