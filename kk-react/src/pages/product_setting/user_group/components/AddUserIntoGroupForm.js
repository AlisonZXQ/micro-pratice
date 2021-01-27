import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from 'antd';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const { TextArea } = Input;
const formLayout = getFormLayout(6, 16);

class AddUserInfoGroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;

    return (<span>
      <FormItem label="邮箱" {...formLayout}>
        {
          getFieldDecorator('email', {
            rules: [{ required: true, message: '此项必填！' }]
          })(
            <TextArea placeholder="请输入，用逗号(,)分隔的多个邮箱，以批量添加成员" />
          )
        }
      </FormItem>
    </span>);
  }
}

export default Form.create()(AddUserInfoGroupForm);
