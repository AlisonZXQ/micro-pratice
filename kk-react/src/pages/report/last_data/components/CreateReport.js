import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Button, Input, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { saveReportSnapshot } from '@services/report';

const formLayout = getFormLayout(4, 20);
const FormItem = Form.Item;

const CreateReport = (props) => {
  const [visible, changeVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { form, form: { getFieldDecorator}, id, hasPer } = props;

  const addReport = () => {
    form.validateFields((err, values) => {
      if (err) return ;
      const params = {
        productid: Number(id),
        name: values.addName,
      };
      setLoading(true);
      saveReportSnapshot(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(res.msg);
        message.success('报告已生成，可在报告列表中查看');
        changeVisible(false);
      }).catch((err) => {
        setLoading(false);
        return message.error(err || err.message);
      });
    });
  };

  return ([
    <Modal
      title="生成报告"
      visible={visible}
      onCancel={() => changeVisible(false)}
      onOk={() => addReport()}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
    >
      <FormItem label="报告名称" {...formLayout}>
        {
          getFieldDecorator('addName', {
            rules: [{ required: true, message: '此项必填' }]
          })(
            <Input style={{ width: '100%' }} maxLength={50} placeholder="请输入名称，不超过50字"/>
          )
        }
      </FormItem>
    </Modal>,
    <Button 
      type="primary"
      className="u-mgr10" 
      onClick={() => changeVisible(true)}
      disabled={!hasPer}
    >生成报告</Button>
  ]);
};

export default CreateReport;