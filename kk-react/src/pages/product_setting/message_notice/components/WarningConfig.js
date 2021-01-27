import React, { Component } from 'react';
import { Spin, message, Button, InputNumber, Switch, Row, Col, Checkbox } from 'antd';
import { getWarningConfig, saveWarningConfig } from '@services/product_setting';
import BusinessHOC from '@components/BusinessHOC';
import { WARNING_CONFIG_USE } from '@shared/ProductSettingConfig';

class WarningConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configvalue: {
        configKey: 'version_delay_alert',
        status: 0,
        requireDays: 0,
        reportDays: 0,
        requireNoticeType: [],
        reportNoticeType: [],
      },
      loading: false,
      productid: 0,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    const { productid } = this.props;
    const params = {
      productid: productid,
    };
    getWarningConfig(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      const data = res.result;
      const versionDelayAlertType = data.versionDelayAlertType || {};
      const newValue = {
        ...this.state.configvalue,
        status: versionDelayAlertType.status ? versionDelayAlertType.status : 0,
        requireDays: versionDelayAlertType.requireDays ? versionDelayAlertType.requireDays : 0,
        reportDays: versionDelayAlertType.reportDays ? versionDelayAlertType.reportDays : 0,
        requireNoticeType: versionDelayAlertType.requireNoticeType ? versionDelayAlertType.requireNoticeType.split(',') : [],
        reportNoticeType: versionDelayAlertType.reportNoticeType ? versionDelayAlertType.reportNoticeType.split(',') : [],
      };
      if (newValue.status === WARNING_CONFIG_USE.OPEN) {
        newValue.status = true;
      } else {
        newValue.status = false;
      }
      newValue.requireNoticeType = newValue.requireNoticeType.map(it => Number(it));
      newValue.reportNoticeType = newValue.reportNoticeType.map(it => Number(it));
      this.setState({ configvalue: newValue });
    }).catch((err) => {
      return message.error('获取数据异常', err || err.msg);
    });
  }

  handleSave = () => {
    const { configvalue } = this.state;
    const params = {
      productId: this.props.productid,
      ...configvalue,
    };
    params.reportNoticeType = params.reportNoticeType.join(',');
    params.requireNoticeType = params.requireNoticeType.join(',');
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

  handleChange = (value, key) => {
    const newValue = {
      ...this.state.configvalue,
    };
    newValue[key] = value;
    this.setState({ configvalue: newValue });
  }

  render() {
    const { isBusiness } = this.props;
    const { configvalue } = this.state;

    const limitNumber = value => {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(-1+)|[^\d]/g, '') : 0;
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(-1+)|[^\d]/g, '') : 0;
      } else {
        return 0;
      }
    };

    return (<Spin spinning={this.state.loading}>
      <div style={{ padding: '0px 16px 16px 16px' }}>
        <div className='bbTitle f-jcsb-aic' style={{ marginTop: '0px' }}>
          <span className='name'>版本设置</span>
          <span className='btn98'>
            <Button type='primary' onClick={() => this.handleSave()}>
              保存
            </Button>
          </span>
        </div>
        <div className='bgWhiteModel'>
          <div className='f-aic'>
            <span className='f-fs3 u-mgr20'>版本延期预警:</span>
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
        </div>
      </div>
    </Spin>);
  }
}


export default BusinessHOC()(WarningConfig);
