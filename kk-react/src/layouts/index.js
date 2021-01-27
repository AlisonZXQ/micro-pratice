import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import 'antd/dist/antd.less'; // 引入官方提供的 less 样式入口文件

import { ConfigProvider, Badge, Empty, Button } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { connect } from 'dva';
import { history, connectMaster } from 'umi';
import ErrorBoundary from '@components/ErrorBoundary';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import NoPermission from '@components/403';
import SurveyModal from '@components/SurveyModal';
import logo from '@assets/logo.jpg';
import {
  issuesUrl, urlPrefix, staticPagesUrl, receiptDetailArr, loginPathname,
  LAYOUT_HEADER_TYPE_MAP, LAYOUT_SIDEBAR_TYPE_MAP, PRODUCT_MANAGE_MAP, oldReceiptDetailArr, manageUrl,
  productChangeRelace
} from '@shared/LayoutConfig';
import CreateAdviseTicket from './components/create_advise_ticket';
import CreateIssues from './components/create_issues';
import CurrentUser from './components/current_user';
import ProductSetting from './components/product_setting';
import ProductManage from './components/product_manage';
import SystemManage from './components/system_manage';
import ProductRole from './components/product_role';
import { isProjectUri, isOtherUri, isObjectiveUri, isProductSettingUri, isSystemSettingUri, getHelpUrl } from './components/LayoutFun';

import styles from './index.less';

class Index extends Component {
  state = {
    value: '',
    headerType: '', //顶部导航位置
    sidebarType: LAYOUT_SIDEBAR_TYPE_MAP.PRODUCT, //产品管理下导航类型
  }

  componentDidMount() {
    const { productid } = this.props.location.query;
    const { pathname } = window.location;
    // 登陆页不调用这些接口
    if (!loginPathname.includes(pathname)) {
      this.getDefaultInfo();
    }

    this.getDefaultTab(pathname);
    this.getNejRediect();
    this.getOldDetailUrlRediect();
    this.getOldMyWorkbenchRediect();

    this.doLoadWatermark();
    this.getReceiptDetailRediect(pathname);

    // 当单据路由携带不同于lastProduct中的productid时
    const issueUrlArr = manageUrl;
    if (productid && issueUrlArr.some(it => pathname.includes(it))) {
      this.props.dispatch({ type: 'product/setLastProduct', payload: { productId: productid } });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforePathname = this.props.location.pathname;
    const nextPathname = nextProps.location.pathname;
    if (beforePathname !== nextPathname) {
      this.getDefaultTab(nextPathname);
    }

    if (beforePathname !== nextPathname && loginPathname.includes(beforePathname)) {
      this.getDefaultInfo();
    }
  }

  /**
   * @description - 当产品改变时重新加载对应的页面
   */
  componentDidUpdate(prevProps) {
    const prevProductId = prevProps.lastProduct.id;
    const nextProductId = this.props.lastProduct.id;
    if (prevProductId !== nextProductId && nextProductId) {
      const pathname = this.props.location.pathname;
      if (productChangeRelace.some(it => pathname.includes(it))) {
        history.push(`${pathname}?productid=${nextProductId}`);
      }
    }
  }

  getDefaultInfo = () => {
    this.props.dispatch({
      type: 'user/getCurrentUser',
      payload: {
        rolesFlag: 1,
        usergroupsFlag: 1,
        lastProductFlag: 1
      }
    });
    this.props.dispatch({ type: 'message/getCurrentMessageCount' });
    this.props.dispatch({ type: 'product/getUserProduct' });
  }

  doLoadWatermark() {
    const watermarkId = "watermark";
    const watermarkUrl = "//nos.netease.com/watermark/nis.wm.js";

    const scriptDom = document.getElementById(watermarkId);
    if (scriptDom) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = watermarkId;
    script.src = watermarkUrl;
    script.onload = () => {
      const { currentUser } = this.props;
      const nick = currentUser.user && currentUser.user.nick ? currentUser.user.nick : '';
      // eslint-disable-next-line
      WaterMark.mark({ "text": nick, xSpace: 300, ySpace: 300, opacity: 0.05 });
    };
    document.head.appendChild(script);
  }

  // nej老工程跳转
  getNejRediect = () => {
    const { pathname, hash } = window.location;
    let route = '';
    if (pathname.includes('manage.html')) {
      const path = hash.slice(1);
      if (issuesUrl.some(it => path.includes(it))) {
        route = `${urlPrefix['issuesUrl']}${path}`;
      }
    }
    if (route) {
      history.push(route);
    }
  }

  /**
   * 单据详情的路由替换manage -> my_workbench
   */
  getOldDetailUrlRediect = () => {
    const { pathname } = this.props.location;
    if (oldReceiptDetailArr.some(it => pathname.includes(it))) {
      const newPathname = pathname.replace('manage', 'my_workbench');
      history.push(newPathname);
    }
  }

  /**
   * @description - 单据详情的路由改动
   * @param {*} pathname
   */
  getReceiptDetailRediect = (pathname) => {
    const url = receiptDetailArr.find(it => pathname.includes(it)) || '';
    if (Object.keys(url).length) {
      const { aid, rid, tid, bid, oid } = this.props.location.query;
      const issueId = aid || rid || tid || bid || oid;
      const issueType = (aid && 'Feedback') || (rid && 'Feature') || (tid && 'Task') || (bid && 'Bug') || (oid && 'Objective');
      if (issueId) {
        history.push(`${url}/${issueType}-${issueId}`);
      }
    }
  }

  /**
   * @description - myworkbrench -> myworkbench
   */
  getOldMyWorkbenchRediect = () => {
    const { pathname } = this.props.location;
    if (pathname.includes('my_workbrench')) {
      const newPathname = pathname.replace('my_workbrench', 'my_workbench');
      history.push(newPathname);
    }
  }

  /**
   * @description - 默认选择的tab
   * @param {*} pathname
   */
  getDefaultTab = (pathname) => {
    this.setHeaderType(pathname);

    if (!(isProjectUri(pathname) || isOtherUri(pathname))) {
      this.setSidebarType4Product(pathname);

      if (!(isProductSettingUri(pathname) || isSystemSettingUri(pathname))) {
        this.setCurrentSidebar4Product(pathname);
      }
    }
  }

  // 当前的左侧栏是产品配置/系统设置/产品管理
  setSidebarType4Product = (pathname) => {
    if (isProductSettingUri(pathname)) { //产品配置
      this.setState({ sidebarType: LAYOUT_SIDEBAR_TYPE_MAP.PRODUCT_SETTING });
    } else if (isSystemSettingUri(pathname)) { //系统设置
      this.setState({ sidebarType: LAYOUT_SIDEBAR_TYPE_MAP.SYSTEM_SETTING });
    } else { // 产品管理
      this.setState({ sidebarType: LAYOUT_SIDEBAR_TYPE_MAP.PRODUCT });
    }
  };

  setHeaderType = (pathname) => {
    if (isProjectUri(pathname)) { //项目管理
      this.setState({ headerType: LAYOUT_HEADER_TYPE_MAP.PROJECT });
    } else if (isOtherUri(pathname)) { //其他
      this.setState({ headerType: LAYOUT_HEADER_TYPE_MAP.OTHER });
    } else if (isObjectiveUri(pathname)) {
      this.setState({ headerType: LAYOUT_HEADER_TYPE_MAP.OBJECTIVE });
    } else { //产品管理
      this.setState({ headerType: LAYOUT_HEADER_TYPE_MAP.PRODUCT });
    }
  }

  setCurrentSidebar4Product = (pathname) => {
    let id = '';
    if (pathname.includes('version')) {
      id = PRODUCT_MANAGE_MAP.VERSION;
    }
    this.setState({ value: id });
  }

  // 项目管理
  handleClickProject = () => {
    history.push('/project/list');
  }

  // 产品管理
  handleClickProduct = () => {
    const { lastProduct } = this.props;
    history.push(`/manage/productadvise/?productid=${lastProduct.id}`);
  }

  // 目标管理
  handleClickObjective = () => {
    history.push(`/objective_manage/organization`);
  }

  // 消息或者帮助
  handleClickIcon = () => {
    this.setState({
      value: '',
    });
    history.push(`/message/list`);
  }

  getHeader = () => {
    const { messageCount, productList, isBusiness } = this.props;
    const { headerType } = this.state;
    const { pathname } = window.location;
    const workbenchFlag = pathname.includes('my_workbench');

    return (<div className={styles.header}>
      <span className={`${styles.left} f-db`}>
        <a>
          <img onClick={() => { history.push(`/my_workbench/advise`) }} src={logo} alt="logo" style={{ width: '150px', marginBottom: '9px' }} />
        </a>
      </span>

      <div className={styles.quickTool}>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => { history.push(`/my_workbench/advise`) }}
          className={workbenchFlag ? styles.activeworkbench : styles.workbench}>
          <a
            className={workbenchFlag ? styles.enableA : styles.unableA}
          >
            个人工作台
          </a>
        </span>
        <div className={styles.divider} />

        <span className={`${headerType === LAYOUT_HEADER_TYPE_MAP.PROJECT ? styles.btnSelect : styles.btnUnSelect} f-csp`} onClick={() => this.handleClickProject()}>项目管理</span>
        <span className={`${headerType === LAYOUT_HEADER_TYPE_MAP.PRODUCT ? styles.btnSelect : styles.btnUnSelect} u-mgl10 f-csp`} onClick={() => this.handleClickProduct()}>产品管理</span>
        <span className={`${headerType === LAYOUT_HEADER_TYPE_MAP.OBJECTIVE ? styles.btnSelect : styles.btnUnSelect} u-mgl10 f-csp`} onClick={() => this.handleClickObjective()}>目标管理</span>
      </div>

      <div className={`${styles.info} btn98`}>
        <span className={styles.opt}>
          <span className={`u-mgr10 ${styles.optButton}`}>
            <Button onClick={() => window.open('https://survey.dingwei.netease.com/htmls/tszgap/paper.html')}>
              <MyIcon className={styles.icon} type='icon-tiyanliangchi1' />
              体验量尺
            </Button>
          </span>

          <CreateIssues />
          <div className={styles.divider}></div>
          <a
            href={getHelpUrl(isBusiness)}
            onClick={() => this.setState({ value: '' })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MyIcon type="icon-bangzhu" className="f-fs5" />
          </a>
          <a onClick={() => this.handleClickIcon()}>
            <Badge count={messageCount} className={styles.msg}>
              <MyIcon type="icon-xinxi" className={`${styles.xinxi} u-mgr10 f-fs5`} />
            </Badge>
          </a>
        </span>
        <div className={styles.user}>
          <CurrentUser
            {...this.props}
            callback={() => this.setState({ headerType: LAYOUT_HEADER_TYPE_MAP.OTHER })}
          />
        </div>
      </div>
    </div>
    );
  }

  isProductTabWithProductSidebar = () => {
    const { headerType, sidebarType } = this.state;
    return headerType === LAYOUT_HEADER_TYPE_MAP.PRODUCT
      && sidebarType === LAYOUT_SIDEBAR_TYPE_MAP.PRODUCT;
  }

  isProductTabWithProductSettingSidebar = () => {
    const { headerType, sidebarType } = this.state;
    return headerType === LAYOUT_HEADER_TYPE_MAP.PRODUCT
      && sidebarType === LAYOUT_SIDEBAR_TYPE_MAP.PRODUCT_SETTING;
  }

  isProductTabWithSystemSettingSidebar = () => {
    const { headerType, sidebarType } = this.state;
    return headerType === LAYOUT_HEADER_TYPE_MAP.PRODUCT
      && sidebarType === LAYOUT_SIDEBAR_TYPE_MAP.SYSTEM_SETTING;
  }

  getContainer4ProductSidebar = () => {
    const { productPermission } = this.props;
    if (productPermission) {
      return [
        <ProductManage {...this.props} />,
        this.getContainerOfBasic()
      ];
    } else {
      return <NoPermission />;
    }
  }

  getContainer4ProductSettingSidebar = () => {
    const { productPermission } = this.props;
    if (productPermission) {
      return [
        <ProductSetting {...this.props} />,
        this.getContainerOfBasic()
      ];
    } else {
      return <NoPermission />;
    }
  }

  getContainer4SystemSettingSidebar = () => {
    return [
      <SystemManage {...this.props} />,
      this.getContainerOfBasic()
    ];
  }

  getContainerOfBasic = () => {
    return (<div className={styles.main}>
      <div>
        {this.props.children}
      </div>
    </div>);
  }

  getContainer = () => {
    const { headerType, sidebarType } = this.state;

    if (headerType && sidebarType) {
      if (this.isProductTabWithProductSidebar()) { // 产品管理-5类单据列表
        return this.getContainer4ProductSidebar();
      }
      else if (this.isProductTabWithProductSettingSidebar()) { // 产品管理-产品配置
        return this.getContainer4ProductSettingSidebar();
      }
      else if (this.isProductTabWithSystemSettingSidebar()) { // 产品管理-系统管理
        return this.getContainer4SystemSettingSidebar();
      }
      else { // 其他-项目管理之类没有侧边栏的
        return this.getContainerOfBasic();
      }
    }
  }

  getStaticPages = (pathname) => {
    if (['/', '/v2', '/v2/'].includes(pathname)) {
      return (<div className={styles.root}>
        <div className={styles.staticContainer}>
          <div className={styles.main}>
            {this.props.children}
          </div>
        </div>
      </div>);
    }
    return (<div className={styles.root}>
      <div className={styles.header}>
        <span className={`${styles.left} f-db`}>
          <a>
            <img onClick={() => { history.push(`/my_workbench/advise`) }} src={logo} alt="logo" style={{ width: '150px' }} />
          </a>
        </span>
      </div>
      <div className={styles.container}>
        <div className={styles.main}>
          {this.props.children}
        </div>
      </div>
    </div>);
  }

  render() {
    console.log('ep', this.props);

    const { pathname } = window.location;
    return (
      <ErrorBoundary>
        <ConfigProvider
          locale={zhCN}
          renderEmpty={() => <Empty />}
        >
          <div
            onClick={(e) => { this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: '' }) }}
          >
            {
              staticPagesUrl.includes(pathname) ?
                this.getStaticPages(pathname)
                :
                <div className={styles.root}>
                  {this.getHeader()}
                  <div className={styles.container}>
                    {
                      this.getContainer()
                    }
                  </div>
                  {
                    pathname.includes('/v2/manage') && <ProductRole />
                  }
                </div>
            }
            <SurveyModal />
          </div>
        </ConfigProvider>
      </ErrorBoundary >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    messageCount: state.message.messageCount,
    productList: state.product.productList,
    lastProduct: state.product.lastProduct,
    productPermission: state.product.productPermission,
  };
};

export default connectMaster(connect(mapStateToProps)(BusinessHOC()(Index)));
