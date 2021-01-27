import React, { Component } from 'react';
import { QuestionCircleTwoTone } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, Popover, message, Cascader, InputNumber } from 'antd';
import debounce from 'lodash/debounce';
import { getFormLayout, equalsObj } from '@utils/helper';
import { queryUser, getProjectDepartMents, queryProjectList, queryTemplateList, createProjectCode } from '@services/project';
import { getAllSubProductList } from '@services/product';
import { CASCADE_TYPE } from '@shared/SystemManageConfig';
import { PROJECT_TEMPLATE_DEFAULT_TYPE, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import MyIcon from '@components/MyIcon';
import { LEVER_TYPE } from '@shared/ProjectConfig';
import { deleteModal } from '@shared/CommonFun';
import CustomField from './CustomField';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const littleFormLayout = getFormLayout(6, 18);
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

class SubmitFormCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      managerList: [],
      departmentList: [],
      hasAlready: '',
      template: [],
      subProductList: [],
      deptId: []
    };
    this.handleSearch = debounce(this.handleSearch, 800);
    this.validFunction = debounce(this.validFunction, 800);
  }

  componentDidMount() {
    this.getProjectCode();

    const { productByUser } = this.props;
    // length为1时只有一个子产品，直接调用模版列表，自定义字段列表和级联列表
    if (productByUser && productByUser.length === 1) {
      this.getDepartMents(productByUser[0].id);
      this.queryTemplateList(productByUser[0].id);
      this.getCascadeList(productByUser[0].id);
      this.getAllSubProductList(productByUser[0].id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.productByUser, nextProps.productByUser)) {
      const { productByUser } = nextProps;
      if (productByUser && productByUser.length === 1) {
        this.getDepartMents(productByUser[0].id);
        this.queryTemplateList(productByUser[0].id);
        this.getCascadeList(productByUser[0].id);
        this.getAllSubProductList(productByUser[0].id);
      }
    }
  }

  getProjectCode = () => {
    const { form: { setFieldsValue } } = this.props;
    createProjectCode().then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setFieldsValue({ projectCode: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSelectProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ subProductId: '' });
    const product = data.props.data || {};
    let department = [];
    try {
      department = JSON.parse(product.department);
    } catch (e) {
      department = [];
    }
    this.setState({ deptId: department });
    const saveData = [];
    department.forEach(it => {
      saveData.push({
        deptId: it,
      });
    });
    setFieldsValue({ departmentId: saveData });
    this.getDepartMents(value);
    this.queryTemplateList(value);
    this.getCascadeList(value);
    this.getAllSubProductList(value);

    // 这里为了dataSource标记位用
    const arr = [];
    arr.push(data.props.data);
    this.props.dispatch({ type: 'createProject/saveProductList', payload: arr });
  }

  getAllSubProductList = (value) => {
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
      }
      if (res.result.length === 1) {
        const obj = res.result[0];
        this.props.dispatch({ type: 'createProject/saveSelectSubProduct', payload: obj });
        const firstSubProductId = res.result[0].id;

        this.props.form.setFieldsValue({ subProductId: firstSubProductId });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getCascadeList = (id) => {
    const params = {
      productid: id,
      type: CASCADE_TYPE.PROJECT, // 1项目 2单据
    };
    this.props.dispatch({ type: 'projectCascade/getCascadeList', payload: params });
  }

  queryTemplateList = (id) => {
    queryTemplateList(id).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ template: res.result || [] });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getDepartMents = (id) => {
    const params = {
      productid: id,
    };
    getProjectDepartMents(params).then((res) => {
      if (res.code !== 200) return message.error(`获取部门列表失败，${res.msg}`);
      this.setState({ departmentList: res.result });
    }).catch((err) => {
      return message.error(`获取部门列表失败，${err || err.msg}`);
    });
  }

  handleClickMore = () => {
    this.setState({ showMore: true });
  }

  updateProjectMileStones = (data) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    if (data) {
      let newMile = [...getFieldValue('milestones')];
      if (getFieldValue('milestones').some(it => it.uuid === data.uuid)) {
        const index = getFieldValue('milestones').findIndex(it => it.uuid === data.uuid);
        newMile.splice(index, 1, data);
        setFieldsValue({ milestones: newMile });
      } else {
        newMile = [...getFieldValue('milestones')].concat([data]);
        setFieldsValue({ milestones: newMile });
      }
      let arr = [];
      newMile.forEach(it => {
        arr = arr.concat(it.issues);
      });
      this.props.dispatch({ type: 'createProject/saveHasSelectContents', payload: arr });
    }
  }

  handleDeleteMileStones = (uuid) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    const newMileStones = getFieldValue('milestones').filter(it => it.uuid !== uuid);

    setFieldsValue({ milestones: newMileStones });

    this.props.dispatch({ type: 'createProject/saveHasUsedName', payload: newMileStones.map(it => it.name) });
    let arr = [];
    newMileStones.forEach(it => {
      arr = arr.concat(it.issues);
    });
    this.props.dispatch({ type: 'createProject/saveHasSelectContents', payload: arr });
  }

  updateProjectAims = (data) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;

    if (data) {
      if (getFieldValue('objectives').some(it => it.objectiveId === data.objectiveId)) {
        let newAim = [...getFieldValue('objectives')];
        const index = getFieldValue('objectives').findIndex(it => it.objectiveId === data.objectiveId);
        newAim.splice(index, 1, data);
        setFieldsValue({ objectives: newAim });
      } else {
        setFieldsValue({ objectives: getFieldValue('objectives').concat([data]) });
      }
    }
  }

  handleDeleteAims = (objectiveId) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    deleteModal({
      title: '确定移除目标吗？',
      okCallback: () => {
        const newAims = getFieldValue('objectives').filter(it => it.objectiveId !== objectiveId);
        setFieldsValue({ objectives: newAims });
        message.success('移除项目目标成功！');
      }
    });
  }

  handleSearch = (value, type) => {
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
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  onChangeDepart = (value, data) => {
    this.setState({ deptId: value });
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

  handleChangeDate = (value, data) => {
    if (value && value.length) {
      const arr = [value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')];
      this.props.dispatch({ type: 'createProject/saveTimeRange', payload: arr });
    }
  }

  validFunction = (rule, value, callback) => {
    const params = {
      title: value,
    };
    queryProjectList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(res.msg);
      }
      if (res.result && res.result.list) {
        if (res.result.list.some((it, index) => it.title === value)) {
          callback('当前项目名已存在，请更换名称!');
        } else {
          callback();
        }
      }
    }).catch((err) => {
      return message.error(`查询项目列表异常, ${err || err.message}`);
    });
  }

  handleSelectSubProduct = (value, data) => {
    const obj = data.props.data;
    this.props.dispatch({ type: 'createProject/saveSelectSubProduct', payload: obj });
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, styles, productByUser, step } = this.props;
    const { ownerList, managerList, departmentList, template, subProductList, deptId } = this.state;

    const defaultTemplate = (template && template.find(it => it.projectTemplate.isDefault === PROJECT_TEMPLATE_DEFAULT_TYPE.DEFAULT)) || {};
    const templateId = defaultTemplate.projectTemplate && defaultTemplate.projectTemplate.id;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    return (
      <Form className="u-form">
        <div style={{ display: step === 'first' ? 'block' : 'none' }}>
          <FormItem label="项目名称" {...formLayout} style={{ paddingTop: '15px' }}>
            {getFieldDecorator('title', {
              rules: [{ required: true, message: `此项不能为空` }],
            })(
              <Input
                placeholder="请输入项目名称，不超过50个字"
                maxLength={50} />
            )}
          </FormItem>

          <FormItem label="关联产品" {...littleFormLayout}>
            {getFieldDecorator('productIds', {
              initialValue: (productByUser && productByUser.length === 1) ? productByUser[0].id : undefined,
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择产品"
                optionFilterProp="children"
                onChange={this.handleSelectProduct}
              >
                {productByUser && productByUser.map(it => (
                  <Option key={it.id} value={it.id} data={it} id={`productIds-${it.id}`}>{it.name}</Option>
                ))}
              </Select>
            )}
          </FormItem>

          <FormItem label="子产品" {...littleFormLayout}>
            {getFieldDecorator('subProductId', {
              initialValue: (enableSubProductList && enableSubProductList.length === 1) ? enableSubProductList[0].id : undefined,
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择子产品"
                optionFilterProp="children"
                onChange={this.handleSelectSubProduct}
              >
                {enableSubProductList && enableSubProductList.map(it => (
                  <Option key={it.id} value={it.id} data={it} id={`subProductId-${it.id}`}>{it.subProductName}</Option>
                ))}
              </Select>
            )}
          </FormItem>

          <FormItem label="归属部门" {...littleFormLayout}>
            <Cascader
              fieldNames={{ label: 'deptName', value: 'deptId', children: 'children' }}
              expandTrigger="hover"
              options={departmentList}
              onChange={this.onChangeDepart}
              value={deptId}
              changeOnSelect
              showSearch
              allowClear
            />
          </FormItem>
          {getFieldDecorator('departmentId', {
          })(
            <Input style={{ display: 'none' }} />
          )}

          {template && template.length >= 1 &&
            <FormItem
              label={<span>
                项目模版
                <Popover content="模板与项目自定义字段和审批流相绑定">
                  <span style={{ fontSize: '12px' }}><QuestionCircleTwoTone /></span>
                </Popover>
              </span>}
              {...formLayout}
            >
              {getFieldDecorator('templateId', {
                initialValue: templateId,
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select
                  className={styles.widthFull}
                  showSearch
                  placeholder="请选择模版">
                  {template && template.map(it => (
                    <Option key={it.projectTemplate.id} value={it.projectTemplate.id}>{it.projectTemplate.name}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          }

          <FormItem label="项目代号" {...formLayout}>
            <span>{getFieldValue('projectCode')}</span>
          </FormItem>
          <span className="f-dn">
            {
              getFieldDecorator('projectCode', {
              })(
                <Input />
              )
            }
          </span>

          <FormItem label="描述" {...formLayout}>
            {getFieldDecorator('description', {
            })(
              <TextArea
                placeholder="给项目写点描述，不超过200个字"
                maxLength={200}
                style={{ height: '120px' }} />
            )}
          </FormItem>
        </div>

        <div style={{ display: step === 'second' ? 'block' : 'none' }}>
          <FormItem label="项目负责人" {...formLayout}>
            {getFieldDecorator('ownerId', {
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <Select
                allowClear
                showSearch
                showArrow={false}
                placeholder="请输入人名"
                filterOption={false}
                onSearch={(value) => this.handleSearch(value, 'owner')}
              >
                {
                  ownerList && ownerList.map(it => (
                    <Option key={it.id} value={it.id} id={`owner-${it.id}`}>{it.realname} {it.email}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="项目经理" {...formLayout}>
            {getFieldDecorator('managerIds', {
            })(
              <Select
                allowClear
                showSearch
                showArrow={false}
                style={{ width: '100%' }}
                placeholder="请输入人名"
                filterOption={false}
                onSearch={(value) => this.handleSearch(value, 'manager')}
              >
                {
                  managerList && managerList.map(it => (
                    <Option key={it.id} value={it.id}>{it.realname} {it.email}</Option>
                  ))
                }
              </Select>
            )}
          </FormItem>

          <FormItem label="优先级" {...littleFormLayout}>
            {getFieldDecorator('priority', {
              initialValue: LEVER_TYPE.P1,
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
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <RangePicker className={styles.widthFull} onChange={this.handleChangeDate} suffixIcon={<MyIcon type='icon-riqi' />} />
            )}
          </FormItem>

          <FormItem label="人力预算" {...formLayout}>
            <span style={{ display: 'flex', flexDirection: 'row' }}>
              {getFieldDecorator('budget', {
                initialValue: 0,
              })(
                <InputNumber min={0} step={0.5} />
              )}
              <span className="u-mgl10">人天</span>
            </span>
          </FormItem>

          {
            getFieldValue('templateId') &&
            <CustomField
              form={this.props.form}
              templateId={getFieldValue('templateId') || 0}
              type={CASCADE_TYPE.PROJECT}
              {...this.props}
            />
          }
        </div>

      </Form>
    );
  }
}

export default SubmitFormCreate;
