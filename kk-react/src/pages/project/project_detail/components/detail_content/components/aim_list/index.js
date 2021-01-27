import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Card, Modal, Button, message, Input, Menu, Empty, Tooltip, Checkbox } from 'antd';
import { Link } from 'umi';
import { connect } from 'dva';
import DropDown from '@components/CustomAntd/drop_down';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import NewAims from '@pages/project/components/project_aims_ep/components/NewAims';
import { PROJECT_STATUS_MAP, PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import { dateToTime, getFormLayout, getIssueCustom, drawerDelayFun, getMentionUsers } from '@utils/helper';
import { aimColorDotMap, aimNameMap, AIM_TASK_BUG_STATUS_MAP, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { withdrawAim, getObjectiveDetailEP, updateObjectiveEP, aimCancel, aimDeleteFromProject, aimReopen, aimUnbindFromProject, deleteTempObjectiveFromProject, getObjectiveDetailEPTemp, updateTempObjectiveEP } from '@services/project';
import { warnModal } from '@shared/CommonFun';
import AimApprovalFlow from '../../../submit_approval/AimApprovalFlow';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const { TextArea } = Input;
const MenuItem = Menu.Item;

const diffOperationsTitleMap = {
  'delete': '删除目标',
  'edit': '编辑目标',
  'cancel': '取消目标',
  'reopen': '重新打开目标',
  'unbind': '解绑目标'
};

class index extends Component {
  state = {
    visible: false,
    aimQuery: {},
    record: {},
    confirmLoading: false,
    type: '', // accept 发起验收 edit 编辑目标
    aimData: {},

    showCheckbox: false, // 批量操作
    selectData: [], // 批量操作
  }

  commonColumns = [{
    key: 'summary',
    title: <span style={{ position: 'relative', left: '-15px' }}>目标</span>,
    dataIndex: 'summary',
    width: '240px',
    render: (text, record) => {
      const { projectObjective } = this.props;
      const { showCheckbox } = this.state;
      const objectives = projectObjective.objectives || [];
      const objectiveVO = objectives.find(it => it.objectiveVO && it.objectiveVO.objectiveId === record.objectiveId) || {};
      const action = objectiveVO.action || '未变更';
      return (<span className="f-pr">
        <span>
          {
            action !== '未变更' &&
            <Tooltip title={action}>
              <MyIcon
                type="icon-tishigantanhaohuang"
                className={showCheckbox ? styles.showCheckboxAimChangeIcon : styles.aimChangeIcon}
              />
            </Tooltip>
          }
        </span>
        {text ?
          <a
            style={{ position: 'relative', left: '-15px', whiteSpace: 'pre-line' }}
          >
            {text}
          </a >
          : '-'}
      </span>);
    }
  }, {
    key: 'objectiveStatus',
    title: '状态',
    dataIndex: 'objectiveStatus',
    width: '100px',
    render: (text, record) => {
      return (text ?
        <DefineDot
          text={text}
          statusColor={aimColorDotMap}
          statusMap={aimNameMap}
        />
        : '-');
    }
  }, {
    key: 'assignee',
    title: '负责人',
    dataIndex: 'assignee',
    render: (text) => {
      return text ? text : '-';
    }
  }, {
    key: 'verfier',
    title: '验证人',
    dataIndex: 'verfier',
    render: (text) => {
      return <span className='f-ib' style={{ minWidth: '50px' }}>{text ? text : '-'}</span>;
    }
  }, {
    key: 'dueDate',
    title: '到期日',
    dataIndex: 'dueDate',
    render: (text) => {
      return text ? text : '-';
    }
  },
  // {
  //   key: 'type',
  //   title: '目标类型',
  //   dataIndex: 'type',
  //   render: (text) => {
  //     return text ? aimType[text] : '-';
  //   }
  // },
  {
    key: 'priority',
    title: '优先级',
    dataIndex: 'priority',
    render: (text) => {
      return text ? text : '-';
    }
  }
    // {
    //   key: 'subProductName',
    //   title: '子产品',
    //   dataIndex: 'subProductName',
    //   render: (text, record) => {
    //     const subProductVO = record.subProductVO || {};
    //     return subProductVO.subProductName ? subProductVO.subProductName : '-';
    //   }
    // },
    // {
    //   key: 'description',
    //   title: '验收标准',
    //   dataIndex: 'description',
    //   render: (text, record) => {
    //     return (<span className='f-ib' style={{ minWidth: '50px' }}>{text ?
    //       <RichTextDisplay data={text} title="验收标准" /> : '-'}</span>);
    //   }
    // }, {
    //   key: 'remark',
    //   title: '描述',
    //   dataIndex: 'remark',
    //   render: (text, record) => {
    //     return (<span className='f-ib' style={{ minWidth: '50px' }}>{text ?
    //       <RichTextDisplay data={text} title="目标描述" /> : '-'}</span>);
    //   }
    // }
  ];

  diffColumns = [{
    title: '操作',
    dataIndex: 'caozuo',
    width: '120px',
    render: (text, record) => {
      const { currentUser, type: detailType } = this.props;
      const currId = currentUser && currentUser.user && currentUser.user.id; // 当前用户id
      const assId = record.assigneeUser && record.assigneeUser.id; // 负责人id
      const verId = record.verifierUser && record.verifierUser.id; // 验收人id
      const reportId = record.reportUser && record.reportUser.id; // 报告人id
      const objectiveStatus = record.objectiveStatus;
      // TODO_CHANGE
      // 展示下拉更多的条件：当前处于待验收状态（验收详情有没有权限都可以看）或者非待验收状态但是有目标的相应权限
      const hasAimPermission = currId === assId || currId === verId || currId === reportId;
      const showDropDown = (objectiveStatus === AIM_TASK_BUG_STATUS_MAP.TODO ||
        (objectiveStatus !== AIM_TASK_BUG_STATUS_MAP.TODO && hasAimPermission)) && detailType && detailType === 'detail';

      const objectiveKey = record.objectiveId ? `objective-${record.objectiveId}` : `temp-${record.tempId}`;

      return (showDropDown ?
        <DropDown
          overlay={() => this.getMenu(record)}
          visible={this.state[`${objectiveKey}`]}
          onVisibleChange={(visible) => this.setState({ [objectiveKey]: visible })}
        >
        </DropDown> : '--');
    }
  }]

  componentDidMount() {
  }

  handleAction = (e, record) => {
    const objectiveKey = record.objectiveId ? `objective-${record.objectiveId}` : `temp-${record.tempId}`;

    e.stopPropagation();
    this.setState({ [objectiveKey]: false });
  }

  // 解绑
  getMenu = (record) => {
    const { projectBasic, currentUser } = this.props;
    const objectiveStatus = record.objectiveStatus;
    const projectDetail = projectBasic.projectDetail || {};
    const projectId = projectDetail.projectId;
    const status = projectDetail.status;
    const productId = projectBasic && projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id;

    const currId = currentUser && currentUser.user && currentUser.user.id; // 当前用户id
    const assId = record.assigneeUser && record.assigneeUser.id; // 负责人id
    const reportId = record.reportUser && record.reportUser.id; // 报告人id

    const disabled = status === PROJECT_STATUS_MAP.DOING_CHANGE;

    switch (objectiveStatus) {
      case AIM_TASK_BUG_STATUS_MAP.NEW:
      case AIM_TASK_BUG_STATUS_MAP.REOPEN:
        return (<Menu>
          <MenuItem key="0">
            <a onClick={(e) => { this.handleAction(e, record); this.handleEdit(record) }} disabled={disabled}>编辑目标</a>
          </MenuItem>
          {/* <MenuItem key="1">
            <a onClick={(e) => { this.handleAction(e, record); this.handleDiffOperations(record, 'unbind') }} disabled={disabled}>解绑目标</a>
          </MenuItem> */}
          {
            status !== PROJECT_STATUS_MAP.DOING &&
            [
              <MenuItem key="2">
                <a onClick={(e) => { this.handleAction(e, record); this.handleDiffOperations(record, 'delete') }} disabled={disabled}>删除目标</a>
              </MenuItem>,
              <MenuItem key="3">
                <a onClick={(e) => { this.handleAction(e, record); this.handleDiffOperations(record, 'cancel') }} disabled={disabled}>取消目标</a>
              </MenuItem>
            ]
          }
        </Menu>);
      case AIM_TASK_BUG_STATUS_MAP.DOING:
        return (<Menu>
          <MenuItem key="0">
            <a onClick={(e) => { this.handleAction(e, record); this.handleEdit(record) }} disabled={disabled}>编辑目标</a>
          </MenuItem>
          <MenuItem key="1">
            <a onClick={(e) => { this.handleAction(e, record); this.handleDiffOperations(record, 'cancel') }} disabled={disabled}>取消目标</a>
          </MenuItem>
          {
            (currId === assId || currId === reportId) &&
            <MenuItem key="2">
              <a disabled={disabled}>
                <AimApprovalFlow record={record} productId={productId} callback={(e) => this.handleAction(e, record)} disabled={disabled} />
              </a>
            </MenuItem>
          }
        </Menu>);
      case AIM_TASK_BUG_STATUS_MAP.TODO:
        return (<Menu>
          {
            (currId === assId || currId === reportId) &&
            <MenuItem key="0">
              <a onClick={(e) => { this.handleAction(e, record); this.handleWithdraw(record) }} disabled={disabled}>验收撤回</a>
            </MenuItem>
          }

          <MenuItem key="1">
            <Link
              to={`/project/aim_accept?pid=${record.projectId}&oid=${record.objectiveId}`}
              target="_blank"
              onClick={e => e.stopPropagation()}
              disabled={disabled}
            >验收详情</Link>
          </MenuItem>
        </Menu>);
      case AIM_TASK_BUG_STATUS_MAP.CLOSE:
      case AIM_TASK_BUG_STATUS_MAP.CANCLE:
        return (<Menu>
          <MenuItem key="0">
            <a
              onClick={(e) => {
                this.handleAction(e, record);
                this.handleDiffOperations(record, 'reopen');
              }}
              disabled={disabled}
            >重新打开</a>
          </MenuItem>
        </Menu>);
      default:
        return null;
    }
  };

  handleDiffOperations = (record, type) => {
    this.setState({
      visible: true,
      type: type,
      record
    });
  }

  // 编辑目标
  handleEdit = (record) => {
    // 获取当前用户所拥有的子产品列表
    this.props.dispatch({ type: 'product/getUserProduct' });
    this.setState({
      visible: true,
      type: 'edit',
      record
    }, () => this.handleUpdateMsg());
  }

  // 编辑目标获取目标信息
  handleUpdateMsg = () => {
    const { record: { objectiveId, tempId } } = this.state;
    let promise = null;
    if (objectiveId) {
      promise = getObjectiveDetailEP({ id: objectiveId });
    } else {
      promise = getObjectiveDetailEPTemp({ id: tempId });
    }

    promise.then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ aimData: res.result || {} });
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleWithdraw = (record) => {
    const params = {
      projectId: record.projectId,
      objectiveId: record.objectiveId,
    };
    withdrawAim(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('目标撤回成功！');
      this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: record.projectId } });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleRefreshObjectiveAndBasic = (record) => {
    const { id: projectId } = this.props;
    this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
    this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
    this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
  }

  handleOk = () => {
    const { currentUser, customSelect } = this.props;
    const { id: projectId } = this.props;

    const { type, aimData, record } = this.state;
    const userEmail = currentUser && currentUser.user && currentUser.user.email;

    if (type === 'edit') {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        const valueList = aimData.objectiveCustomFieldRelationInfoList || [];

        const custom_field_values = getIssueCustom(values, customSelect, valueList); // 自定义字段

        const descriptionMentions = getMentionUsers(values.description).map(it => it.email) || [];
        const remarkMentions = getMentionUsers(values.remark).map(it => it.email) || [];

        const params = {
          ...values,
          expect_releasetime: values.expect_releasetime && dateToTime(values.expect_releasetime),
          submitemail: userEmail,
          noticeEmailList: descriptionMentions.concat(remarkMentions),
          id: aimData && aimData.objective && aimData.objective.id,
          custom_field_values: JSON.stringify(custom_field_values),
        };
        let promise = null;
        if (record.tempId) {
          promise = updateTempObjectiveEP({
            ...params,
            id: record.tempId,
          });
        } else {
          promise = updateObjectiveEP({
            ...params,
          });
        }
        this.setState({ confirmLoading: true });
        promise.then((res) => {
          this.setState({ confirmLoading: false });
          if (res.code !== 200) {
            return message.error(`更新目标失败，${res.msg}`);
          }
          message.success('更新目标成功！');
          this.setState({ visible: false });
          this.props.form.resetFields();
          this.handleRefreshObjectiveAndBasic(record);
        }).catch((err) => {
          this.props.form.resetFields();
          this.setState({ confirmLoading: false });
          return message.error(err || err.message);
        });
      });
    }

    if (type === 'cancel') {
      this.props.form.validateFields((err, values) => {
        if (err) return;
        const params = {
          projectId: record.projectId,
          objectiveId: record.objectiveId,
          cancelReason: values.cancelReason,
        };
        this.setState({ confirmLoading: true });
        aimCancel(params).then((res) => {
          this.setState({ confirmLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success(`目标取消成功！`);
          this.setState({ visible: false });
          this.handleRefreshObjectiveAndBasic(record);
        }).catch((err) => {
          this.setState({ confirmLoading: false });
          return message.error(err || err.message);
        });
      });
    }

    if (type === 'reopen') {
      const params = {
        objectiveId: Number(record.objectiveId),
      };
      aimReopen(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('目标重新打开成功!');
        this.setState({ visible: false });
        this.handleRefreshObjectiveAndBasic(record);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }

    if (type === 'delete') {
      const params = {
        projectId: record.projectId,
        objectiveId: record.objectiveId,
      };
      aimDeleteFromProject(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('目标删除成功！');
        this.setState({ visible: false });
        this.handleRefreshObjectiveAndBasic(record);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }

    if (type === 'unbind') {
      let params = {};
      let promise = null;
      if (record.tempId) {
        params = {
          id: record.tempId,
        };
        promise = deleteTempObjectiveFromProject(params);
      } else if (record.objectiveId) {
        params = {
          projectId: record.projectId || projectId,
          objectiveId: record.objectiveId,
        };
        promise = aimUnbindFromProject(params);
      }

      promise.then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('目标解绑成功！');
        this.setState({ visible: false });
        this.handleRefreshObjectiveAndBasic(record);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  handleBatchClose = () => {
    const { id: projectId } = this.props;
    const { selectData } = this.state;
    let tempIdList = [];
    let objectiveIdList = [];
    selectData.forEach(it => {
      if (it.tempId) {
        tempIdList.push(it.tempId);
      } else {
        objectiveIdList.push(it.objectiveId);
      }
    });
    const params = {
      projectId: projectId,
      objectiveIdList: objectiveIdList,
      tempIdList: tempIdList
    };
    warnModal({
      title: '提示',
      content: '确定批量解绑这些目标吗？',
      okCallback: () => {
        aimUnbindFromProject(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('目标解绑成功！');
          this.setState({ visible: false, selectData: [], showCheckbox: false });
          this.handleRefreshObjectiveAndBasic();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getFooter = () => {
    const { confirmLoading } = this.state;

    return (<div className="f-tar">
      <Button className="u-mgl30" onClick={() => { this.setState({ visible: false }); this.props.form.resetFields() }}>取消</Button>
      <Button type="primary" className="u-mgl10" onClick={() => this.handleOk()} loading={confirmLoading}>确定</Button>
    </div>);
  }

  customExpandIcon = (props) => {
    const record = props.record || {};
    if (record.objectiveStatus === AIM_TASK_BUG_STATUS_MAP.CLOSE) {
      if (props.expanded) {
        return (
          <a
            style={{ color: 'inherit' }}
            onClick={e => { props.onExpand(props.record, e) }}
          >
            <MyIcon type="icon-kuozhananniu" className="f-fs3" style={{ position: 'relative', top: '1px', left: '5px' }} />
          </a>);
      } else {
        return (
          <a
            style={{ color: 'inherit' }}
            onClick={e => { props.onExpand(props.record, e) }}
          >
            <MyIcon type="icon-shousuoanniu" className="f-fs3" style={{ position: 'relative', top: '1px', left: '5px' }} />
          </a>);
      }
    } else {
      return (<span style={{ marginRight: 8 }}></span>);
    }

  }

  isEmpty = (text) => {
    return text ? text : '-';
  }

  render() {
    // detail来自详情页
    const { form: { getFieldDecorator }, projectObjective, currentHeight, projectBasic, type: detailType, currentMemberInfo: { roleGroup } } = this.props;
    const { visible, aimData, type, showCheckbox, selectData } = this.state;

    const objectives = projectObjective.objectives || [];
    const columns = [...this.commonColumns, ...this.diffColumns];
    const projectDetail = projectBasic.projectDetail || {};
    const datasource = projectDetail.datasource;
    const objectiveData = objectives.map(it => it.objectiveVO);
    const exNewReopenObjective = objectiveData.filter(it => it.objectiveStatus === AIM_TASK_BUG_STATUS_MAP.NEW || it.objectiveStatus === AIM_TASK_BUG_STATUS_MAP.REOPEN) || [];

    return ([
      <Card className={styles.cardStyle} style={{ height: `${currentHeight - 70}px` }}>
        {
          <div>
            <Table
              rowKey={record => record.objectiveId || record.tempId}
              columns={columns}
              dataSource={objectiveData}
              pagination={false}
              size="middle"
              className="u-mgt10"
              expandedRowRender={(record, index) => {
                return (<div className={styles.expandMore}>
                  <FormItem label="目标验收标准" {...getFormLayout(3, 20)}>
                    <div dangerouslySetInnerHTML={{ __html: record.description || '--' }}></div>
                  </FormItem>
                  <FormItem label="目标完成情况" {...getFormLayout(3, 20)}>
                    <div style={{ whiteSpace: 'pre-line' }}>{record.completeDescription || '--'}</div>
                  </FormItem>
                  <FormItem label="目标达成评价" {...getFormLayout(3, 20)}>
                    <div style={{ whiteSpace: 'pre-line' }}>{record.achievementEvaluation || '--'}</div>
                  </FormItem>
                  <FormItem label="其他验收意见" {...getFormLayout(3, 20)}>
                    <div style={{ whiteSpace: 'pre-line' }}>{record.initiateSuggestion || '--'}</div>
                  </FormItem>
                </div>);
              }}
              expandIcon={(props) => this.customExpandIcon(props)}
              onRow={(record) => {
                return {
                  className: 'f-csp',
                  onClick: (e) => {
                    e.stopPropagation();
                    // 只有详情页弹出

                    drawerDelayFun(() => {
                      this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: record.issueKey });
                    }, 200);
                  }
                };
              }}
              scroll={{ y: currentHeight - 200 }}
              rowSelection={showCheckbox ? {
                selectedRowKeys: selectData.map(it => it.objectiveId || it.tempId),
                hideDefaultSelections: true,
                columnTitle: ' ',
                onChange: (value, data) => {
                  this.setState({ selectData: data });
                },
                getCheckboxProps: (record) => {
                  return {
                    disabled: record.objectiveStatus !== AIM_TASK_BUG_STATUS_MAP.NEW && record.objectiveStatus !== AIM_TASK_BUG_STATUS_MAP.REOPEN,
                  };
                }
              } : null}
            />
            {
              datasource === PROJECT_DATASOURCE.EP && detailType === 'detail' && roleGroup !== ISSUE_ROLE_VALUE_MAP.READ &&
              <div className={`f-jcsb-aic u-mgt10 ${styles.batchUpdate}`}>
                {
                  !showCheckbox &&
                  <span className="u-mgl15">
                    共{selectData.length}个
                  </span>
                }
                {
                  showCheckbox &&
                  <span className="u-mgl15">
                    <Checkbox
                      onChange={(e) => this.setState({
                        selectData: e.target.checked ? exNewReopenObjective : []
                      })}
                      checked={selectData.length === exNewReopenObjective.length}
                    ></Checkbox>
                    <span className="u-mgr10 u-mgl10">
                      已选择{selectData.length}项
                    </span>
                    {
                      !!selectData.length && <a onClick={() => this.handleBatchClose()}>批量解绑</a>
                    }
                  </span>
                }
                <span>
                  {
                    showCheckbox ?
                      <Button onClick={() => { this.setState({ showCheckbox: false, selectData: [] }) }}>取消操作</Button>
                      :
                      <Button onClick={() => this.setState({ showCheckbox: true })} disabled={!exNewReopenObjective.length}>批量操作</Button>
                  }
                </span>
              </div>
            }
          </div>
        }
      </Card>,
      <div onClick={(e) => e.stopPropagation()}>
        <Modal
          title={diffOperationsTitleMap[type]}
          visible={visible}
          width={type === 'edit' ? 800 : 500}
          maskClosable={false}
          footer={this.getFooter()}
          onCancel={() => {
            this.setState({ visible: false }); this.props.form.resetFields();
          }}
          className={type === 'edit' ? 'modal-createissue-height' : ''}
          destroyOnClose
        >
          {
            type === 'edit' && <NewAims form={this.props.form} aimData={aimData} {...this.props} />
          }

          {
            type === 'cancel' &&
            <div>
              <div className="u-mgb10">请确定是否要取消目标？</div>
              <FormItem {...formLayout} label="取消目标原因">
                {
                  getFieldDecorator('cancelReason', {
                    rules: [{ required: true, message: '此项必填！' }]
                  })(
                    <TextArea />
                  )
                }
              </FormItem>
            </div>
          }

          {
            type === 'reopen' &&
            <div>
              <div className="u-mgb10">请确定是否要重新打开目标？</div>
            </div>
          }

          {
            type === 'delete' &&
            <div>
              <div className="u-mgb10">确定要删除目标吗？</div>
            </div>
          }

          {
            type === 'unbind' &&
            <div>
              <div className="u-mgb10">确定要解绑目标吗？</div>
            </div>
          }
        </Modal></div>,
    ]);
  }
}
const mapStateToProps = (state) => {
  return {
    acceptList: state.objective.acceptList,
    productByUser: state.product.productList,
    customSelect: state.aimEP.customSelect,
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
