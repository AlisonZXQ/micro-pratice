import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, message, Spin, Col, Dropdown, Button, Menu, Tag, Popover } from 'antd';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import { updateRequirement, updateRequireemail, deleteRequireItem } from '@services/requirement';
import { getIssueKey } from '@utils/helper';
import BackToPreview from '@pages/receipt/components/BackToPreview';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import EditSelectStatus from '@pages/receipt/components/drawer_shared/requirement/EditStatus';
import EditSelectUser from '@components/EditSelectUser';
import CreateLog from '@pages/receipt/components/create_log';
import Tabs from '@components/Tabs';
import { headerTabs, DETAIL_HISTORY_ATTACHMENT, RECEIPT_LOG_TYPE, LIMITED_RECEIPT, urlJumpMap } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import CopyAs from '@pages/receipt/components/copy_as';
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
    const rid = getIssueKey();
    if (rid) {
      this.getReqirementDetail();
      this.props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: rid, conntype: connTypeMapIncludeProject.requirement } });
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
    this.getReqirementDetail();
  }

  getReqirementDetail = () => {
    const rid = getIssueKey();
    this.props.dispatch({ type: 'requirement/getReqirementDetail', payload: { id: rid } });
  }

  updateRequirementRole = (type, value) => {
    this.setState({ visible: false });
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.updateRequirement(type, value);
        }
      });
    } else {
      this.updateRequirement(type, value);
    }
  }

  updateRequirement = (type, value) => {
    const rid = getIssueKey();
    const params = {
      id: rid,
      [type]: value,
    };
    let promise = null;
    if (type === 'requireemail') {
      promise = updateRequireemail(params);
    } else {
      promise = updateRequirement(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getReqirementDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    this.closeVisible();
    const { lastProduct } = this.props;
    const rid = getIssueKey();

    deleteModal({
      title: '提示',
      content: '您确认要删除吗?',
      okCallback: () => {
        deleteRequireItem({ id: rid }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          history.push(`/manage/productrequirement/?productid=${lastProduct.id}`);
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
    const { requirementDetail } = this.props;
    const { productUserState } = requirementDetail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type='requirement'
          record={requirementDetail}
          closeVisible={this.closeVisible}
        />
      </MenuItem>

      {
        requirementDetail.issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={() => this.updateRequirementRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={() => this.updateRequirementRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
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
        requirementDetail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => this.handleDelete()}>删除</a>
        </MenuItem>
      }
    </Menu>);
  }

  parentLink = () => {
    const { fullLinkData } = this.props;
    const pType = 'objective';
    const item = fullLinkData.objectiveSet || [];
    return item.length ? <span>
      <Popover content={item[0].name}>
        <Link className="f-csp" to={`${urlJumpMap[pType]}-${item[0].id}`} target="_blank">
          <EpIcon type={pType} className={`${styles.icon}`} />
          <span className={styles.issueId}>{`Objective-${item[0].id}`}</span>
        </Link>
      </Popover>
      <span className='u-pd5'>/</span>
    </span> : <span></span>;
  }

  render() {
    const { requirementDetail, loading, collapse, attachmentCount } = this.props;
    const { pathname } = this.props.location;
    const { activeKey } = this.state;
    const requirement = requirementDetail.requirement || {};
    const state = requirement.state;
    const responseUser = requirementDetail.responseUser || {};
    const requireUser = requirementDetail.requireUser || {};
    const submitUser = requirementDetail.submitUser || {};
    const projectid = requirement.projectid;
    const project = requirementDetail.project || {};
    const jirakey = requirement.jirakey;
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
              connType={RECEIPT_LOG_TYPE.REQUIREMENT}
              connId={getIssueKey()}
            />

            <Row className="f-fs2 u-mgb10">
              <span className='u-mgr10'>
                <BackToPreview type="requirement" detail={requirementDetail} {...this.props} />
              </span>
              {this.parentLink()}
              <a>
                <EpIcon type={'requirement'} className={`${styles.icon}`} />
                <span className={styles.issueId}>{`Feature-${getIssueKey()}`}</span>
              </a>
              <CopyToClipboard
                style={{ display: 'inline' }}
                text={`Feature-${requirement.id}: ${requirement.name} ${window.location.origin}/v2/my_workbench/requirementdetail/Feature-${requirement.id}` || ''}
                onCopy={() => message.success('复制成功')}
              >
                <MyIcon type="icon-fuzhi" className={`${styles.copy} u-mgl10 issueIcon`} />
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
                  !!projectid && <Tag color="blue" className={styles.tag}>项目需求</Tag>
                }
                <span className="f-fw5">
                  <EditNoWidthTitle
                    title={requirement.name}
                    issueRole={requirementDetail.issueRole}
                    handleSave={(value) => this.updateRequirement('name', value)}
                  />
                </span>
              </Col>

              <Col span={6} className="f-tar">
                <SubscribeUser
                  type="requirement"
                  connid={requirement.id}
                  productid={this.props.lastProduct.id}
                  issueRole={requirementDetail.issueRole} />

                <Dropdown
                  overlay={this.menuMore(requirement)}
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
                      type="requirement"
                      bgHover={true}
                    />
                  </span>
                </Col>

                <Col span={5}>
                  负责人：
                  <EditSelectUser
                    issueRole={requirementDetail.issueRole}
                    value={responseUser.email}
                    dataSource={getUserList(responseUser, this.state.userList)}
                    handleSearch={(value) => handleSearchUser(value, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateRequirement('responseemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  报告人：
                  <EditSelectUser
                    issueRole={requirementDetail.issueRole}
                    value={submitUser.email}
                    dataSource={getUserList(submitUser, this.state.userList)}
                    handleSearch={(valueSubmit) => handleSearchUser(valueSubmit, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateRequirement('submitemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  验证人：
                  <EditSelectUser
                    issueRole={requirementDetail.issueRole}
                    value={requireUser.email}
                    dataSource={getUserList(requireUser, this.state.userList)}
                    handleSearch={(valueRequire) => handleSearchUser(valueRequire, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateRequirement('requireemail', value)}
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
            activeKey === DETAIL_HISTORY_ATTACHMENT.DETAIL && <DetailInfo {...this.props} updateRequirement={updateRequirement} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.HISTORY && <History {...this.props} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.ATTACHMENT && <Attachment fromDetail type="requirement" issueRole={requirementDetail.issueRole} />
          }
        </div>
      </Spin>
    </span >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    requirementDetail: state.requirement.requirementDetail,
    relateadvise: state.requirement.relateadvise,
    relateTask: state.requirement.relateTask,
    customSelect: state.aimEP.customSelect,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`requirement/getReqirementDetail`],
    subscribeUser: state.requirement.subscribeUser, // 关注人
    collapse: state.layout.collapse,
    attachmentCount: state.receipt.attachmentCount,
    fullLinkData: state.receipt.fullLinkData,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
