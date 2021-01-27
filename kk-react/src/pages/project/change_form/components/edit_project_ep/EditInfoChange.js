import React, { Component } from 'react';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Select,
  DatePicker,
  Input,
  Tooltip,
  message,
  Cascader,
  InputNumber,
  Popover,
  Tag,
  Divider,
} from 'antd';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { getFormLayout, deepCopy } from '@utils/helper';
import { queryUser, getProjectDepartMents, queryProjectList } from '@services/project';
import { getAllSubProductList } from '@services/product';
import MyIcon from '@components/MyIcon';
import { aimNameMap, aimColorMap, statusAction } from '@shared/CommonConfig';
import { warnModal } from '@shared/CommonFun';
import ChangeAimsEP from '../change_aims_ep'; // 新变更项目的目标入口EP
import CustomField from './CustomField';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(2, 16);
const littleFormLayout = getFormLayout(2, 10);
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

class EditInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      managerList: [],
      departmentList: [],
      subProductList: [],
    };
  }

  componentDidMount() {
    this.getDepartMents();
    const { editData } = this.props;
    if (editData && Object.keys(editData).length) {
      const productid = editData.product && editData.product[0].id;
      this.getAllSubProductList(productid);
    }
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (Object.keys(nextProps.editData).length !== 0 && this.props.editData !== nextProps.editData) {
      const productid = nextProps.editData.product && nextProps.editData.product[0].id;
      this.getAllSubProductList(productid);
      this.getDefaultData(nextProps.editData);
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
      if (getFieldValue('objectives').some(it => it.issueKey === data.issueKey)) {
        let newAim = [...getFieldValue('objectives')];
        const index = getFieldValue('objectives').findIndex(it => it.issueKey === data.issueKey);
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

  validFunction = (rule, value, callback) => {
    const { editData } = this.props;
    if (editData && value === editData.title) {
      callback();
    } else {
      const params = {
        title: value,
      };
      queryProjectList(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`查询项目列表失败, ${res.msg}`);
        }
        if (res.result.list) {
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
  }

  handleDeleteAims = (issueKey, status) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;

    warnModal({
      title: '确定解绑目标吗？',
      okCallback: () => {
        const newAims = getFieldValue('objectives').filter(it => it.issueKey !== issueKey);
        setFieldsValue({ objectives: newAims });
        message.success('解绑项目目标成功！');
      }
    });
  }

  handleUpdateStatusAim = (item, type) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    const status = type === 'cancel' ? 5 : 2;

    warnModal({
      title: `确定${type === 'cancel' ? '取消' : '恢复'}目标吗？`,
      okCallback: () => {
        const arr = [];
        getFieldValue('objectives').forEach(it => {
          const obj = deepCopy(it, {});
          if (it.issueKey === item.issueKey) {
            obj.objectiveStatus = status;
          }
          arr.push(obj);
        });
        setFieldsValue({ objectives: arr });
        message.success('取消项目目标成功！');
      }
    });
  }

  getObjectiveOpt = (item) => {
    const status = item.objectiveStatus || 0;
    //取消（5），进行中（2），已验收（4），新建（1），重新打开（6）, 待验收（3）

    switch (status) {
      case statusAction.new:
      case statusAction.reopen:
        return (<span>
          {/* 编辑目标 */}
          <span className='u-mgl5'>
            <ChangeAimsEP issueKey={item.objectiveId} updateProjectAims={this.updateProjectAims} changeData={item} />
          </span>
          <span className="u-mgr5 u-mgl5">
            <Divider type="vertical" />
          </span>
          <span onClick={() => this.handleDeleteAims(item.issueKey, item.objectiveStatus)} className='f-csp delColor'>解绑</span>
        </span>);
      case statusAction.todo:
        return (<span>
          {/* 编辑目标 */}
          <span className='u-mgl5'>
            <ChangeAimsEP issueKey={item.objectiveId} updateProjectAims={this.updateProjectAims} changeData={item} />
          </span>
          <span className="u-mgr5 u-mgl5">
            <Divider type="vertical" />
          </span>
          <a onClick={() => this.handleUpdateStatusAim(item, 'cancel')} className='f-csp'>取消</a>
        </span>);
      case statusAction.cancel:
        return (<span>
          <a onClick={() => this.handleUpdateStatusAim(item, 'reCancel')} className='f-csp'>恢复</a>
        </span>);
      default: return null;
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, editData } = this.props;
    const { ownerList, managerList, departmentList, subProductList } = this.state;

    return (
      <Form className="u-form">
        <FormItem label="项目名称" {...formLayout}>
          {getFieldDecorator('title', {
            initialValue: editData && editData.title,
            rules: [
              { required: true, message: '此项不能为空' },
              // { validator: this.validFunction }
            ]
          })(
            <Input placeholder="请输入项目名称" maxLength={30} />
          )}
        </FormItem>
        <FormItem label="项目负责人" {...littleFormLayout}>
          {getFieldDecorator('ownerId', {
            initialValue: editData && editData.owner && editData.owner.id,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Select
              showSearch
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

        <FormItem label="项目经理" {...littleFormLayout}>
          {getFieldDecorator('managerIds', {
            initialValue: editData && editData.manager && editData.manager[0] && editData.manager[0].id,
          })(
            <Select
              allowClear
              showSearch
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

        <FormItem label="归属产品" {...formLayout}>
          {
            editData && editData.product && editData.product.map(it => (<span className="u-mgr10">
              {it.name}</span>))
          }
        </FormItem>

        <FormItem label="归属子产品" {...littleFormLayout}>
          {getFieldDecorator('subProductId', {
            initialValue: editData && editData.subProductVO && editData.subProductVO.id,
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

        <FormItem label="优先级" {...littleFormLayout}>
          {getFieldDecorator('priority', {
            initialValue: (editData && editData.priority) ? editData.priority : undefined
          })(
            <Select className={styles.widthFull} placeholder="请选择优先级">
              <Option key={1} value={1}>P0</Option>
              <Option key={3} value={3}>P1</Option>
              <Option key={4} value={4}>P2</Option>
            </Select>
          )}
        </FormItem>

        <FormItem label="起止时间" {...littleFormLayout}>
          {getFieldDecorator('timeRange', {
            initialValue: editData && editData.startTime && editData.endTime &&
              [moment(editData.startTime), moment(editData.endTime)]
          })(
            <RangePicker
              allowClear
              className={styles.widthFull}
              suffixIcon={<MyIcon type='icon-riqi' />}
            />
          )}
        </FormItem>

        <FormItem label="项目目标" {...formLayout}>
          {
            getFieldValue('objectives') && getFieldValue('objectives').length ?
              <span>
                {
                  getFieldValue('objectives').map(item => (<div className='f-aic' style={{ height: 30 }}>
                    <Popover
                      content={item.summary}
                    >
                      <span className={`${styles.name} u-mgr10 f-ib f-toe`}
                        href={item.jiraUrl}
                        rel="noopener noreferrer"
                        target="_blank">
                        {item.exist ? item.exist.summary : item.summary}
                      </span>
                    </Popover>
                    <span className='f-aic'>
                      {
                        item.objectiveStatus && <Tag color={aimColorMap[item.objectiveStatus]}>{aimNameMap[item.objectiveStatus]}</Tag>
                      }
                      {this.getObjectiveOpt(item)}
                    </span>
                  </div>))
                }
                {/* 新建目标/添加已有目标 */}
                <div>
                  {
                    <ChangeAimsEP updateProjectAims={this.updateProjectAims} />
                  }
                </div>
              </span> :
              // 不存在任何目标
              <ChangeAimsEP updateProjectAims={this.updateProjectAims} />

          }
          {getFieldDecorator('objectives', {
            initialValue: [],
          })(
            <Input style={{ display: 'none' }} />
          )}
        </FormItem>

        <FormItem label="归属部门" {...littleFormLayout}>
          {
            getFieldDecorator('departmentTemp', {
              initialValue: editData && editData.department && editData.department.map(it => it.deptId),
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
            )
          }
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

        <FormItem label="描述" {...formLayout}>
          {getFieldDecorator('description', {
            initialValue: editData && editData.description,
          })(
            <TextArea placeholder="给项目写点描述，不超过200个字" style={{ height: '80px' }} maxLength={200} />
          )}
        </FormItem>

      </Form >
    );
  }
}
export default withRouter(EditInfo);
