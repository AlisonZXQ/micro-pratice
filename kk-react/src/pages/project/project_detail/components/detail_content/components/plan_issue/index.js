import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  Popover,
  Menu,
  Modal,
  Dropdown,
  Divider,
  message,
  Card,
  Checkbox,
  Button,
  Popconfirm,
} from 'antd';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { arrDeduplication, getIssueCustom, estimateCost, drawerDelayFun, calculateDwm, getMentionUsers } from '@utils/helper';
import DropDown from '@components/CustomAntd/drop_down';
import JiraIcon from '@components/JiraIcon';
import EpIcon from '@components/EpIcon';
import DefineDot from '@components/DefineDot';
import TextOverFlow from '@components/TextOverFlow';
import CreateRequirement from '@components/CreateIssues/create_requirement'; // 创建需求
import CreateTask from '@components/CreateIssues/create_task'; // 创建任务/子任务
import { issueAddMilestoneWBS, issueDeleteMilestoneWBS, createIssueWBS, issueBindAimWBS, issueunBindProjectWBS, issuDeleteProjectWBS } from '@services/project';
import { issue_type_name_map } from '@shared/ReceiptConfig';
import { FST_TYPE_MAP } from '@shared/ProductSettingConfig';
import MyIcon from '@components/MyIcon';
import { jiraStatusMap } from '@shared/ProjectConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import { warnModal, deleteModal, customExpandIcon, cascaderOpt, handleShowPersonConfirm } from '@shared/CommonFun';
import BatchUpdate from '@components/BatchUpdate';
import RemoveToVersion from './components/RemoveToVersion';
import QueryArea from './components/QueryArea';
import EditStatusEP from './components/edit_status_ep';
import { setTreeData, getTitle, getList, getAllKeys, showRemoveFromProject, processData } from './components/PlanIssueFun';

import styles from './index.less';

const MenuItem = Menu.Item;

class DetailTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterObj: {},
      visible: false,
      type: '', // 标记是什么操作
      record: {},
      loading: false,
      expandKeys: [],
      manpowerData: [],

      showCheckbox: false,
      selectData: [],
    };

    this.commmonColumns = [{
      title: () => {
        const { plannings } = this.props;
        const { expandKeys } = this.state;
        const allExpandKeys = getAllKeys(plannings);
        return (
          <span style={allExpandKeys.length > 0 ? {} : { marginLeft: '26px' }}>
            {
              !!allExpandKeys.length &&
              <span>
                {
                  allExpandKeys.length === expandKeys.length ?
                    <MyIcon type="icon-kuozhananniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => this.handleCollapseAll()} />
                    :
                    <MyIcon type="icon-shousuoanniu" className="f-fs3 u-mgr10 f-csp" style={{ position: 'relative', top: '1px' }} onClick={() => this.handleExpandAll()} />
                }
              </span>
            }
            标题
          </span>
        );
      },
      dataIndex: 'summary',
      width: '15vw',
      render: (text, record) => {
        const { projectBasic } = this.props;

        const projectDetail = projectBasic.projectDetail || {};
        const dataSource = projectDetail.datasource;

        return (<Popover
          content={text}>
          <span
            style={{ maxWidth: '12vw', lineHeight: '10px' }}
            className="f-vam f-toe f-ib"
          >
            {dataSource === PROJECT_DATASOURCE.EP ?
              <EpIcon type={record.issuetype} className='f-fs3' /> :
              <JiraIcon type={record.issuetype} />
            }
            <a className="u-mgl10"
              href={dataSource !== PROJECT_DATASOURCE.EP && record.jiraUrl}
              rel="noopener noreferrer"
              target="_blank"
            >{text}</a>
          </span>
        </Popover>);
      },
    }, {
      title: '状态',
      dataIndex: 'status',
      width: '8vw',
      render: (text, record) => {
        const { projectBasic } = this.props;

        const projectDetail = projectBasic.projectDetail || {};
        const dataSource = projectDetail.datasource;

        const { issueRole } = record;

        const txt = ['开始', '重新打开', '关闭'].includes(text) ? text : '其他';
        return (
          text ?
            (dataSource === PROJECT_DATASOURCE.EP && issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE) ?
              <EditStatusEP record={record} /> :
              <DefineDot
                text={txt}
                statusColor={jiraStatusMap}
                displayText={text}
              />
            : '-'
        );
      }
    }, {
      title: '负责人',
      dataIndex: 'assignee',
      width: '5vw',
      render: (text) => {
        return (
          text ? <TextOverFlow content={text} maxWidth={'5vw'} /> : '-'
        );
      }
    }, {
      title: '验证人',
      dataIndex: 'verifier',
      width: '5vw',
      render: (t, record) => {
        return (
          t ? <TextOverFlow content={t} maxWidth={'5vw'} /> : '-'
        );
      }
    }, {
      title: () => {
        return <span>到期日</span>;
      },
      dataIndex: 'dueDate',
      width: '8vw',
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
        let beforeDate = a.dueDate || '';
        let nextDate = b.dueDate || '';
        if (beforeDate > nextDate) {
          return 1;
        }
        if (beforeDate < nextDate) {
          return -1;
        }
        return 0;
      },
      render: (text) => {
        return (
          text ? <TextOverFlow content={text} maxWidth={'8vw'} /> : '-'
        );
      }
    }];

    this.manpowerColumns = [{
      title: '预估工作量(人天)',
      dataIndex: 'dwManpower',
      key: 'dwManpower',
      width: '8vw',
      render: (text, record) => {
        return (text ?
          <span className="f-ib">
            {calculateDwm((record && record.dwManpower && record.dwManpower.estimate) || 0)}
          </span> : '-'
        );
      },
    }];

    this.versionColumns = [{
      title: '版本',
      dataIndex: 'versionVO',
      width: '6vw',
      render: (text) => {
        return <div>
          {text ? <a href={`/v2/manage/version/detail?productid=${text.productId}&versionid=${text.id}`}
            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <TextOverFlow content={text.name} maxWidth={'5vw'} /></a> : '-'}
        </div>;
      }
    }];

    this.milestoneColumns = [
      {
        width: 30,
        dataIndex: 'milestoneName',
        render: (text) => {
          return <span className='f-ib'>{
            text && text.length ? <MyIcon type="icon-lichengbei1" style={{ fontSize: '20px', position: 'relative', top: '4px' }} /> : ''
          }</span>;
        }
      }
    ];

    this.operationsColumns = [
      {
        title: '操作',
        dataIndex: 'caozuo',
        width: 100,
        render: (text, record) => {
          const { currentMemberInfo: { roleGroup }, plannings } = this.props;
          const list = getList(plannings);
          const aimArr = list.filter(it => it.issuetype === '目标' || it.issuetype === 'Epic') || [];
          return <div>
            {record.issueKey !== 'bugGroup' &&
              <DropDown
                overlay={() => this.getMenu(record)} disabled={roleGroup === ISSUE_ROLE_VALUE_MAP.READ}
                visible={this.state[`${record.id}`]}
                onVisibleChange={(visible) => this.setState({ [record.id]: visible })}
                onClick={(e) => e.stopPropagation()}
              >
              </DropDown>
            }

            {
              record.isIndependentIssue && record.issuetype !== '缺陷' &&
              <span>
                <Divider type="vertical" />
                <Dropdown overlay={() => this.getMenuAimList(record)} disabled={!aimArr.length || roleGroup === ISSUE_ROLE_VALUE_MAP.READ}>
                  <a onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>关联至</a>
                </Dropdown>
              </span>
            }
          </div>;
        }
      }
    ];
  }

  handleMoveToAim = (record, it) => {
    const { id } = this.props;
    warnModal({
      title: `确认要将该单据移到 ${it.summary} 下吗？`,
      okCallback: () => {
        const params = {
          issueKey: record.issueKey,
          parentIssuekey: it.issueKey,
          projectId: Number(id),
        };
        issueBindAimWBS(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('移动单据成功！');
          this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  checkPermission4MoveToAim = (record, it) => {
    this.handleMoveToAim(record, it);
  }

  getMenuAimList = (record) => {
    const { plannings } = this.props;
    const list = getList(plannings);
    const aimArr = list.filter(it => it.issuetype === '目标' || it.issuetype === 'Epic') || [];

    return (<Menu>
      {
        aimArr.map(it => (<MenuItem key={it.id}>
          <a onClick={(e) => { e.stopPropagation(); this.checkPermission4MoveToAim(record, it) }}>{it.summary}</a>
        </MenuItem>))
      }
    </Menu>);
  }

  // wbs添加里程碑
  issueAddMilestone = (id) => {
    const { id: projectId } = this.props;
    const params = {
      projectId,
      planningId: id,
    };
    issueAddMilestoneWBS(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加里程碑成功！');
      this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
      this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  // wbs解绑里程碑
  issueDeleteMilestone = (id) => {
    const { id: projectId } = this.props;
    const params = {
      projectId,
      planningId: id,
    };
    issueDeleteMilestoneWBS(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('取消里程碑成功！');
      this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
      this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  // 获取更新后的已选择规划内容
  getPlanningData = () => {
    const { productList, id } = this.props;
    const params = {
      projectId: id,
      products: productList.map(it => it.id),
    };
    this.props.dispatch({ type: 'project/getPlanningData', payload: params });
  }

  handleRemoveFromProject = (record) => {
    const { id } = this.props;
    deleteModal({
      title: '确定移除该单据吗？',
      okCallback: () => {
        const params = {
          issueKey: record.issueKey,
          projectId: Number(id),
        };
        issueunBindProjectWBS(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('移除该单据成功！');
          this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
          this.getPlanningData();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handleDelete = (record) => {
    const { id } = this.props;
    deleteModal({
      title: '确定删除该单据吗？',
      okCallback: () => {
        const params = {
          issueKey: record.issueKey,
          projectId: Number(id),
        };
        issuDeleteProjectWBS(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('单据删除成功！');
          this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
          // 规划内容已经选择的单据
          this.getPlanningData();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  checkPermission4CreateRequirement = (record) => {
    this.setState({ visible: true, type: 'story', record });
  }

  checkPermission4CreateTask = (record) => {
    this.setState({ visible: true, type: 'task', record });
  }

  checkPermission4CreateSubTask = (record) => {
    this.setState({ visible: true, type: 'subtask', record });
  }

  checkPermission4AddMileStone = (record) => {
    this.issueAddMilestone(record.id);
  }

  checkPermission4DeleteMileStone = (record) => {
    this.issueDeleteMilestone(record.id);
  }

  checkPermission4RemoveFromProject = (record) => {
    this.handleRemoveFromProject(record);
  }

  checkPermission4Delete = (record) => {
    this.handleDelete(record);
  }

  getMenu = (record) => {
    const { projectBasic } = this.props;
    // jiraFstType一级拆分类型 1按Task, 2按SubTask
    const fstType = projectBasic && projectBasic.subProductVO && projectBasic.subProductVO.fstType;
    const subProductId = projectBasic && projectBasic.subProductVO && projectBasic.subProductVO.id;
    const issuetype = record && record.issuetype;
    const milestoneName = record.milestoneName;
    const isRelateMilestone = record.isRelateMilestone;
    const dataSource = projectBasic && projectBasic.projectDetail && projectBasic.projectDetail.datasource;
    // 创建需求：'目标', 'Epic'
    // 创建任务：'需求', '故事', '目标', 'Epic',
    // 创建子任务：'任务'
    // 设为里程碑：'目标', 'Epic', 需求', '故事', '任务', '子任务',
    // 取消里程碑：'目标', 'Epic', 需求', '故事', '任务', '子任务',
    // 项目中移除：'需求', '故事', 任务', '缺陷'
    // 删除：'需求', '故事', 任务', '子任务', '缺陷'
    // 排入版本：'需求', '故事', '任务', '缺陷'

    return (<Menu>
      {
        ['目标', 'Epic'].includes(issuetype) &&
        <MenuItem key="0">
          <a onClick={(e) => {
            e.stopPropagation();
            this.checkPermission4CreateRequirement(record);
            this.closeMoreVisible(record.id);
          }}>创建需求</a>
        </MenuItem>
      }
      {
        ['需求', '故事', '目标', 'Epic'].includes(issuetype) && (dataSource === PROJECT_DATASOURCE.EP || (dataSource !== PROJECT_DATASOURCE.EP && fstType === 1)) &&
        ['需求', '故事', '目标', 'Epic'].includes(issuetype) && (dataSource === PROJECT_DATASOURCE.EP || (dataSource !== PROJECT_DATASOURCE.EP && fstType === 1)) &&
        <MenuItem key="1">
          <a onClick={(e) => {
            e.stopPropagation();
            this.checkPermission4CreateTask(record);
            this.closeMoreVisible(record.id);
          }}>创建任务</a>
        </MenuItem>
      }
      {
        ['任务'].includes(issuetype) && fstType === FST_TYPE_MAP.TASK &&
        <MenuItem key="2">
          <a onClick={(e) => {
            e.stopPropagation();
            this.checkPermission4CreateSubTask(record);
            this.closeMoreVisible(record.id);
          }}>创建子任务</a>
        </MenuItem>
      }
      {
        ['需求', '故事'].includes(issuetype) && fstType === FST_TYPE_MAP.SUBTASK && dataSource !== PROJECT_DATASOURCE.EP &&
        <MenuItem key="3">
          <a onClick={(event) => {
            event.stopPropagation();
            this.checkPermission4CreateSubTask(record);
            this.closeMoreVisible(record.id);
          }}>创建子任务</a>
        </MenuItem>
      }
      {
        ['目标', 'Epic', '需求', '故事', '任务', '子任务'].includes(issuetype) && !milestoneName.length &&
        <MenuItem key="4">
          {
            <a onClick={(e) => {
              e.stopPropagation();
              this.checkPermission4AddMileStone(record);
              this.closeMoreVisible(record.id);
            }}>设为里程碑</a>
          }
        </MenuItem>
      }
      {
        ['目标', 'Epic', '需求', '故事', '任务', '子任务'].includes(issuetype) && !!milestoneName.length && isRelateMilestone &&
        <MenuItem key="5">
          {
            <a onClick={(e) => {
              e.stopPropagation();
              this.checkPermission4DeleteMileStone(record);
              this.closeMoreVisible(record.id);
            }}>取消里程碑</a>
          }
        </MenuItem>
      }
      {
        showRemoveFromProject(record, dataSource) &&
        <MenuItem key="6">
          <a onClick={(e) => {
            e.stopPropagation();
            this.checkPermission4RemoveFromProject(record);
            this.closeMoreVisible(record.id);
          }}>项目中移除</a>
        </MenuItem>
      }
      {
        ['需求', '故事', '任务', '子任务', '缺陷'].includes(issuetype) &&
        <MenuItem key="7">
          <a onClick={(e) => {
            e.stopPropagation();
            this.checkPermission4Delete(record);
            this.closeMoreVisible(record.id);
          }}>删除</a>
        </MenuItem>
      }
      {
        // 数据源是EP且单据的子产品和项目下关联的子产品一致
        ['需求', '故事', '任务', '缺陷'].includes(issuetype) && dataSource === PROJECT_DATASOURCE.EP && record.subProductId === subProductId && !record.versionVO &&
        <MenuItem key="8">
          <RemoveToVersion
            closeMoreVisible={this.closeMoreVisible}
            {...this.props}
            data={record} />
        </MenuItem>
      }
    </Menu>);
  }

  closeMoreVisible = (id) => {
    this.setState({ [id]: false });
  }

  handleExpandAll = () => {
    const { plannings } = this.props;
    this.setState({ expandKeys: getAllKeys(plannings) });
  }

  handleCollapseAll = () => {
    this.setState({ expandKeys: [] });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    this.setState({ filterObj: newFilterObj });
  }

  handleOk = (issueRole2ProjectMember) => {
    // type story, task, subtask
    const { id } = this.props;
    const { customSelect } = this.props;
    const { type, record } = this.state;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (values.estimate_cost && estimateCost(values.estimate_cost)) {
        return message.warn('预估工作量不合法！');
      }

      const custom_field_values = getIssueCustom(values, customSelect);
      const params = {
        parentid: 0,
        projectId: Number(id),
        parentIssuekey: record.issueKey,
        epic: record.issueKey,
        issuetype: issue_type_name_map[type],
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        moduleid: values.moduleid ? values.moduleid : 0,
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
        issueRole2ProjectMember
      };

      this.setState({ loading: true });
      createIssueWBS(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        this.setState({ visible: false });
        this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
        this.props.dispatch({ type: 'project/getProjectMember', payload: { id: id } });
        this.getPlanningData();
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  handleRowExpand = (flag, record) => {
    const { expandKeys } = this.state;
    let newExpandKeys = [...expandKeys];
    if (flag) {
      newExpandKeys.push(record.issueKey);
    } else {
      newExpandKeys = newExpandKeys.filter(i => i !== record.issueKey);
    }
    this.setState({ expandKeys: newExpandKeys });
  }

  render() {
    // detailType项目主页的值是detail否则是其他审批页
    const { plannings, projectBasic, type: detailType, currentHeight, stoneName,
      currentMemberInfo: { roleGroup }, form: { getFieldsValue }, projectMember } = this.props;
    const { visible, type, loading, record, expandKeys, showCheckbox, selectData, filterObj } = this.state;

    const data = projectBasic ? projectBasic : {};
    const projectDetail = data.projectDetail || {};
    const datasource = projectDetail.datasource;
    const projectId = projectDetail.projectId;
    let baseColumns = [];
    if (datasource === PROJECT_DATASOURCE.EP) {
      baseColumns = [...this.commmonColumns, ...this.manpowerColumns, ...this.versionColumns];
    }
    else {
      baseColumns = [...this.commmonColumns, ...this.versionColumns];
    }

    const columns4Planning = detailType === 'detail' ? [...baseColumns, ...this.operationsColumns, ...this.milestoneColumns] : [...baseColumns, ...this.milestoneColumns];
    const list = getList(plannings);

    const productid = data.products && data.products[0] && data.products[0].id;
    let parentData = record;
    parentData.version = record.versionVO;

    const selectKeys = selectData.map(it => it.issueKey);
    const processDataResult = processData(list, stoneName, filterObj) || [];

    const allSelectData = processDataResult.filter(it => !it.issueKey.includes('Objective'));

    return (<div className={styles.detailContent} style={{ height: currentHeight - 45 }}>
      <Card>
        <div className="u-mgt10 u-mgb10">
          <QueryArea
            issueTypeArr={arrDeduplication(list && list.map(it => it.issuetype))}
            statusArr={arrDeduplication(list && list.map(it => it.status))}
            assigneeArr={arrDeduplication(list && list.map(it => it.assignee))}
            updateFilter={this.updateFilter}
          />
        </div>

        <Table
          rowKey={record => record.issueKey}
          size="middle"
          columns={columns4Planning}
          dataSource={setTreeData(processDataResult, projectBasic)}
          expandedRowKeys={expandKeys}
          pagination={false}
          onExpand={(flag, record) => this.handleRowExpand(flag, record)}
          expandIcon={(props) => customExpandIcon(props)}
          scroll={processDataResult && processDataResult.length > 8 ? { y: currentHeight ? currentHeight - 220 : 500 } : {}}
          onRow={(record) => {
            return {
              className: 'f-csp',
              onClick: (e) => {
                e.stopPropagation();
                drawerDelayFun(() => {
                  if (datasource === PROJECT_DATASOURCE.EP && record.issueKey !== 'bugGroup') {
                    this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: record.issueKey });
                  }
                }, 200);
              }
            };
          }}
          rowSelection={showCheckbox ? {
            selectedRowKeys: selectKeys,
            hideDefaultSelections: true,
            columnTitle: ' ',
            onSelect: (data, selected) => {
              const newSelectData = cascaderOpt(data, selected, selectData);
              this.setState({ selectData: newSelectData });
            },
            getCheckboxProps: (record) => {
              return {
                disabled: record.issueKey.includes('Objective') || record.issueKey.includes('bugGroup')
              };
            }
          } : null}
        />
        {
          !!processDataResult.length && datasource === PROJECT_DATASOURCE.EP && detailType === 'detail' && roleGroup !== ISSUE_ROLE_VALUE_MAP.READ &&
          <div className={`f-jcsb-aic u-mgt10 ${styles.batchUpdate}`}>
            {
              !showCheckbox &&
              <span className="u-mgl15">
                共{allSelectData.length}个
              </span>
            }
            {
              showCheckbox &&
              <span className="u-mgl25">
                <Checkbox
                  onChange={(e) => this.setState({
                    selectData: e.target.checked ? allSelectData : []
                  })}
                  checked={selectData.length === allSelectData.length}
                ></Checkbox>
                <span className="u-mgr10 u-mgl10">
                  已选择
                  <span>{selectData.length}</span>项
                </span>
                {
                  !!selectData.length &&
                  <BatchUpdate
                    data={selectData}
                    productId={productid}
                    refreshFun={() => {
                      this.setState({ selectData: [] });
                      this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
                    }}
                  />
                }
              </span>
            }
            <span>
              {
                showCheckbox ?
                  <Button onClick={() => { this.setState({ showCheckbox: false, selectData: [] }) }}>取消操作</Button>
                  :
                  <Button onClick={() => this.setState({ showCheckbox: true })} disabled={!allSelectData.length}>批量操作</Button>
              }
            </span>
          </div>
        }

      </Card>
      <Modal
        visible={visible}
        width={type === 'version' ? 600 : 1000}
        title={getTitle(type)}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
        okButtonProps={{ loading }}
        bodyStyle={{ paddingTop: '0px' }}
        maskClosable={false}
        className="modal-createissue-height"
        footer={<span>
          <Button className="u-mgr10" onClick={() => this.setState({ visible: false })}>取消</Button>
          {
            handleShowPersonConfirm(getFieldsValue(), projectMember) ?
              <Popconfirm
                title="是否将单据相关人员加入到项目中?"
                onConfirm={() => this.handleOk(true)}
                onCancel={() => this.handleOk(false)}
                okText="是"
                cancelText="否"
              >
                <Button type="primary">确定</Button>
              </Popconfirm>
              :
              <Button type="primary" onClick={() => this.handleOk(false)}>确定</Button>
          }
        </span>}
      >
        {
          type === 'task' && <CreateTask form={this.props.form} {...this.props} productid={productid} parentData={parentData} />
        }
        {
          type === 'subtask' && <CreateTask form={this.props.form} createType="childtask" parentData={parentData} {...this.props} productid={productid} />
        }
        {
          type === 'story' && <CreateRequirement form={this.props.form} {...this.props} productid={productid} />
        }
      </Modal>
    </div>);
  }
}

export default withRouter(Form.create()(DetailTable));
