import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input } from 'antd';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const formLayout = getFormLayout(3, 20);

function Link(props) {
  const { getFieldDecorator } = props.form;

  const validFunction4Url = (rule, value, callback) =>{
    const {getFieldValue} = props.form;
    const urlValue =getFieldValue('url');
    if (urlValue){
      if(!/^(http:\/\/|https:\/\/)/.test(urlValue)){
        callback('地址必须以http://或https://为前缀');
      }
      else{
        callback();
      }
    }
    else{
      callback();
    }
  };

  return <span>
    <FormItem label="名称" {...formLayout}>
      {getFieldDecorator('name', {
        rules: [
        ],
      })(
        <Input placeholder="请输入链接名称，不超过50字" className="f-fw" maxLength={50} />
      )}
    </FormItem>

    <FormItem label="地址" {...formLayout}>
      {getFieldDecorator('url', {
        rules: [
          { required: true, message: `此项不能为空` },
          { validator: validFunction4Url }
        ],
      })(
        <Input placeholder="请输入链接地址，不超过255字" className="f-fw" maxLength={255} />
      )}
    </FormItem>
  </span>;
}

export default Link;
