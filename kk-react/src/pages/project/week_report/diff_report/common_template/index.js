import React, { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Spin, Button, Card } from 'antd';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import CommonBase from './CommonBase';
import ReportRisk from '../components/ReportRisk';
import ReportHeader from '../components/ReportHeader';
import AddIssueModal from './AddIssueModal';
import WorkPlan from './WorkPlan';
import styles from '../index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);
const planningDispatch = 'project/getProjectPlanning';

/**
 * @description - 普通模版
 * @param {Object} props
 */
function Index(props) {
  const { id, reportId } = props.location.query;
  const { reportData, reportDetail, actionType, detailLoading, dependLoading,
    form: { getFieldDecorator }, drawerIssueId, riskAll } = props;
  let progressData = [];
  let nextPlanData = [];
  if (actionType === 'create') {
    progressData = reportData.progressData || [];
  } else {
    progressData = reportDetail.progressData || [];
    nextPlanData = reportDetail.nextPlanData || [];
  }
  const addRef = useRef(null);

  useEffect(() => {
    props.dispatch({ type: planningDispatch, payload: { id } });
  }, [id]);

  useEffect(() => {
    return () => {
      props.dispatch({ type: 'weekReport/saveReportDetail', payload: {} });
    };
  }, []);

  return (<div className="btn98">
    <ReportHeader reportData={reportData} actionType={actionType} {...props} />
    <div className={styles.otherCardStyle} id="weekReport">
      <Spin spinning={reportId ? detailLoading : dependLoading}>
        <div className="u-mg20" style={{ marginBottom: '0px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>基本信息</span>
          </div>
          <CommonBase
            form={props.form}
            actionType={actionType}
            riskList={actionType === 'view' ? reportDetail.riskList : riskAll}
            {...props}
            id={id}
            reportId={reportId}
            reportData={reportData}
          />
        </div>

        <div className="u-mg20" style={{ margin: '0px 20px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>当前进展</span>
            <span style={{ visibility: (actionType === 'create' || actionType === 'edit') ? 'visible' : 'hidden' }}>
              {
                getFieldDecorator('currentPlan', {
                  initialValue: progressData || [],
                })(
                  <AddIssueModal
                    ref={addRef}
                    trigger={<Button type="primary">添加</Button>}
                    projectId={id}
                    {...props}
                  />
                )
              }
            </span>
          </div>
          <Card>
            <WorkPlan
              planType="current"
              {...props}
              handleRemoveIssue={(value) => addRef.current.setRemoveNewKeys(value)}
            />
          </Card>
        </div>

        <div>
          <ReportRisk
            {...props}
            actionType={actionType}
            existList={reportDetail && reportDetail.riskList}
            projectId={id}
            reportId={reportId}
          />
        </div>

        <div className="u-mg20" style={{ marginBottom: '0px', marginTop: '0px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>下期工作</span>
            <span style={{ visibility: (actionType === 'create' || actionType === 'edit') ? 'visible' : 'hidden' }}>
              {
                getFieldDecorator('nextPlan', {
                  initialValue: nextPlanData || [],
                })(
                  <AddIssueModal
                    trigger={<Button type="primary">添加</Button>}
                    projectId={id}
                    {...props}
                  />
                )
              }
            </span>
          </div>
          <Card>
            <WorkPlan
              planType="next"
              actionType={actionType}
              {...props}
            />
          </Card>
        </div>
      </Spin>
    </div>
    {
      drawerIssueId &&
      <DrawerComponent
        refreshFun={(params) => {
          if (reportId) {
            props.dispatch({ type: 'weekReport/getWeekReportDetail', payload: reportId });
          } else {
            props.dispatch({ type: planningDispatch, payload: { id } });
          }
        }}
      />
    }
  </div>);
}

const mapStateToProps = (state) => {
  const projectPlanning = state.project.projectPlanning || {};

  return {
    reportDetail: state.weekReport.reportDetail,
    reportDepend: state.weekReport.reportDepend,
    dependLoading: state.loading.effects['weekReport/getReportDepend'],
    detailLoading: state.loading.effects['weekReport/getWeekReportDetail'],
    riskObj: state.risk.riskObj,
    currentMemberInfo: state.user.currentMemberInfo,

    plannings: projectPlanning.plannings || [],
    planningLoading: state.loading.effects['project/getProjectPlanning'],
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(Index));
