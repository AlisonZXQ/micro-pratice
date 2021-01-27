import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import FullLink from '@pages/receipt/task/task_detail/components/detail_info/components/full_link';
import SubTaskFullLink from '@pages/receipt/task/task_detail/components/detail_info/components/subtask_full_link';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import PanelCollapse from '../components/panel_collapse';
import IssueActivity from '../components/issue_activity';
import Header from '../components/drawer_header';
import BasicInfo from './BasicInfo';
import styles from '../index.less';

function Index(props) {
  const { issueId, taskDetail, type, loading } = props;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (issueId) {
      const issueArr = issueId.split('-');
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: issueArr[1], conntype: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'task/getTaskDetail', payload: { id: issueArr[1] } });
      setHeaderHeight(document.getElementById('header').offsetHeight + 27);
    }
  }, [issueId, type]);

  return (<Spin spinning={loading}>
    <div className={styles.topHeader} id='header'>
      <div className={styles.header}>
        <Header detail={taskDetail} type={type} {...props} />
      </div>
      <div className={styles.divider}></div>
    </div>

    <div className={styles.drawerBody} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* 基本字段信息 */}
      <div className={`drawerBodyTop ${styles.block}`}></div>
      <BasicInfo taskDetail={taskDetail} {...props} />

      {/* 全链路关系图 */}
      {
        issueId.includes('Task') ?
          <FullLink />
          :
          <SubTaskFullLink />
      }

      {/* 动态包括备注，附件，历史 */}
      <PanelCollapse
        title="动态"
        children={
          <IssueActivity
            detail={taskDetail}
            type="task"
          />
        }
      />
    </div>
  </Spin>);
}

const mapStateToProps = (state) => {
  return {
    taskDetail: state.task.taskDetail,
    loading: state.loading.effects[`task/getTaskDetail`],
    issueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);
