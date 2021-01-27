import React, { Component } from 'react';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Radio, message, Row, Col, InputNumber, Slider, Card } from 'antd';
import uuid from 'uuid';
import { getUserExist, setUemSize } from '@services/requirement';
import { deepCopy } from '@utils/helper';
import { getTitle } from '../shared/Helper';
import { spreadRate, dengji, importantTitle, importantRate } from '../shared/Config';
import SelectSize from '../spread_size/SelectSize';
import CreateSize from '../spread_size/CreateSize';
import styles from '../../index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { TextArea } = Input;

class SpreadDesign extends Component {
  state = {
    visionList: [],
    edit: false,
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
    if (editData && editData.visionUser2) {
      this.setState({ visionList: [editData.visionUser2] });
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
    setFieldsValue({ visionUser2: data.props.data });
  }

  handleLocalSelect = (it) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      visionUser2: it,
      visionId2: it.email,
    });
  }

  getChildren = () => {
    const localSize = localStorage.getItem('designSize') ? JSON.parse(localStorage.getItem('designSize')) : [];
    const arr = localSize;
    if (!localSize.some(it => it === '1125*2436（开机屏1）')) {
      arr.push('1125*2436（开机屏1）');
    }
    if (!localSize.some(it => it === '1080*1920（开机屏2）')) {
      arr.push('1080*1920（开机屏2）');
    }
    return arr;
  }

  handleChangeSlider = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ pageNum2: value });
  }

  handleChangePage = (value) => {
    const { form: { setFieldsValue } } = this.props;
    if (value >= 100) {
      setFieldsValue({ slider2: 100 });
    } else {
      setFieldsValue({ slider2: value || 0 });
    }
  }

  getSilderNum = () => {
    const { data } = this.props;
    if (data && data.pageNum2) {
      if (data.pageNum2 >= 100) {
        return 100;
      } else {
        return data.pageNum2;
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

  handleChangeSize = () => {
    const { reqData } = this.props;
    const productId = reqData && reqData.product && reqData.product.id;
    this.setState({ edit: true });
    this.props.dispatch({ type: 'design/saveSpreadEdit', payload: true });
    this.props.dispatch({ type: 'design/getUemSize', payload: { productid: productId, channel: [] } });
  }

  getDes = () => {
    const { edit } = this.state;
    if (edit) {
      return (
        <span>
          <InfoCircleTwoTone
            className="u-mgl5 u-mgr5 f-fs2"
            style={{ position: 'relative', top: '1px' }} />
          <span className="f-fs1 u-subtitle">同一产品共享同一套常用尺寸</span>
        </span>
      );
    } else {
      return (
        <span className="f-fs1 u-subtitle">
          请选择常用尺寸或填写自定义尺寸。如果下方选项不能覆盖常用尺寸，您可以编辑常用尺寸
        </span>
      );
    }
  }

  getButtons = () => {
    const { edit } = this.state;
    if (edit) {
      return null;
    } else {
      return (<span>
        <span className={styles.size} onClick={() => this.handleChangeSize()}>编辑常用尺寸</span>
      </span>);
    }
  }

  getChannel = (addSize, selectSize) => {
    const { channelObj } = this.props;

    const channelList = channelObj.channelList;
    const arr = [];
    let sizeMap = {};
    // 处理选择的已有处理
    selectSize.forEach(it => {
      let obj = {};
      if (it.id.includes('source')) {
        const sourceId = Number(it.id.split('-')[1]);
        const sourceObj = channelList.find(item => item.id === sourceId) || {};
        obj.id = sourceId;
        obj.name = it.name;
        obj.sizeList = sourceObj.sizeList || [];
        arr.push(obj);
      } else if (it.id.includes('size')) {
        const sourceId = Number(it.id.split('-')[1]);
        const sizeId = Number(it.id.split('-')[2]);
        const arr = sizeMap[sourceId] ? sizeMap[sourceId] : [];
        sizeMap[sourceId] = deepCopy(arr, []);
        sizeMap[sourceId].push({
          id: sizeId,
          name: it.name,
          description: it.description,
        });
      }
    });

    for (let i in sizeMap) {
      const obj = channelList.find(item => item.id === Number(i)) || {};
      arr.push({
        id: Number(i),
        name: obj.name,
        sizeList: sizeMap[i],
      });
    }

    // 处理自定义尺寸
    if (addSize && !!addSize.length) {
      arr.push({
        id: `ZXQHAPPYSIZE-${uuid()}`,
        name: '自定义',
        sizeList: addSize,
      });
    }
    return arr;
  }

  handleSaveSize = (data) => {
    const { reqData, form: { getFieldsValue }, data: uemData } = this.props;

    const selectSize = getFieldsValue().selectSize || [];
    const addSize = getFieldsValue().addSize || [];

    const productId = reqData && reqData.product && reqData.product.id;
    const params = {
      productid: productId,
      data: JSON.stringify(data),
    };
    setUemSize(params).then((res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('保存尺寸成功！');
      this.setState({ edit: false });
      this.props.dispatch({ type: 'design/saveSpreadEdit', payload: false });
      // 保存之后调用查询接口

      const params = {
        channelSave: this.getChannel(addSize, selectSize), // 由addSize和selectSize组成的
        addSize: addSize,
        selectSize: selectSize,
        size: uemData.size || [],
      };

      this.props.dispatch({
        type: 'design/getUemSize',
        payload: { productid: productId, data: { ...params } }
      });
    })).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleCancel = () => {
    this.setState({ edit: false });
    this.props.dispatch({ type: 'design/saveSpreadEdit', payload: false });

    const { form: { getFieldsValue }, channelAll } = this.props;
    const addSize = getFieldsValue().addSize;
    const selectSize = getFieldsValue().selectSize;

    const params = {
      channel: channelAll.channel || [],
      sizeMap: channelAll.info || [],
      channelSave: this.getChannel(addSize, selectSize),
      addSize: addSize,
      selectSize: selectSize,
    };

    this.props.dispatch({
      type: 'design/solveChannelList',
      payload: { ...params },
    });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data } = this.props;

    const { visionList, edit } = this.state;
    const local = localStorage.getItem('designUser') ? JSON.parse(localStorage.getItem('designUser')) : {};

    return (<span>
      <Card className={styles.cardStyle}>
        {getTitle('推广类型', true, null)}
        <FormItem>
          {
            getFieldDecorator('expandType', {
              initialValue: data && data.expandType,
              rules: [{ required: true, message: '此项必填！' }],
            })(
              <Radio.Group>
                {
                  Object.keys(spreadRate).map(it => <Radio value={it}>
                    {spreadRate[it]}
                  </Radio>)
                }
              </Radio.Group>
            )
          }
        </FormItem>
      </Card>

      <Card className={styles.cardStyle}>
        {getTitle('尺寸', true, this.getDes(), 10)}
        {this.getButtons()}
        {
          edit ?
            <CreateSize
              key="CreateSize"
              handleSaveSize={this.handleSaveSize}
              channelObj={this.props.channelObj}
              reqData={this.props.reqData}
              handleCancel={() => this.handleCancel()}
            /> :
            <SelectSize
              key="SelectSize"
              from={this.props.form}
              {...this.props}
            />
        }
      </Card>

      <Card className={styles.cardStyle}>
        {getTitle('设计要求', true, null)}
        <FormItem>
          {
            getFieldDecorator('designDemand2', {
              initialValue: data && data.designDemand2,
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
                getFieldDecorator('pageNum2', {
                  initialValue: data && data.pageNum2 ? data.pageNum2 : 1,
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
              {getFieldDecorator('slider2', {
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
            getFieldDecorator('grade2', {
              initialValue: data && data.grade2,
              rules: [{ required: true, message: '此项必填！' }],
            })(
              <RadioGroup>
                {
                  Object.keys(dengji).map(it => (
                    <span>
                      <Radio value={Number(it)}>
                        {dengji[it]}级
                      </Radio>
                    </span>
                  ))
                }
              </RadioGroup>
            )
          }
          {
            importantTitle[getFieldValue('grade2')] &&
            <div
              style={{ border: '1px solid #E1E3E6', background: '#F4F4F4', padding: '12px', fontSize: '12px', fontWeight: 400 }}
            >
              <div style={{ color: '#333333', height: '20px', lineHeight: '14px' }}>{importantTitle[getFieldValue('grade2')]}</div>
              {
                importantRate[getFieldValue('grade2')] && importantRate[getFieldValue('grade2')].map(it =>
                  <div className="f-fs1 u-subtitle" style={{ height: '20px', color: '#7C8895', lineHeight: '14px' }}>
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
                getFieldDecorator('visionId2', {
                  initialValue: data && data.visionUser2 && data.visionUser2.email,
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <Select
                    allowClear
                    showSearch
                    placeholder="请输入人名或邮箱"
                    filterOption={false}
                    onSearch={(value) => this.handleSearch(value)}
                    onChange={(value, data) => this.handleSelect(value, data)}
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
                local.visionUser2 &&
                <div>
                  <span style={{ color: '#7C8895' }}>最近选择：</span>
                  {local.visionUser2.map((it, index) =>
                    index < 10 && it.name && it.email &&
                    <div className={styles.tagStyle} onClick={() => this.handleLocalSelect(it)}>
                      {it.name}
                    </div>)}
                </div>
              }
              {
                getFieldDecorator('visionUser2', {
                  initialValue: data && data.visionUser2,
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
            getFieldDecorator('remark2', {
              initialValue: data && data.remark2,
            })(
              <TextArea placeholder="如有其它问题及要求，请补充" />
            )
          }
        </FormItem>
      </Card>

      {
        getFieldDecorator('selectSize', {
          initialValue: [],
        })(
          <Input style={{ display: 'none' }} />
        )
      }
      {
        getFieldDecorator('addSize', {
          initialValue: [],
        })(
          <Input style={{ display: 'none' }} />
        )
      }

    </span>);
  }
}

export default SpreadDesign;
