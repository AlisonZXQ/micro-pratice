import React, { Component } from 'react';
import Rates from '@components/Rates';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Input,
  Select,
  Tooltip,
  message,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Slider,
  Card,
} from 'antd';
import { equalsObj } from '@utils/helper';
import { getUserExist } from '@services/requirement';
import { fuzadu } from '../shared/Config';
import { getTitle } from '../shared/Helper';
import styles from '../../index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const Option = Select.Option;

class ProductDesign extends Component {
  state = {
    userList: [],
    interList: [],
    visionList: [],
  }

  componentDidMount() {
    const { data } = this.props;
    this.getDefaultData(data);
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (nextProps.data && Object.keys(nextProps.data).length !== 0 && !equalsObj(this.props.data, nextProps.data)) {
      this.getDefaultData(nextProps.data);
    }
  }

  getDefaultData = (editData) => {
    if (editData && editData.interUser) {
      this.setState({ interList: [editData.interUser] });
    }
    if (editData && editData.visionUser1) {
      this.setState({ visionList: [editData.visionUser1] });
    }
  }

  handleSearch = (value, type) => {
    const params = {
      search: value,
    };
    if (value.length) {
      getUserExist(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          if (type === 'inter') {
            this.setState({ interList: res.result });
          } else {
            this.setState({ visionList: res.result });
          }
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  handleSelect = (value, data, type) => {
    const { form: { setFieldsValue } } = this.props;

    if (type === 'inter') {
      setFieldsValue({ interUser: data.props.data });
    } else {
      setFieldsValue({ visionUser1: data.props.data });
    }

  }

  getDefaultValue = (it) => {
    const { data, form: { getFieldValue } } = this.props;

    if (data && it.type !== 'platformNum') {
      return data[it.type] || 3;
    }

    if (!data && it.type !== 'platformNum') {
      return 3;
    }

    if (data && it.type === 'platformNum') {
      if (data.platformNum) {
        return data.platformNum;
      } else if (data.platform) {
        return data.platform.length <= 5 ? data.platform.length : 5;
      }
    }

    if (!data && it.type === 'platformNum') {
      return getFieldValue('platform') && getFieldValue('platform').length <= 5 ? getFieldValue('platform').length : 5;
    }
  }

  handleChangeCheck = (type) => {
    const { form: { setFieldsValue } } = this.props;

    if (type === 'inter') {
      setFieldsValue({
        interId: '',
        interUser: '',
      });
    }
    if (type === 'vision') {
      setFieldsValue({
        visionId1: '',
        visionUser1: '',
      });
    }
  }

  handleLocalSelect = (it, type) => {
    const { form: { setFieldsValue } } = this.props;
    if (type === 'inter') {
      setFieldsValue({
        interId: it.email,
        interUser: it,
      });
    } else {
      setFieldsValue({
        visionUser1: it,
        visionId1: it.email,
      });
    }
  }

  handleChangeSlider = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ pageNum1: value });
  }

  handleChangePage = (value) => {
    const { form: { setFieldsValue } } = this.props;
    if (value >= 100) {
      setFieldsValue({ slider1: 100 });
    } else {
      setFieldsValue({ slider1: value || 0 });
    }
  }

  getSilderNum = () => {
    const { data } = this.props;
    if (data && data.pageNum1) {
      if (data.pageNum1 >= 100) {
        return 100;
      } else {
        return data.pageNum1;
      }
    } else {
      return 1;
    }
  }

  validFunctionPage = (rule, value, callback) => {
    if (!value) {
      if (value === 0) {
        callback();
      } else {
        callback('页数不能为空！');
      }
    } else if (typeof Number(value) !== 'number') {
      callback('页数必须为数字！');
    } else if (value % 1 !== 0) {
      callback('页数必须为正整数！');
    } else if (value < 0 || value > 500) {
      callback('页数必须为0-500的数字！');
    } else {
      callback();
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data } = this.props;
    const { interList, visionList } = this.state;
    const local = localStorage.getItem('designUser') ? JSON.parse(localStorage.getItem('designUser')) : {};

    return (
      <span>
        <Card className={styles.cardStyle}>
          {getTitle('设计页数', true, null)}
          <FormItem>
            <Row>
              <Col span={4}>
                {
                  getFieldDecorator('pageNum1', {
                    initialValue: data && data.pageNum1 ? data.pageNum1 : 1,
                    rules: [
                      { validator: this.validFunctionPage }
                    ],
                  })(
                    <InputNumber
                      placeholder="页数"
                      step={1}
                      onChange={(value) => this.handleChangePage(value)}
                    />
                  )
                }
              </Col>
              <Col span={20}>
                {getFieldDecorator('slider1', {
                  initialValue: this.getSilderNum(),
                })(
                  <Slider
                    marks={{
                      '0': '0',
                      '10': '10',
                      '20': '20',
                    }}
                    onChange={(value) => this.handleChangeSlider(value)}
                  />,
                )}
              </Col>
            </Row>
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('复杂度预估', true, null)}
          <FormItem>
            {
              fuzadu.map((it, index) => <Row
                style={{ border: '1px solid #E1E3E6', padding: '5px', borderBottom: it.id === 4 ? '1px solid #E1E3E6' : 'unset' }}>
                <Col span={6}>
                  <span style={{ marginLeft: '24px' }}>{it.name}</span>
                  <Tooltip title={it.tip}>
                    <InfoCircleTwoTone className="u-mgl5 f-fs2" />
                  </Tooltip>
                </Col>
                <Col span={8}>
                  {
                    getFieldDecorator(`${it.type}`, {
                      initialValue: this.getDefaultValue(it),
                      rules: [{ required: true, message: '此项必填！' }],
                    })(
                      <Rates total={5} value={this.getDefaultValue(it)} />
                    )
                  }
                </Col>
                <Col span={10}>
                  <span style={{ color: '#7C8895' }}>{it.des[getFieldValue(it.type)]}</span>
                </Col>
              </Row>)
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('指派设计师', true, <span className="u-subtitle f-fs1">产品设计默认需要交互支持+视觉支持；如有特殊要求请手动调整</span>)}
          <FormItem>
            <Row className="u-mgb10">
              <Col span={2}>
                {
                  getFieldDecorator('INTERACTION', {
                    initialValue: data ? data.INTERACTION : true,
                    valuePropName: 'checked',
                  })(
                    <Checkbox onChange={() => this.handleChangeCheck('inter')}>交互</Checkbox>
                  )
                }
              </Col>
              <Col span={20}>
                <FormItem>
                  {
                    getFieldDecorator('interId', {
                      initialValue: data && data.interUser && data.interUser.email,
                      rules: [{ required: getFieldValue('INTERACTION'), message: '此项必填！' }],
                    })(
                      <Select
                        allowClear
                        showSearch
                        placeholder="请输入人名或邮箱"
                        filterOption={false}
                        onSearch={(value) => this.handleSearch(value, 'inter')}
                        disabled={!getFieldValue('INTERACTION')}
                        onChange={(value, data) => this.handleSelect(value, data, 'inter')}
                        style={{ width: 400 }}
                      >
                        {
                          interList && interList.map(it => (
                            <Option key={it.email} value={it.email} data={it}>{it.name} {it.email}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                  {
                    local.interUser && getFieldValue('INTERACTION') &&
                    <div>
                      <span style={{ color: '#7C8895' }}>最近选择：</span>
                      {local.interUser.map((it, index) =>
                        index < 10 &&
                        <div className={styles.tagStyle} onClick={() => this.handleLocalSelect(it, 'inter')}>
                          {it.name}
                        </div>)}
                    </div>
                  }
                </FormItem>
                {
                  getFieldDecorator('interUser', {
                    initialValue: data && data.interUser,
                  })(
                    <Input style={{ display: 'none' }} />
                  )
                }
              </Col>
            </Row>
            <Row>
              <Col span={2}>
                {
                  getFieldDecorator('VISION', {
                    initialValue: data ? data.VISION : true,
                    valuePropName: 'checked',
                  })(
                    <Checkbox onChange={() => this.handleChangeCheck('vision')}>视觉</Checkbox>
                  )
                }
              </Col>
              <Col span={20}>
                <FormItem>
                  {
                    getFieldDecorator('visionId1', {
                      initialValue: data && data.visionUser1 && data.visionUser1.email,
                      rules: [{ required: getFieldValue('VISION'), message: '此项必填！' }],
                    })(
                      <Select
                        allowClear
                        showSearch
                        placeholder="请输入人名或邮箱"
                        filterOption={false}
                        onSearch={(value) => this.handleSearch(value, 'vision')}
                        disabled={!getFieldValue('VISION')}
                        onSelect={(value, data) => this.handleSelect(value, data, 'vision')}
                        style={{ width: 400 }}
                      >
                        {
                          visionList && visionList.map(it => (
                            <Option key={it.email} value={it.email} data={it}>{it.name} {it.email}</Option>
                          ))
                        }
                      </Select>
                    )
                  }
                  {
                    local.visionUser1 && getFieldValue('VISION') &&
                    <div>
                      <span style={{ color: '#7C8895' }}>最近选择：</span>
                      {local.visionUser1.map((it, index) =>
                        index < 10 && it.name && it.email &&
                        <div className={styles.tagStyle} onClick={() => this.handleLocalSelect(it, 'vision')}>
                          {it.name}
                        </div>)}
                    </div>
                  }
                </FormItem>
                {
                  getFieldDecorator('visionUser1', {
                    initialValue: data && data.visionUser1,
                  })(
                    <Input style={{ display: 'none' }} />
                  )
                }
              </Col>
            </Row>
          </FormItem>
        </Card>

        <Card className={styles.cardStyleRemark}>
          {getTitle('备注', false, null)}
          <FormItem>
            {
              getFieldDecorator('remark1', {
                initialValue: data && data.remark1,
              })(
                <TextArea placeholder="如有其它问题及要求，请补充" />
              )
            }
          </FormItem>
        </Card>
      </span>
    );
  }
}

export default ProductDesign;
