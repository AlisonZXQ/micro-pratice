import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Button,
  Card,
  Input,
  Select,
  Radio,
  message,
  Cascader,
  Checkbox,
  InputNumber,
  Row,
  Col,
} from 'antd';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { updateBaseInfo, getBaseInfo } from '@services/product_setting';
import { getProjectDepartMents } from '@services/project';
import { queryUser } from '@services/project';
import { baseStateReactArr } from '@shared/ProductSettingConfig';
import styles from './index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const formLayout = getFormLayout(5, 13);
const littleFormLayout = getFormLayout(5, 7);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productid: 0,
      ownerList: [],
      data: {},
      departmentList: [],
    };
  }

  componentDidMount() {
    const { productid } = this.props.location.query;
    this.setState({ productid }, () => {
      this.getDepartments();
      this.getData();
    });
  }

  getDepartments = () => {
    const params = {
      id: this.state.productid,
    };
    getProjectDepartMents(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取部门信息失败, ${res.msg}`);
      }
      this.setState({ departmentList: res.result });
    }).catch((err) => {
      return message.error('获取部门信息异常', err || err.msg);
    });
  }

  getData = () => {
    const params = {
      id: this.state.productid,
    };
    getBaseInfo(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      let result = res.result;
      if (result.productSettingVOList && result.productSettingVOList.length) { //转换自动关单和状态联动的格式
        let arr = [];
        result.productSettingVOList.map(it => {
          if (it.key.indexOf('adviseAuto') > -1) {
            result.adviseAuto = it.value;
            arr.push('adviseAuto');
          }else if (it.key.indexOf('ticketAuto') > -1) {
            result.ticketAuto = it.value;
            arr.push('ticketAuto');
          }else if(it.key.indexOf('adviseState') > -1 && it.value === 'true') {
            arr.push('adviseState');
          }else if(it.key.indexOf('ticketState') > -1 && it.value === 'true') {
            arr.push('ticketState');
          }else if(it.key.indexOf('requirementState') > -1 && it.value === 'true') {
            arr.push('requirementState');
          }else if(it.key.indexOf('taskState') > -1 && it.value === 'true') {
            arr.push('taskState');
          }
        });
        result.productSettingVOList = arr;
      }

      this.setState({ data: result });
      if (res.result && res.result.responseUser && res.result.responseUser.id) {
        this.fetchUser(res.result.responseUser.email);
      }
    }).catch((err) => {
      return message.error('获取信息异常', err || err.msg);
    });
  }

  handleSave = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        id: this.state.productid,
        ...values,
      };
      if (values.autoCloseList.length) { //自动关单数据转化
        let arr = [];
        values.autoCloseList.map(it => {
          if(it.indexOf('Auto') > -1) {
            arr.push({
              key: `${it}CloseSetting`,
              value: values[it],
            });
          }
        });
        params.productSettingUpdateDtoList = arr;
        delete params.adviseAuto;
        delete params.ticketAuto;
      }
      if(values.stateReactList.length) { //状态联动转换
        let arr = [];
        baseStateReactArr.map(item => {
          if(values.stateReactList.indexOf(item.key) > -1) {
            arr.push({
              key: `${item.key}Cascade`,
              value: true,
            });
          }else {
            arr.push({
              key: `${item.key}Cascade`,
              value: false,
            });
          }
        });
        params.productSettingUpdateDtoList = [...params.productSettingUpdateDtoList, ...arr];
        delete params.stateReactList;
      }
      updateBaseInfo(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`更改信息失败, ${res.msg}`);
        }
        message.success('更改信息成功！');
        this.getData();
      }).catch((err) => {
        return message.error('更改信息异常', err || err.msg);
      });
    });
  }

  fetchUser = (value) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.setState({ ownerList: res.result });
      }).catch((err) => {
        return message.error(`${err || err.message}获取人员异常`);
      });
    }
  }

  render() {
    const { ownerList, data, departmentList } = this.state;
    const { lastProduct } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;

    const limitNumber = value => {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(-1+)|[^\d]/g, '') : 0;
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(-1+)|[^\d]/g, '') : 0;
      } else {
        return 0;
      }
    };
    return (<span>
      <div className='settingTitle'>
        {lastProduct.name}-基本信息
      </div>
      <div style={{ padding: '5px 16px 16px 16px' }}>
        <div className='bbTitle'>
          <span className='name'>基本信息</span>
        </div>
        <Card className='bgWhiteModel'>
          <FormItem label="产品名称" {...formLayout}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请选择产品名称！' }],
              initialValue: data && data.name,
            })(
              <Input placeholder="请输入产品名称" disabled={false} />,
            )}
          </FormItem>
          <FormItem label="所属企业" {...littleFormLayout}>
            {getFieldDecorator('entid', {
              rules: [{ required: true, message: '请选择所属企业！' }],
              initialValue: data && data.entid,
            })(
              <Select
                placeholder="请选择所属企业"
                style={{ width: '100%' }}
                onChange={this.handleSelectChange}
              >
                <Option value={data && data.entid}>{data && data.entName}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="所属部门" {...littleFormLayout}>
            {getFieldDecorator('departmentId', {
              initialValue: data && data.department && data.department.map(it => it.deptId),
            })(
              <Cascader
                fieldNames={{ label: 'deptName', value: 'deptId', children: 'children' }}
                expandTrigger="hover"
                options={departmentList}
                onChange={this.onChangeDepart}
                changeOnSelect
                style={{ width: '100%' }}
                showSearch
              />
            )}
          </FormItem>
          <FormItem label="产品负责人" {...formLayout}>
            {getFieldDecorator('responseUid', {
              rules: [{ required: true, message: '请选择所属企业！' }],
              initialValue: data && data.responseUser && data.responseUser.id,
            })(
              <Select
                showSearch
                placeholder="请输入人名"
                optionFilterProp="children"
                style={{ width: '100%' }}
                onSearch={(value) => this.fetchUser(value)}
                showArrow={false}
              >
                {
                  ownerList && ownerList.length && ownerList.map(it => (
                    <Option key={it.id} value={it.id}>{it.realname || it.name} {it.email}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="项目管理数据源" {...formLayout}>
            {getFieldDecorator('datasource', {
              initialValue: data && data.datasource,
            })(
              <Radio.Group>
                <Radio value={1}>EP</Radio>
                <Radio value={2}>JIRA</Radio>
              </Radio.Group>,
            )}
          </FormItem>
          <FormItem label="自动关单" {...formLayout}>
            {getFieldDecorator('autoCloseList', {
              initialValue: data && data.productSettingVOList,
            })(
              <Checkbox.Group>
                <Checkbox value='adviseAuto'>建议</Checkbox>
                <Checkbox value='ticketAuto'>工单</Checkbox>
              </Checkbox.Group>
            )}
          </FormItem>
          {getFieldValue('autoCloseList') && getFieldValue('autoCloseList').indexOf('adviseAuto') > -1 &&
            <Row className='u-pdb15'>
              <Col span={5}></Col>
              <Col>
                {getFieldDecorator('adviseAuto',
                  { initialValue: (data && data.adviseAuto) || 0 }
                )(
                  <InputNumber
                    step={1}
                    formatter={limitNumber}
                    parser={limitNumber}
                    min={0} />
                )}
                <span className='u-mgl5 u-mgr5'>天</span>
                <span className={styles.desc}>
                  后，若建议处于“已解决”与“已驳回”状态时，系统将根据设置执行关闭操作
                </span>
              </Col>
            </Row>
          }
          {getFieldValue('autoCloseList') && getFieldValue('autoCloseList').indexOf('ticketAuto') > -1 &&
            <Row className='u-pdb15'>
              <Col span={5}></Col>
              <Col>
                {getFieldDecorator('ticketAuto',
                  { initialValue: (data && data.ticketAuto) || 0 }
                )(
                  <InputNumber
                    step={1}
                    formatter={limitNumber}
                    parser={limitNumber}
                    min={0} />
                )}
                <span className='u-mgl5 u-mgr5'>天</span>
                <span className={styles.desc}>
                  后，若工单处于“已解决”与“已驳回”状态时，系统将根据设置执行关闭操作
                </span>
              </Col>
            </Row>
          }

          <FormItem label="状态联动" {...formLayout}>
            {getFieldDecorator('stateReactList', {
              initialValue: data && data.productSettingVOList,
            })(
              <Checkbox.Group>
                {baseStateReactArr.map(it => (
                  <Checkbox value={it.key} disabled={it.key !== 'taskState'}>
                    {it.value}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          </FormItem>
          <FormItem label="产品描述" {...formLayout}>
            {getFieldDecorator('description', {
              initialValue: data && data.description,
            })(
              <TextArea
                style={{ height: '150px' }}
                placeholder="请输入产品描述，最多500字"
                maxLength={500} />
            )}
          </FormItem>
          <div className='btn98 f-tar u-mgt20'>
            <Button type='primary' onClick={() => this.handleSave()}>保存</Button>
          </div>
        </Card>
      </div>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
