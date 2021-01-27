import React, { Component } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import { history } from 'umi';
import Tabs from '@components/Tabs';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import { tabsRoute, tabsData, keyMap, TAB_INDEX_MAP } from '@shared/WorkbenchConfig';
import MyProducts from './components/my_products';
import MyIssues from './components/my_issues';
import MyProjects from './components/my_projects';
import MyAudits from './components/my_audits';
import MyAdvise from './components/my_advise_ticket/index';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

class index extends Component {
  state = {
    activeKey: 0,
  };
  filterType = null;
  getMyAdviseRef = null;

  componentDidMount() {
    const { pathname } = window.location;
    this.getCount();

    let key = 0;
    for (let i in keyMap) {
      if (pathname.includes(i)) {
        key = keyMap[i];
      }
    }
    this.setState({ activeKey: key });
  }

  callback = (key) => {
    this.setState({ activeKey: key });
    history.push(`/my_workbench/${tabsRoute[key]}`);
  }

  getCount = () => {
    this.props.dispatch({ type: 'myworkbench/getAdviseCount' });
    this.props.dispatch({ type: 'myworkbench/getMyWaitAuditCount' });
  }

  render() {
    const { adviseCount, drawerIssueId, auditCount } = this.props;
    const { activeKey } = this.state;

    let tabs = tabsData;
    tabs[TAB_INDEX_MAP.ADVISE].badge = adviseCount;
    tabs[TAB_INDEX_MAP.AUDIT].badge = auditCount;

    return (<span className={styles.container}>
      <MyProducts {...this.props} />
      <div className="u-mgl20 u-mgr20">
        <Card>
          <Tabs
            tabsData={tabs}
            defaultKey={activeKey}
            className={styles.tabs}
            callback={this.callback}
            // extra={<CreateAdviseTicket callback={() => { this.setState({ activeKey: keyMap['advise'] }); this.getMyAdviseRef.setFilterTypeToREPORT() }} />}
          />
          <div className="u-mg15" style={{ marginBottom: '0px' }}>
            {
              activeKey === keyMap['issue'] &&
              <MyIssues
                {...this.props}
                getThis={(ref) => this.getMyIssuesRef = ref}
              />
            }
            {
              activeKey === keyMap['advise'] &&
              <MyAdvise
                {...this.props}
                count={adviseCount}
                getThis={(ref) => this.getMyAdviseRef = ref}
              />
            }
            {
              activeKey === keyMap['userPro'] && <MyProjects {...this.props} />
            }
            {
              activeKey === keyMap['audit'] &&
              <MyAudits
                count={auditCount}
                {...this.props}
              />
            }

          </div>
        </Card>
      </div>
      {
        drawerIssueId &&
        <DrawerComponent
          refreshFun={() => {
            if (activeKey === keyMap['issue']) {
              this.getMyIssuesRef.getIssueListByPage();
            } else if (activeKey === keyMap['advise']) {
              this.getMyAdviseRef.getIssueListByPage();
            }
          }}
        />
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productList: state.product.productList,
    issueList: state.myworkbench.issueList,
    issueTotal: state.myworkbench.issueTotal,

    adviseCount: state.myworkbench.adviseCount,

    issueLoading: state.loading.effects['myworkbench/getIssueListByPage'],
    productLoading: state.loading.effects['product/getUserProduct'],

    projectObj: state.myworkbench.projectObj,
    projectLoading: state.loading.effects['myworkbench/queryProjectList'],

    currentUser: state.user.currentUser,

    createAuditList: state.myworkbench.createAuditList,
    createProjectList: state.myworkbench.createProjectList,

    waitAuditList: state.myworkbench.waitAuditList,
    waitProjectList: state.myworkbench.waitProjectList,
    auditCount: state.myworkbench.auditCount,

    auditLoading: state.loading.effects['myworkbench/getMyWaitAudit'] || state.loading.effects['myworkbench/getMyCreateAudit'],

    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(index);
