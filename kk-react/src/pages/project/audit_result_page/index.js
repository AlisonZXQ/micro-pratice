import React, { useEffect } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { approvalStatusMap, priorityMap, PROJECT_AUDIT_TYPE, PROJECT_AUDIT_TYPE_NAME, PROJECT_AUFIT_SUTIATION, WORKFLOW_TYPE } from '@shared/ProjectConfig';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import ApprovalSteps from '@pages/project/project_detail/components/approval_steps';
import AimApprovalFlow from '@pages/project/project_detail/components/submit_approval/AimApprovalFlow';
import styles from './index.less';

function AuditResultPage({
  auditResult,
  dispatch,
  match: { params: { workflowId, type, projectId } },
  location: { query: { objectiveId, changeId } },
  loading,
  ...rest
}) {
  const productVO = auditResult.productVO || {};
  const subProductVO = auditResult.subProductVO || {};
  const workflowQueryDetailVOList = auditResult.workflowQueryDetailVOList || [];
  const projectDetail = auditResult.projectDetailVO || {};
  const objective = auditResult.objective || {};
  const nextObjectiveId = auditResult.nextObjectiveId || 0;
  const responseUser = projectDetail.responseUser || {};

  let currentAuditStep = {};
  let currentIndex = 0;
  workflowQueryDetailVOList && workflowQueryDetailVOList.forEach((it, index) => {
    if (it.state === PROJECT_AUDIT_TYPE.PASS || it.state === PROJECT_AUDIT_TYPE.FAIL) {
      currentAuditStep = it;
      currentIndex = index;
    }
  });

  useEffect(() => {
    const params = {
      workflowId,
      workflowType: WORKFLOW_TYPE[type],
      projectId,
      objectiveId: objectiveId || 0,
      changeId: changeId || 0,
    };
    dispatch({ type: 'project/getAuditResult', payload: params });
  }, [workflowId, changeId, type, projectId, objectiveId]);

  // 当前如果是最后一个和第一个节点则特殊处理名字
  const getResultPage = () => {

    if (currentIndex === workflowQueryDetailVOList.length - 1) {
      if (type === 'aim_approval') {
        return '目标验收完成';
      } else {
        return (<span>
          {PROJECT_AUFIT_SUTIATION[type]}审批完成
        </span>);
      }
    } else {
      return (<span>
        {
          currentIndex === 0 ?
            <span>{currentAuditStep.workflowNodeSnapshotName}</span>
            :
            <span>
              {PROJECT_AUFIT_SUTIATION[type]}
              {currentAuditStep.workflowNodeSnapshotName}
            </span>
        }
        {PROJECT_AUDIT_TYPE_NAME[currentAuditStep.state]}
      </span>);
    }
  };

  return (<div className={styles.container}>
    <Spin spinning={loading}>
      <div className={styles.body}>
        <div className={styles.content}>
          <div>
            <MyIcon type={approvalStatusMap[currentAuditStep.state]} className={styles.icon} />
          </div>
          <div className={styles.resultText}>
            {getResultPage()}
          </div>
          <div className={styles.stepsContainer}>
            <div className={styles.firstPart}>
              {type !== 'aim_approval' &&
                <div>
                  <span className={styles.primaryName}>项目名称：{projectDetail.title}</span>
                  <span className={styles.tag}>{productVO.name}/{subProductVO.subProductName}</span>
                </div>
              }
              {type === 'aim_approval' &&
                <div>
                  <div className={styles.primaryName}>
                    目标名称：<EpIcon type="objective" className="u-mgr5" />{objective.name}
                  </div>
                  <div className="u-mgt10">
                    <span className={styles.secondName}>关联项目：{projectDetail.title}</span>
                    <span className={styles.tag}>{productVO.name}/{subProductVO.subProductName}</span>
                  </div>
                </div>
              }
            </div>
            <div className={styles.secondPart}>
              <span>项目ID：</span>
              <span className="u-mgr20">{projectDetail.projectCode}</span>
              <span>优先级：</span>
              <span className="u-mgr20">{priorityMap[projectDetail.priority]}</span>
              <span>负责人：</span>
              <span className="u-mgr20">{responseUser.name}</span>
              <span>项目周期：</span>
              <span>{projectDetail.startTime} ~ {projectDetail.endTime}</span>
            </div>
            <div className={styles.thirdPart}>
              <ApprovalSteps data={auditResult} />
            </div>
          </div>
          <div className={styles.footer}>
            <Button type="primary" className="u-mgr10" onClick={() => history.push(`/project/list`)}>返回项目列表</Button>
            {
              type === 'aim_approval' &&
              <Button onClick={() => history.push(`/my_workbench/objectivedetail/Objective-${objective.id}`)} className="u-mgr10">查看目标</Button>
            }
            <Button onClick={() => history.push(`/project/detail?id=${projectDetail.projectId}`)}>查看项目</Button>

            {
              type === 'aim_approval' && !!nextObjectiveId &&
              <span>
                {
                  workflowQueryDetailVOList[1] && (workflowQueryDetailVOList[1].state === PROJECT_AUDIT_TYPE.PASS || workflowQueryDetailVOList[1].state === PROJECT_AUDIT_TYPE.FAIL)
                    ?
                    <a className="u-mgl10" onClick={() => history.push(`/project/aim_accept?pid=${projectId}&oid=${nextObjectiveId}`)}>继续验收下一个</a>
                    :
                    <AimApprovalFlow
                      record={{
                        projectId,
                        objectiveId: nextObjectiveId
                      }}
                      productId={productVO.id}
                      trigger={<a className="u-mgl10">继续发起下一个</a>}
                    />
                }
              </span>
            }
          </div>
        </div>
      </div>
    </Spin>
  </div>);
}

const mapStateToProps = (state) => {
  return {
    auditResult: state.project.auditResult,
    loading: state.loading.effects[`project/getAuditResult`]
  };
};

export default connect(mapStateToProps)(AuditResultPage);
