import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Row, Col, message, TimePicker, DatePicker } from 'antd';
import { getFormLayout } from '@utils/helper';
import { withRouter } from 'react-router-dom';
import { sendUpgradeMsg } from '@services/system_manage';
import { warnModal } from '@shared/CommonFun';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);

class PlatNotice extends Component {

  handleSend = () => {
    const { form: { resetFields } } = this.props;

    warnModal({
      title: '提示',
      content: '您确认要向目前EP中所有企业的子产品用户发送此系统通知吗?',
      okCallback: () => {
        this.props.form.validateFields((err, values) => {
          if (!values.date || !values.begin || !values.end)
            return message.error('日期或时间必填！');
          const params = {
            date: values.date.format('YYYY-MM-DD'),
            timerange: `${values.begin.format('HH:mm')}-${values.end.format('HH:mm')}`
          };

          sendUpgradeMsg(params).then(res => {
            if (res.code !== 200) return message.error(res.msg);
            message.success('发送成功！');
            resetFields();
          }).catch(err => {
            return message.error(err || err.message);
          });
        });
      }
    });

  }

  handlePre = () => {
    this.handleSend();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;

    return (<>

      <FormItem label="日期" {...formLayout}>
        {
          getFieldDecorator('date', {
          })(
            <DatePicker className="f-fw" />
          )
        }
      </FormItem>
      <FormItem label="时间范围" {...formLayout}>
        <Col span={10}>
          {
            getFieldDecorator('begin', {
            })(
              <TimePicker format={'HH:mm'} placeholder="开始时间" style={{ width: '100%' }} />
            )
          }
        </Col>
        <Col span={4} className="f-tac">
          ~
        </Col>
        <Col span={10}>
          {
            getFieldDecorator('end', {
            })(
              <TimePicker format={'HH:mm'} placeholder="结束时间" style={{ width: '100%' }} />
            )
          }
        </Col>
      </FormItem>
      <Row className="f-tac">
        <Col offset={6} span={14}>
          <Button type="primary" className="f-fw" onClick={() => this.handlePre()}>发送</Button>
        </Col>
      </Row>

    </>);
  }

}

export default withRouter(Form.create()(PlatNotice));
