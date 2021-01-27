import React, { Component, } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, Button, Checkbox, message, Pagination, Tooltip, Popover } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import {
  getIssueCustom, getDisplayCustomField, compareFilter, filterCustom,
  serverFilterData, hasPermission, drawerDelayFun, calculateDwm, getMentionUsers, getSystemDescription
} from '@utils/helper';
import MyIcon from '@components/MyIcon';
import Tool from '@components/Tool';
import Columns from '@components/Columns';
import QueryMore from '@components/QueryMore';
import Filter from '@components/Filter';
import IssueEditTitle from '@components/IssueEditTitle';
import EditSelect from '@components/EditSelect';
import EditSelectUser from '@components/EditSelectUser';
import EditStatus from '@pages/receipt/components/drawer_shared/requirement/EditStatus';
import OrderTime from '@components/OrderTime';
import EpIcon from '@components/EpIcon';
import CreateRequirement from '@components/CreateIssues/create_requirement';
import RelateAdvise from '@pages/receipt/components/relate_advise';
import RelateTask from '@pages/receipt/components/relate_task';
import ListDelete from '@pages/receipt/components/list_delete';
import SearchNameId from '@pages/receipt/components/search_name_id';
import {
  getRequirementCustomList, getTotalCount, getRequirementList, deleteRequireItem,
  setRequirementState, updateRequirement, updateRequireemail
} from '@services/requirement';
import { createBill } from '@services/receipt';
import { requirementNameArr, ISSUE_ROLE_VALUE_MAP, USERGROUP_PERMISSION_KEY_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG, ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import {
  rQueryMoreList, defaultrequireColumns, orderFieldData,
  requirementColumns, levelMapArr, timeMap, orderMap, REQUIREMENT_STATUS_MAP
} from '@shared/RequirementConfig';
import { handleSearchUser, getUserList, deleteModal, warnModal } from '@shared/CommonFun';
import BatchUpdate from '@components/BatchUpdate';
import TextOverFlow from '@components/TextOverFlow';
import QueryArea from './components/QueryArea';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

const isFixedRight = () => {
  const localColumn = JSON.parse(localStorage.getItem('requirement_column')); //计算是否需要fixed:right
  let defaultColumn = [];
  defaultrequireColumns.forEach((it) => {
    defaultColumn.push(it.key);
  });
  const currentColumn = localColumn ? localColumn : defaultColumn;
  return currentColumn.length > 8;
};

const dispatchType = 'design/saveDes';

const isEmpty = (text) => {
  return text ? text : '--';
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
    newrequirementColumns: [],
    total: 0,
    orderby: 1,
    order: 2,
    visible: false,
    dataSource: [],
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
    createLoading: false,
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
                window.open(`/v2/my_workbench/requirementdetail/Feature-${record.requirement.id}`);
              }
            }}
          >
            {`Feature-${record.requirement.id}`}
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
            <EpIcon type='requirement' className='f-fs3'></EpIcon>
          </span>
          <IssueEditTitle
            hoverRowId={this.state.hoverRowId}
            rowId={record.requirement.id}
            title={record.requirement.name}
            handleSave={(title) => this.handleSaveTitle(title, record.requirement.id)}
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
        return (record.requirement.state ?
          <span>
            <EditStatus
              value={record.requirement.state}
              listDetail={record}
              type="requirement"
              bgHover={false}
              refreshFun={this.getRefreshList}
            />
          </span>
          : '-');
      }
    },
    {
      title: '关联建议',
      dataIndex: 'rtotal',
      key: 'rtotal',
      render: (text, record) => {
        return (
          <span style={{ position: 'relative', top: '-2px' }}>
            <RelateAdvise
              record={record}
              issuetype={'requirement'}
            />
          </span>
        );
      },
    },
    {
      title: '一级拆分',
      dataIndex: 'fsttotal',
      key: 'fsttotal',
      render: (text, record) => {
        return (
          <span style={{ position: 'relative', top: '-1px' }}>
            <RelateTask
              record={record}
              issuetype={'requirement'}
            />
          </span>
        );
      },
    },
    {
      title: '计划上线时间',
      dataIndex: 'expect_releasetime',
      key: 'expect_releasetime',
      render: (text, record) => {
        const time = record && record.requirement && record.requirement.expect_releasetime;
        return (
          <span>{time ? moment(time).format('YYYY-MM-DD') : '--'}</span>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'level',
      key: 'level',
      render: (text, record) => {
        return <span className='f-ib' style={{ width: '80px' }}>
          <EditSelect
            issueRole={record.issueRole}
            value={record.requirement.level}
            dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
            handleSaveSelect={(value) => this.handleSaveSelectLevel(value, record.requirement.id)}
            required={true}
            type='list'
          />
        </span>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'responseuid',
      key: 'responseuid',
      render: (text, record) => {
        return record.responseUser && record.responseUser.email ?
          <EditSelectUser
            issueRole={record.issueRole}
            value={record.responseUser.email}
            dataSource={getUserList(record.responseUser, this.state.userList)}
            handleSearch={(value) => handleSearchUser(value, (result) => this.setState({ userList: result }))}
            handleSaveSelect={(value) => this.handleUpdateResponse(value, record.requirement.id)}
            required
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
          handleSaveSelect={(value) => this.handleUpdateSubmit(value, record.requirement.id)}
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
          handleSaveSelect={(value) => this.handleUpdateRequire(value, record.requirement.id)}
          type='list'
        /> : '--';
      },
    },
    {
      title: '关联项目',
      dataIndex: 'projectid',
      key: 'projectid',
      render: (text, record) => {
        const title = record.project && record.project.title;
        const id = record.project && record.project.id;
        return (
          title ?
            <Popover content={title} trigger="hover">
              <a
                className='f-toe f-ib'
                onClick={(e) => e.stopPropagation()}
                href={`/v2/project/detail/?id=${id}`}
                style={{ position: 'relative', top: '2px', width: '120px', height: '18px' }}
              >
                {title}
              </a>
            </Popover> :
            <a>--</a>
        );
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
      title: '评审不通过原因',
      dataIndex: 'rejectdesc',
      key: 'rejectdesc',
      render: (text, record) => {
        return (
          <span>{record.requirement.rejectdesc}</span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'addtime',
      key: 'addtime',
      render: (text, record) => {
        return (
          <span>{momentDate(record && record.requirement && record.requirement.addtime)}</span>
        );
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatetime',
      key: 'updatetime',
      render: (text, record) => {
        return (
          <span>{momentDate(record && record.requirement && record.requirement.updatetime)}</span>
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
    const localDefaultColumns = JSON.parse(localStorage.getItem('requirement_column'));
    const defaultColumns = localDefaultColumns || defaultrequireColumns.map(x => { return x.key });
    localStorage.setItem('requirement_column', JSON.stringify(defaultColumns));

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

  handleSaveSelectLevel = (value, id) => {
    const params = {
      id: id,
      level: value,
    };
    this.updateRequirement(params);
  }

  handleUpdateResponse = (value, id) => {
    const params = {
      id,
      responseemail: value,
    };
    this.updateRequirement(params);
  }

  handleUpdateSubmit = (value, id) => {
    const params = {
      id,
      submitemail: value,
    };
    this.updateRequirement(params);
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

  handleSaveTitle = (title, id) => {
    const params = {
      id: id,
      name: title,
    };
    this.updateRequirement(params);
  }

  updateRequirement = (params) => {
    updateRequirement(params).then(res1 => {
      if (res1.code !== 200) return message.error(res1.msg);
      message.success('更改成功！');
      this.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handlePinshenOk = () => {
    const { form: { getFieldValue } } = this.props;
    const arr = getFieldValue('reviewresult') === 1 ? ['reviewresult'] : ['reviewresult', 'rejectdesc'];
    this.props.form.validateFields(arr, (err, values) => {
      if (err) return;
      const params = [{
        id: this.state.pingshenId,
        state: this.state.pingshenValue,
        reviewResult: values.reviewresult,
        rejectDesc: values.rejectdesc ? values.rejectdesc : '',
      }];
      setRequirementState(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更改状态成功！');
        this.setState({ pingshenVisible: false });
        this.getList();
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  }

  changeOrderField = (value) => {
    this.setState({ orderby: value }, () => this.getList());
    let newParams = JSON.parse(localStorage.getItem('requirementOrder')) || {};
    newParams.orderby = value;
    if (!newParams.order) {
      newParams.order = 2;
    }
    localStorage.setItem('requirementOrder', JSON.stringify(newParams));
  }

  changeOrder = (value) => {
    this.setState({ order: value }, () => this.getList());
    let newParams = JSON.parse(localStorage.getItem('requirementOrder')) || {};
    newParams.order = value;
    if (!newParams.orderby) {
      newParams.orderby = 1;
    }
    localStorage.setItem('requirementOrder', JSON.stringify(newParams));
  }

  changeState = (record) => {
    const { checkData } = this.state;
    let newCheckData = checkData;
    const id = record.requirement.id;
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
        newCheckData.push(item.requirement.id);
      });
      this.setState({ checkData: newCheckData });
    } else {
      this.setState({ checkData: [] });
    }
  }

  setColumns = (requirementColumn) => {
    const { openOperate } = this.state;
    let data = this.columns.filter((it) => {
      if (openOperate) {
        return (requirementColumn.indexOf(it.key) > -1);
      } else {
        return (requirementColumn.indexOf(it.key) > -1) || it.key === 'caozuo';
      }
    });

    data && data.map((it) => {
      const item = requirementColumns.find((i) => i.key === it.key) || { width: 200 };
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
            checked={checkData.indexOf(record.requirement.id) > -1}
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
            type='requirement'
            handleUpdate={this.updateRequirement}
            checkPermission4DeleteOpt={this.checkPermission4DeleteOpt} />
        </div>);
      }
    };
  }

  checkPermission4BatchCloseOpt = () => {
    const { lastProduct } = this.props;
    if (!hasPermission(USERGROUP_PERMISSION_KEY_MAP.REQUIREMENT_ROLE_MANAGE, lastProduct.perssionList)) {
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

    this.dltItem(record.requirement);
  }

  onAddBtnClick = () => {
    this.setState({ visible: true, createType: 'requirement' }, () => this.props.form.resetFields());
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
    getRequirementCustomList(params).then((res) => { //获取自定义字段
      if (res.code !== 200) { return message.error(res.msg) }
      const newQueryMoreList = JSON.parse(JSON.stringify(rQueryMoreList));
      const newrequirementColumns = JSON.parse(JSON.stringify(requirementColumns));
      let newThisColumns = this.columns.filter((it) => it.key.indexOf('customfield') === -1);
      newThisColumns = newThisColumns.filter((it) => it.key.indexOf('statetimestamp') === -1);

      const data = res.result;
      data.map((it) => {
        newQueryMoreList.push({
          key: `customfield_${it.id}`,
          value: `${it.name}`,
          status: it.type
        });
        newrequirementColumns.push({
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
            return <Popover content={getDisplayCustomField(it, record, 'requirement')} trigger="hover">
              <span className='f-ib f-toe' style={{ width: '120px' }}>
                {getDisplayCustomField(it, record, 'requirement')}
              </span>
            </Popover>;
          },
        });
      });
      this.columns = newThisColumns;
      this.getStateValue(newrequirementColumns); //更多下拉框&列下拉框
      this.setState({ newQueryMoreList });

      const hasColumn = localStorage.getItem('requirement_column') && JSON.parse(localStorage.getItem('requirement_column'));
      this.setColumns(hasColumn);

    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getStateValue = (qdata) => { //获取状态时间戳
    const columnData = qdata;

    requirementNameArr.map((item) => {
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
    this.setState({ newrequirementColumns: columnData });
    if (!this.columns.find(it => it.key === 'caozuo')) {
      this.columns.push(this.caozuoColumn());
    }
  }

  getCustomValue = (data, id) => {
    let value = '--';
    data && data.requirementCustomFieldRelationInfoList && data.requirementCustomFieldRelationInfoList.map((item) => {
      if (item.productCustomField && item.productCustomField.id === id) {
        value = data.customFieldValueidMap &&
          data.customFieldValueidMap[item.requirementCustomFieldRelation.id] &&
          data.customFieldValueidMap[item.requirementCustomFieldRelation.id].customlabel;
      } else {
        value = '--';
      }
    });
    return <span>{value}</span>;
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
      offset: params.offset ? params.offset : 0,
      limit: params.limit ? params.limit : 10,
      productid,
      orderby: timeMap[orderby] === 'subProductId' ? 'sub_product_id' : timeMap[orderby],
      order: orderMap[order],
    };
    const sessionParams = JSON.parse(sessionStorage.getItem(`requirementListQuery_${productid}`));
    if (sessionParams) {
      params2 = {
        ...sessionParams,
        orderby: timeMap[orderby] === 'subProductId' ? 'sub_product_id' : timeMap[orderby],
        order: orderMap[order],
      };
    }
    getTotalCount(params2).then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      this.setState({ total: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });

    this.setState({ params: params2 });
    getRequirementList(params2).then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      localStorage.setItem(`requirementListQuery`, JSON.stringify(params2));
      this.setState({ dataSource: res.result });
      this.setState({ loading: false });
    }).catch((err) => {
      return message.error(err || err.message);
    });
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
    const currentQcl = JSON.parse(localStorage.getItem('qcl_requirement')) || [];
    const isChangeQcl = JSON.stringify(defaultCurrentQcl.sort()) !== JSON.stringify(currentQcl.sort());
    const ischangeFilter = compareFilter(newParams, this.state.defaultCurrentFilter);
    if (!isChangeQcl && !ischangeFilter) {
      this.setState({ isChangeFilter: false });
      sessionStorage.setItem(`requirementChangeFilter_${productid}`, false);
    } else {
      this.setState({ isChangeFilter: true });
      sessionStorage.setItem(`requirementChangeFilter_${productid}`, true);
    }

    this.setState({ params: newParams }, () => this.getList());
    sessionStorage.setItem(`requirementListQuery_${productid}`, JSON.stringify(newParams));
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
      sessionStorage.setItem(`requirementChangeFilter_${productid}`, false);
    } else {
      this.setState({ isChangeFilter: true });
      sessionStorage.setItem(`requirementChangeFilter_${productid}`, true);
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
      requirementNameArr.forEach(it => {
        if (it.key !== REQUIREMENT_STATUS_MAP.CLOSE && it.key !== REQUIREMENT_STATUS_MAP.CANCLE) {
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
        limit: listQuery.limit || 10,
        offset: listQuery.offset || 0,
        state: newState,
        subProductId: defaultSubProduct
      };
      setTimeout(() => {
        this.setState({ params: paramsState }, () => this.getList(productid));
      }, 100);
    }
  }

  getQueryCondition = (data, productid, subProductList) => {
    const listQuery = JSON.parse(localStorage.getItem('requirementListQuery')) || {};
    const sessionFilter = JSON.parse(sessionStorage.getItem(`requirementChangeFilter_${productid}`));
    if (sessionFilter) {
      this.setState({ isChangeFilter: sessionFilter });
    } else {
      this.setState({ isChangeFilter: false });
    }
    this.setState({ defaultCurrentQcl: JSON.parse(localStorage.getItem('qcl_requirement')) || [] });
    if (data === 'all' || data === 'allOpen') {
      this.systemFilter(data, productid, listQuery, subProductList);
    } else {
      const newObj = serverFilterData(data, listQuery, this.state.newQueryMoreList, 'requirement');

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
    sessionStorage.setItem(`requirementListQuery_${productid}`, JSON.stringify(newParams));
    this.setState({ params: newParams }, () => this.getList());
  }

  onShowSizeChange = (current, pageSize) => {
    const { productid } = this.props.location.query;
    const newParams = {
      ...this.state.params,
      offset: 0,
      limit: pageSize,
    };
    sessionStorage.setItem(`requirementListQuery_${productid}`, JSON.stringify(newParams));
    this.setState({ params: newParams }, () => this.getList());
  }

  dltItem = (item) => {
    const _this = this;
    deleteModal({
      title: `您确认删除需求【${item.name}】吗？`,
      okCallback: () => {
        const params = {
          id: item.id,
        };
        deleteRequireItem(params).then((res) => { //删除建议列表数据
          if (res.code !== 200) { return message.error(res.msg) }
          message.success('删除成功！');
          _this.props.dispatch({ type: 'requirement/saveRequirementDetail', payload: {} });
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
      const params = {
        issuetype: '',
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };
      params.issuetype = ISSUE_TYPE_JIRA_MAP.REQUIREMENT;
      this.setState({ createLoading: true });
      createBill(params).then((res) => {
        this.setState({ createLoading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        if (this.state.createOther) {
          this.props.dispatch({ type: dispatchType, payload: '' });
          this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          this.props.form.resetFields(['name', 'attachments']);
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
    requirementNameArr.map((item) => {
      if (item.name === status) {
        it = item;
      }
    });
    const { checkData } = this.state;
    let data = [];
    checkData.map((item) => {
      data.push({
        id: item,
        state: it.key,
        reviewResult: '',
        rejectDesc: '',
      });
    });
    const newData = data;
    if (checkData.length === 0) {
      return message.warning('请选择后操作');
    } else {
      warnModal({
        title: '提示',
        content: `您确认批量设置选中需求的状态为【${it.name}】吗？`,
        okCallback: () => {
          setRequirementState(newData).then((res) => {
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
    const { dataSource, visible, newQueryMoreList, checkData,
      newrequirementColumns, total, columns, loading, createLoading } = this.state;

    const scrollTableWidth = this.getScrollTableWidth();

    const defaultQuery = this.state.params;
    let selectData = [];
    checkData.forEach(item => {
      const obj = dataSource.find(it => it.requirement.id === item) || {};
      selectData.push({
        ...obj,
        issueKey: `Feature-${item}`,
        subProductVO: obj.subproduct || {},
      });
    });

    return (
      <div style={{ padding: '16px', paddingBottom: '0px' }}>
        <div className='f-jcsb-aic' style={{ paddingBottom: '16px', position: 'relative' }}>
          <div className='f-aic'>
            <span className={styles.adviseIcon}>
              <MyIcon type="icon-xuqiu" className={styles.icon} />
            </span>
            <span className='u-mgl10 f-fs3 font-pfm'>需求列表</span>
          </div>
          <div>
            <Tool
              newParams={this.state.params}
              type={'requirement'}
              order={orderMap[Number(this.state.order)]}
              orderby={timeMap[Number(this.state.orderby)]}
              hasManagePermission={hasPermission(USERGROUP_PERMISSION_KEY_MAP.REQUIREMENT_ROLE_MANAGE, lastProduct.perssionList)}
              hasEditPermission={hasPermission(USERGROUP_PERMISSION_KEY_MAP.REQUIREMENT_ROLE_EDIT, lastProduct.perssionList)}
              defaultData={columns}
              data={newrequirementColumns} />
            <Button
              className='u-mgl10'
              type='primary'
              onClick={() => {
                this.onAddBtnClick();
              }}
            >创建需求</Button>
          </div>
        </div>
        <div className={`f-jcsb-aic ${styles.filterArea}`}>
          <Filter
            {...this.props}
            queryCondition={this.getQueryCondition}
            type='requirement'
            isChangeFilter={this.state.isChangeFilter}
          />
          <div className='f-aic'>
            <SearchNameId
              updateFilter={this.updateFilter}
              defaultValue={defaultQuery.id || defaultQuery.name}
              type='requirement' />
            <span className='u-mgr20'>
              <OrderTime
                changeOrderField={this.changeOrderField}
                changeOrder={this.changeOrder}
                orderFieldData={this.state.orderFieldData}
                orderData={this.state.orderData}
                type='issue_requirement'
              />
            </span>
            <Columns
              type='requirement'
              defaultColumns={defaultrequireColumns}
              columns={newrequirementColumns}
              setColumns={this.setColumns}
            />
          </div>
        </div>
        <div className={styles.queryArea}>
          <QueryArea
            type={'requirement'}
            updateFilter={this.updateFilter}
            productid={this.props.location.query.productid}
            subProductList={this.state.subProductList}
          />
          <QueryMore
            type='requirement'
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
                    this.setState({ hoverRowId: record.requirement.id });
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
                    this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `Feature-${record.requirement.id}` });
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
          title='提需求'
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
                this.props.dispatch({ type: 'design/saveDes', payload: '' });
                this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
              }}>取消</Button>
              <Button type='primary' onClick={() => this.confirmCreate()} loading={createLoading}>创建</Button>
            </div>
          ]}
          destroyOnClose
        >
          <CreateRequirement
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
