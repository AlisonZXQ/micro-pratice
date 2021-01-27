import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Spin,
  Switch,
  Button,
  Checkbox,
  Table,
  message,
  Modal,
  Select,
  Row,
  Col,
  InputNumber,
} from 'antd';
import { getFormLayout } from '@utils/helper';
import {
  getWarningConfig, saveWarningConfig, notificationUserList,
  deleteNotificationUser, addNotificationUser,
} from '@services/product_setting';
import { queryUser } from '@services/project';
import BusinessHOC from '@components/BusinessHOC';
import { deleteModal } from '@shared/CommonFun';
import { WARNING_CONFIG_USE, warningConfigType, warningConfigKey } from '@shared/ProductSettingConfig';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(5, 15);

class AdviseTicketWarning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      configvalue: {
        configKey: warningConfigKey[this.props.type],
        status: 0,
        requireDays: 0,
        reportDays: 0,
        customDays: 0,
        requireNoticeType: '',
        reportNoticeType: '',
        customNoticeType: '',
      },
      dataSource: [],
      userEmailList: [],
      addVisible: false,
    };
    this.columns = [
      {
        title: '通知人员',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          return <span>{record.user.realname}</span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: 160,
        render: (text, record) => {
          return (
            <a className="delColor" onClick={() => { this.handleDelete(record) }}>移除</a>
          );
        }
      },
    ];
  }

  componentDidMount() {
    this.getData();
    this.getNoticeUser();
  }

  getData = () => {
    const params = {
      productid: this.props.productid,
    };
    getWarningConfig(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      const data = res.result;
      const { type } = this.props;
      let acceptAlertType = {};
      if(type === 'advise') {
        acceptAlertType = data.adviseAcceptAlertType || {};
      }else {
        acceptAlertType = data.ticketAcceptAlertType || {};
      }
      const newValue = {
        ...this.state.configvalue,
        status: acceptAlertType.status ? acceptAlertType.status : 0,
        requireDays: acceptAlertType.requireDays ? acceptAlertType.requireDays : 0,
        reportDays: acceptAlertType.reportDays ? acceptAlertType.reportDays : 0,
        customDays: acceptAlertType.customDays ? acceptAlertType.customDays : 0,
        requireNoticeType: acceptAlertType.requireNoticeType ? acceptAlertType.requireNoticeType.split(',') : [],
        reportNoticeType: acceptAlertType.reportNoticeType ? acceptAlertType.reportNoticeType.split(',') : [],
        customNoticeType: acceptAlertType.customNoticeType ? acceptAlertType.customNoticeType.split(',') : [],
      };
      if (newValue.status === WARNING_CONFIG_USE.OPEN) {
        newValue.status = true;
      } else {
        newValue.status = false;
      }
      newValue.requireNoticeType = newValue.requireNoticeType.map(it => Number(it));
      newValue.reportNoticeType = newValue.reportNoticeType.map(it => Number(it));
      newValue.customNoticeType = newValue.customNoticeType.map(it => Number(it));
      this.setState({ configvalue: newValue });
    }).catch((err) => {
      return message.error('获取数据异常', err || err.msg);
    });
  }

  getNoticeUser = () => {
    const params = {
      productid: this.props.productid,
      affect: warningConfigType[this.props.type],
    };
    notificationUserList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ dataSource: res.result });
    }).catch((err) => {
      return message.error('获取数据异常', err || err.msg);
    });
  }

  saveData = () => {
    const { configvalue } = this.state;
    const params = {
      productId: this.props.productid,
      ...configvalue,
    };
    params.reportNoticeType = params.reportNoticeType.join(',');
    params.requireNoticeType = params.requireNoticeType.join(',');
    params.customNoticeType = params.customNoticeType.join(',');
    if (params.status === true) {
      params.status = WARNING_CONFIG_USE.OPEN;
    } else {
      params.status = WARNING_CONFIG_USE.CLOSE;
    }
    saveWarningConfig(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`保存数据失败, ${res.msg}`);
      }
      this.getData();
      return message.success('保存成功');
    }).catch((err) => {
      return message.error('保存数据异常', err || err.msg);
    });
  }

  handleDelete = (record) => {
    const _this = this;
    const params = {
      id: record.notificationUserList.id,
    };
    deleteModal({
      title: `您确认删除用户【${record.user.realname}】吗?`,
      okCallback: () => {
        deleteNotificationUser(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功');
          _this.getNoticeUser();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });
  }

  handleSearch = (value) => {
    const params = {
      value: value,
      offset: 0,
      limit: 10,
    };
    if (value === '') {
      return;
    }
    queryUser(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询人员失败, ${res.msg}`);
      }
      this.setState({ userEmailList: res.result });
    }).catch((err) => {
      return message.error('查询人员异常', err || err.msg);
    });
  }

  handleSelectEmail = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ email: data.props.data.email });
  }

  handleAddOk = () => {
    this.props.form.validateFieldsAndScroll(['email'], (err, values) => {
      if (err) return;
      const params = {
        productid: this.props.productid,
        affect: warningConfigType[this.props.type],
        type: 1,
        email: values.email,
      };
      addNotificationUser(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`添加失败, ${res.msg}`);
        }
        message.success('添加成功！');
        this.setState({ addVisible: false });
        this.getNoticeUser();
      }).catch((err) => {
        return message.error('添加异常', err || err.msg);
      });
    });
  }

  handleChange = (value, key) => {
    const newValue = {
      ...this.state.configvalue,
    };
    newValue[key] = value;
    this.setState({ configvalue: newValue });
  }

  render() {
    const { form: { getFieldDecorator }, isBusiness, type } = this.props;
    const { configvalue, dataSource, addVisible, userEmailList } = this.state;

    const limitNumber = value => {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(-1+)|[^\d]/g, '') : 0;
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(-1+)|[^\d]/g, '') : 0;
      } else {
        return 0;
      }
    };

    return (
      <Spin spinning={this.state.loading}>
        <div style={{ padding: '0px 16px 16px 16px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ marginTop: '0px' }}>
            <span className='name'>未受理{type === 'advise' ? '建议' : '工单'}提醒</span>
            <span span={13} className='btn98'>
              <Button type='primary' onClick={() => this.saveData()}>保存</Button>
            </span>
          </div>
          <div className='bgWhiteModel'>
            <div className='f-aic'>
              <span className='f-fs3 u-mgr20'>未受理{type === 'advise' ? '建议' : '工单'}预警:</span>
              <Switch checked={configvalue.status} onChange={(value) => this.handleChange(value, 'status')} />
            </div>
            <Row className='u-mgt20' style={{ height: '30px' }}>
              <Col span={3} style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '20px' }}>负责人</Col>
              <Col span={6} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <span>最大阀值：</span>
                <InputNumber
                  min={0}
                  step={1}
                  formatter={limitNumber}
                  parser={limitNumber}
                  value={configvalue.requireDays}
                  onChange={(value) => this.handleChange(value, 'requireDays')}
                />
                <span className='u-mgl10'>天</span>
              </Col>
              <Col style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Checkbox.Group
                  onChange={(value) => this.handleChange(value, 'requireNoticeType')}
                  value={configvalue.requireNoticeType}>
                  {
                    !isBusiness && <Checkbox value={1}>泡泡</Checkbox>
                  }
                  <Checkbox value={2}>邮箱</Checkbox>
                </Checkbox.Group>
              </Col>
            </Row>

            <Row className='u-mgt20' style={{ height: '30px' }}>
              <Col span={3} style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '20px' }}>报告人</Col>
              <Col span={6} style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <span>最大阀值：</span>
                <InputNumber
                  min={0}
                  step={1}
                  formatter={limitNumber}
                  parser={limitNumber}
                  value={configvalue.reportDays}
                  onChange={(value) => this.handleChange(value, 'reportDays')}
                />
                <span className='u-mgl10'>天</span>
              </Col>
              <Col style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Checkbox.Group
                  onChange={(value) => this.handleChange(value, 'reportNoticeType')}
                  value={configvalue.reportNoticeType}>
                  {
                    !isBusiness && <Checkbox value={1}>泡泡</Checkbox>
                  }
                  <Checkbox value={2}>邮箱</Checkbox>
                </Checkbox.Group>
              </Col>
            </Row>

            <Row className='u-mgt20'>
              <Col span={3}></Col>
              <Col span={21}>
                <Table
                  dataSource={dataSource}
                  columns={this.columns}
                  pagination={false}
                />
                <a className='f-csp u-mgl10 u-mgt10' onClick={() => this.setState({ addVisible: true })}>
                  <PlusOutlined />
                  添加人员
                </a>
                <div className='u-mgl10 u-mgt10'>
                  <span>最大阀值：</span>
                  <InputNumber
                    min={0}
                    step={1}
                    formatter={limitNumber}
                    parser={limitNumber}
                    value={configvalue.customDays}
                    onChange={(value) => this.handleChange(value, 'customDays')}
                  />
                  <span className='u-mgl10'>天</span>
                  <Checkbox.Group
                    className='u-mgl60'
                    onChange={(value) => this.handleChange(value, 'customNoticeType')}
                    value={configvalue.customNoticeType}>
                    {
                      !isBusiness && <Checkbox value={1}>泡泡</Checkbox>
                    }
                    <Checkbox value={2}>邮箱</Checkbox>
                  </Checkbox.Group>
                </div>
              </Col>
            </Row>

          </div>

          <Modal
            title='加人到通知人员列表'
            visible={addVisible}
            onOk={() => this.handleAddOk()}
            onCancel={() => this.setState({ addVisible: false })}
            destroyOnClose={true}
            maskClosable={false}
          >
            <FormItem label="邮箱" {...formLayout}>
              {getFieldDecorator('email', {
                initialValue: '',
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select
                  showArrow={false}
                  showSearch
                  placeholder="请选择"
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  onSearch={(value) => this.handleSearch(value)}
                  onChange={(value, data) => this.handleSelectEmail(value, data)} // select不适用于回填的情况
                >
                  {
                    userEmailList && userEmailList.map(it => (
                      <Option key={it.email} value={it.email} data={it}>{it.realname || it.name} {it.email}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Modal>
        </div>
      </Spin>
    );
  }
}


export default BusinessHOC()(AdviseTicketWarning);
