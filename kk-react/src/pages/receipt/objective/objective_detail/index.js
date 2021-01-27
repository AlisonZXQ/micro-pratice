import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, message, Spin, Col, Tag, Dropdown, Button, Menu } from 'antd';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import { updateObjective, updateRequireemail, deleteObjective } from '@services/objective';
import { getIssueKey } from '@utils/helper';
import BackToPreview from '@pages/receipt/components/BackToPreview';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import EditSelectStatus from '@pages/receipt/components/drawer_shared/objective/EditStatus';
import EditSelectUser from '@components/EditSelectUser';
import CreateLog from '@pages/receipt/components/create_log';
import Tabs from '@components/Tabs';
import Attachment from '@pages/receipt/components/attachment';
import { headerTabs, DETAIL_HISTORY_ATTACHMENT, LIMITED_RECEIPT, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import CopyAs from '@pages/receipt/components/copy_as';
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
    const oid = getIssueKey();

    if (oid) {
      this.getObjectiveDetail();
      this.getObjectiveAcceptList();
      this.props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: oid, conntype: connTypeMapIncludeProject.objective } });

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
    this.getObjectiveDetail();
  }

  getObjectiveAcceptList = () => {
    const oid = getIssueKey();
    this.props.dispatch({ type: 'objective/getObjectiveAcceptList', payload: { id: oid } });
  }

  getObjectiveDetail = () => {
    const oid = getIssueKey();
    this.props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: oid } });
  }

  updateObjectiveRole = (type, value) => {
    this.setState({ visible: false });
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.updateObjective(type, value);
        }
      });
    } else {
      this.updateObjective(type, value);
    }
  }

  updateObjective = (type, value) => {
    const oid = getIssueKey();
    const params = {
      id: oid,
      [type]: value,
    };
    let promise = null;
    if (type === 'requireemail') {
      promise = updateRequireemail(params);
    } else {
      promise = updateObjective(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getObjectiveDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    this.closeVisible();
    const { lastProduct } = this.props;
    const oid = getIssueKey();

    deleteModal({
      title: '提示',
      content: '您确认要删除吗?',
      okCallback: () => {
        deleteObjective({ id: oid }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          history.push(`/manage/productobjective/?productid=${lastProduct.id}`);
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
    const { objectiveDetail } = this.props;
    const { productUserState } = objectiveDetail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type='objective'
          record={objectiveDetail}
          closeVisible={this.closeVisible}
        />
      </MenuItem>

      {
        objectiveDetail.issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={() => this.updateObjectiveRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={() => this.updateObjectiveRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
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
        objectiveDetail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => this.handleDelete()}>删除</a>
        </MenuItem>
      }
    </Menu>);
  }

  render() {
    const { objectiveDetail, loading, collapse, attachmentCount } = this.props;
    const { pathname } = this.props.location;
    const { activeKey } = this.state;
    const objective = objectiveDetail.objective || {};
    const state = objective.state;
    const responseUser = objectiveDetail.responseUser || {};
    const requireUser = objectiveDetail.requireUser || {};
    const submitUser = objectiveDetail.submitUser || {};
    const projectid = objective.projectid;
    const project = objectiveDetail.project || {};
    const jirakey = objective.jirakey;
    const okrId = objective.okrId;
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
              connType={RECEIPT_LOG_TYPE.OBJECTIVE}
              connId={getIssueKey()}
            />

            <Row className="f-fs2 u-mgb10">
              <BackToPreview type="objective" detail={objectiveDetail} {...this.props} />
              <a className='u-mgl10'>
                <EpIcon type={'objective'} className={`${styles.icon}`} />
                <span className={styles.issueId}>{`Objective-${getIssueKey()}`}</span>
              </a>
              <CopyToClipboard
                style={{ display: 'inline' }}
                text={`objective-${objective.id}: ${objective.name} ${window.location.origin}/v2/my_workbench/objectivedetail/Objective-${objective.id}` || ''}
                onCopy={() => message.success('复制成功')}
              >
                <MyIcon type="icon-fuzhi" className={`${styles.copy} issueIcon u-mgl10`} />
              </CopyToClipboard>
              {/* {
                !!project.id &&
                <span className={`${styles.headerTag} u-mgl10`}>
                  <a href={`/v2/project/detail/?id=${project.id}`} target="_blank" rel="noopener noreferrer">
                    项目{project.projectCode}
                  </a>
                </span>
              } */}
            </Row>

            <Row className="u-mgb20">
              <Col span={18}>
                {
                  !!projectid && <Tag color="blue" className={styles.tag}>项目目标</Tag>
                }
                <span className="f-fw5">
                  <EditNoWidthTitle
                    title={objective.name}
                    issueRole={objectiveDetail.issueRole}
                    handleSave={(value) => this.updateObjective('name', value)}
                  />
                </span>
              </Col>

              <Col span={6} className="f-tar">
                <SubscribeUser
                  type="objective"
                  connid={objective.id}
                  productid={this.props.lastProduct.id}
                  issueRole={objective.issueRole} />

                <Dropdown
                  overlay={this.menuMore(objective)}
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
                      type="objective"
                      bgHover={true}
                    />
                  </span>
                </Col>

                <Col span={5}>
                  负责人：
                  <EditSelectUser
                    issueRole={objectiveDetail.issueRole}
                    value={responseUser.email}
                    dataSource={getUserList(responseUser, this.state.userList)}
                    handleSearch={(responseValue) => handleSearchUser(responseValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateObjective('responseemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  报告人：
                  <EditSelectUser
                    issueRole={objectiveDetail.issueRole}
                    value={submitUser.email}
                    dataSource={getUserList(submitUser, this.state.userList)}
                    handleSearch={(submitValue) => handleSearchUser(submitValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateObjective('submitemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  验证人：
                  <EditSelectUser
                    issueRole={objectiveDetail.issueRole}
                    value={requireUser.email}
                    dataSource={getUserList(requireUser, this.state.userList)}
                    handleSearch={(requireValue) => handleSearchUser(requireValue, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateObjective('requireemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                {
                  jirakey &&
                  <Col span={4}>
                    <span className="f-fr5">JIRA：</span>
                    <a href={`http://jira.netease.com/browse/${jirakey}`} target="_blank" rel="noopener noreferrer">
                      <Tag color="blue" className="f-csp" style={{ cursor: 'pointer' }}>{jirakey}</Tag>
                    </a>
                  </Col>
                }

                {
                  !!okrId &&
                  <Col span={5}>
                    <span className="f-fr5">OKR：</span>
                    <a href={`http://okr.netease.com/index.html#/okr/detail/${okrId}`} target="_blank" rel="noopener noreferrer">
                      <Tag color="blue" className="f-csp" style={{ cursor: 'pointer' }}>OKR-{okrId}</Tag>
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
            activeKey === DETAIL_HISTORY_ATTACHMENT.DETAIL && <DetailInfo {...this.props} updateObjective={updateObjective} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.HISTORY && <History {...this.props} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.ATTACHMENT && <Attachment fromDetail type="objective" issueRole={objectiveDetail.issueRole} />
          }
        </div>
      </Spin>
    </span >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    objectiveDetail: state.objective.objectiveDetail,
    acceptList: state.objective.acceptList,
    fullLink: state.objective.fullLink,
    loading: state.loading.effects[`objective/getObjectiveDetail`],
    lastProduct: state.product.lastProduct,
    collapse: state.layout.collapse,
    attachmentCount: state.receipt.attachmentCount,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
