import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Radio, message, Row, Col, InputNumber, Slider, Card } from 'antd';
import { getUserExist } from '@services/requirement';
import { getTitle } from '../shared/Helper';
import { dengji, importantTitle, importantRate } from '../shared/Config';
import styles from '../../index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { TextArea } = Input;

class DetailDesign extends Component {
  state = {
    visionList: [],
  }

  componentDidMount() {
    const { data } = this.props;
    this.getDefaultData(data);
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (nextProps.data && Object.keys(nextProps.data).length !== 0 && this.props.data !== nextProps.data) {
      this.getDefaultData(nextProps.data);
    }
  }

  getDefaultData = (editData) => {
    if (editData && editData.visionUser4) {
      this.setState({ visionList: [editData.visionUser4] });
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
          this.setState({ visionList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  handleSelect = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ visionUser4: data.props.data });
  }

  handleLocalSelect = (it) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      visionUser4: it,
      visionId4: it.email,
    });
  }

  handleChangeSlider = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ pageNum4: value });
  }

  handleChangePage = (value) => {
    const { form: { setFieldsValue } } = this.props;
    if (value >= 100) {
      setFieldsValue({ slider4: 100 });
    } else {
      setFieldsValue({ slider4: value || 0});
    }
  }

  getSilderNum = () => {
    const { data } = this.props;
    if (data && data.pageNum1) {
      if (data.pageNum4 >= 100) {
        return 100;
      } else {
        return data.pageNum4;
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
    const { visionList } = this.state;
    const local = localStorage.getItem('designUser') ? JSON.parse(localStorage.getItem('designUser')) : {};

    return (<span>
      <Card className={styles.cardStyle}>
        {getTitle('设计要求', true, null)}
        <FormItem>
          {
            getFieldDecorator('designDemand4', {
              initialValue: data && data.designDemand4,
              rules: [{ required: true, message: '此项必填！' }],
            })(
              <TextArea placeholder="请填写关键词、风格倾向、竞品参考、配色要求等（如：年轻、活力、夸张、极简、科技感、拟物等）" maxLength={500} />
            )
          }
        </FormItem>
      </Card>

      <Card className={styles.cardStyle}>
        {getTitle('设计页数', true, null)}
        <FormItem>
          <Row>
            <Col span={4}>
              {
                getFieldDecorator('pageNum4', {
                  initialValue: data && data.pageNum4 ? data.pageNum4 : 1,
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
              {getFieldDecorator('slider4', {
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
        {getTitle('重要性等级', true, null)}
        <FormItem>
          {
            getFieldDecorator('grade4', {
              initialValue: data && data.grade4,
              rules: [{ required: true, message: '此项必填！' }],
            })(
              <RadioGroup>
                {
                  Object.keys(dengji).map(it => (
                    <Radio value={Number(it)}>
                      {dengji[it]}级
                    </Radio>
                  ))
                }
              </RadioGroup>
            )
          }
          {
            importantTitle[getFieldValue('grade4')] &&
            <div style={{ border: '1px solid #E1E3E6', background: '#F4F4F4', paddingBottom: '10px' }}>
              <div className="f-fwb" style={{ color: '#333333' }}>{importantTitle[getFieldValue('grade4')]}</div>
              {
                importantRate[getFieldValue('grade4')] && importantRate[getFieldValue('grade4')].map(it =>
                  <div className="f-fs1 u-subtitle" style={{ height: '20px', color: '#7C8895' }}>
                    {it}
                  </div>)
              }
            </div>
          }
        </FormItem>
      </Card>

      <Card className={styles.cardStyle}>
        {getTitle('指派设计师', true, null)}
        <FormItem>
          <Row>
            <Col span={2}>视觉：</Col>
            <Col span={22}>
              {
                getFieldDecorator('visionId4', {
                  initialValue: data && data.visionUser4 && data.visionUser4.email,
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <Select
                    allowClear
                    showSearch
                    placeholder="请输入人名或邮箱"
                    filterOption={false}
                    onSearch={(value) => this.handleSearch(value)}
                    onChange={(value, data) => this.handleSelect(value, data)}
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
                local.visionUser4 &&
                <div>
                  <span style={{ color: '#7C8895' }}>最近选择：</span>
                  {local.visionUser4.map((it, index) =>
                    index < 10 && it.name && it.email &&
                    <div className={styles.tagStyle} onClick={() => this.handleLocalSelect(it)}>
                      {it.name}
                    </div>)}
                </div>
              }
              {
                getFieldDecorator('visionUser4', {
                  initialValue: data && data.visionUser4,
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
            getFieldDecorator('remark4', {
              initialValue: data && data.remark4,
            })(
              <TextArea placeholder="如有其它问题及要求，请补充" />
            )
          }
        </FormItem>
      </Card>
    </span>);
  }
}

export default DetailDesign;
