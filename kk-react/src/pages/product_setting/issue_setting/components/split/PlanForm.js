import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { updateDismantle, addDismantle } from '@services/product_setting';

const formLayout = getFormLayout(6, 18);

const FormItem = Form.Item;

function PlanForm(props) {
  const { trigger, record, type, form: { getFieldDecorator, getFieldValue }, getPlanList, productid } = props;
  const [visible, setVisible] = useState(false);

  const handleOk = () => {
    if (type === 'create') {
      const params = {
        productid,
        name: getFieldValue('name'),
      };
      addDismantle(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`创建失败, ${res.msg}`);
        }
        message.success('创建成功');
        getPlanList();
        setVisible(false);
      }).catch((err) => {
        return message.error('创建异常', err || err.msg);
      });
    } else if (type === 'edit') {
      const params = {
        id: record.id,
        name: getFieldValue('name')
      };
      updateDismantle(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`更新失败, ${res.msg}`);
        }
        message.success('更新成功');
        getPlanList();
        setVisible(false);
      }).catch((err) => {
        return message.error('更新异常', err || err.msg);
      });
    }
  };

  return (<span>
    <Modal
      title={type === 'edit' ? '编辑方案' : '新建方案'}
      visible={visible}
      onOk={() => handleOk()}
      onCancel={() => setVisible(false)}
      destroyOnClose={true}
      maskClosable={false}
    >
      <FormItem label="方案名称" {...formLayout}>
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '请输入方案名称！' }],
          initialValue: (record && record.name) || '',
        })(
          <Input placeholder="请输入方案名称" />,
        )}
      </FormItem>
    </Modal>
    <span onClick={() => setVisible(true)}>
      {trigger}
    </span>
  </span>);
}

export default Form.create()(PlanForm);
