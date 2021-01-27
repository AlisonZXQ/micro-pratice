import React, { Component } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, message, Spin, Col, Tag, Menu, Dropdown, Button, Popover } from 'antd';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import { updateTaskState, updateTask, updateRequireemail, deleteTaskItem } from '@services/task';
import { getIssueKey } from '@utils/helper';
import BackToPreview from '@pages/receipt/components/BackToPreview';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import EditSelectStatus from '@pages/receipt/components/drawer_shared/task/EditStatus';
import EditSelectUser from '@components/EditSelectUser';
import CreateLog from '@pages/receipt/components/create_log';
import Tabs from '@components/Tabs';
import { headerTabs, DETAIL_HISTORY_ATTACHMENT, LIMITED_RECEIPT, RECEIPT_LOG_TYPE, urlJumpMap } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import Attachment from '@pages/receipt/components/attachment';
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
    const tid = getIssueKey();
    if (tid) {
      this.getTaskDetail();
      this.props.dispatch({ type: 'receipt/getAttachmentCount', payload: { connid: tid, conntype: connTypeMapIncludeProject.task } });
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
    this.getTaskDetail();
  }

  getTaskDetail = () => {
    const tid = getIssueKey();
    this.props.dispatch({ type: 'task/getTaskDetail', payload: { id: tid } });
  }

  updateTaskState = (params) => {
    updateTaskState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      this.getTaskDetail();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const tid = getIssueKey();
    const { currentState } = this.state;
    const params = [{
      id: tid,
      state: currentState.key,
    }];
    this.setTaskState(params);
  }

  setTaskState = (params) => {
    updateTaskState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      this.getTaskDetail();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  updateTaskRole = (type, value) => {
    this.setState({ visible: false });
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.updateTask(type, value);
        }
      });
    } else {
      this.updateTask(type, value);
    }
  }

  updateTask = (type, value) => {
    const tid = getIssueKey();
    const params = {
      id: tid,
      [type]: value,
    };
    let promise = null;
    if (type === 'requireemail') {
      promise = updateRequireemail(params);
    } else {
      promise = updateTask(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getTaskDetail();

      // 变换负责人的时候更新关注人列表
      if (type === 'responseemail') {
        const params = {
          conntype: connTypeMapIncludeProject['task'],
          connid: tid,
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
    const tid = getIssueKey();

    deleteModal({
      title: '提示',
      content: '您确认要删除吗?',
      okCallback: () => {
        deleteTaskItem({ id: tid }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          history.push(`/manage/producttask/?productid=${lastProduct.id}`);
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
    const { taskDetail } = this.props;
    const { productUserState } = taskDetail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type='task'
          record={taskDetail}
          closeVisible={this.closeVisible}
        />
      </MenuItem>

      {
        taskDetail.issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={() => this.updateTaskRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={() => this.updateTaskRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
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
        taskDetail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => this.handleDelete()}>删除</a>
        </MenuItem>
      }
    </Menu>);
  }

  parentLink = (subTaskId) => {
    const { fullLinkData } = this.props;
    if (!subTaskId) {
      const set = fullLinkData.objectiveSet && fullLinkData.objectiveSet.length ?
        fullLinkData.objectiveSet :
        fullLinkData.requirementSet;
      const pType = fullLinkData.objectiveSet && fullLinkData.objectiveSet.length ?
        'objective' : 'requirement';
      return set && set.length ? <span>
        <Popover content={set[0].name}>
          <Link className="f-csp" to={`${urlJumpMap[pType]}-${set[0].id}`} target="_blank">
            <EpIcon type={pType} className={`${styles.icon}`} />
            <span className={styles.issueId}>
              {`${pType === 'objective' ? 'Objective' : 'Requirement'}-${set[0].id}`}
            </span>
          </Link>
        </Popover>
        <span className='u-pd5'>/</span>
      </span> : <span></span>;
    } else if (subTaskId) {
      const pType = 'task';
      const item = fullLinkData.taskSet;
      return item && item.length ? <span>
        <Popover content={item[0].name}>
          <Link className="f-csp" to={`${urlJumpMap[pType]}-${item[0].id}`} target="_blank">
            <EpIcon type={pType} className={`${styles.icon}`} />
            <span className={styles.issueId}>{`Task-${item[0].id}`}</span>
          </Link>
        </Popover>
        <span className='u-pd5'>/</span>
      </span> : <span></span>;
    }
  }

  render() {
    const { taskDetail, loading, collapse, attachmentCount } = this.props;
    const { pathname } = this.props.location;
    const { activeKey } = this.state;
    const task = taskDetail.task || {};
    const parentid = task.parentid;
    const subTaskId = parentid;
    const state = task.state;
    const responseUser = taskDetail.responseUser || {};
    const requireUser = taskDetail.requireUser || {};
    const submitUser = taskDetail.submitUser || {};
    const projectid = task.projectid;
    const project = taskDetail.project || {};
    const jirakey = task.jirakey;
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
              connType={RECEIPT_LOG_TYPE.TASK}
              connId={getIssueKey()}
            />
            <Row className="f-fs2 u-mgb10">
              <span className='u-mgr10'>
                <BackToPreview type="task" detail={taskDetail} {...this.props} />
              </span>
              {this.parentLink(subTaskId)}
              <a>
                <EpIcon type={'task'} className={`${styles.icon}`} />
                {
                  !subTaskId && <span className={styles.issueId}>{`Task-${getIssueKey()}`}</span>
                }
                {
                  !!subTaskId && <span className={styles.issueId}>{`Subtask-${getIssueKey()}`}</span>
                }
              </a>

              <CopyToClipboard
                style={{ display: 'inline' }}
                text={`${subTaskId ? 'Subtask' : 'Task'}-${task.id}: ${task.name} ${window.location.origin}/v2/my_workbench/taskdetail/${parentid ? 'Subtask' : 'Task'}-${task.id}` || ''}
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
                  !!projectid && <Tag color="blue" className={styles.tag}>项目任务</Tag>
                }
                {
                  !!subTaskId && <Tag color="blue">子任务</Tag>
                }
                <span className="f-fw5">
                  <EditNoWidthTitle
                    title={task.name}
                    issueRole={taskDetail.issueRole}
                    handleSave={(value) => this.updateTask('name', value)}
                  />
                </span>
              </Col>

              <Col span={6} className="f-tar">
                <SubscribeUser
                  type="task"
                  connid={task.id}
                  productid={this.props.lastProduct.id}
                  issueRole={taskDetail.issueRole} />

                <Dropdown
                  overlay={this.menuMore(task)}
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
                    issueRole={taskDetail.issueRole}
                    value={responseUser.email}
                    dataSource={getUserList(responseUser, this.state.userList)}
                    handleSearch={(valueResponse) => handleSearchUser(valueResponse, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateTask('responseemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  报告人：
                  <EditSelectUser
                    issueRole={taskDetail.issueRole}
                    value={submitUser.email}
                    dataSource={getUserList(submitUser, this.state.userList)}
                    handleSearch={(valueSubmit) => handleSearchUser(valueSubmit, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateTask('submitemail', value)}
                    required
                    type='detail'
                  />
                </Col>

                <Col span={5}>
                  验证人：
                  <EditSelectUser
                    issueRole={taskDetail.issueRole}
                    value={requireUser.email}
                    dataSource={getUserList(requireUser, this.state.userList)}
                    handleSearch={(valueRequire) => handleSearchUser(valueRequire, (result) => {
                      this.setState({ userList: result });
                    })}
                    handleSaveSelect={(value) => this.updateTask('requireemail', value)}
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
                  defaultKey={1}
                  callback={(value) => this.setState({ activeKey: value })}
                />
              </Col>
            </Row>
          </Card>
        </div>

        <div className={styles.body} style={{ paddingTop: `${headerHeight}px` }}>
          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.DETAIL && <DetailInfo {...this.props} updateTask={updateTask} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.HISTORY && <History {...this.props} />
          }

          {
            activeKey === DETAIL_HISTORY_ATTACHMENT.ATTACHMENT && <Attachment fromDetail type="task" issueRole={taskDetail.issueRole} />
          }
        </div>
      </Spin>
    </span >);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    taskDetail: state.task.taskDetail,
    customSelect: state.aimEP.customSelect,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`task/getTaskDetail`],
    collapse: state.layout.collapse,
    attachmentCount: state.receipt.attachmentCount,
    fullLinkData: state.receipt.fullLinkData,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
