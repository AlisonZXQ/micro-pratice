import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import FullLink from '@pages/receipt/bug/bug_detail/components/detail_info/components/full_link';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import Header from '../components/drawer_header';
import BasicInfo from './BasicInfo';
import PanelCollapse from '../components/panel_collapse';
import IssueActivity from '../components/issue_activity';
import styles from '../index.less';

function Index(props) {
  const { issueId, bugDetail, type, loading } = props;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (issueId) {
      const issueArr = issueId.split('-');
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: issueArr[1], conntype: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'bug/getBugDetail', payload: { id: issueArr[1] } });
      setHeaderHeight(document.getElementById('header').offsetHeight+27);
    }
  }, [issueId, type]);

  return (<Spin spinning={loading}>
    <div className={styles.topHeader} id='header'>
      <div className={styles.header}>
        <Header detail={bugDetail} type={type} {...props}/>
      </div>
      <div className={styles.divider}></div>
    </div>

    <div className={styles.drawerBody} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* 基本字段信息 */}
      <div className={`drawerBodyTop ${styles.block}`}></div>
      <BasicInfo bugDetail={bugDetail} {...props} />

      {/* 全链路关系图 */}
      <FullLink />

      {/* 动态包括备注，附件，历史 */}
      <PanelCollapse
        title="动态"
        children={
          <IssueActivity
            detail={bugDetail}
            type="bug"
          />
        }
      />
    </div>
  </Spin>);
}

const mapStateToProps = (state) => {
  return {
    bugDetail: state.bug.bugDetail,
    loading: state.loading.effects[`bug/getBugDetail`],
    manPower: state.systemManage.manPower,
    issueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);
