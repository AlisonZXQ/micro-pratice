import React, { Component, } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, Button, Checkbox, message, Pagination, Tooltip, Popover } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import {
  getIssueCustom, getDisplayCustomField, estimateCost,
  compareFilter, filterCustom, serverFilterData, hasPermission, drawerDelayFun, getMentionUsers, calculateDwm,
  getSystemDescription
} from '@utils/helper';
import MyIcon from '@components/MyIcon';
import Tool from '@components/Tool';
import Columns from '@components/Columns';
import QueryMore from '@components/QueryMore';
import Filter from '@components/Filter';
import IssueEditTitle from '@components/IssueEditTitle';
import EditSelect from '@components/EditSelect';
import EditSelectUser from '@components/EditSelectUser';
import EditStatus from '@pages/receipt/components/drawer_shared/bug/EditStatus';
import OrderTime from '@components/OrderTime';
import EpIcon from '@components/EpIcon';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import CreateBug from '@components/CreateIssues/create_bug';
import SearchNameId from '@pages/receipt/components/search_name_id';
import ListDelete from '@pages/receipt/components/list_delete';
import {
  getBugCustomList, getTotalCount, getBugList, deleteBugItem,
  updateBugState, updateBug, updateRequireemail
} from '@services/bug';
import { createBill } from '@services/receipt';
import { bugTaskNameArr, ISSUE_ROLE_VALUE_MAP, USERGROUP_PERMISSION_KEY_MAP } from '@shared/CommonConfig';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import {
  levelMap, bQueryMoreList, defaultbugColumns, timeMap, orderMap,
  bugColumns, onlinebugMap, orderFieldData, classifyBug, BUG_STATUS_MAP
} from '@shared/BugConfig';
import { handleSearchUser, getUserList, deleteModal, warnModal } from '@shared/CommonFun';
import BatchUpdate from '@components/BatchUpdate';
import TextOverFlow from '@components/TextOverFlow';
import QueryArea from './components/QueryArea';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

const isEmpty = (text) => {
  return text ? text : '--';
};

const dispatchType = 'design/saveDes';

const isFixedRight = () => {
  const localColumn = JSON.parse(localStorage.getItem('bug_column')); //计算是否需要fixed:right
  let defaultColumn = [];
  defaultbugColumns.forEach((it) => {
    defaultColumn.push(it.key);
  });
  const currentColumn = localColumn ? localColumn : defaultColumn;
  return currentColumn.length > 6;
};

const momentDate = (date) => {
  if (date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  } else {
    return '--';
  }
};

class Index extends Component {
  state = {
    subProductList: [],
    loading: false,
    columns: [],
    newQueryMoreList: [],
    newbugColumns: [],
    total: 0,
    orderby: 1,
    order: 2,
    visible: false,
    dataSource: [],
    createLoading: false,
    params: {
      offset: 0,
      limit: 10,
    },
    orderFieldData: [],
    orderData: [
      { name: '升序', key: 'asc' },
      { name: '降序', key: 'desc' },
    ],

    checkData: [],

    userList: [],
    openOperate: false,
    createOther: false,
    hoverRowId: 0,
    isChangeFilter: false,
    defaultCurrentFilter: {},
    defaultCurrentQcl: [],
  };
  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        return (
          <a
            onClick={(e) => {
              e.stopPropagation();
              if (!record.issueRole) {
                return message.error('您没有查看权限！');
              } else {
                window.open(`/v2/my_workbench/bugdetail/Bug-${record.bug.id}`);
              }
            }}
          >
            {`Bug-${record.bug.id}`}
          </a>
        );
      },
    },
    {
      title: '子产品',
      dataIndex: 'subProductId',
      key: 'subProductId',
      render: (text, record) => {
        return (
          <span>
            <TextOverFlow content={isEmpty(record.subproduct && record.subproduct.name)} maxWidth="150px" />
          </span>
        );
      },
    },
    {
      title: '模块',
      dataIndex: 'moduleid',
      key: 'moduleid',
      render: (text, record) => {
        return (
          <span>{record && record.productModule && record.productModule.name}</span>
        );
      },
    },
    {
      title: '标题',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        return <div>
          <span className='f-vam' style={{ marginRight: '4px' }}>
            <EpIcon type='bug' className='f-fs3'></EpIcon>
          </span>
          <IssueEditTitle
            hoverRowId={this.state.hoverRowId}
            rowId={record.bug.id}
            title={record.bug.name}
            handleSave={(title) => this.handleSaveTitle(title, record.bug.id)}
            columns={this.state.columns}
          />
        </div>;
      },
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (text, record) => {
        return (record.bug.state ?
          <span>
            <EditStatus
              value={record.bug.state}
              listDetail={record}
              type="bug"
              bgHover={false}
              refreshFun={this.getRefreshList}
            />
          </span>
          : '-');
      }
    },
    {
      title: '严重程度',
      dataIndex: 'level',
      key: 'level',
      render: (text, record) => {
        return <span className='f-ib' style={{ width: '80px' }}>
          <EditSelect
            value={record.bug.level}
            dataSource={levelMap}
            handleSaveSelect={(value) => this.handleSaveSelectLevel(value, record.bug.id)}
            required={true}
            type='list'
          />
        </span>;
      },
    },
    {
      title: '线上缺陷',
      dataIndex: 'onlinebug',
      key: 'onlinebug',
      render: (text, record) => {
        const obj = onlinebugMap.find((it) => it.id === record.bug.onlinebug);
        return (
          <span>{obj ? obj.name : '--'}</span>
        );
      },
    },
    {
      title: 'BUG分类',
      dataIndex: 'bugtype',
      key: 'bugtype',
      render: (text, record) => {
        const obj = classifyBug.find(it => it.id === record.bug.bugtype) || {};
        return (
          <span>{obj.name ? obj.name : '-'}</span>
        );
      },
    },
    {
      title: '预估工作量',
      dataIndex: 'estimate_cost',
      key: 'estimate_cost',
      render: (text, record) => {
        return (
          <span>{(record && record.bug && record.bug.estimate_cost) || '--'}</span>
        );
      },
    },
    {
      title: '到期日',
      dataIndex: 'expect_releasetime',
      key: 'expect_releasetime',
      render: (text, record) => {
        const time = record && record.bug && record.bug.expect_releasetime;
        return (
          <span>{time ? moment(time).format('YYYY-MM-DD') : '--'}</span>
        );
      },
    },
    {
      title: '负责人',
      dataIndex: 'responseuid',
      key: 'responseuid',
      render: (text, record) => {
        return record.responseUser && record.responseUser.email ? <EditSelectUser
          issueRole={record.issueRole}
          value={record.responseUser.email}
          dataSource={getUserList(record.responseUser, this.state.userList)}
          handleSearch={(value) => handleSearchUser(value, (result) => this.setState({ userList: result }))}
          handleSaveSelect={(value) => this.handleUpdateResponse(value, record.bug.id)}
          required={true}
          type='list'
        /> : '--';
      },
    },
    {
      title: '报告人',
      dataIndex: 'submituid',
      key: 'submituid',
      render: (text, record) => {
        return record.submitUser && record.submitUser.email ? <EditSelectUser
          issueRole={record.issueRole}
          value={record.submitUser.email}
          dataSource={getUserList(record.submitUser, this.state.userList)}
          handleSearch={(value) => handleSearchUser(value, (result) => this.setState({ userList: result }))}
          handleSaveSelect={(value) => this.handleUpdateSubmit(value, record.bug.id)}
          required={true}
          type='list'
        /> : '--';
      },
    },
    {
      title: '验证人',
      dataIndex: 'requireuid',
      key: 'requireuid',
      render: (text, record) => {
        return record.requireUser && record.requireUser.email ? <EditSelectUser
          issueRole={record.issueRole}
          value={record.requireUser.email}
          dataSource={getUserList(record.requireUser, this.state.userList)}
          handleSearch={(value) => handleSearchUser(value, (result) => this.setState({ userList: result }))}
          handleSaveSelect={(value) => this.handleUpdateRequire(value, record.bug.id)}
          type='list'
        /> : '--';
      },
    },
    {
      title: '解决版本',
      dataIndex: 'fixversionid',
      key: 'fixversionid',
      render: (text, record) => {
        const version = record.version && record.version.name;
        return (
          <Popover content={version || '--'} trigger="hover">
            <span className='f-ib f-toe' style={{ width: '100px' }}>{version || '--'}</span>
          </Popover>
        );
      },
    },
    {
      title: '发现版本',
      dataIndex: 'findversionid',
      key: 'findversionid',
      render: (text, record) => {
        const findVersion = record.findVersion && record.findVersion.name;
        return (
          <Popover content={findVersion || '--'} trigger="hover">
            <span className='f-ib f-toe' style={{ width: '100px' }}>{findVersion || '--'}</span>
          </Popover>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'addtime',
      key: 'addtime',
      render: (text, record) => {
        return (
          <span>{momentDate(record && record.bug && record.bug.addtime)}</span>
        );
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatetime',
      key: 'updatetime',
      render: (text, record) => {
        return (
          <span>{momentDate(record && record.bug && record.bug.updatetime)}</span>
        );
      },
    },
    {
      title: '标签',
      dataIndex: 'tag',
      key: 'tag',
      render: (text, record) => {
        const arr = [];
        record.tagList && record.tagList.map((item) => {
          arr.push(item.name);
        });
        if (arr.length) {
          if (arr.length === 1) {
            return arr[0];
          } else {
            return (<Tooltip title={<span>
              {
                arr.map(it => <div>
                  {it}
                </div>)
              }
            </span>}>
              <div className={styles.tagStyle}>{arr.length}</div>
            </Tooltip>);
          }
        } else {
          return '--';
        }
      },
    },
    {
      title: '预估工作量(人天)',
      dataIndex: 'dwManpower',
      key: 'dwManpower',
      render: (text, record) => {
        return (
          <span>{calculateDwm((record && record.dwManpower && record.dwManpower.estimate) || 0)}</span>
        );
      },
    },
  ];

  componentDidMount() {
    this.setState({ orderFieldData });
    const localDefaultColumns = JSON.parse(localStorage.getItem('bug_column'));
    const defaultColumns = localDefaultColumns || defaultbugColumns.map(x => { return x.key });
    localStorage.setItem('bug_column', JSON.stringify(defaultColumns));

    const { lastProduct } = this.props;
    if (lastProduct.id) {
      this.getInitData(lastProduct.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const propsId = this.props.lastProduct.id;
    const nextPropsId = nextProps.lastProduct.id;
    if (propsId !== nextPropsId) {
      this.getInitData(nextPropsId);
    }
  }

  //防止EditStatus组件接收过来的参数
  getRefreshList = () => {
    this.getList();
  }

  getList = (pid) => {
    this.setState({ checkData: [] });//恢复批量操作
    const productid = pid || this.props.location.query.productid;
    this.setState({ loading: true });
    const { params, orderby, order } = this.state;
    let params2 = {
      ...params,
      productid,
      offset: params.offset ? params.offset : 0,
      limit: params.limit ? params.limit : 10,
      orderby: timeMap[orderby] === 'subProductId' ? 'sub_product_id' : timeMap[orderby],
      order: orderMap[order],
    };
    const sessionParams = JSON.parse(sessionStorage.getItem(`bugListQuery_${productid}`));
    if (sessionParams) {
      params2 = {
        ...sessionParams,
        orderby: timeMap[orderby] === 'subProductId' ? 'sub_product_id' : timeMap[orderby],
        order: orderMap[order],
      };
    }
    this.setState({ params: params2 });
    getTotalCount(params2).then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      this.setState({ total: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });
    getBugList(params2).then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      localStorage.setItem(`bugListQuery`, JSON.stringify(params2));
      this.setState({ dataSource: res.result });
      this.setState({ loading: false });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleSaveTitle = (title, id) => {
    const params = {
      id: id,
      name: title,
    };
    this.updateBug(params);
  }

  handleUpdateResponse = (value, id) => {
    const params = {
      id,
      responseemail: value,
    };
    this.updateBug(params);
  }

  handleUpdateSubmit = (value, id) => {
    const params = {
      id,
      submitemail: value,
    };
    this.updateBug(params);
  }

  handleUpdateRequire = (value, id) => {
    const params = {
      id,
      requireemail: value,
    };
    updateRequireemail(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更改成功！');
      this.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSaveSelectLevel = (value, id) => {
    const params = {
      id: id,
      level: value,
    };
    this.updateBug(params);
  }

  updateBug = (params) => {
    updateBug(params).then(res1 => {
      if (res1.code !== 200) return message.error(res1.msg);
      message.success('更改成功！');
      this.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  changeOrderField = (value) => {
    this.setState({ orderby: value }, () => this.getList());
    let newParams = JSON.parse(localStorage.getItem('bugOrder')) || {};
    newParams.orderby = value;
    if (!newParams.order) {
      newParams.order = 2;
    }
    localStorage.setItem('bugOrder', JSON.stringify(newParams));
  }

  changeOrder = (value) => {
    this.setState({ order: value }, () => this.getList());
    let newParams = JSON.parse(localStorage.getItem('bugOrder')) || {};
    newParams.order = value;
    if (!newParams.orderby) {
      newParams.orderby = 1;
    }
    localStorage.setItem('bugOrder', JSON.stringify(newParams));
  }

  changeState = (record) => {
    const { checkData } = this.state;
    let newCheckData = checkData;
    const id = record.bug.id;
    if (newCheckData.indexOf(id) === -1) {
      newCheckData.push(id);
    } else {
      newCheckData.splice(newCheckData.indexOf(id), 1);
    }
    this.setState({ checkData: newCheckData });
  }

  changeStateAll = (value) => {
    const { dataSource } = this.state;
    let newCheckData = [];
    if (value) {
      dataSource && dataSource.map((item) => {
        newCheckData.push(item.bug.id);
      });
      this.setState({ checkData: newCheckData });
    } else {
      this.setState({ checkData: [] });
    }
  }

  setColumns = (bugColumn) => {
    const { openOperate } = this.state;
    let data = this.columns.filter((it) => {
      if (openOperate) {
        return (bugColumn.indexOf(it.key) > -1);
      } else {
        return (bugColumn.indexOf(it.key) > -1) || it.key === 'caozuo';
      }
    });

    data && data.map((it) => {
      const item = bugColumns.find((i) => i.key === it.key) || { width: 200 };
      if (it.key === 'caozuo') {
        it.fixed = isFixedRight() ? 'right' : '';
      } else {
        it.width = isFixedRight() ? item.width : '';
      }
    });

    if (openOperate) {
      data.unshift(this.checkboxColumn());
    }
    this.setState({ columns: data });
  }

  checkboxColumn = () => {
    return {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 20,
      render: (text, record) => {
        const { checkData } = this.state;
        return (
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            checked={checkData.indexOf(record.bug.id) > -1}
            onChange={() => this.changeState(record)}
          />
        );
      },
    };
  }

  caozuoColumn = () => {
    return {
      title: '操作',
      dataIndex: 'caozuo',
      key: 'caozuo',
      fixed: isFixedRight() ? 'right' : '',
      render: (text, record) => {
        return (<div>
          <ListDelete
            record={record}
            getList={this.getList}
            type='bug'
            handleUpdate={this.updateBug}
            checkPermission4DeleteOpt={this.checkPermission4DeleteOpt} />
        </div>);
      }
    };
  }

  checkPermission4BatchCloseOpt = () => {
    const { lastProduct } = this.props;
    if (!hasPermission(USERGROUP_PERMISSION_KEY_MAP.BUG_ROLE_MANAGE, lastProduct.perssionList)) {
      message.error(NO_OPT_PERMISSION_TIP_MSG);
      return;
    }

    this.changeOperate(true);
  }

  checkPermission4DeleteOpt = (e, record) => {
    e.stopPropagation();

    if (record.issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE) {
      message.error(NO_OPT_PERMISSION_TIP_MSG);
      return;
    }

    this.dltItem(record.bug);
  }

  onAddBtnClick = () => {
    this.setState({ visible: true, createType: 'bug' }, () => this.props.form.resetFields());
  }

  changeOperate = (data) => {
    this.setState({ openOperate: data });
    let checkColumns = this.state.columns;
    if (data) {
      checkColumns.unshift(this.checkboxColumn());
      checkColumns = checkColumns.filter(it => it.key !== 'caozuo');
      checkColumns.map((it) => {
        if (it.key === 'name' && !isFixedRight()) {
          it.width = 400;
        }
      });
    } else {
      checkColumns = checkColumns.filter(it => it.key !== 'checkbox');
      checkColumns.push(this.caozuoColumn());
      checkColumns.map((it) => {
        if (it.key === 'name' && !isFixedRight()) {
          it.width = '';
        }
      });
    }
    this.setState({ columns: checkColumns });
  }

  getInitData = (id) => {

    const params = {
      productid: id,
    };
    getBugCustomList(params).then((res) => { //获取自定义字段
      if (res.code !== 200) { return message.error(res.msg) }
      const newQueryMoreList = JSON.parse(JSON.stringify(bQueryMoreList));
      const newbugColumns = JSON.parse(JSON.stringify(bugColumns));
      let newThisColumns = this.columns.filter((it) => it.key.indexOf('customfield') === -1);
      newThisColumns = newThisColumns.filter((it) => it.key.indexOf('statetimestamp') === -1);

      const data = res.result;
      data.map((it) => {
        newQueryMoreList.push({
          key: `customfield_${it.id}`,
          value: `${it.name}`,
          status: it.type
        });
        newbugColumns.push({
          key: `customfield_${it.id}`,
          label: `${it.name}`,
        });
        newThisColumns.push({
          title: <Popover content={`${it.name}`} trigger="hover">
            <span className='f-ib f-toe' style={{ width: '120px' }}>
              {`${it.name}`}
            </span>
          </Popover>,
          dataIndex: `customfield_${it.id}`,
          key: `customfield_${it.id}`,
          width: 200,
          render: (text, record) => {
            return <Popover content={getDisplayCustomField(it, record, 'bug')} trigger="hover">
              <span className='f-ib f-toe' style={{ width: '120px' }}>
                {getDisplayCustomField(it, record, 'bug')}
              </span>
            </Popover>;
          },
        });
      });
      this.columns = newThisColumns;
      this.getStateValue(newbugColumns); //更多下拉框&列下拉框
      this.setState({ newQueryMoreList });

      const hasColumn = localStorage.getItem('bug_column') && JSON.parse(localStorage.getItem('bug_column'));
      this.setColumns(hasColumn);

    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getStateValue = (bdata) => { //获取状态时间戳
    const columnData = bdata;

    bugTaskNameArr.map((item) => {
      columnData.push({
        key: `statetimestamp_${item.key}`,
        label: `状态时间戳(${item.name})`,
      });
      this.columns.push({
        title: `状态时间戳(${item.name})`,
        dataIndex: `statetimestamp_${item.key}`,
        key: `statetimestamp_${item.key}`,
        width: 200,
        render: (text, record) => {
          const list = record.stateTimestampInfoList;
          const obj = list.find(it => it.stateTimestamp.state === item.key) || {};
          const time = (obj.stateTimestamp && obj.stateTimestamp.addtime) || 0;
          return momentDate(time);
        },
      });
    });
    this.setState({ newbugColumns: columnData });
    if (!this.columns.find(it => it.key === 'caozuo')) {
      this.columns.push(this.caozuoColumn());
    }
  }

  getCustomValue = (data, id) => {
    let value = '--';
    data && data.bugCustomFieldRelationInfoList && data.bugCustomFieldRelationInfoList.map((item) => {
      if (item.productCustomField && item.productCustomField.id === id) {
        value = data.customFieldValueidMap &&
          data.customFieldValueidMap[item.bugCustomFieldRelation.id] &&
          data.customFieldValueidMap[item.bugCustomFieldRelation.id].customlabel;
      } else {
        value = '--';
      }
    });
    return <span>{value}</span>;
  }

  updateFilter = (key, value, type) => {
    const productid = this.props.location.query.productid;
    const newParams = {
      ...this.state.params,
      offset: 0,
    };

    if (key.includes('customfield')) {

      newParams['customfield'] = filterCustom(key, value, type, newParams);
    } else if (key === 'id') {
      newParams[key] = value;
      newParams.name = '';
    } else if (key === 'name') {
      newParams[key] = value;
      newParams.id = '';
    } else {
      newParams[key] = value;
    }

    const { defaultCurrentQcl } = this.state;
    const currentQcl = JSON.parse(localStorage.getItem('qcl_bug')) || [];
    const isChangeQcl = JSON.stringify(defaultCurrentQcl.sort()) !== JSON.stringify(currentQcl.sort());
    const ischangeFilter = compareFilter(newParams, this.state.defaultCurrentFilter);
    if (!isChangeQcl && !ischangeFilter) {
      this.setState({ isChangeFilter: false });
      sessionStorage.setItem(`bugChangeFilter_${productid}`, false);
    } else {
      this.setState({ isChangeFilter: true });
      sessionStorage.setItem(`bugChangeFilter_${productid}`, true);
    }

    this.setState({ params: newParams }, () => this.getList());
    sessionStorage.setItem(`bugListQuery_${productid}`, JSON.stringify(newParams));
  }

  changeQueryMore = (arr) => {
    const productid = this.props.location.query.productid;
    const newParams = {
      ...this.state.params,
    };
    const ischangeFilter = compareFilter(newParams, this.state.defaultCurrentFilter);
    const { defaultCurrentQcl } = this.state;
    const isChangeQcl = JSON.stringify(defaultCurrentQcl.sort()) !== JSON.stringify(arr.sort());
    if (!isChangeQcl && !ischangeFilter) {
      this.setState({ isChangeFilter: false });
      sessionStorage.setItem(`bugChangeFilter_${productid}`, false);
    } else {
      this.setState({ isChangeFilter: true });
      sessionStorage.setItem(`bugChangeFilter_${productid}`, true);
    }
  }

  systemFilter = (data, productid, listQuery, subProductList) => {
    this.setState({ subProductList });
    let defaultSubProduct = [];
    subProductList.forEach(it => {
      if (it.isEnable === 1) {
        defaultSubProduct.push(it.id);
      }
    });
    if (data === 'all') {
      this.setState({
        defaultCurrentFilter: {
          order: 'desc',
          orderby: 'id',
          subProductId: defaultSubProduct
        }
      });
      setTimeout(() => {
        this.setState({
          params: {
            limit: listQuery.limit || 10,
            offset: listQuery.offset || 0,
            subProductId: defaultSubProduct
          }
        }, () => this.getList(productid));
      }, 100);
    } else {
      let newState = [];
      bugTaskNameArr.forEach(it => {
        if (it.key !== BUG_STATUS_MAP.CLOSE && it.key !== BUG_STATUS_MAP.CANCLE) {
          newState.push(it.key);
        }
      });
      this.setState({
        defaultCurrentFilter: {
          order: 'desc',
          orderby: 'id',
          state: newState,
          subProductId: defaultSubProduct
        },
      });
      const paramsState = {
        order: 'desc',
        orderby: 'id',
        state: newState,
        limit: listQuery.limit || 10,
        offset: listQuery.offset || 0,
        subProductId: defaultSubProduct
      };
      setTimeout(() => {
        this.setState({ params: paramsState }, () => this.getList(productid));
      }, 100);
    }
  }

  getQueryCondition = (data, productid, subProductList) => {
    const listQuery = JSON.parse(localStorage.getItem('bugListQuery')) || {};
    const sessionFilter = JSON.parse(sessionStorage.getItem(`bugChangeFilter_${productid}`));
    if (sessionFilter) {
      this.setState({ isChangeFilter: sessionFilter });
    } else {
      this.setState({ isChangeFilter: false });
    }
    this.setState({ defaultCurrentQcl: JSON.parse(localStorage.getItem('qcl_bug')) || [] });
    if (data === 'all' || data === 'allOpen') {
      this.systemFilter(data, productid, listQuery, subProductList);
    } else {
      const newObj = serverFilterData(data, listQuery, this.state.newQueryMoreList, 'bug');

      this.setState({ defaultCurrentFilter: newObj });
      this.setState({ params: newObj }, () => this.getList(productid));
    }
  }

  handlePageChange = (value) => {
    const { limit } = this.state.params;
    const { productid } = this.props.location.query;
    const newParams = {
      ...this.state.params,
      offset: (value - 1) * limit,
    };
    sessionStorage.setItem(`bugListQuery_${productid}`, JSON.stringify(newParams));
    this.setState({ params: newParams }, () => this.getList());
  }

  onShowSizeChange = (current, pageSize) => {
    const { productid } = this.props.location.query;
    const newParams = {
      ...this.state.params,
      offset: 0,
      limit: pageSize,
    };
    sessionStorage.setItem(`bugListQuery_${productid}`, JSON.stringify(newParams));
    this.setState({ params: newParams }, () => this.getList());
  }

  dltItem = (item) => {
    const _this = this;
    deleteModal({
      title: `您确认删除缺陷【${item.name}】吗？`,
      okCallback: () => {
        const params = {
          id: item.id,
        };
        deleteBugItem(params).then((res) => { //删除缺陷列表数据
          if (res.code !== 200) { return message.error(res.msg) }
          message.success('删除成功！');
          _this.props.dispatch({ type: 'bug/saveBugDetail', payload: {} });
          _this.getList();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  confirmCreate = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { customSelect, customList } = this.props;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段
      if (estimateCost(values.estimate_cost)) {
        return message.warn('预估工作量不合法！');
      }
      const params = {
        parentid: 0,
        issuetype: '',
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };
      params.issuetype = ISSUE_TYPE_JIRA_MAP.BUG;
      this.setState({ createLoading: true });
      createBill(params).then((res) => {
        this.setState({ createLoading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        if (this.state.createOther) {
          this.props.dispatch({ type: dispatchType, payload: '' });
          this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          this.props.form.resetFields(['name', 'description', 'attachments']);
          this.setState({ visible: true });
        } else {
          this.setState({ visible: false });
          this.props.form.resetFields();
        }
        this.getList();
      }).catch((err) => {
        this.setState({ createLoading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  setSomeState = (status) => {
    const _this = this;
    let it = {};
    bugTaskNameArr.map((item) => {
      if (item.name === status) {
        it = item;
      }
    });
    const { checkData } = this.state;
    let data = [];
    checkData.map((item) => {
      data.push({
        id: item,
        state: it.key
      });
    });
    const newData = data;
    if (checkData.length === 0) {
      return message.warning('请选择后操作');
    } else {
      warnModal({
        title: '提示',
        content: `您确认批量设置选中任务的状态为【${it.name}】吗？`,
        okCallback: () => {
          updateBugState(newData).then((res) => {
            if (res.code !== 200) return message.error(`设置失败，${res.msg}`);
            message.success('设置成功！');
            _this.getList();
            _this.setState({ checkData: [] });
          }).catch((err) => {
            return message.error(`设置异常, ${err || err.message}`);
          });
        }
      });
    }
  }

  openCreateTask = () => {
    this.setState({ visible: true });
  }

  getScrollTableWidth() {
    const { columns } = this.state;
    let scrollTableWidth = 0;
    columns.map((it) => {
      if (it.width) {
        scrollTableWidth = scrollTableWidth + it.width;
      }
    });
    return scrollTableWidth;
  }

  render() {
    const { lastProduct, drawerIssueId, customList } = this.props;
    const { dataSource, visible, newQueryMoreList,
      newbugColumns, total, columns, loading, createLoading, checkData } = this.state;

    const scrollTableWidth = this.getScrollTableWidth();
    const defaultQuery = this.state.params;
    let selectData = [];
    checkData.forEach(item => {
      const obj = dataSource.find(it => it.bug.id === item) || {};
      selectData.push({
        ...obj,
        issueKey: `Bug-${item}`,
        subProductVO: obj.subproduct || {},
      });
    });

    return (
      <div style={{ padding: '16px', paddingBottom: '0px' }}>
        <div className='f-jcsb-aic' style={{ paddingBottom: '16px', position: 'relative' }}>
          <div className='f-aic'>
            <span className={styles.adviseIcon}>
              <MyIcon type="icon-quexian" className={styles.icon} />
            </span>
            <span className='u-mgl10 f-fs3 font-pfm'>缺陷列表</span>
          </div>
          <div>
            <Tool
              newParams={this.state.params}
              type={'bug'}
              order={orderMap[Number(this.state.order)]}
              orderby={timeMap[Number(this.state.orderby)]}
              hasManagePermission={hasPermission(USERGROUP_PERMISSION_KEY_MAP.BUG_ROLE_MANAGE, lastProduct.perssionList)}
              hasEditPermission={hasPermission(USERGROUP_PERMISSION_KEY_MAP.BUG_ROLE_EDIT, lastProduct.perssionList)}
              defaultData={columns}
              data={newbugColumns} />
            <Button
              className='u-mgl10'
              type='primary'
              onClick={() => {
                this.onAddBtnClick();
              }}>创建缺陷</Button>
          </div>
        </div>
        <div className={`f-jcsb-aic ${styles.filterArea}`}>
          <Filter
            {...this.props}
            queryCondition={this.getQueryCondition}
            type='bug'
            isChangeFilter={this.state.isChangeFilter}
          />
          <div className='f-aic'>
            <SearchNameId
              updateFilter={this.updateFilter}
              defaultValue={defaultQuery.id || defaultQuery.name}
              type='bug' />
            <span className='u-mgr20'>
              <OrderTime
                changeOrderField={this.changeOrderField}
                changeOrder={this.changeOrder}
                orderFieldData={this.state.orderFieldData}
                orderData={this.state.orderData}
                type='issue_bug'
              />
            </span>
            <Columns
              type='bug'
              defaultColumns={defaultbugColumns}
              columns={newbugColumns}
              setColumns={this.setColumns}
            />
          </div>
        </div>
        <div className={styles.queryArea}>
          <QueryArea
            type={'bug'}
            updateFilter={this.updateFilter}
            productid={this.props.location.query.productid}
            subProductList={this.state.subProductList}
          />

          <QueryMore
            type='bug'
            updateFilter={this.updateFilter}
            parentParams={this.state.params}
            dataSource={newQueryMoreList && newQueryMoreList.map((item) => ({
              value: item.value, key: item.key, status: item.status
            }))}
            productid={this.props.location.query.productid}
            changeQueryMore={this.changeQueryMore}
          />
        </div>

        <div className={dataSource.length ? styles.noneContent : styles.tableContent}>
          <Table
            dataSource={dataSource}
            loading={loading}
            columns={columns}
            pagination={false}
            scroll={{ x: scrollTableWidth }}
            className={styles.table}
            onRow={record => {
              return {
                onMouseEnter: () => {
                  if (record.issueRole !== ISSUE_ROLE_VALUE_MAP.READ && record.issueRole) {
                    this.setState({ hoverRowId: record.bug.id });
                  }
                },
                onMouseLeave: () => {
                  if (record.issueRole !== ISSUE_ROLE_VALUE_MAP.READ && record.issueRole) {
                    this.setState({ hoverRowId: 0 });
                  }
                },
                className: 'f-csp',
                onClick: (e) => {
                  e.stopPropagation();
                  drawerDelayFun(() => {
                    this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `Bug-${record.bug.id}` });
                  }, 200);
                }
              };
            }}
            ref={(ref) => { this.refDom = ref }}
          />
          <div className='u-pd10 f-jcsb-aic u-pdb20'>
            {!this.state.openOperate && <Pagination
              pageSize={(defaultQuery.limit) || 10}
              current={(defaultQuery.offset / 10 + 1) || 1}
              showSizeChanger
              onShowSizeChange={this.onShowSizeChange}
              onChange={this.handlePageChange}
              defaultCurrent={1}
              total={total}
              showTotal={total => <span>共{total}个</span>}
            />}
            <div style={this.state.openOperate ? { width: '100%' } : {}}>
              {this.state.openOperate === false &&
                <span onClick={() => this.checkPermission4BatchCloseOpt()} className={styles.operateButton}>批量操作</span>
              }
              {this.state.openOperate === true && <div className='f-jcsb-aic' style={{ width: '100%' }}>
                <span>
                  <Checkbox
                    style={{ paddingLeft: '6px' }}
                    checked={checkData.length}
                    onChange={(e) => this.changeStateAll(e.target.checked)}>
                    已选择{checkData.length}项
                  </Checkbox>
                  <a
                    className='u-mgr10'
                    onClick={() => this.setSomeState('关闭')}>批量关闭</a>
                  {
                    !!checkData.length &&
                    <BatchUpdate
                      data={selectData}
                      productId={lastProduct.id}
                      refreshFun={() => {
                        this.getList();
                      }}
                    />
                  }
                </span>
                <span onClick={() => {
                  this.changeOperate(false);
                  this.setState({ checkData: [] });
                }} className={styles.operateButton}>取消操作</span>
              </div>}
            </div>
          </div>
        </div>

        <Modal
          className={`${styles.needsDialog} modal-createissue-height`}
          title='创建缺陷'
          width={1050}
          visible={visible}
          maskClosable={false}
          onCancel={() => {
            this.setState({ visible: false, createOther: false }, () => this.props.form.resetFields());
            this.props.dispatch({ type: 'design/saveDes', payload: '' });
            this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          }}
          footer={[
            <div style={{ textAlign: 'right' }}>
              <Checkbox onChange={(e) => { this.setState({ createOther: e.target.checked }) }} className='u-mgr10'>创建另一个</Checkbox>
              <Button onClick={() => {
                this.setState({ visible: false, createOther: false });
                this.props.dispatch({ type: dispatchType, payload: '' });
                this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
              }}>取消</Button>
              <Button type='primary' onClick={() => this.confirmCreate()} loading={createLoading} >创建</Button>
            </div>
          ]}
          destroyOnClose
        >
          <CreateBug
            {...this.props}
            productid={this.props.location.query.productid}
            type="list"
          />
        </Modal>

        {
          drawerIssueId &&
          <DrawerComponent
            refreshFun={() => {
              this.getList();
            }}
          />
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
    customSelect: state.aimEP.customSelect,
    drawerIssueId: state.receipt.drawerIssueId,

    customList: state.receipt.customList,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
