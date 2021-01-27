import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import AcceptHistory from '@pages/receipt/advise/advise_detail/components/detail_info/components/AcceptHistory';
import FullLink from '@pages/receipt/advise/advise_detail/components/detail_info/components/full_link';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import PanelCollapse from '../components/panel_collapse';
import IssueActivity from '../components/issue_activity';
import Header from '../components/drawer_header';
import BasicInfo from './BasicInfo';
import styles from '../index.less';

function Index(props) {
  const { issueId, adviseDetail, adviseHistory, type, loading } = props;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (issueId) {
      const issueArr = issueId.split('-');
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: issueArr[1], conntype: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: issueArr[1] } });
      props.dispatch({ type: 'receipt/setCommentState', payload: { connId: issueArr[1], connType: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'advise/getAdviseHistory', payload: { adviseid: issueArr[1] } });
      setHeaderHeight(document.getElementById('header').offsetHeight+27);
    }
  }, [issueId, type]);

  return (<Spin spinning={loading}>
    <div className={styles.topHeader} id='header'>
      <div className={styles.header}>
        <Header
          detail={adviseDetail}
          type={type}
          {...props}
        />
      </div>
      <div className={styles.divider}></div>
    </div>

    <div className={styles.drawerBody} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* 基本字段信息 */}
      <div className={`drawerBodyTop ${styles.block}`}></div>
      <BasicInfo adviseDetail={adviseDetail} {...props} />

      {/* 全链路关系图 */}
      <FullLink />

      {/* 建议受理情况 */}
      <PanelCollapse
        title="建议受理情况"
        children={
          <AcceptHistory adviseHistory={adviseHistory} drawer/>
        }
      />

      {/* 动态包括备注，附件，历史 */}
      <PanelCollapse
        title="动态"
        children={
          <IssueActivity
            detail={adviseDetail}
            type="advise"
          />
        }
      />
    </div>
  </Spin>);
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    adviseHistory: state.advise.adviseHistory,
    adviseDetail: state.advise.adviseDetail,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`advise/getAdviseDetail`],
    manPower: state.systemManage.manPower,
    issueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);
