import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, message, Spin, Col, Tag, Dropdown, Button, Menu } from 'antd';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import { updateBugState, updateBug, updateRequireemail, deleteBugItem } from '@services/bug';
import { getIssueKey } from '@utils/helper';
import BackToPreview from '@pages/receipt/components/BackToPreview';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import EditSelectStatus from '@pages/receipt/components/drawer_shared/bug/EditStatus';
import EditSelectUser from '@components/EditSelectUser';
import CreateLog from '@pages/receipt/components/create_log';
import Tabs from '@components/Tabs';
import { headerTabs, DETAIL_HISTORY_ATTACHMENT, LIMITED_RECEIPT, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import CopyAs from '@pages/receipt/components/copy_as';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import Attachment from '@pages/receipt/components/attachment';
import { deleteModal, warnModal, handleSearchUser, getUserList } from '@shared/CommonFun';
import DetailInfo from './components/detail_info';
import History from './components/history';
import styles from './index.less';

const MenuItem = Menu.Item;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: DETAIL_HISTORY_ATTACHMENT.DETAIL,
      visible: false,
      currentState: {},
      userList: [],
    };
  }

  componentDidMount() {
    const bid = getIssueKey();
    if (bid) {
      this.getBugDetail();
      this.props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: bid, conntype: connTypeMapIncludeProject.bug } });
    }
  }

  getAttachCount = (count) => {
    let tabs = [];
    headerTabs.map(it => {
      tabs.push({
        key: it.key,
        name: it.name === '附件' ? `${it.name}(${count})` : it.name,
      });
    });
    return tabs;
  }

  getAll = () => {
    this.getBugDetail();
  }

  getBugDetail = () => {
    const bid = getIssueKey();
    this.props.dispatch({ type: 'bug/getBugDetail', payload: { id: bid } });
  }

  updateBugState = (params) => {
    updateBugState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      this.getBugDetail();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  updateBugRole = (type, value) => {
    this.setState({ visible: false });
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.updateBug(type, value);
        }
      });
    } else {
      this.updateBug(type, value);
    }
  }

  updateBug = (type, value) => {
    const bid = getIssueKey();
    const params = {
      id: bid,
      [type]: value,
    };
    let promise = null;
    if (type === 'requireemail') {
      promise = updateRequireemail(params);
    } else {
      promise = updateBug(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getBugDetail();

      // 变换负责人的时候更新关注人列表
      if (type === 'responseemail') {
        const params = {
          conntype: connTypeMapIncludeProject['bug'],
          connid: bid,
        };
        this.props.dispatch({ type: 'requirement/getSubscribeByType', payload: params });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    this.closeVisible();
    const { lastProduct } = this.props;
    const bid = getIssueKey();

    deleteModal({
      title: '提示',
      content: '您确认要删除吗?',
      okCallback: () => {
        deleteBugItem({ id: bid }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          history.push(`/manage/productbug/?productid=${lastProduct.id}`);
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });

  }

  closeVisible = () => {
    this.setState({ visible: false });
  }

  menuMore = (item) => {
    const { bugDetail } = this.props;
    const { productUserState } = bugDetail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type='bug'
          record={bugDetail}
          closeVisible={this.closeVisible}
        />
      </MenuItem>

      {
        bugDetail.issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={() => this.updateBugRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={() => this.updateBugRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
            >取消设置为受限单据</a>
          }
        </MenuItem>
      }

      {
        productUserState &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => {
            this.logRef.openModal();
            this.closeVisible();
          }}>登记日志</a>
        </MenuItem>
      }

      {
        bugDetail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => this.handleDelete()}>删除</a>
        </MenuItem>
      }
    </Menu>);
  }

  render() {
    const { bugDetail, loading, collapse, attachmentCount } = this.props;
    const { pathname } = this.props.location;
    const { activeKey } = this.state;
    const bug = bugDetail.bug || {};
    const state = bug.state;
    const responseUser = bugDetail.responseUser || {};
    const requireUser = bugDetail.requireUser || {};
    const submitUser = bugDetail.submitUser || {};
    const jirakey = bug.jirakey;
    const project = bug.project || {};
    let delNum = collapse ? 60 : 156;

    const headerHeight = document.getElementById('header') && document.getElementById('header').offsetHeight;

    if (pathname.includes('my_workbench')) {
      delNum = 0;
    }

    return (<span className={styles.container}>
      <Spin spinning={loading}>
        <div className={styles.header} style={{ width: `calc(100vw - ${delNum}px)` }}>
          <Card className="btn98" id='header'>
            <CreateLog
              onRef={(ref) => this.logRef = ref}
              currentUser={this.props.currentUser}
              productid={this.props.lastProduct.id}
              connType={RECEIPT_LOG_TYPE.BUG}
              connId={getIssueKey()}
            />
            <Row className="f-fs2 u-mgb10">
              <BackToPreview detail={bugDetail} type="bug" {...this.props} />
              <a className='u-mgl10'>
                <EpIcon type={'bug'} className={`${styles.icon}`} />
                <span className={styles.issueId}>{`Bug-${getIssueKey()}`}</span>
              </a>
              <CopyToClipboard
                style={{ display: 'inline' }}
                text={`Bug-${bug.id}: ${bug.name} ${window.location.origin}/v2/my_workbench/bugdetail/Bug-${bug.id}` || ''}
                onCopy={() => message.success('复制成功')}
              >
                <MyIcon type="icon-fuzhi" className={`${styles.copy} issueIcon u-mgl10`} />
              </CopyToClipboard>
              {/* {
                project.id &&
                <span className={`${styles.headerTag} u-mgl10`}>
                  <a href={`/v2/project/detail/?id=${project.id}`} target="_blank" rel="noopener noreferrer">
                    项目{project.projectCode}
                  </a>
                </span>
              } */}
            </Row>

            <Row className="u-mgb20">
              <Col span={18}>
                <span className="f-fw5">
                  <EditNoWidthTitle
                    title={bug.name}
                    issueRole={bugDetail.issueRole}
                    handleSave={(value) => this.updateBug('name', value)}
                  />
                </span>
              </Col>

              <Col span={6} className="f-tar">
                <SubscribeUser
                  type="bug"
                  connid={bug.id}
                  productid={this.props.lastProduct.id}
                  issueRole={bugDetail.issueRole} />

                <Dropdown
                  overlay={this.menuMore(bug)}
                  visible={this.state.visible}
                  onVisibleChange={(visible) => this.setState({ visible: visible })}
                  trigger={['click']}>
                  <Button className="u-mgl10">
                    更多<MyIcon type="icon-jiantou1" style={{ fontSize: '9px', position: 'relative', top: '-2px' }} />
                  </Button>
                </Dropdown>
              </Col>
            </Row>

            <Row>
              <Col span={16} style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={3}>
                  <span style={{ position: 'relative', top: '-1px' }}>
                    <EditSelectStatus
                      value={state}
                      type="bug"
                      bgHover={true}
                    />
                  </span>
                </Col>

                <Col span={5}>
                  负责人：
                  <EditSelectUser
                    issueRole={bugDetail.issueRole}
                    value={responseUser.email}
                    dataSource={getUserList(responseUser, this.state.userList)}
                    handleSearch={(responseValue) => handleSearchUser(responseValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateBug('responseemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  报告人：
                  <EditSelectUser
                    issueRole={bugDetail.issueRole}
                    value={submitUser.email}
                    dataSource={getUserList(submitUser, this.state.userList)}
                    handleSearch={(submitValue) => handleSearchUser(submitValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateBug('submitemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  验证人：
                  <EditSelectUser
                    issueRole={bugDetail.issueRole}
                    value={requireUser.email}
                    dataSource={getUserList(requireUser, this.state.userList)}
                    handleSearch={(requireValue) => handleSearchUser(requireValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateBug('requireemail', value)}
                    type='detail'
                  />
                </Col>
                {
                  jirakey &&
                  <Col span={9}>
                    <span className="f-fr5">JIRA Issue：</span>
                    <a href={`http://jira.netease.com/browse/${jirakey}`} target="_blank" rel="noopener noreferrer">
                      <Tag color="blue" className="f-csp" style={{ cursor: 'pointer' }}>{jirakey}</Tag>
                    </a>
                  </Col>
                }

              </Col>

              <Col span={8} className="f-tar">
                <Tabs
                  tabsData={this.getAttachCount(attachmentCount)}
                  defaultKey={DETAIL_HISTORY_ATTACHMENT.DETAIL}
                  callback={(value) => this.setState({ activeKey: value })}
                />
              </Col>
            </Row>
          </Card>
        </div>

        <div className={styles.body} style={{ paddingTop: `${headerHeight}px` }}>
          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.DETAIL && <DetailInfo {...this.props} updateBug={updateBug} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.HISTORY && <History {...this.props} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.ATTACHMENT && <Attachment fromDetail type="bug" issueRole={bugDetail.issueRole} />
          }
        </div>
      </Spin>
    </span >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    bugDetail: state.bug.bugDetail,
    loading: state.loading.effects[`bug/getBugDetail`],
    lastProduct: state.product.lastProduct,
    subscribeUser: state.bug.subscribeUser, // 关注人
    collapse: state.layout.collapse,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
