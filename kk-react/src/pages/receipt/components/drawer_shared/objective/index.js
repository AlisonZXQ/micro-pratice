import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import FullLink from '@pages/receipt/objective/objective_detail/components/detail_info/components/full_link';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import AcceptHistory from '@pages/receipt/objective/objective_detail/components/detail_info/components/AcceptHistory';
import PanelCollapse from '../components/panel_collapse';
import IssueActivity from '../components/issue_activity';
import Header from '../components/drawer_header';
import BasicInfo from './BasicInfo';
import styles from '../index.less';

function Index(props) {
  const { issueId, objectiveDetail, type, loading, refreshFun } = props;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (issueId) {
      const issueArr = issueId.split('-');
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: issueArr[1], conntype: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: issueArr[1] } });
      props.dispatch({ type: 'objective/getObjectiveAcceptList', payload: { id: issueArr[1] } });
      setHeaderHeight(document.getElementById('header').offsetHeight+27);
    }
  }, [issueId, type]);

  return (<Spin spinning={loading}>
    <div className={styles.topHeader} id='header'>
      <div className={styles.header}>
        <Header detail={objectiveDetail} type={type} {...props} />
      </div>
      <div className={styles.divider}></div>
    </div>

    <div className={styles.drawerBody} id="drawerBodyTop" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* 基本字段信息 */}
      <div className={`drawerBodyTop ${styles.block}`}></div>
      <BasicInfo objectiveDetail={objectiveDetail} {...props} />

      {/* 全链路关系图 */}
      <FullLink refreshFun={refreshFun} />

      {/* 目标验收情况 */}
      <PanelCollapse
        title="目标验收情况"
        children={
          <AcceptHistory drawer/>
        }
      />

      {/* 动态包括备注，附件，历史 */}
      <PanelCollapse
        title="动态"
        children={
          <IssueActivity
            detail={objectiveDetail}
            type="objective"
          />
        }
      />
    </div>
  </Spin>);
}

const mapStateToProps = (state) => {
  return {
    objectiveDetail: state.objective.objectiveDetail,
    loading: state.loading.effects[`objective/getObjectiveDetail`],
    manPower: state.systemManage.manPower,
    issueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);
