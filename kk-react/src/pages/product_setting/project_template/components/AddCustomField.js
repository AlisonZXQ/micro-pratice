import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Radio } from 'antd';
import { getFormLayout } from '@utils/helper';
import { PROJECT_CUSTOM_USE, PROJECT_CUSTOM_REQUIRED, PROJECT_CUSTOM_TYPE, PROJECT_CUSTOM_TEXT_TYPE } from '@shared/ProductSettingConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 13);

class AddCustomField extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, itemData } = this.props;
    return (<span>
      <FormItem label="名称" {...formLayout}>
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入名称！' }],
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.name) || '',
        })(
          <Input placeholder="请输入名称" disabled={false} />,
        )}
      </FormItem>
      <FormItem label="字段键" {...formLayout}>
        {getFieldDecorator('fieldkey', {
          rules: [{ required: true, message: '请输入字段键！' }],
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.fieldkey) || '',
        })(
          <Input placeholder="请输入字段键" disabled={false} />,
        )}
      </FormItem>
      <FormItem label="是否必填" {...formLayout}>
        {getFieldDecorator('required', {
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.required) || PROJECT_CUSTOM_REQUIRED.NOT_REQUIRED,
        })(
          <Radio.Group>
            <Radio value={PROJECT_CUSTOM_REQUIRED.REQUIRED}>必填</Radio>
            <Radio value={PROJECT_CUSTOM_REQUIRED.NOT_REQUIRED}>选填</Radio>
          </Radio.Group>
        )}
      </FormItem>
      <FormItem label="类型" {...formLayout}>
        {getFieldDecorator('type', {
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.type) || PROJECT_CUSTOM_TYPE.TEXT,
        })(
          <Radio.Group>
            <Radio value={PROJECT_CUSTOM_TYPE.TEXT}>文本输入</Radio>
            <Radio value={PROJECT_CUSTOM_TYPE.SELECT}>下拉列表</Radio>
          </Radio.Group>
        )}
      </FormItem>
      {getFieldValue('type') === PROJECT_CUSTOM_REQUIRED.TEXT && <FormItem label="输入框样式" {...formLayout}>
        {getFieldDecorator('inputui', {
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.inputui) || PROJECT_CUSTOM_TEXT_TYPE.INPUT,
        })(
          <Radio.Group>
            <Radio value={PROJECT_CUSTOM_TEXT_TYPE.INPUT}>单行文本</Radio>
            <Radio value={PROJECT_CUSTOM_TEXT_TYPE.TEXTAREA}>多行文本</Radio>
          </Radio.Group>
        )}
      </FormItem>}
      <FormItem label="状态" {...formLayout}>
        {getFieldDecorator('state', {
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.state) || PROJECT_CUSTOM_USE.OPEN,
        })(
          <Radio.Group>
            <Radio value={PROJECT_CUSTOM_USE.OPEN}>启用</Radio>
            <Radio value={PROJECT_CUSTOM_USE.CLOSE}>禁用</Radio>
          </Radio.Group>
        )}
      </FormItem>
      <FormItem label="排序值" {...formLayout}>
        {getFieldDecorator('sortvalue', {
          rules: [{ required: true, message: '请输入排序值！' }],
          initialValue: (itemData && itemData.projectTemplateCustomField && itemData.projectTemplateCustomField.sortvalue) || '',
        })(
          <Input placeholder="请输入排序值(值越大越靠前)" disabled={false} />,
        )}
      </FormItem>
    </span>);
  }
}

export default AddCustomField;
