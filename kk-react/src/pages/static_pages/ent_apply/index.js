import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Input, Button, Col, message } from 'antd';
import { entApply } from '@services/login';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);

function EntApply(props) {
  const { form: { getFieldDecorator, resetFields } } = props;

  const handleSubmit = () => {
    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (!values.name || !values.adminemail) {
        return message.warn('申请信息必填！');
      }
      const params = {
        ...values,
      };
      entApply(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('申请成功');
        resetFields();
      }).catch((err) => {
        return message.error(err || err.message);
      });
    });
  };

  return (<div className="u-mg15">
    <div className="bbTitle">
      <span className="name">新企业申请接入</span>
    </div>

    <Card>
      <FormItem label="企业名称" {...formLayout}>
        {
          getFieldDecorator('name', {
          })(
            <Input placeholder="请输入企业名称" />
          )
        }
      </FormItem>

      <FormItem label="申请人邮箱" {...formLayout}>
        {
          getFieldDecorator('adminemail', {
          })(
            <Input placeholder="请输入申请人邮箱" />
          )
        }
      </FormItem>
      <Col offset={6} span={14}>
        <Button type="primary" className="f-fw" onClick={() => handleSubmit()}>立即申请</Button>
      </Col>
    </Card>
  </div>);
}

export default Form.create()(EntApply);
