import React, { Component } from 'react';
import { Card, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import Remark from '@pages/receipt/components/remark';
import FullLink from './components/full_link';
import WorkLog from '@pages/receipt/components/work_log';
import Tabs from '@components/Tabs';
import { detailHeaderTabs, REMARK_DINRARY, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import CreateLog from '@pages/receipt/components/create_log';
import SubFullLink from './components/subtask_full_link';
import BasicInfo from './components/basic_info';
import styles from './index.less';

class index extends Component {
  state = {
    activeKey: REMARK_DINRARY.REMARK,
  }

  setActiveKey = (value) => {
    this.setState({ activeKey: value });
  }

  render() {
    const { taskDetail } = this.props;
    const { activeKey } = this.state;
    const task = taskDetail.task || {};
    // subTaskId存在是子任务
    const subTaskId = task.parentid;
    const product = taskDetail.product || {};
    const productid = product.id;
    const issueKey = task.jirakey;
    const epKey = task.id;
    const { productUserState } = taskDetail;

    return (<div>

      <div className="bbTitle">
        <span className="name">基本信息</span>
      </div>
      <BasicInfo {...this.props} />

      <div className="bbTitle">
        <span className="name">任务链路</span>
      </div>
      <Card>
        {
          subTaskId ?
            <SubFullLink {...this.props} />
            :
            <FullLink {...this.props} />
        }
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
        connType={RECEIPT_LOG_TYPE.TASK}
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
        activeKey === REMARK_DINRARY.REMARK && <Remark {...this.props} type="task" issueKey={issueKey} productid={productid} epKey={epKey} />
      }
      {
        activeKey === REMARK_DINRARY.DINARY &&
        <WorkLog {...this.props} issueObj={task} issueRole={taskDetail.issueRole} connType={RECEIPT_LOG_TYPE.TASK} />
      }

    </div>);
  }
}

export default withRouter(index);
