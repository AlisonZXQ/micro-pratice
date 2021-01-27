import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Radio, Input, Select } from 'antd';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formLayout = getFormLayout(6, 18);

const BasicForm = (props) => {
  const { editData: data, type, cascadeList, form: { getFieldDecorator } } = props;
  const editData = type === 'edit' ? data : {};
  const cascadeField = editData.cascadeField || {};

  return (<>
    {
      type === 'create' &&
      <FormItem label="自定义字段" {...formLayout}>
        {
          getFieldDecorator('customfieldid', {
            rules: [{ required: true, message: '自定义字段必填！' }],
          })(
            <Select className="f-fw">
              {
                cascadeList.map(it => <Option key={it.id} value={it.id}>
                  {it.name}
                </Option>)
              }
            </Select>
          )
        }
      </FormItem>
    }

    <FormItem label="关联字段名称" {...formLayout}>
      {
        getFieldDecorator('fieldname', {
          initialValue: cascadeField.fieldname || '',
          rules: [{ required: true, message: '名称必填！' }],
        })(
          <Input placeholder="请输入名称" />
        )
      }
    </FormItem>

    <FormItem label="是否必填" {...formLayout}>
      {
        getFieldDecorator('required', {
          initialValue: cascadeField.required ? cascadeField.required : 1,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <RadioGroup>
            <Radio key={1} value={1}>必填</Radio>
            <Radio key={2} value={2}>选填</Radio>
          </RadioGroup>
        )
      }
    </FormItem>
  </>);
};

export default BasicForm;
