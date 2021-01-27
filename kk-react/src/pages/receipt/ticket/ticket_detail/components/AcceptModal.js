import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Radio, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import moment from 'moment';
import { getFormLayout, getIssueCustom } from '@utils/helper';
import CreateTask from '@components/CreateIssues/create_task';
import CreateBug from '@components/CreateIssues/create_bug';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { create4RelationIssue } from '@services/receipt';
import { connTypeMap, connTypeIdMap } from '@shared/ReceiptConfig';
import EpIssueList from '@pages/receipt/components/ep_issue_list';

const formLayout = getFormLayout(3, 21);

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class AcceptModal extends Component {
  state = {
    visible: false,
    nextVisible: false,
    createVisible: false,
  }

  componentDidMount() {
    this.props.detailThis(this);
  }

  handleOk = () => {
    this.setState({ visible: false, nextVisible: true });
  }

  getTicketDetail = () => {
    const { ticketObj } = this.props;
    const ticket = ticketObj.ticket || {};
    const tid = this.props.location.query.tid || this.props.tid || ticket.id;
    if (this.props.callback) {
      this.props.callback();
    } else if (this.props.type === 'list') {
      this.props.getList();
    } else {
      this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: tid } });
    }
  }

  getFullLink = () => {
    const { ticketObj } = this.props;
    const ticket = ticketObj.ticket || {};

    const tid = this.props.location.query.tid || this.props.tid || ticket.id;
    const params = {
      type: connTypeMap.ticket,
      id: tid,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  handleNext = () => {
    this.setState({ createVisible: true });
  }

  handleAddReq = () => {
    const { ticketObj, customSelect } = this.props;
    const ticketId = ticketObj && ticketObj.ticket && ticketObj.ticket.id;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段
      const action = this.props.form.getFieldValue('action');
      const issuetype = action === 1 ? 'TASK' : 'BUG';

      const params = {
        parentIssueType: connTypeMap['ticket'],
        parentIssueId: this.props.location.query[connTypeIdMap['ticket']] || ticketId,
        issuetype: ISSUE_TYPE_JIRA_MAP[issuetype],
        ...values,
        moduleid: values.moduleid ? values.moduleid : 0,
        custom_field_values,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      this.setState({ loading: true });
      create4RelationIssue(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        this.getTicketDetail();
        this.getFullLink();
        this.setState({ createVisible: false, nextVisible: false });
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  getFooters = () => {
    const { form: { getFieldValue }, ticketObj } = this.props;
    const ticketId = ticketObj && ticketObj.ticket && ticketObj.ticket.id;
    const action = getFieldValue('action');
    if (action === 1 || action === 3) {
      return <Button onClick={() => this.handleNext()}>下一步</Button>;
    } else {
      return (<EpIssueList
        issueType={action === 2 ? 'task' : 'bug'}
        type="detail"
        parentIssueType={'ticket'}
        nextObj={ticketObj}
        parentIssueId={ticketId}
        isMulti
        next
        callback={() => { this.setState({ nextVisible: false }); this.getTicketDetail() }}
      />);
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, ticketObj } = this.props;
    const { visible, nextVisible, createVisible, loading } = this.state;
    const ticket = ticketObj.ticket || {};
    const product = ticketObj.product || {};
    const productid = product.id;
    const action = getFieldValue('action');

    const reqObj = { ...ticketObj };
    reqObj.task = reqObj.ticket || {};
    reqObj.bug = reqObj.ticket || {};
    const arr = [];
    reqObj.ticketCustomFieldRelationInfoList && reqObj.ticketCustomFieldRelationInfoList.forEach(it => {
      arr.push({
        taskCustomFieldRelation: it.ticketCustomFieldRelation,
        bugCustomFieldRelation: it.ticketCustomFieldRelation,
        productCustomField: it.productCustomField,
      });
    });
    reqObj.taskCustomFieldRelationInfoList = arr || [];
    reqObj.bugCustomFieldRelationInfoList = arr || [];

    return (<span onClick={(e) => e.stopPropagation()}>
      <Modal
        title="受理确认"
        visible={visible}
        onCancel={() => { this.setState({ visible: false }); this.getTicketDetail() }}
        onOk={() => this.handleOk()}
        destroyOnClose
        maskClosable={false}
      >
        <div>您确认受理工单【{ticket.name}】吗?</div>
      </Modal>

      <Modal
        title="选择下一步动作"
        visible={nextVisible}
        onCancel={() => { this.setState({ nextVisible: false }); this.getTicketDetail() }}
        footer={this.getFooters()}
        destroyOnClose
        maskClosable={false}
      >
        <FormItem label="动作" {...formLayout}>
          {
            getFieldDecorator('action', {
              initialValue: 1,
            })(
              <RadioGroup>
                <Radio key={1} value={1}>创建任务</Radio>
                <Radio key={2} value={2}>关联任务</Radio>
                <Radio key={3} value={3}>创建缺陷</Radio>
                <Radio key={4} value={4}>关联缺陷</Radio>
              </RadioGroup>
            )
          }
        </FormItem>

      </Modal>

      <Modal
        visible={createVisible}
        title={ action === 1 ? '创建任务' : '创建缺陷'}
        onCancel={() => this.setState({ createVisible: false })}
        onOk={() => this.handleAddReq()}
        width={850}
        okButtonProps={{ loading }}
        destroyOnClose
        maskClosable={false}
      >
        {action === 1 &&
          <CreateTask {...this.props} productid={productid} acceptTaskDetail={reqObj} isAccept />
        }
        {action === 3 &&
          <CreateBug {...this.props} productid={productid} bugDetail={reqObj} />
        }
      </Modal>
    </span >);
  }
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
    lastProduct: state.product.lastProduct,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(AcceptModal)));
