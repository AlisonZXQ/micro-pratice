import React, { Component } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, DatePicker, Input, Tooltip, message, InputNumber } from 'antd';
import moment from 'moment';
import debounce from 'lodash/debounce';
import { queryUser, getProjectDepartMents } from '@services/project';
import { getFormLayout, equalsObj } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { getAllSubProductList } from '@services/product';
import { LEVER_TYPE } from '@shared/ProjectConfig';
import CustomField from './CustomField';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const littleFormLayout = getFormLayout(6, 18);
const Option = Select.Option;
const { RangePicker } = DatePicker;

class EditInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      managerList: [],
      departmentList: [],
      subProductList: [],
    };
    this.fetchUser = debounce(this.fetchUser, 800);
  }

  componentDidMount() {
    this.getDepartMents();
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (!equalsObj(this.props.editData, nextProps.editData)) {
      this.getDefaultData(nextProps.editData);
      const productid = nextProps.editData.product && nextProps.editData.product[0] && nextProps.editData.product[0].id;
      this.getAllSubProductList(productid);
    }
  }

  getAllSubProductList = (value) => {
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getDefaultData = (editData) => {
    const { form: { setFieldsValue } } = this.props;
    if (editData && editData.owner) {
      this.setState({ ownerList: [editData.owner] });
    }
    if (editData && editData.manager) {
      this.setState({ managerList: editData.manager });
    }
    if (editData && editData.objective) {
      setFieldsValue({ objectives: editData.objective });
    }
  }

  getDepartMents = () => {
    getProjectDepartMents().then((res) => {
      if (res.code !== 200) return message.error(`获取部门列表失败，${res.msg}`);
      this.setState({ departmentList: res.result });
    }).catch((err) => {
      return message.error(`获取部门列表失败，${err || err.msg}`);
    });
  }

  fetchUser = (value, type) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          if (type === 'owner') {
            this.setState({ ownerList: res.result });
          } else {
            this.setState({ managerList: res.result });
          }
        }
      }).catch((err) => {
        return message.error(`${err || err.message}获取人员异常`);
      });
    }
  }

  updateProjectAims = (data) => {
    const { form: { getFieldValue, setFieldsValue } } = this.props;
    if (data) {
      if (getFieldValue('objectives').some(it => Number(it.objectiveId) === Number(data.objectiveId))) {
        let newAim = [...getFieldValue('objectives')];
        const index = getFieldValue('objectives').findIndex(it => it.objectiveId === data.objectiveId);
        newAim.splice(index, 1, data);
        setFieldsValue({ objectives: newAim });
      } else {
        setFieldsValue({ objectives: getFieldValue('objectives').concat([data]) });
      }
    }
  }

  onChangeDepart = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    const saveData = [];
    data.map(it => {
      saveData.push({
        deptId: it.deptId,
        deptName: it.deptName,
      });
    });
    setFieldsValue({ departmentId: saveData });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, editData } = this.props;
    const { ownerList, managerList, subProductList } = this.state;
    const subProductVO = editData.subProductVO || {};

    return (
      <Form>
        <FormItem label="项目负责人" {...formLayout}>
          {getFieldDecorator('ownerId', {
            initialValue: editData && editData.owner && editData.owner.id,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Select
              showSearch
              showArrow={false}
              placeholder="请输入人名"
              optionFilterProp="children"
              style={{ width: '100%' }}
              onSearch={(value) => this.fetchUser(value, 'owner')}
            >
              {
                ownerList && ownerList.length && ownerList.map(it => (
                  <Option key={it.id} value={it.id}>{it.realname || it.name} {it.email}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>

        <FormItem label="项目经理" {...formLayout}>
          {getFieldDecorator('managerIds', {
            initialValue: editData && editData.manager && editData.manager[0] && editData.manager[0].id,
          })(
            <Select
              allowClear
              showSearch
              showArrow={false}
              style={{ width: '100%' }}
              placeholder="请输入人名"
              optionFilterProp="children"
              onSearch={(value) => this.fetchUser(value, 'manager')}
            >
              {
                managerList && managerList.length && managerList.map(it => (
                  <Option key={it.id} value={it.id}>{it.realname || it.name} {it.email}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>

        <span className="f-dn">
          <FormItem label="归属产品" {...littleFormLayout}>
            <Select defaultValue="default" style={{ width: '100%' }} disabled>
              <Option value="default">
                {editData && editData.product && editData.product[0] && editData.product[0].name}
              </Option>
            </Select>
          </FormItem>

          <FormItem label="归属子产品" {...littleFormLayout}>
            {getFieldDecorator('subProductId', {
              initialValue: subProductVO && subProductVO.id,
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择子产品"
                optionFilterProp="children"
              >
                {subProductList && subProductList.map(it => (
                  <Option key={it.id} value={it.id} data={it}>{it.subProductName}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </span>

        <FormItem label="优先级" {...littleFormLayout}>
          {getFieldDecorator('priority', {
            initialValue: (editData && editData.priority) ? editData.priority : undefined,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Select className={styles.widthFull} placeholder="请选择优先级">
              <Option key={LEVER_TYPE.P0} value={LEVER_TYPE.P0}>P0</Option>
              <Option key={LEVER_TYPE.P1} value={LEVER_TYPE.P1}>P1</Option>
              <Option key={LEVER_TYPE.P2} value={LEVER_TYPE.P2}>P2</Option>
            </Select>
          )}
        </FormItem>

        <FormItem label="项目周期" {...littleFormLayout}>
          {getFieldDecorator('timeRange', {
            initialValue: editData && editData.startTime && editData.endTime &&
              [moment(editData.startTime), moment(editData.endTime)],
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <RangePicker
              allowClear
              className={styles.widthFull}
              suffixIcon={<MyIcon type='icon-riqi' />}
            />
          )}
        </FormItem>

        {getFieldDecorator('departmentId', {
          initialValue: editData && editData.department,
        })(
          <Input style={{ display: 'none' }} />
        )}

        <FormItem label="人力预算" {...formLayout}>
          <span style={{ display: 'flex', flexDirection: 'row' }}>
            {getFieldDecorator('budget', {
              initialValue: (editData && editData.budget) || 0,
            })(
              <InputNumber min={0} step={0.5} />
            )}
            <span className="u-mgl10">人天</span>
          </span>
        </FormItem>

        {
          editData && editData.template && editData.template.id &&
          <span>
            <FormItem
              label={<span>
                自定义模版
                <Tooltip title="选择后将默认同步EP上已有产品的自定义字段等配置">
                  <span style={{ fontSize: '12px' }}><QuestionCircleFilled /></span>
                </Tooltip>
              </span>}
              {...formLayout}
              style={{ display: 'none' }}
            >
              {getFieldDecorator('templateId', {
                initialValue: editData && editData.template && editData.template.id,
              })(
                <Select className={styles.widthFull} placeholder="请选择模版">
                  {[].map(it => (
                    <Option key={it.projectTemplate.id} value={it.projectTemplate.id}>{it.projectTemplate.name}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
            {
              getFieldValue('templateId') &&
              <CustomField
                form={this.props.form}
                templateId={getFieldValue('templateId')}
                customFileds={editData && editData.createCustomFileds}
                {...this.props}
              />
            }
          </span>
        }
      </Form >
    );
  }
}
export default EditInfo;
