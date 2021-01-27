import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Input, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { updateTicketState } from '@services/ticket';
import { TICKET_STATUS_MAP } from '@shared/TicketConfig';

const formLayout = getFormLayout(4, 20);

const FormItem = Form.Item;
const { TextArea } = Input;

class RejectModal extends Component {
  state = {
    visible: false,
  }

  componentDidMount() {
    this.props.detailThis(this);
  }

  handleOk = () => {
    const { ticket } = this.props;
    const tid = this.props.location.query.tid || this.props.tid || ticket.id;
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const params = {
        ...values,
        id: tid,
        state: TICKET_STATUS_MAP.REJECTED,
      };
      updateTicketState(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更新状态成功！');
        this.setState({ visible: false });
        this.getTicketDetail();
      }).catch((err) => {
        return message.error(err || err.message);
      });
    });
  }

  getTicketDetail = () => {
    const { ticket } = this.props;
    const tid = this.props.location.query.tid || this.props.tid || ticket.id;
    if (this.props.callback) {
      this.props.callback();
    } else if (this.props.type === 'list') {
      this.props.getList();
    } else {
      this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: tid } });
    }
  }

  render() {
    // detailThis是来自主页的
    const { form: { getFieldDecorator }, ticket, detailThis } = this.props;
    const { visible } = this.state;

    return (<span onClick={(e) => e.stopPropagation()}>
      {
        !detailThis &&
        <Button onClick={() => this.setState({ visible: true })} className="u-mgr10" type="danger">驳回</Button>
      }
      <Modal
        title="驳回确认"
        visible={visible}
        onCancel={() => { this.setState({ visible: false }); this.props.callback && this.props.callback() }}
        onOk={() => this.handleOk()}
        width={650}
        destroyOnClose
        maskClosable={false}
      >
        <FormItem label="当前工单" {...formLayout}>
          {ticket.name}
        </FormItem>
        <FormItem label="驳回原因" {...formLayout}>
          {
            getFieldDecorator('rejectdesc', {
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <TextArea />
            )
          }
        </FormItem>
      </Modal>
    </span>);
  }
}

export default withRouter(connect()(Form.create()(RejectModal)));
