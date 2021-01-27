import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Table,
  Button,
  Modal,
  message,
  Switch,
  Input,
  Checkbox,
  Card,
  Empty,
  Spin,
  Row,
  Col,
} from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import moment from 'moment';
import NoPermission from '@components/403';
import { deleteSnapshot, getSnapshotConfig, setSnapshotConfig } from '@services/report';
import TextOverFlow from '@components/TextOverFlow';
import { getFormLayout } from '@utils/helper';
import { deleteModal } from '@shared/CommonFun';
import { REPORT_TABS, REOPRT_PERMISSION, REPORT_AUTO, WEEKLY_REPORT, MONTHLY_REPORT } from '@shared/ReportConfig';
import Header from '../components/Header';
import QueryArea from './components/QueryArea';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 14);

class index extends Component {
  state = {
    visible: false,
    reportId: '',
    filterObj: {},
    current: 1, //pageNum
    configInfo: {},
    configLoading: false,
    productId: '',
  }

  columns = [{
    title: '报告名称',
    dataIndex: 'name',
    width: '40vw',
    render: (text, record) => {
      return (record.reportSnapshot && record.reportSnapshot.name) ?
        <TextOverFlow content={record.reportSnapshot.name} maxWidth={'40vw'} /> : '-';
    }
  }, {
    title: '创建时间',
    dataIndex: 'addtime',
    render: (text, record) => {
      return (record.reportSnapshot && record.reportSnapshot.addtime) ?
        moment(record.reportSnapshot.addtime).format('YYYY-MM-DD HH:mm:ss') : '-';
    }
  }, {
    title: '创建人',
    dataIndex: 'creator',
    render: (text, record) => {
      return (record.autoGenerate ? '系统' : (record.optUser && record.optUser.realname) ? record.optUser.realname : '');
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      const { currentUserReportPer } = this.props;
      return (<a
        style={{ color: '#F1F3F5' }}
        onClick={(e) => { e.stopPropagation(); this.handleDelete(record.reportSnapshot.id) }}
        disabled={currentUserReportPer.auth !== REOPRT_PERMISSION.MANAGE}
      >删除</a>);
    }
  }]

  componentDidMount() {
    const { lastProduct } = this.props;
    if (lastProduct && lastProduct.id) {
      const id = lastProduct.id;
      this.setState({ productId: id }, () => {
        this.getSnapshotByPage();
        this.getUserReportPer();
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeId = this.props.lastProduct && this.props.lastProduct.id;
    const nextId = nextProps.lastProduct && nextProps.lastProduct.id;
    if (beforeId !== nextId) {
      history.push(`/report/list?productid=${nextId}`);
      this.setState({ productId: nextId }, () => {
        this.getSnapshotByPage();
        this.getUserReportPer();
      });
    }
  }

  getUserReportPer = () => {
    const { productId } = this.state;
    this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: productId } });
  }

  getSnapshotByPage = () => {
    const { filterObj, current, productId } = this.state;
    const params = {
      productId: Number(productId),
      ...filterObj,
      limit: 10,
      offset: (current - 1) * 10,
    };
    this.props.dispatch({ type: 'report/getSnapshotByPage', payload: params });
  }

  getSnapshotConfig = () => {
    const { productid } = this.props.location.query;
    getSnapshotConfig({ productid: productid }).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({
        configInfo: res.result,
      });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleDelete = (rid) => {
    const that = this;
    deleteModal({
      title: '删除报告不可恢复',
      content: '确定要删除吗？',
      okCallback: () => {
        deleteSnapshot({ id: rid }).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除报告成功！');
          that.getSnapshotByPage();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  onChange = (value) => {
    this.setState({ checked: value });
  }

  getStartTime = (date) => {
    return date ? new Date(date).setHours(0, 0, 0, 0) : '';
  }

  getEndTime = (date) => {
    return date ? new Date(date).setHours(23, 59, 59, 999) : '';
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let newFilterObj = {
      ...filterObj
    };
    if (key === 'start') {
      newFilterObj['start'] = this.getStartTime(value);
    } else if (key === 'end') {
      newFilterObj['end'] = this.getEndTime(value);
    } else {
      newFilterObj[key] = value;
    }
    this.setState({
      filterObj: newFilterObj,
      current: 1,
    }, () => this.getSnapshotByPage());
  }

  setSnapshotConfig = () => {
    const { productid } = this.props.location.query;

    this.props.form.validateFields((err, values) => {

      if (values.state && !values.name.trim().length) {
        return message.error('报告名称必填！');
      }

      const params = {
        productid: productid,
        state: values.state ? REPORT_AUTO.OPEN : REPORT_AUTO.CLOSE,
        name: values.name,
        weekly: values.weekly ? WEEKLY_REPORT.OPEN : WEEKLY_REPORT.CLOSE,
        monthly: values.monthly ? MONTHLY_REPORT.OPEN : MONTHLY_REPORT.CLOSE,
      };
      this.setState({ configLoading: true });
      setSnapshotConfig(params).then((res) => {
        this.setState({ configLoading: false });
        if (res.code !== 200) return message.error(res.msg);
        message.success('设置自动报告配置信息成功！');
        this.setState({ visible: false });
      }).catch((err) => {
        this.setState({ configLoading: false });
        return message.error(err || err.message);
      });
    });

  }

  handlePageChange = (pageNum) => {
    this.setState({ current: pageNum }, () => this.getSnapshotByPage());
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, snapShotObj, snapShotLoading, currentUserReportPer, reportPermission } = this.props;
    const { productid } = this.props.location.query;
    const { visible, configInfo, current, configLoading } = this.state;

    return (<Card className={`${styles.reportCard} bgCard`}>
      <Header activeKey={`${REPORT_TABS.REPORT_LIST}`} />
      <div style={{ padding: '0px 20px 20px 20px' }}>
        {
          productid ?
            reportPermission ?
              <Spin spinning={snapShotLoading}>
                <div className="u-mgt8 bgWhiteModel">
                  <QueryArea updateFilter={this.updateFilter} />
                  <Button type='primary' className="f-fr" style={{ position: 'absolute', right: '20px', top: '-48px' }}
                    onClick={() => { this.setState({ visible: true }); this.getSnapshotConfig() }}
                    disabled={currentUserReportPer.auth !== REOPRT_PERMISSION.MANAGE}
                  >自动报告配置</Button>
                </div>
                <div className='bgWhiteModel u-mgt8' style={{ paddingBottom: '0px' }}>
                  <Table
                    className='tableMargin'
                    rowKey={record => record.id}
                    columns={this.columns}
                    dataSource={snapShotObj.list}
                    onRow={(record) => {
                      return {
                        className: 'f-csp',
                        onClick: () => {
                          history.push(`/report/detail?productid=${productid}&reportid=${record.reportSnapshot.id}`);
                          this.setState({ reportId: record.reportSnapshot.id });
                        }
                      };
                    }}
                    pagination={{
                      pageSize: 10,
                      current: current,
                      onChange: this.handlePageChange,
                      defaultCurrent: 1,
                      total: snapShotObj.totalCount,
                    }}
                  />
                </div>
                <Modal
                  title="自动报告配置"
                  visible={visible}
                  onCancel={() => this.setState({ visible: false })}
                  onOk={() => this.setSnapshotConfig()}
                  okButtonProps={{ loading: configLoading }}
                  destroyOnClose
                  maskClosable={false}
                >
                  <Row>
                    <Col span={24}>
                      <FormItem label="自动报告配置" {...formLayout}>
                        {
                          getFieldDecorator('state', {
                            initialValue: configInfo.state === REPORT_AUTO.OPEN,
                            valuePropName: 'checked',
                          })(
                            <Switch
                              checkedChildren="开启"
                              unCheckedChildren="关闭"
                            />)
                        }
                      </FormItem>
                    </Col>

                    <Col span={24}>
                      <FormItem label="报告名称" {...formLayout}>
                        {
                          getFieldDecorator('name', {
                            initialValue: configInfo.name,
                          })(
                            <Input disabled={!getFieldValue('state')} style={{ width: '300px' }} className="f-ib" />
                          )
                        }
                      </FormItem>
                    </Col>
                  </Row>
                  <FormItem style={{ marginBottom: '0px' }} label="生成日期" {...formLayout}>
                    {
                      getFieldDecorator('weekly', {
                        initialValue: configInfo.weekly === WEEKLY_REPORT.OPEN,
                        valuePropName: 'checked',
                      })(
                        <Checkbox disabled={!getFieldValue('state')}>每周一 00:00</Checkbox>
                      )
                    }
                    {
                      getFieldDecorator('monthly', {
                        initialValue: configInfo.monthly === MONTHLY_REPORT.OPEN,
                        valuePropName: 'checked',
                      })(
                        <Checkbox disabled={!getFieldValue('state')}>每月1日 00:00</Checkbox>
                      )
                    }
                  </FormItem>
                </Modal>
              </Spin> : <NoPermission /> :
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '60vh', marginTop: '150px' }} />
        }
      </div>
    </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    snapShotObj: state.report.snapShotObj,
    snapShotLoading: state.loading.effects['report/getSnapshotByPage'],
    currentUserReportPer: state.report.currentUserReportPer,
    lastProduct: state.product.lastProduct,
    reportPermission: state.report.reportPermission,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
