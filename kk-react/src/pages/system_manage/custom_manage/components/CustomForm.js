import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Radio, Checkbox, Switch, Select, Tooltip } from 'antd';
import { getFormLayout } from '@utils/helper';
import BusinessHOC from '@components/BusinessHOC';
import { issueMap } from '@shared/SystemManageConfig';
import { CUSTOME_TYPE_MAP, CUSTOME_SYSTEM, ISSUE_CUSTOM_USE, CUSTOME_REQUIRED, CUSTOME_TYPE_NAME_MAP } from '@shared/ReceiptConfig';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;
const { TextArea } = Input;
const formLayout = getFormLayout(6, 16);

class CustomForm extends Component {

  render() {
    const { form: { getFieldDecorator, getFieldValue }, dialogType, editData, isBusiness } = this.props;
    const data = editData;
    const edit = dialogType === 'edit';

    return (
      <span>
        <FormItem label="名称" {...formLayout}>
          {
            getFieldDecorator('name', {
              initialValue: data.name,
              rules: [{ required: true, message: '此项必填！' }],
            })(<Input maxLength={50} placeholder="请输入名称，最多50字" />)
          }
        </FormItem>

        {
          !edit &&
          <FormItem label="属性" {...formLayout}>
            {
              getFieldDecorator('system', {
                initialValue: data.system,
                rules: [{ required: true, message: '此项必填！' }],
              })(<RadioGroup>
                <Radio key={CUSTOME_SYSTEM.SYSTEM} value={CUSTOME_SYSTEM.SYSTEM}>系统字段
                  <Tooltip title="产品初始化时默认配置">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Radio>
                <Radio key={CUSTOME_SYSTEM.NOT_SYSTEM} value={CUSTOME_SYSTEM.NOT_SYSTEM}>自定义字段</Radio>
              </RadioGroup>)
            }
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

        {
          !edit &&
          <FormItem label="类型" {...formLayout}>
            {
              getFieldDecorator('type', {
                initialValue: data.type,
                rules: [{ required: true, message: '此项必填！' }],
              })(<Select className="f-fw" placeholder="请选择类型">
                {
                  Object.keys(CUSTOME_TYPE_NAME_MAP).map(it =>
                    <Option key={Number(it)} value={Number(it)}>
                      {CUSTOME_TYPE_NAME_MAP[Number(it)]}
                    </Option>)
                }
              </Select>
              )
            }
          </FormItem>
        }

        {
          (getFieldValue('type') === CUSTOME_TYPE_MAP.DECIMAL
           || getFieldValue('type') === CUSTOME_TYPE_MAP.INTERGER
           || data.type === CUSTOME_TYPE_MAP.INTERGER
           || data.type === CUSTOME_TYPE_MAP.DECIMAL) &&
          <FormItem label="数值单位" {...formLayout}>
            {
              getFieldDecorator('danwei', {
                initialValue: data.platformCustomFieldValueVOList && data.platformCustomFieldValueVOList[0] && data.platformCustomFieldValueVOList[0].customlabel,
                rules: [{ required: true, message: '此项必填！' }],
              })(<Input placeholder={'显示在数值后面，最多2个字符'} maxLength={2} />)
            }
          </FormItem>
        }

        {(getFieldValue('type') === CUSTOME_TYPE_MAP.SELECT || getFieldValue('type') === CUSTOME_TYPE_MAP.MULTISELECT
          || data.type === CUSTOME_TYPE_MAP.SELECT || data.type === CUSTOME_TYPE_MAP.MULTISELECT)
          && !isBusiness && <span>
          <FormItem label="Cloudcc表" {...formLayout}>
            {getFieldDecorator('cloudccKey', {
              initialValue: data.cloudccKey,
            })(
              <Input placeholder="请输入Cloudcc中的表名称(大小写敏感)" disabled={false} />
            )}
          </FormItem>
          <FormItem label="Cloudcc列" {...formLayout}>
            {getFieldDecorator('cloudccField', {
              initialValue: data.cloudccField,
            })(
              <Input placeholder="Cloudcc中的列名称" disabled={false} />
            )}
          </FormItem>
        </span>}

        <FormItem label="描述" {...formLayout}>
          {
            getFieldDecorator('description', {
              initialValue: data.description,
            })(<TextArea placeholder="请输入描述" />)
          }
        </FormItem>
      </span>
    );
  }
}

export default BusinessHOC()(CustomForm);
