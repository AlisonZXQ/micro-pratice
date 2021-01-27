import React, { Component } from 'react';
import { connect } from 'dva';
import CopyToClipboard from 'react-copy-to-clipboard';
import { history } from 'umi';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Button, message, Spin, Col, Tag, Dropdown, Menu } from 'antd';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import { updateTicketState, deleteTicketItem, updateRequireemail, updateTicket } from '@services/ticket';
import { getIssueKey } from '@utils/helper';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import EditSelectUser from '@components/EditSelectUser';
import Tabs from '@components/Tabs';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import CreateLog from '@pages/receipt/components/create_log';
import Attachment from '@pages/receipt/components/attachment';
import EditSelectStatus from '@pages/receipt/components/drawer_shared/ticket/EditStatus';
import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import BackToPreview from '@pages/receipt/components/BackToPreview';
import CopyAs from '@pages/receipt/components/copy_as';
import { deleteModal, warnModal, handleSearchUser, getUserList } from '@shared/CommonFun';
import { TICKET_STATUS_MAP } from '@shared/TicketConfig';
import { headerTabs, DETAIL_HISTORY_ATTACHMENT, RECEIPT_LOG_TYPE, LIMITED_RECEIPT } from '@shared/ReceiptConfig';
import DetailInfo from './components/detail_info';
import History from './components/history';
import styles from './index.less';

const MenuItem = Menu.Item;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 1,
      visible: false,
      currentState: {},
      userList: [],
    };
  }

  componentDidMount() {

    const tid = getIssueKey();
    if (tid) {
      this.getTicketDetail();
      this.getTicketHistory();
      this.props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: tid, conntype: connTypeMapIncludeProject.ticket } });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeObj = this.props.ticketDetail || {};
    const nextObj = nextProps.ticketDetail || {};
    const { pathname, query: { type } } = this.props.location;
    if (Object.keys(beforeObj).length !== Object.keys(nextObj).length) {
      const ticket = nextObj.ticket || {};
      const state = ticket.state;
      if (pathname.includes('my_workbench') && type && type === "popo" && (state === TICKET_STATUS_MAP.NEW || state === TICKET_STATUS_MAP.REOPEN)) {
        this.handleToPinggu(ticket, TICKET_STATUS_MAP.ASSESS);
      }
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

  // 新建到评估中
  handleToPinggu = (ticket, state) => {
    const params = {
      id: ticket.id,
      state,
    };
    updateTicketState(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('状态更新成功！');
      this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: ticket.id } });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getAll = () => {
    this.getTicketDetail();
    this.getTicketHistory();
  }

  getTicketHistory = () => {
    const tid = getIssueKey();

    if (tid) {
      this.props.dispatch({ type: 'ticket/getTicketHistory', payload: { ticketId: tid } });
    }
  }

  getTicketDetail = () => {
    const tid = getIssueKey();

    this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: tid } });
    this.props.dispatch({ type: 'receipt/setCommentState', payload: { connId: tid, connType: connTypeMapIncludeProject.ticket } });
  }

  updateTicketRole = (type, value) => {
    this.setState({ visible: false });
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.updateTicket(type, value);
        }
      });
    } else {
      this.updateTicket(type, value);
    }
  }

  updateTicket = (type, value) => {
    const aid = getIssueKey();

    const params = {
      id: aid,
      [type]: value,
    };
    let promise = null;
    if (type === 'requireemail') {
      promise = updateRequireemail(params);
    } else {
      promise = updateTicket(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getTicketDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    this.closeVisible();
    const { lastProduct } = this.props;
    const aid = getIssueKey();

    deleteModal({
      title: '提示',
      content: '您确认要删除吗?',
      okCallback: () => {
        deleteTicketItem({ id: aid }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          history.push(`/manage/productticket/?productid=${lastProduct.id}`);
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
    const { ticketDetail } = this.props;
    const { productUserState } = ticketDetail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type='ticket'
          record={ticketDetail}
          closeVisible={this.closeVisible}
        />
      </MenuItem>

      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
          <a
            onClick={() => this.updateTicketRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
          >设置为受限单据</a>
        }
        {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
          <a
            onClick={() => this.updateTicketRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
          >取消设置为受限单据</a>
        }
      </MenuItem>

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
        ticketDetail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => this.handleDelete()}>删除</a>
        </MenuItem>
      }

    </Menu>);
  }

  render() {
    const { ticketDetail, loading, collapse, attachmentCount } = this.props;
    const { pathname } = this.props.location;
    const { activeKey } = this.state;
    const ticket = ticketDetail.ticket || {};
    const responseUser = ticketDetail.responseUser || {};
    const submitUser = ticketDetail.submitUser || {};
    const state = ticket.state;
    const jiraKey = ticket.jiraKey;
    let delNum = collapse ? 60 : 156;

    const headerHeight = document.getElementById('header') && document.getElementById('header').offsetHeight;

    if (pathname.includes('my_workbench')) {
      delNum = 0;
    }

    return (<div className={styles.container}>
      <Spin spinning={loading}>
        <div className={styles.header} style={{ width: `calc(100vw - ${delNum}px)` }}>
          <Card className="btn98" id='header'>
            <CreateLog
              onRef={(ref) => this.logRef = ref}
              currentUser={this.props.currentUser}
              productid={this.props.lastProduct.id}
              connType={RECEIPT_LOG_TYPE.TICKET}
              connId={getIssueKey()}
            />

            <Row className="f-fs2 u-mgb10">
              <BackToPreview detail={ticketDetail} type="ticket" {...this.props} />
              <a className='u-mgl10'>
                <EpIcon type={'ticket'} className={`${styles.icon}`} />
                <span className={styles.issueId}>{`Ticket-${getIssueKey()}`}</span>
              </a>
              <CopyToClipboard
                style={{ display: 'inline' }}
                text={`Ticket-${ticket.id}: ${ticket.name} ${window.location.origin}/v2/my_workbench/ticketdetail/Ticket-${ticket.id}` || ''}
                onCopy={() => message.success('复制成功')}
              >
                <MyIcon type="icon-fuzhi" className={`${styles.copy} issueIcon u-mgl10`} />
              </CopyToClipboard>
            </Row>

            <Row className="u-mgb20">
              <Col span={18}>
                <span className="f-fw5">
                  <EditNoWidthTitle
                    title={ticket.name}
                    issueRole={ticketDetail.issueRole}
                    handleSave={(value) => this.updateTicket('name', value)}
                  />
                </span>

              </Col>

              <Col span={6} className="f-tar">
                <SubscribeUser
                  type="ticket"
                  connid={ticket.id}
                  productid={this.props.lastProduct.id}
                  issueRole={ticketDetail.issueRole} />
                <Dropdown
                  overlay={this.menuMore(ticket)}
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
                      type="ticket"
                      bgHover={true}
                    />
                  </span>
                </Col>
                <Col span={5}>
                  负责人：
                  <EditSelectUser
                    issueRole={ticketDetail.issueRole}
                    value={responseUser.email}
                    dataSource={getUserList(responseUser, this.state.userList)}
                    handleSearch={(value) => handleSearchUser(value, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateTicket('responseEmail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  报告人：
                  <EditSelectUser
                    issueRole={ticketDetail.issueRole}
                    value={submitUser.email}
                    dataSource={getUserList(submitUser, this.state.userList)}
                    handleSearch={(submitValue) => handleSearchUser(submitValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateTicket('submitEmail', value)}
                    required
                    type='detail'
                  />
                </Col>
                {
                  jiraKey &&
                  <Col span={9}>
                    <span className="f-fr5">JIRA Issue：</span>
                    <a href={`http://jira.netease.com/browse/${jiraKey}`} target="_blank" rel="noopener noreferrer">
                      <Tag color="blue" className="f-csp" style={{ cursor: 'pointer' }}>{jiraKey}</Tag>
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

        <div className={styles.body} style={{ left: `${delNum}px`, top: `${headerHeight}px` }}>
          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.DETAIL && <DetailInfo {...this.props} updateTicket={updateTicket} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.HISTORY && <History {...this.props} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.ATTACHMENT && <Attachment fromDetail type="ticket" issueRole={ticketDetail.issueRole} />
          }
        </div>
      </Spin>
    </div >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    ticketHistory: state.ticket.ticketHistory,
    ticketDetail: state.ticket.ticketDetail,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`ticket/getTicketDetail`],
    collapse: state.layout.collapse,
    manPower: state.systemManage.manPower,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
