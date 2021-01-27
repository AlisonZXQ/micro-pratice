import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import AcceptHistory from '@pages/receipt/ticket/ticket_detail/components/detail_info/components/AcceptHistory';
import FullLink from '@pages/receipt/ticket/ticket_detail/components/detail_info/components/full_link';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import PanelCollapse from '../components/panel_collapse';
import IssueActivity from '../components/issue_activity';
import Header from '../components/drawer_header';
import BasicInfo from './BasicInfo';
import styles from '../index.less';

function Index(props) {
  const { issueId, ticketDetail, ticketHistory, type, loading } = props;
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (issueId) {
      const issueArr = issueId.split('-');
      props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: issueArr[1], conntype: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: issueArr[1] } });
      props.dispatch({ type: 'receipt/setCommentState', payload: { connId: issueArr[1], connType: connTypeMapIncludeProject[type] } });
      props.dispatch({ type: 'ticket/getTicketHistory', payload: { ticketId: issueArr[1] } });
      setHeaderHeight(document.getElementById('header').offsetHeight+27);
    }
  }, [issueId, type]);

  return (<Spin spinning={loading}>
    <div className={styles.topHeader} id='header'>
      <div className={styles.header}>
        <Header
          detail={ticketDetail}
          type={type}
          {...props}
        />
      </div>
      <div className={styles.divider}></div>
    </div>

    <div className={styles.drawerBody} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      {/* 基本字段信息 */}
      <div className={`drawerBodyTop ${styles.block}`}></div>
      <BasicInfo ticketDetail={ticketDetail} {...props} />

      {/* 全链路关系图 */}
      <FullLink />

      {/* 工单受理情况 */}
      <PanelCollapse
        title="工单受理情况"
        children={
          <AcceptHistory ticketHistory={ticketHistory} drawer/>
        }
      />

      {/* 动态包括备注，附件，历史 */}
      <PanelCollapse
        title="动态"
        children={
          <IssueActivity
            detail={ticketDetail}
            type="ticket"
          />
        }
      />
    </div>
  </Spin>);
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    ticketHistory: state.ticket.ticketHistory,
    ticketDetail: state.ticket.ticketDetail,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`ticket/getTicketDetail`],
    manPower: state.systemManage.manPower,
    issueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);
