import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs, } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { REPORT_TABS } from '@shared/ReportConfig';
import styles from './header.less';

const { TabPane } = Tabs;

const routerMap = {
  [`${REPORT_TABS.LAST_DATA}`]: 'dashboard',
  [`${REPORT_TABS.REPORT_LIST}`]: 'list',
  [`${REPORT_TABS.ACCESS_MANAGE}`]: 'access',
};

class Header extends Component {
  state = {
    activeKey: `${REPORT_TABS.LAST_DATA}`,
  }

  callback = (value) => {
    const { id, productid } = this.props.location.query;
    this.setState({
      activeKey: value
    });
    const cid = id || productid ;
    if (cid) {
      history.push(`/report/${routerMap[value]}?productid=${cid}`);
    } else {
      history.push(`/report/${routerMap[value]}`);
    }
  }

  componentDidMount() {
  }

  render() {
    const { activeKey } = this.props;

    return (
      <Tabs
        className={styles.dataReportTabs}
        onChange={this.callback}
        activeKey={activeKey}
      >
        <TabPane tab="实时数据" key={`${REPORT_TABS.LAST_DATA}`}>
        </TabPane>

        <TabPane tab="报告列表" key={`${REPORT_TABS.REPORT_LIST}`}>
        </TabPane>

        {/* <TabPane tab="权限管理" key="3">
        </TabPane> */}
      </Tabs>);
  }
}

const mapStateToProps = (state) => {
  return {
    productList: state.product.productList,
  };
};

export default withRouter(connect(mapStateToProps)(Header));
