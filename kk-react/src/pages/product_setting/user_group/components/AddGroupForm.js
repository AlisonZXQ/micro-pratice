import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from 'antd';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);

class AddGroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;

    return (<span>
      <FormItem label="用户组名称" {...formLayout}>
        {
          getFieldDecorator('name', {
            rules: [{ required: true, message: '此项必填！' }]
          })(
            <Input placeholder="请输入" className="f-fw" />
          )
        }
      </FormItem>
    </span>);
  }
}

export default Form.create()(AddGroupForm);
