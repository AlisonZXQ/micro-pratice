import React, { Component } from 'react';
import { Card, Button } from 'antd';
import Remark from '@pages/receipt/components/remark';
import WorkLog from '@pages/receipt/components/work_log';
import Tabs from '@components/Tabs';
import { detailHeaderTabs, REMARK_DINRARY, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import CreateLog from '@pages/receipt/components/create_log';
import BasicInfo from './components/basic_info';
import FullLink from './components/full_link';
import AcceptHistory from './components/AcceptHistory';
import styles from './index.less';

class index extends Component {
  state = {
    activeKey: REMARK_DINRARY.REMARK,
  }

  setActiveKey = (value) => {
    this.setState({ activeKey: value });
  }

  render() {
    const { ticketDetail } = this.props;
    const { activeKey } = this.state;

    const ticket = ticketDetail.ticket || {};
    const product = ticketDetail.product || {};
    const productid = product.id;
    const issueKey = ticket.jirakey;
    const epKey = ticket.id;
    const { productUserState } = ticketDetail;

    return (<div>
      <div className="bbTitle">
        <span className="name">基本信息</span>
      </div>
      <BasicInfo {...this.props} />

      <span>
        <div className="bbTitle">
          <span className="name">工单受理情况</span>
        </div>
        <Card>
          <AcceptHistory {...this.props} />
        </Card>
      </span>

      <div className="bbTitle">
        <span className="name">工单链路</span>
      </div>
      <Card>
        <FullLink {...this.props} />
      </Card>

      {
        activeKey === REMARK_DINRARY.DINARY && productUserState &&
        <Button
          onClick={() => this.logRef.openModal()}
          className={styles.createButton}>登记日志</Button>
      }
      <CreateLog
        onRef={(ref) => this.logRef = ref}
        currentUser={this.props.currentUser}
        productid={this.props && this.props.lastProduct && this.props.lastProduct.id}
        connType={RECEIPT_LOG_TYPE.TICKET}
        connId={epKey}
      />

      {/* 备注和工作日志 */}
      <Tabs
        tabsData={
          !productUserState ? detailHeaderTabs.filter(it => it.key !== REMARK_DINRARY.DINARY) : detailHeaderTabs
        }
        defaultKey={activeKey}
        callback={(value) => this.setActiveKey(value)}
        className={styles.tabs}
      />
      {
        activeKey === REMARK_DINRARY.REMARK && <Remark {...this.props} type="ticket" issueKey={issueKey} productid={productid} epKey={epKey} />
      }
      {
        activeKey === REMARK_DINRARY.DINARY &&
        <WorkLog {...this.props} issueObj={ticket} issueRole={ticketDetail.issueRole} connType={RECEIPT_LOG_TYPE.TICKET}/>
      }

    </div>);
  }
}

export default index;
