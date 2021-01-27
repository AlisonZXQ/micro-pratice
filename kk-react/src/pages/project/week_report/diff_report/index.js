import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { connect } from 'dva';
import { WEEKREPORT_TEMPLATE_TYPE, WEEKREPORT_TYPE } from '@shared/ProjectConfig';
import EmptyTemplate from './empty_template';
import CommonTemplate from './common_template';
import styles from './index.less';

/**
 * @description - 根据template参数的不同决定是用普通模版还是空白模版
 * @param {Object} props - props参数
 */
function Index(props) {
  const { template, id, reportId } = props.location.query;
  const { pathname } = props.location;
  const { reportDetail, reportDepend } = props;
  const dataSource = reportDepend.dataSource;
  const actionType = pathname.includes('view') ? 'view' : pathname.includes('edit') ? 'edit' : 'create';

  useEffect(() => {
    sessionStorage.setItem('currentPid', id);
    props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
    props.dispatch({ type: 'weekReport/getReportDepend', payload: { id } });
    if (reportId) {
      props.dispatch({ type: 'weekReport/getWeekReportDetail', payload: reportId });
    }
  }, [id, reportId]);

  const getData = (reportDetail) => {
    // 已经归档的取level 其他的取latestLevel

    const weekReportInfo = reportDetail && reportDetail.weekReportInfo ? reportDetail.weekReportInfo : {};
    const projectWeekReport = weekReportInfo.projectWeekReport || {};
    const state = projectWeekReport.state; // 1是未归档 2是已归档

    return {
      ...projectWeekReport,
      projectData: projectWeekReport && projectWeekReport.projectData && JSON.parse(projectWeekReport.projectData),
      objectiveData: projectWeekReport && projectWeekReport.objectives && JSON.parse(projectWeekReport.objectives),
      milestoneData: projectWeekReport && projectWeekReport.milestones && JSON.parse(projectWeekReport.milestones),
      responseUser: reportDetail.weekReportInfo && reportDetail.weekReportInfo.responseUser,
      latestLevel: state === WEEKREPORT_TYPE.DONE ? projectWeekReport.level : weekReportInfo.latestLevel,
    };
  };

  const reportData = reportId ? getData(reportDetail) : reportDepend;

  return (<div className={styles.container}>
    {
      Number(template) === WEEKREPORT_TEMPLATE_TYPE.COMMON ?
        <CommonTemplate {...props} actionType={actionType} reportData={reportData} dataSource={dataSource} />
        :
        <EmptyTemplate {...props} actionType={actionType} reportData={reportData} dataSource={dataSource} />
    }
  </div>);
}

const mapStateToProps = (state) => {
  return {
    reportDetail: state.weekReport.reportDetail,
    reportDepend: state.weekReport.reportDepend,
    dependLoading: state.loading.effects['weekReport/getReportDepend'],
    detailLoading: state.loading.effects['weekReport/getWeekReportDetail'],
    riskObj: state.risk.riskObj,
    riskAll: state.risk.riskAll,
    currentMemberInfo: state.user.currentMemberInfo,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(Index)));
