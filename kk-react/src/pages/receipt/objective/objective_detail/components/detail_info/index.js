import React, { Component } from 'react';
import { Card, Button } from 'antd';
import Remark from '@pages/receipt/components/remark';
import WorkLog from '@pages/receipt/components/work_log';
import Tabs from '@components/Tabs';
import { detailHeaderTabs, RECEIPT_LOG_TYPE, REMARK_DINRARY } from '@shared/ReceiptConfig';
import CreateLog from '@pages/receipt/components/create_log';
import FullLink from './components/full_link';
import BasicInfo from './components/basic_info';
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
    const { objectiveDetail } = this.props;
    const { activeKey } = this.state;

    const objective = objectiveDetail.objective || {};
    const product = objectiveDetail.product || {};
    const productid = product.id;
    const issueKey = objective.jirakey;
    const epKey = objective.id;
    const { productUserState } = objectiveDetail;

    return (<div>
      <div className="bbTitle">
        <span className="name">基本信息</span>
      </div>
      <BasicInfo {...this.props} />

      <span>
        <div className="bbTitle">
          <span className="name">验收情况</span>
        </div>
        <Card>
          <AcceptHistory />
        </Card>
      </span>

      <div className="bbTitle">
        <span className="name">目标链路</span>
      </div>
      <Card>
        <FullLink {...this.props} />
      </Card>

      {
        activeKey === 2 && productUserState &&
        <Button
          onClick={() => this.logRef.openModal()}
          className={styles.createButton}>登记日志</Button>
      }
      <CreateLog
        onRef={(ref) => this.logRef = ref}
        currentUser={this.props.currentUser}
        productid={this.props && this.props.lastProduct && this.props.lastProduct.id}
        connType={RECEIPT_LOG_TYPE.OBJECTIVE}
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
        activeKey === REMARK_DINRARY.REMARK && <Remark {...this.props} type="objective" issueKey={issueKey} productid={productid} epKey={epKey} />
      }
      {
        activeKey === REMARK_DINRARY.DINARY &&
        <WorkLog {...this.props} issueObj={objective} issueRole={objectiveDetail.issueRole} connType={RECEIPT_LOG_TYPE.OBJECTIVE}/>
      }
    </div>);
  }
}

export default index;
