import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Checkbox, Switch, Select, message } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { getCustomManageList } from '@services/system_manage';
import { issueMap } from '@shared/ProductSettingConfig';
import { CUSTOME_SYSTEM, CUSTOME_REQUIRED, ISSUE_CUSTOM_USE, CUSTOME_TYPE_MAP } from '@shared/ReceiptConfig';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const { TextArea } = Input;
const formLayout = getFormLayout(6, 16);

class CustomForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldData: [],
      fieldType: 0,
    };
  }

  componentDidMount() {
    this.setState({ fieldType: 0 });
    this.getCustomManageList();
  }

  getCustomManageList = (name) => {
    this.setState({ fieldData: [] });
    const params = {
      system: CUSTOME_SYSTEM.NOT_SYSTEM,
      name: name ? name : '',
    };
    getCustomManageList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ fieldData: res.result || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  changeSelect = (item) => {
    this.setState({ fieldType: item.type }, () => {
      const { form: { setFieldsValue } } = this.props;
      setFieldsValue({
        cloudcc_key: item.cloudccKey,
        cloudcc_field: item.cloudccField,
        required: item.required === CUSTOME_REQUIRED.REQUIRED,
        state: item.state === CUSTOME_REQUIRED.REQUIRED,
        description: item.description,
        customFieldIssueList: item.customFieldIssueVOList && item.customFieldIssueVOList.map((it) => {
          return it.issueType;
        })
      });
    });
  }

  getOptions = (item) => {
    const productCustomFieldVOList = item.productCustomFieldVOList || [];
    const products = productCustomFieldVOList.map(it => it.productVO && it.productVO.name);

    return (
      <Option key={item.id} value={item.id} onClick={() => this.changeSelect(item)}>
        {item.name}
        {
          !!products.length &&
          <span>
          （{products.length === 1 ? products[0] : `${products[0]}等多个产品`}）
          </span>
        }
      </Option>);
  }

  handleJump = () => {
    const { currentUser } = this.props;
    const isPlatFormAdmin = currentUser && currentUser.isPlatFormAdmin;
    if (isPlatFormAdmin) {
      history.push(`/system_manage/custom_manage/`);
    } else {
      message.warn('您没有操作权限，请联系系统管理员~');
    }
  }

  render() {
    const { form: { getFieldDecorator }, dialogType, editData } = this.props;
    const { fieldData, fieldType } = this.state;
    const data = editData;
    const edit = dialogType === 'edit';

    return (<span>
      {
        edit &&
        <FormItem label="名称" {...formLayout}>
          {
            getFieldDecorator('name', {
              initialValue: data && data.name,
              rules: [{ required: true, message: '此项必填！' }],
            })(<Input disabled />)
          }
        </FormItem>
      }

      {!edit &&
        <FormItem label="选择字段" {...formLayout}>
          {
            getFieldDecorator('platformCustomFieldId', {
              rules: [{ required: true, message: '此项必填！' }],
            })(<Select
              showSearch
              onSearch = {(value) => this.getCustomManageList(value)}
              placeholder='请搜索或选择字段'
              optionFilterProp={'children'}
              className="f-fw">
              {fieldData && fieldData.map((item) => (
                this.getOptions(item)
              ))}
            </Select>)
          }
          <span>没有找到你想要的？
            <a onClick={() => this.handleJump()} target="_blank" rel="noopener noreferrer">前往新建字段</a>
          </span>
        </FormItem>
      }

      <FormItem label="应用范围" {...formLayout}>
        {
          getFieldDecorator('customFieldIssueList', {
            initialValue: data.customFieldIssueVOList && data.customFieldIssueVOList.map(it => it.issueType),
            rules: [{ required: true, message: '此项必填！' }],
          })(<CheckboxGroup>
            {Object.keys(issueMap).map(it =>
              <Checkbox key={Number(it)} value={Number(it)}>
                {issueMap[Number(it)]}
              </Checkbox>)}
          </CheckboxGroup>)
        }
      </FormItem>

      {
        !edit &&
        <FormItem label="是否使用" {...formLayout}>
          {
            getFieldDecorator('state', {
              initialValue: data.state === ISSUE_CUSTOM_USE.OPEN,
              rules: [{ required: true, message: '此项必填！' }],
              valuePropName: 'checked',
            })(<Switch />)
          }
        </FormItem>
      }

      {
        !edit &&
        <FormItem label="是否必填" {...formLayout}>
          {
            getFieldDecorator('required', {
              initialValue: data.required === CUSTOME_REQUIRED.REQUIRED,
              rules: [{ required: true, message: '此项必填！' }],
              valuePropName: 'checked',
            })(<Switch />)
          }
        </FormItem>
      }

      {edit &&
        <FormItem label="描述" {...formLayout}>
          {
            getFieldDecorator('description', {
              initialValue: data.description,
            })(<TextArea disabled />)
          }
        </FormItem>
      }

      {
        (fieldType === 2 || data.type === CUSTOME_TYPE_MAP.SELECT) && <span>
          <FormItem label="Cloudcc表" {...formLayout}>
            {getFieldDecorator('cloudcc_key', {
              initialValue: data.cloudcc_key,
            })(
              <Input placeholder="请输入Cloudcc中的表名称(大小写敏感)" disabled={false} />
            )}
          </FormItem>
          <FormItem label="Cloudcc列" {...formLayout}>
            {getFieldDecorator('cloudcc_field', {
              initialValue: data.cloudcc_field,
            })(
              <Input placeholder="Cloudcc中的列名称" disabled={false} />
            )}
          </FormItem>
        </span>
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(CustomForm);
