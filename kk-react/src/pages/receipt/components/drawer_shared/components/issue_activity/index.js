import React, { useState, useEffect, useRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { connect } from 'dva';
import { deepCopy } from '@utils/helper';
import Tabs from '@components/Tabs';
import Remark from '@pages/receipt/components/remark';
import WorkLog from '@pages/receipt/components/work_log';
import CreateLog from '@pages/receipt/components/create_log';
import AttachmentModal from '@pages/receipt/components/attachment_modal';
// import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import { drawerHeaderTabs, DRAWER_HEADER_TABS, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import Attachment from './components/Attachment';
import History from './components/History';
import styles from './index.less';

let logRef = '';

function Index(props) {
  const childRef = useRef();
  const { detail, type, bottomActive, currentTab, drawerIssueId, attachmentCount } = props;
  const { productUserState } = detail;
  const [activeKey, setActiveKey] = useState(DRAWER_HEADER_TABS.REMARK);
  const [stateHeaderTabs, setStateHeaderTabs] = useState([]);

  const issue = detail[type] || {};
  const issueKey = issue.jirakey;
  const product = detail.product || {};
  const productid = product.id;
  const epKey = issue.id;

  useEffect(() => {
    const newTabs = deepCopy(drawerHeaderTabs, []);
    newTabs.map(it => {
      if(it.name === '附件' && attachmentCount !== 0){
        it.name = `附件(${attachmentCount})`;
      }else if(it.name === '附件' && attachmentCount === 0) {
        it.name = `附件`;
      }
    });
    setStateHeaderTabs(newTabs);
  }, [attachmentCount]);

  useEffect(() => {
    if (currentTab === 'remark') {
      setActiveKey(DRAWER_HEADER_TABS.REMARK);
    }else if(currentTab === 'attachment') {
      setActiveKey(DRAWER_HEADER_TABS.ATTACHMENT);
    }
  }, [currentTab]);

  useEffect(() => {
    if (bottomActive) {
      setActiveKey(DRAWER_HEADER_TABS.REMARK);
    }
  }, [bottomActive]);

  useEffect(() => {
    setActiveKey(DRAWER_HEADER_TABS.REMARK);
  }, [drawerIssueId]);

  return (
    <span id='issueid'>
      {
        activeKey === DRAWER_HEADER_TABS.DINARY && productUserState &&
        <Button
          onClick={() => logRef.openModal()}
          className={styles.createButton}>登记日志</Button>
      }
      <CreateLog
        onRef={(ref) => logRef = ref}
        currentUser={props.currentUser}
        productid={props && props.lastProduct && props.lastProduct.id}
        connType={RECEIPT_LOG_TYPE[type.toUpperCase()]}
        connId={epKey}
      />
      {
        activeKey === DRAWER_HEADER_TABS.ATTACHMENT &&
        <Button
          onClick={() => childRef.current.changeVisible()}
          icon={<PlusOutlined />}
          className={styles.createButton}>添加附件</Button>
      }
      <AttachmentModal
        cRef={childRef}
        connid={issue.id}
        type={type}
        issueRole={detail.issueRole}
      />

      <Tabs
        tabsData={
          !productUserState ? stateHeaderTabs.filter(it => it.key !== DRAWER_HEADER_TABS.DINARY) : stateHeaderTabs
        }
        defaultKey={activeKey}
        callback={(value) => setActiveKey(value)}
        className={styles.tabs}
      />
      {
        activeKey === DRAWER_HEADER_TABS.REMARK && <Remark {...props} type={type} issueKey={issueKey} productid={productid} drawer epKey={epKey} />
      }
      {
        activeKey === DRAWER_HEADER_TABS.DINARY &&
        <WorkLog {...props} issueObj={issue} connType={RECEIPT_LOG_TYPE[type.toUpperCase()]} issueRole={detail.issueRole} drawer/>
      }
      {
        activeKey === DRAWER_HEADER_TABS.ATTACHMENT && <Attachment type={type} connid={epKey} issueRole={detail.issueRole} />
      }
      {
        activeKey === DRAWER_HEADER_TABS.HISTORY && <History detail={detail} {...props} />
      }
    </span>
  );
}

const mapStateToProps = (state) => {
  return {
    bottomActive: state.receipt.bottomActive,
    lastProduct: state.product.lastProduct,
    currentUser: state.user.currentUser,
    currentTab: state.receipt.currentTab,
    drawerIssueId: state.receipt.drawerIssueId,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Index);

