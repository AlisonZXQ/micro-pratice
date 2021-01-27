import React, { Component } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Button, Table, message, Spin } from 'antd';
import ProjectList from '@components/ProjectList';
import TextOverFlow from '@components/TextOverFlow';
import { deleteWeekReport, copyWeekReport } from '@services/weekReport';
import OrderTime from '@components/OrderTime';
import DefineDot from '@components/DefineDot';
import { deleteModal } from '@shared/CommonFun';
import { PROEJCT_PERMISSION, WEEKREPORT_TYPE, weekReportStateMap, weekReportStateColorMap, timeMap, orderMap, WEEKREPORT_TEMPLATE_TYPE } from '@shared/ProjectConfig';
import CreateWeekReport from '@pages/project/components/create_week_report';

import QueryArea from './components/QueryArea';
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      current: 1, // pageNum
      filterObj: {},
      loading: false,
      orderby: 'updatetime',
      order: 'desc',
      orderFieldData: [
        { name: '更新时间', key: 'updatetime' },
        { name: '开始时间', key: 'starttime' },
        { name: '结束时间', key: 'endtime' },
      ],
      orderData: [
        { name: '升序', key: 'asc' },
        { name: '降序', key: 'desc' },
      ]
    };

    this.columns = [{
      title: '报告名称',
      dataIndex: 'name',
      width: 350,
      render: (text) => {
        return <TextOverFlow content={text} maxWidth={300} />;
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      render: (text) => {
        return (<DefineDot
          text={text}
          statusMap={weekReportStateMap}
          statusColor={weekReportStateColorMap}
        />);
      }
    },
    // {
    //   title: '风险等级',
    //   dataIndex: 'level',
    //   render: (text, record) => {
    //     const state = record.state === 2 ? record.level : record.latestLevel;
    //     return <Tag color={riskTypeColorMap[state]}>{riskTypeNameMap[state]}</Tag>;
    //   }
    // },
    {
      title: '更新时间',
      dataIndex: 'updatetime',
      render: (text) => {
        return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-';
      }
    }, {
      title: '起止时间',
      dataIndex: 'timeRange',
      render: (text, record) => {
        return (record.starttime && record.endtime) ?
          `${moment(record.starttime).format('YYYY-MM-DD')}~${moment(record.endtime).format('YYYY-MM-DD')}` : '-';
      }
    }, {
      title: '创建人',
      dataIndex: 'createUser',
      render: (text, record) => {
        return record.createUser.realname;
      }
    }, {
      title: '操作',
      dataIndex: 'caozuo',
      render: (text, record) => {
        const { currentMemberInfo } = this.props;
        const roleGroup = currentMemberInfo.roleGroup;

        return (<span>
          <a
            className="u-mgr10"
            onClick={(e) => { e.stopPropagation(); this.handleCopy(record.id) }}
            disabled={roleGroup === PROEJCT_PERMISSION.READ}
          >复制</a>
          <a className="u-mgr10"
            disabled={record.state === WEEKREPORT_TYPE.DONE || roleGroup === PROEJCT_PERMISSION.READ}
            onClick={(e) => { e.stopPropagation(); this.handleUpdate(record.projectid, record.id, record.templateType || WEEKREPORT_TEMPLATE_TYPE.EMPTY) }}
          >编辑</a>
          <a
            className='delColor'
            disabled={this.getPermission(record) || roleGroup === PROEJCT_PERMISSION.READ}
            onClick={(e) => { e.stopPropagation(); this.handleDeleteReport(record.id) }}
          >删除</a>
        </span>);
      }
    }];
  }

  componentDidMount() {
    const { id } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);
    this.props.dispatch({ type: 'weekReport/getWeekReportCreator' });
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
    this.getList();
  }

  getPermission = (record) => {
    const { currentMemberInfo } = this.props;
    const flag = record.createUser && currentMemberInfo.userVO && (record.createUser.email !== currentMemberInfo.userVO.email);
    return currentMemberInfo.role === PROEJCT_PERMISSION.READ && flag;
  }

  handleUpdate = (id, reportId, templateType) => {
    history.push(`/project/project_week_report/edit?id=${id}&reportId=${reportId}&template=${templateType}`);
  }

  getList = () => {
    const { current, filterObj, orderby, order } = this.state;
    const params = {
      offset: (current - 1) * 10,
      limit: 10,
      ...filterObj,
      orderby,
      order,
    };

    this.props.dispatch({ type: 'weekReport/getWeekReportByPage', payload: params });
  }

  getData = (data) => {
    const dataSource = [];

    data && data.forEach(it => {
      dataSource.push({
        ...it.projectWeekReport,
        responseUser: it.responseUser,
        createUser: it.createUser,
        latestLevel: it.latestLevel,
      });
    });
    return dataSource;
  }

  handleCopy = (id) => {
    this.setState({ loading: true });
    copyWeekReport(id).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(`复制周报失败，${res.msg}`);
      message.success(`复制周报成功！`);
      this.getList();
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`复制周报异常，${err || err.message}`);
    });
  }

  handleDeleteReport = (id) => {
    const { reportObj } = this.props;
    const data = reportObj.data || [];
    deleteModal({
      title: '删除周报',
      content: '此操作将不可恢复，你确定要继续吗？',
      okCallback: () => {
        deleteWeekReport(id).then((res) => {
          if (res.code !== 200) return message.error(`删除周报失败，${res.msg}`);
          message.success('删除周报成功！');
          if(data.length === 1) { //如果是当前页的最后一个，跳转到第一页
            this.setState({ current: 1 }, () => {
              this.getList();
            });
          }else {
            this.getList();
          }
        }).catch((err) => {
          return message.error(`删除周报异常，${err || err.message}`);
        });
      }
    });
  }

  handlePageChange = (pageNum) => {
    this.setState({ current: pageNum }, () => this.getList());
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    const newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    this.setState({ filterObj: newFilterObj }, () => this.getList());
  }
  changeOrderField = (value) => {
    let newValue = timeMap[value];
    this.setState({ orderby: newValue }, () => this.getList());
  }

  changeOrder = (value) => {
    let newValue = orderMap[value];
    this.setState({ order: newValue }, () => this.getList());
  }

  render() {
    const extra = [{ name: '周报管理', link: null }];
    const { id } = this.props.location.query;
    const { reportObj, weekReportCreator, weekListLoading, currentMemberInfo } = this.props;
    const { current, orderFieldData, orderData } = this.state;
    const roleGroup = currentMemberInfo.roleGroup;

    return (
      <Spin spinning={weekListLoading}>
        <Card
        >
          <ProjectList id={id} extra={extra} />
        </Card>

        <div style={{ padding: '0px 20px 20px 20px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '17px 0px' }}>
            <span className='name'>周报列表</span>
            <CreateWeekReport
              trigger={
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  disabled={roleGroup === PROEJCT_PERMISSION.READ}>
                  新建周报
                </Button>}
              projectId={id}
            />
          </div>
          <div className={styles.listStyle}>
            <div className={`${styles.queryArea} f-jcsb-aic u-pdl20 u-pdr20`}>
              <QueryArea
                updateFilter={this.updateFilter}
                weekReportCreator={weekReportCreator}
              />
              <div>
                <span className='grayColor'>排序：</span>
                <OrderTime
                  changeOrderField={this.changeOrderField}
                  changeOrder={this.changeOrder}
                  orderFieldData={orderFieldData}
                  orderData={orderData}
                />
              </div>
            </div>
            <Table
              rowKey={record => record.id}
              className='u-pdl20 u-pdr20'
              columns={this.columns}
              dataSource={this.getData(reportObj.data)}
              onRow={(record) => {
                return {
                  className: 'f-csp',
                  onClick: () => {
                    history.push(`/project/project_week_report/view?id=${record.projectid}&reportId=${record.id}&template=${record.templateType}`);
                  },
                };
              }}
              pagination={reportObj.totalCount > 10 ? {
                pageSize: 10,
                current: current,
                onChange: this.handlePageChange,
                defaultCurrent: 1,
                total: reportObj.totalCount
              } : false}
            />
          </div>
        </div>
      </Spin>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    reportObj: state.weekReport.reportObj,
    weekReportCreator: state.weekReport.weekReportCreator,
    weekListLoading: state.loading.effects['weekReport/getWeekReportByPage'],
    currentMemberInfo: state.user.currentMemberInfo,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
