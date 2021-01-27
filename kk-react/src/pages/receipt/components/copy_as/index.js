import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Radio, Modal, message, Button, Col, Row } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getIssueCustom, getMentionUsers, deepCopy, getSystemDescription, equalsObj } from '@utils/helper';
import { createBill } from '@services/receipt';
import { issue_type_name_map } from '@shared/ReceiptConfig';
import CreateAdvise from '@components/CreateIssues/create_advise';
import CreateRequirement from '@components/CreateIssues/create_requirement';
import CreateTask from '@components/CreateIssues/create_task';
import CreateBug from '@components/CreateIssues/create_bug';
import CreateObjective from '@components/CreateIssues/create_objective';
import CreateTicket from '@components/CreateIssues/create_ticket';
import styles from './index.less';

class Index extends Component {
  state = {
    visible: false,
    radioValue: '',
    createLoading: false,
  };

  componentDidMount() {
    const { type } = this.props;
    const params = {
      target: {
        value: type,
      }
    };
    this.onChangeRadio(params);
  }

  componentDidUpdate(prevProps, prevState) {
    const { type } = this.props;
    if (!equalsObj(prevProps.record, this.props.record)) {
      const params = {
        target: {
          value: type,
        }
      };
      this.onChangeRadio(params, this.props.record);
    }
  }

  onChangeRadio = (e, recordProps) => {
    const { record: thisRecord, type } = this.props;
    const record = recordProps || thisRecord;
    const newRecord = deepCopy(record);
    const currentType = e.target.value;
    newRecord[currentType] = newRecord[type];
    newRecord[`${currentType}CustomFieldRelationInfoList`] = newRecord[`${type}CustomFieldRelationInfoList`];
    newRecord[`${currentType}CustomFieldRelationInfoList`].map((it) => {
      it[`${currentType}CustomFieldRelation`] = it[`${type}CustomFieldRelation`];
      it[`${currentType}productCustomField`] = it[`${type}productCustomField`];
    });
    this.setState({ record: newRecord }, () => {
      this.setState({
        radioValue: currentType,
      });
    });

  };

  handleCancel = (e) => {
    this.setState({ visible: false });
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let type = '';
      const { radioValue } = this.state;
      if (radioValue === 'advise' || radioValue === 'task' || radioValue === 'bug' || radioValue === 'ticket') {
        type = issue_type_name_map[radioValue];
      } else if (radioValue === 'requirement') {
        type = issue_type_name_map['story'];
      } else if (radioValue === 'objective') {
        type = issue_type_name_map['epic'];
      }

      const { customSelect, customList } = this.props;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段

      const params = {
        parentid: 0,
        issuetype: type,
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
      };

      this.setState({ createLoading: true });
      createBill(params).then((res) => {
        this.setState({ createLoading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        if (this.state.createOther) {
          this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
          this.props.form.resetFields(['name', 'attachments']);
          this.setState({ visible: true });
        } else {
          this.setState({ visible: false });
          this.props.form.resetFields();
        }
        if (this.props.getList) {
          this.props.getList();
        }

      }).catch((err) => {
        this.setState({ createLoading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  handleOpen = (e) => {
    const { customList } = this.props;
    this.setState({ visible: true });
    this.props.closeVisible();
    this.props.form.setFieldsValue({ [`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`]: getSystemDescription(customList).defaultValue || '' });
    this.props.form.resetFields(['name', 'attachments']);
  }

  render() {
    const { radioValue, visible, createLoading, record } = this.state;
    const { lastProduct } = this.props;
    const productid = lastProduct.id;

    return (<span onClick={(e) => e.stopPropagation()}>
      <Modal
        title="复制为"
        width={1050}
        visible={visible}
        className='modal-createissue-height'
        destroyOnClose
        onCancel={() => this.setState({ visible: false })}
        footer={[
          <div style={{ textAlign: 'right' }}>
            <Button onClick={(e) => {
              this.handleCancel(e);
            }}>取消</Button>
            <Button type='primary' onClick={() => this.handleOk()} loading={createLoading}>创建</Button>
          </div>
        ]}
      >
        <Row className='u-mgb20'>
          <Col span={3}>
            <span className='f-fr'>类型：</span>
          </Col>
          <Col span={20}>
            <Radio.Group
              onChange={(e) => this.onChangeRadio(e)}
              value={radioValue}>
              <Radio value={'objective'}>目标</Radio>
              <Radio value={'advise'}>建议</Radio>
              <Radio value={'ticket'}>工单</Radio>
              <Radio value={'requirement'}>需求</Radio>
              <Radio value={'task'}>任务</Radio>
              <Radio value={'bug'}>缺陷</Radio>
            </Radio.Group>
          </Col>
        </Row>
        {radioValue === 'advise' &&
          <CreateAdvise
            {...this.props}
            adviseDetail={record}
            productid={productid}
          />
        }
        {radioValue === 'requirement' &&
          <CreateRequirement
            {...this.props}
            requirementDetail={record}
            productid={productid}
          />
        }
        {radioValue === 'task' &&
          <CreateTask
            {...this.props}
            taskCopyDetail={record}
            productid={productid}
            isCopyAs
          />
        }
        {radioValue === 'bug' &&
          <CreateBug
            {...this.props}
            bugDetail={record}
            productid={productid}
          />
        }
        {radioValue === 'objective' &&
          <CreateObjective
            {...this.props}
            objectiveDetail={record}
            productid={productid}
          />
        }

        {radioValue === 'ticket' &&
          <CreateTicket
            {...this.props}
            ticketDetail={record}
            productid={productid}
          />
        }

      </Modal>
      <span
        className={styles.copy}
        onClick={(e) => this.handleOpen(e)}>复制为</span>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    customSelect: state.aimEP.customSelect,
    lastProduct: state.product.lastProduct,

    customList: state.receipt.customList || [],
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
