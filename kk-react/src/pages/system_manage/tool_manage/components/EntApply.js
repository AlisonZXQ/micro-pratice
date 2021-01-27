import React, { useEffect, useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Row, Col, Modal, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { getFormLayout } from '@utils/helper';
import { entAccept, entReject } from '@services/system_manage';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);
const { TextArea } = Input;

const EntApply = (props) => {
  const { form: { getFieldDecorator, setFieldsValue, getFieldValue, resetFields }, form } = props;
  const { entname, adminemail } = props.location.query;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (entname && adminemail) {
      setFieldsValue({
        name: entname,
        adminemail,
      });
    }
  }, [])

  const handleAddEnt = () => {

    form.validateFields((err, values) => {
      if (err) return;
      const params = {
        name: values.name,
        adminemail: values.adminemail,
      };
      entAccept(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('企业受理成功!');
        resetFields();
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  };

  const handleOk = () => {
    const reason = getFieldValue('reason');
    if (!reason) {
      return message.error('拒绝原因必填！');
    }
    const params = {
      name: getFieldValue('name'),
      adminemail: getFieldValue('adminemail'),
      reason: reason,
    };
    entReject(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('企业驳回成功!');
      setVisible(false);
      resetFields();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  return (<>
    <FormItem label="企业接入" {...formLayout}>
      {
        getFieldDecorator('name', {
        })(
          <Input disabled />
        )
      }
    </FormItem>
    <FormItem label="申请人邮箱" {...formLayout}>
      {
        getFieldDecorator('adminemail', {
        })(
          <Input disabled />
        )
      }
    </FormItem>
    <Row className="f-tac">
      <Col offset={6} span={14}>
        <Row gutter={16}>
          <Col span={12}>
            <Button
              type="primary"
              className="f-fw"
              onClick={() => handleAddEnt()}
              disabled={!entname || !adminemail}
            >一键创建</Button>
          </Col>
          <Col span={12}>
            <Button
              type="danger"
              className="f-fw"
              onClick={() => setVisible(true)}
              disabled={!entname || !adminemail}
            >驳回</Button>
          </Col>
        </Row>
      </Col>
    </Row>

    <Modal
      title="企业接入申请驳回"
      visible={visible}
      onCancel={() => setVisible(false)}
      maskClosable={false}
      onOk={() => handleOk()}
    >
      <div className="u-mgb10 u-mgl45">你确认将当前企业接入申请驳回么?</div>
      <FormItem label="驳回原因" {...formLayout}>
        {
          getFieldDecorator('reason', {
          })(
            <TextArea />
          )
        }
      </FormItem>
    </Modal>

  </>);
};

export default withRouter(Form.create()(EntApply));
