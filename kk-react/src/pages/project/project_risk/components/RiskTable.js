import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, Tag, message, Divider, Card } from 'antd';
import moment from 'moment';
import uuid from 'uuid';
import TextOverFlow from '@components/TextOverFlow';
import { saveRisk, updateRisk, deleteRisk, getRiskInfo, unBindTask } from '@services/risk';
import DefineDot from '@components/DefineDot';
import OrderTime from '@components/OrderTime';
import { bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import { drawerDelayFun } from '@utils/helper';
import { PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import { deleteModal } from '@shared/CommonFun';
import { riskTypeColorMap, riskTypeNameMap, riskTypeStatusMap, riskTypeStatusColorMap, orderMap, RISK_STATUS_MAP } from '@shared/ProjectConfig';
import RiskForm from './RiskForm';
import CreateTask from './CreateTask';
import QueryArea from './QueryArea';
import styles from '../index.less';

/**
 * @param {String} - from detail/begin/finish 主页/立项审批/结项审批
 * 项目立项和项目结项页面不再调用风险的接口，和其他的信息统一放在一起
 * @param {String} - actionType周报下的风险 view/edit/create
 */

const getCreateButtonStyle = (from) => {
  if (from && from === "detail") {
    return {
      position: 'absolute',
      top: '-90px',
      right: '-20px'
    };
  } else if (from && (from === 'begin' || from === 'finish')) {
    return {
      display: 'none'
    };
  } else {
    return {
      position: 'absolute',
      right: '0px'
    };
  }
};

class RiskTable extends Component {
  state = {
    visible: false,
    orderby: 'addtime',
    order: 'desc',
    filterObj: {},
    current: 1,
    editData: {},
    orderFieldData: [
      { name: '创建时间', key: 1 },
    ],
    orderData: [
      { name: '升序', key: 1 },
      { name: '降序', key: 2 },
    ],
  };

  columns = [{
    title: '名称',
    dataIndex: 'name',
    width: 300,
    render: (text, record) => {
      if (!record.type) {
        return (<span>
          <TextOverFlow content={text} maxWidth={210} />
        </span>);
      } else if (record.type === 'task') {
        return <TextOverFlow
          content={
            <a
            >
              {text}
            </a>}
          maxWidth={200} />;
      } else if (record.type === 'subTask') {
        return <TextOverFlow
          content={<a
          >{text}
          </a>} maxWidth={180} />;
      }
    }
  }, {
    title: '状态',
    dataIndex: 'state',
    render: (text, record) => {
      const statusMap = record.type ? bugTaskNameMap : riskTypeStatusMap;
      const statusColor = record.type ? bugTaskColorDotMap : riskTypeStatusColorMap;

      return (<span style={{ position: 'relative', top: '-2px' }}>
        <DefineDot
          text={text}
          statusMap={statusMap}
          statusColor={statusColor}
        />
      </span>);
    }
  }, {
    title: '风险等级',
    dataIndex: 'level',
    render: (text) => {
      return text ?
        <div style={{ width: '50px' }}>
          <Tag color={riskTypeColorMap[text]}>{riskTypeNameMap[text]}</Tag>
        </div>
        : '-';
    }
  }, {
    title: '负责人',
    dataIndex: 'responseUser',
    render: (text, record) => {
      return <span className='f-ib' style={{ minWidth: '50px' }}>{text ? text.name : '-'}</span>;
    }
  }, {
    title: '创建人',
    dataIndex: 'createUser',
    render: (text, record) => {
      return text ? text.name : '-';
    }
  }, {
    title: '创建时间',
    dataIndex: 'addtime',
    render: (text, record) => {
      return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-';
    }
  }, {
    title: '到期日',
    dataIndex: 'duetime',
    render: (text, record) => {
      return <div style={{ minWidth: '50px' }}>{text ? moment(text).format('YYYY-MM-DD') : '-'}</div>;
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: 250,
    render: (text, record) => {
      const { from, currentMemberInfo, id } = this.props;
      const roleGroup = currentMemberInfo.roleGroup;

      const showOperationColumn = from !== 'begin' && from !== 'finish';
      if (showOperationColumn && roleGroup !== PROEJCT_PERMISSION.READ) {
        if (record.type === 'task') {
          return (<span>
            {
              <CreateTask createType="childtask" parentData={record} getRiskList={this.getRiskList} from={this.props.from} projectId={id} />
            }
          </span>);
        } else if (!record.type) {
          return (<span>
            <a onClick={(e) => { e.stopPropagation(); this.getRiskInfo(record.id) }}>编辑</a>
            <Divider type="vertical" />
            <a
              className='delColor'
              disabled={this.getPermission(record)}
              onClick={(e) => { e.stopPropagation(); this.handleDeleteRisk(record.id) }}>
              删除
            </a>
            <Divider type="vertical" />
            <CreateTask createType="task" parentData={record} getRiskList={this.getRiskList} from={this.props.from} projectId={id} />
          </span>);
        } else if (record.type === 'subTask') {
          return (<span>
            --
          </span>);
        }
      } else {
        return '--';
      }

    }
  }];

  componentDidMount() {
    const { id } = this.props;
    if (id) {
      this.getDefaultRequest(id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.id !== this.props.id) {
      this.getDefaultRequest(this.props.id);
    }
  }

  getDefaultRequest = (id) => {
    sessionStorage.setItem('currentPid', id);
    const { from } = this.props;
    const apiFlag = !from || (from && from !== 'begin' && from !== 'finish');
    if (apiFlag) {
      this.getRiskList();
      this.getUserList();
    }
  }

  handleRemoveTask = () => {
    const { record } = this.state;
    const params = {
      riskId: record.riskId,
      taskId: record.id,
    };

    deleteModal({
      title: '确认移除',
      content: '确认移除该任务及其子任务吗?',
      okCallback: () => {
        unBindTask(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('任务移除成功！');
          this.getRiskList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getPermission = (record) => {
    let flag = true;
    const { currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo.roleGroup;
    if (roleGroup === PROEJCT_PERMISSION.MANAGE || roleGroup === PROEJCT_PERMISSION.EDIT) {
      flag = false;
    }
    if (record.createUser.email === currentMemberInfo && currentMemberInfo.userVO && currentMemberInfo.userVO.email) {
      flag = false;
    }
    return flag;
  }

  getUserList = () => {
    this.props.dispatch({ type: 'risk/getResponseUserList' });
    this.props.dispatch({ type: 'risk/getCreateUserList' });
  }

  getRiskList = () => {
    const { actionType } = this.props;
    const { current, filterObj, order, orderby } = this.state;
    const params = {
      limit: 10,
      offset: (current - 1) * 10,
      ...filterObj,
      order,
      orderby,
    };

    if (actionType) {
      this.props.dispatch({
        type: 'risk/getRiskAll', payload: {
          ...params,
          state: RISK_STATUS_MAP.OPEN,
        }
      });
    } else {
      this.props.dispatch({ type: 'risk/getRiskList', payload: params });
    }
  }

  getData = (data) => {
    const dataSource = [];

    data && data.forEach(it => {
      dataSource.push({
        ...it.projectRisk,
        responseUser: it.responseUser,
        createUser: it.createUser,
        children: it.children,
      });
    });

    return dataSource;
  }

  getRiskInfo = (id) => {
    this.setState({ visible: true, type: 'edit' });
    getRiskInfo(id).then((res) => {
      if (res.code !== 200) return message.error(`获取风险详情失败，${res.msg}`);
      if (res.result) {
        const data = {
          ...res.result.projectRisk,
          responseUser: res.result.responseUser,
          createUser: res.result.createUser
        };

        this.setState({ editData: data });
      }
    }).catch((err) => {
      return message.error(`获取风险详情异常，${err || err.message}`);
    });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    const newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    this.setState({ filterObj: newFilterObj }, () => this.getRiskList());
  }

  handleDeleteRisk = (id) => {
    deleteModal({
      title: '删除风险',
      content: '此操作将不可恢复，你确定要继续吗？',
      okCallback: () => {
        deleteRisk(id).then((res) => {
          if (res.code !== 200) return message.error(`删除风险失败，${res.msg}`);
          message.success('删除风险成功！');
          this.getRiskList();
          this.getRefreshLevel();
        }).catch((err) => {
          return message.error(`删除风险异常，${err || err.message}`);
        });
      }
    });
  }

  getRefreshLevel = () => {
    const { actionType, projectId, reportId } = this.props;
    if (actionType) {
      if (actionType === 'create') {
        this.props.dispatch({ type: 'weekReport/getReportDepend', payload: { id: projectId } });
      } else {
        this.props.dispatch({ type: 'weekReport/getWeekReportDetail', payload: reportId });
      }
    }
  }

  handleOk = () => {
    const { type, editData } = this.state;

    if (type === 'add') {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        saveRisk(values).then((res) => {
          if (res.code !== 200) return message.error(`创建风险失败，${res.msg}`);
          message.success('创建风险成功！');
          this.setState({ visible: false });
          this.getRiskList();
          this.getUserList();
          this.getRefreshLevel();
        }).catch((err) => {
          return message.error(`创建风险异常，${err || err.message}`);
        });
      });
    }

    if (type === 'edit') {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        const params = {
          ...values,
          id: editData.id,
        };
        updateRisk(params).then((res) => {
          if (res.code !== 200) return message.error(`更新风险失败，${res.msg}`);
          message.success('更新风险成功！');
          this.setState({ visible: false });
          this.getRiskList();
          this.getRefreshLevel();
        }).catch((err) => {
          return message.error(`更新风险异常，${err || err.message}`);
        });
      });
    }
  }

  handlePageChange = (current) => {
    this.setState({ current }, () => this.getRiskList());
  }

  changeOrder = (value) => {
    let newValue = orderMap[value];
    this.setState({ order: newValue }, () => this.getRiskList());
  }

  changeOrderField = () => {
    return;
  }

  render() {
    const { visible, type, current, editData, orderData, orderFieldData } = this.state;
    const { riskObj, riskAll, actionType, responseUserList, createUserList, title,
      currentMemberInfo, style, from, projectRiskList } = this.props;
    const roleGroup = currentMemberInfo.roleGroup;
    const hasCreateButtonflag = from !== "detail" && from !== "begin" && from !== "finish";

    return (<div style={style} className={!hasCreateButtonflag && styles.riskTable}>
      {
        hasCreateButtonflag &&
        <div className='bbTitle f-jcsb-aic'>
          <span className='name'>{title}</span>
        </div>
      }

      <Card>
        <div className="u-mgb10">
          <QueryArea
            responseUserList={responseUserList}
            createUserList={createUserList}
            updateFilter={this.updateFilter}
          />

          <OrderTime
            changeOrderField={this.changeOrderField}
            changeOrder={this.changeOrder}
            orderFieldData={orderFieldData}
            orderData={orderData}
          />

          <span
            className='btn98'
            style={getCreateButtonStyle(from)}
          >
            <Button
              className="u-mgl10"
              style={{ position: 'relative', top: '-10px' }}
              disabled={roleGroup === PROEJCT_PERMISSION.READ}
              onClick={() => this.setState({ visible: true, type: 'add' })}>
              新建风险
            </Button>
          </span>
        </div>

        <Table
          key={uuid()}
          rowKey={record => record.id}
          columns={this.columns}
          dataSource={from && (from === 'begin' || from === 'finish') ?
            this.getData(projectRiskList)
            :
            this.getData(actionType ? riskAll : riskObj.data)}
          pagination={
            riskObj.totalCount > 10 && !actionType && from && from !== 'begin' && from !== 'finish' ?
              {
                pageSize: 10,
                current: current,
                onChange: this.handlePageChange,
                defaultCurrent: 1,
                total: riskObj.totalCount
              } : false}
          defaultExpandAllRows
          onRow={(record) => {
            return {
              className: record.type && 'f-csp',
              onClick: (e) => {
                e.stopPropagation();
                if (record.type) {
                  let issueKey = '';
                  if (record.type === 'task') {
                    issueKey = `Task-${record.id}`;
                  } else if (record.type === 'subTask') {
                    issueKey = `Subtask-${record.id}`;
                  }
                  drawerDelayFun(() => {
                    this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: issueKey });
                  }, 200);
                }
              }
            };
          }}
        />
      </Card>

      <Modal
        width={650}
        title={type === 'add' ? '创建风险' : '编辑风险'}
        visible={visible}
        destroyOnClose
        onCancel={() => this.setState({ visible: false })}
        maskClosable={false}
        footer={<span className='btn98'>
          <Button onClick={() => this.setState({ visible: false })}>
            取消
          </Button>
          <Button type="primary" onClick={() => this.handleOk()} disabled={roleGroup === PROEJCT_PERMISSION.READ}>
            确定
          </Button>
        </span>}
      >
        {
          type === 'add' && <RiskForm form={this.props.form} />
        }
        {
          type === 'edit' && <RiskForm form={this.props.form} editData={editData} />
        }
      </Modal>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    riskObj: state.risk.riskObj,
    riskAll: state.risk.riskAll,
    responseUserList: state.risk.responseUserList,
    createUserList: state.risk.createUserList,
    currentMemberInfo: state.user.currentMemberInfo,
  };
};
export default withRouter(connect(mapStateToProps)(Form.create()(RiskTable)));
