import React, { Component } from 'react';
import { Radio, Table, message, Badge, Row } from 'antd';
import moment from 'moment';
import uuid from 'uuid';
import OrderTime from '@components/OrderTime';
import DefineDot from '@components/DefineDot';
import TextOverFlow from '@components/TextOverFlow';
import FilterSelect from '@components/FilterSelect';
import { remindAudit } from '@services/my_workbench';
import MyIcon from '@components/MyIcon';
import { orderFieldAuditData, orderData, orderFieldAuditByMap, orderNameMap, AUDIT_TYPE_MAP, AUDIT_STATE_COLOR, AUDIT_TYPE_NUM_MAP } from '@shared/WorkbenchConfig';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterObj: {
        orderBy: 1,
        orderType: 2,
        projectIdList: [],
        type: 'create', // 1我参与的 2我审批的
        current: 1,
      },
      current: 1,
    };
    this.columns = [{
      title: '类型',
      dataIndex: 'workflowType',
      width: 60,
      render: (text, record) => {
        return (<span className={styles.tag}>
          {AUDIT_TYPE_MAP[text]}
        </span>);
      }
    }, {
      title: '所属项目',
      dataIndex: 'projectName',
      width: 180,
      render: (text, record) => {
        return (<TextOverFlow content={text} maxWidth={'180px'} />);
      }
    }, {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 190,
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      }
    }, {
      title: '申请人',
      dataIndex: 'creator',
      render: (text) => {
        return text.name;
      }
    }, {
      title: '最新操作时间',
      dataIndex: 'updateTime',
      width: 190,
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      }
    }, {
      title: '待操作人',
      dataIndex: 'unAuditorList',
      width: 200,
      render: (text, record) => {
        return (<TextOverFlow content={<span>
          {
            text ? text.map(it => it.name).join(',') : '--'
          }
        </span>} maxWidth={'200px'} />);
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      width: 150,
      render: (text, record) => {
        return <DefineDot
          statusColor={AUDIT_STATE_COLOR}
          displayText={record.stateDesc}
          text={text}
        />;
      }
    }, {
      title: '原因',
      dataIndex: 'rejectReason',
      width: 150,
      render: (text, record) => {
        return text ? <TextOverFlow content={text} maxWidth={150} /> : '--';
      }
    }, {
      title: '',
      dataIndex: 'workflowSnapshotId',
      width: 80,
      render: (text, record) => {
        return <span>
          {
            record.state === 1 ?
              <span onClick={(e) => { e.stopPropagation(); this.handleRemind(record) }}>
                <MyIcon type="icon-Vector" className={`f-fs3 f-csp ${styles.reasonIcon}`} />
              </span>
              :
              '--'
          }
        </span>;
      }
    }];

    this.waitColumns = [{
      title: '',
      dataIndex: 'title',
      render: (text, record) => {
        return <span>
          {moment(record.createTime).format('YYYY-MM-DD HH:mm:ss')}
          <span className="u-primary u-mgl10">{record.creator.name}（{record.creator.email}）</span>向您 发起了
          <span className="u-mgr10"><span className="u-primary u-mgl10">
            <TextOverFlow content={record.projectName} maxWidth={'20vw'} />
          </span>项目</span>
          <span className="u-primary">{AUDIT_TYPE_MAP[record.workflowType]} {record.workflowNodeName} </span>审批申请
        </span>;
      }
    }, {
      title: '',
      dataIndex: 'title',
      render: (text, record) => {
        return <a onClick={() => this.getUrl(record)}>查看详情</a>;
      }
    }];
  }

  componentDidMount() {
    this.getDefaultFilter();
  }

  getUrl = (record) => {
    const urlPath = () => {
      switch (record.workflowType) {
        case AUDIT_TYPE_NUM_MAP.BEGIN:
          return `/v2/project/project_begin_approval?id=${record.projectId}`;
        case AUDIT_TYPE_NUM_MAP.FINISH:
          return `/v2/project/project_finish_approval?id=${record.projectId}`;
        case AUDIT_TYPE_NUM_MAP.CHANGE:
          return `/v2/project/project_change_approval?id=${record.projectId}`;
        case AUDIT_TYPE_NUM_MAP.AIM:
          return `/v2/project/aim_accept?pid=${record.projectId}&oid=${record.objectiveId}`;
        default: return '';
      }
    };

    let url = urlPath();

    window.open(url);
  };

  getDefaultFilter = () => {
    const { filterObj } = this.state;
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const auditsFilter = storageFilter.auditsV2 || {};
    const newFilterObj = {
      ...filterObj,
      ...auditsFilter,
    };
    this.setState({ filterObj: newFilterObj }, () => {
      this.getList();
    });
  }

  getList = () => {
    const { createProjectList, waitProjectList } = this.props;
    const { filterObj } = this.state;
    const type = filterObj.type;
    const projectList = type === 'create' ? createProjectList : waitProjectList;
    const projectIdList = [];
    filterObj.projectIdList && filterObj.projectIdList.forEach(it => {
      if (projectList.some(i => i.projectId === it)) {
        projectIdList.push(it);
      }
    });
    const params = {
      projectIdList: projectIdList,
      offset: (filterObj.current - 1) * 10,
      limit: 10,
      orderBy: orderFieldAuditByMap[filterObj.orderBy],
      orderType: orderNameMap[filterObj.orderType],
    };

    if (type === 'create') {
      this.props.dispatch({ type: 'myworkbench/getMyCreateAudit', payload: { ...params } });
      this.props.dispatch({ type: 'myworkbench/getMyCreateAuditProject', payload: { ...params } });
    } else {
      this.props.dispatch({ type: 'myworkbench/getMyWaitAudit', payload: { ...params } });
      this.props.dispatch({ type: 'myworkbench/getMyWaitAuditProject', payload: { ...params } });
    }
  }

  handleRemind = (record) => {
    remindAudit({ workflowSnapshotId: record.workflowSnapshotId }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('已POPO提醒该审批操作人');
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let newFilterObj = {
      ...filterObj,
      [key]: value,
    };

    if (key !== 'current') {
      newFilterObj = {
        ...newFilterObj,
        current: 1,
      };
    }

    this.setState({
      filterObj: newFilterObj,
    }, () => {
      this.getList();
      this.setLocal(newFilterObj);
    });
  }

  // 切换类型(需要从local中获取当前类型下的项目条件)
  updateType = (key, value) => {
    // 调用待我审批的count
    this.props.dispatch({ type: 'myworkbench/getMyWaitAuditCount' });

    const { filterObj } = this.state;

    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    let auditV2 = oldStorageFilter.auditV2 || {};
    const projectIdList = auditV2[`${value}-projectIdList`] || [];

    const newFilterObj = {
      ...filterObj,
      type: value,
      projectIdList: projectIdList,
      current: 1,
    };

    this.setState({
      filterObj: newFilterObj,
    }, () => {
      this.getList();
      this.setLocal(newFilterObj);
    });
  }

  // 切换项目
  updateProject = (key, value) => {
    const { filterObj } = this.state;
    const type = filterObj.type;

    const newFilterObj = {
      ...filterObj,
      [`${type}-projectIdList`]: value,
      projectIdList: value,
      current: 1,
    };

    this.setState({
      filterObj: newFilterObj,
    }, () => {
      this.getList();
      this.setLocal(newFilterObj);
    });
  }

  setLocal = (newFilterObj) => {
    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const newStorageFilter = {
      ...oldStorageFilter,
      auditsV2: newFilterObj,
    };
    localStorage.setItem('my_workbench_filter', JSON.stringify(newStorageFilter));
  }

  getDefaultOrder = (type) => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const auditsFilter = storageFilter.auditsV2 || {};
    if (type === 'orderBy') {
      return auditsFilter.orderBy || 1;
    } else {
      return auditsFilter.orderType || 2;
    }
  }

  render() {
    const { createAuditList, createProjectList, waitAuditList, waitProjectList, auditLoading, count } = this.props;
    const { filterObj } = this.state;
    const type = filterObj.type;
    const objData = type === 'create' ? createAuditList : waitAuditList;
    const projectList = type === 'create' ? createProjectList : waitProjectList;

    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const auditsFilter = storageFilter.auditsV2 || {};
    const localProjectIds = auditsFilter.projectIdList || [];
    const projectIds = [];
    localProjectIds.forEach(item => {
      if (projectList.some(i => i.projectId === item)) {
        projectIds.push(item);
      }
    });

    return (<span className={styles.container}>
      <div className="u-mg10">
        <RadioGroup
          onChange={(e) => this.updateType('type', e.target.value)}
          value={type}
        >
          <RadioButton key={'create'} value={'create'}>我发起的</RadioButton>
          <RadioButton key={'wait'} value={'wait'}>
            <Badge count={count}>
              <span>待我审批的</span>
            </Badge></RadioButton>
        </RadioGroup>

        <span className="queryHover u-mgl20">
          <span className="f-ib f-vam grayColor">所属项目：</span>
          <FilterSelect
            onChange={(value) => this.updateProject('projectIdList', value)}
            dataSource={projectList && projectList.map(item => ({
              label: item.projectName, value: item.projectId,
            }))}
            defaultValue={projectIds}
          />
        </span>

        {
          type === 'create' &&
          <span className="f-fr">
            <span className='grayColor'>排序：</span>
            <OrderTime
              changeOrderField={(value) => this.updateFilter('orderBy', value)}
              changeOrder={(value) => this.updateFilter('orderType', value)}
              orderFieldData={orderFieldAuditData}
              orderData={orderData}
              defaultOrderField={this.getDefaultOrder('orderBy')}
              defaultOrder={this.getDefaultOrder('orderType')}
              from="my_workbench"
            />
          </span>
        }

        <Row>
          <Table
            key={uuid()}
            showHeader={type === 'create'}
            columns={type === 'create' ? this.columns : this.waitColumns}
            dataSource={objData.list}
            className="u-mgt20"
            pagination={{
              pageSize: 10,
              current: filterObj.current,
              onChange: (num) => this.updateFilter('current', num),
              total: objData.total,
            }}
            onRow={(record) => {
              return {
                className: type === 'create' && 'f-csp',
                onClick: () => {
                  if (type === 'create') {
                    this.getUrl(record);
                  }
                }
              };
            }}
            loading={auditLoading}
          />
        </Row>
      </div>

    </span>);
  }
}

export default index;
