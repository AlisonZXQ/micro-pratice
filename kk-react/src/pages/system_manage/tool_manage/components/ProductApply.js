import React, { useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Row, Col, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { getFormLayout } from '@utils/helper';
import { productAccept } from '@services/system_manage';
import BusinessHOC from '@components/BusinessHOC';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);

const ProductApply = (props) => {
  const { form, form: { getFieldDecorator, resetFields, setFieldsValue }, isBusiness } = props;
  const { productname, email, jirakey, entid } = props.location.query;
  const flag = !productname || !email || !jirakey || !entid;

  useEffect(() => {
    if (productname && email) {
      setFieldsValue({
        name: productname,
        email,
      });
    }

    if (jirakey) {
      setFieldsValue({
        jirakey,
      });
    }
  }, [])

  const handleAddProduct = () => {
    form.validateFields((err, values) => {
      if (err) return;
      const params = {
        entid,
        ...values,
      };
      productAccept(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('产品受理成功!');
        resetFields();
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  };

  return (<>
    <FormItem label="产品名称" {...formLayout}>
      {
        getFieldDecorator('name', {
        })(
          <Input />
        )
      }
    </FormItem>
    <FormItem label="申请人邮箱" {...formLayout}>
      {
        getFieldDecorator('email', {
        })(
          <Input />
        )
      }
    </FormItem>

    {!isBusiness &&
      <FormItem label="JIRA项目键" {...formLayout}>
        {
          getFieldDecorator('jirakey', {
          })(
            <Input />
          )
        }
      </FormItem>
    }

    <Row className="f-tac">
      <Col offset={6} span={14}>
        <Button
          type="primary"
          className="f-fw"
          onClick={() => handleAddProduct()}
          disabled={flag}
        >一键创建</Button>
      </Col>
    </Row>

  </>);
};

export default withRouter(BusinessHOC()(Form.create()(ProductApply)));
