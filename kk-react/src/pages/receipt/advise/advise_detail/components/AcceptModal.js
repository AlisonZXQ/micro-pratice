import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Radio, message } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import moment from 'moment';
import { getFormLayout, getIssueCustom } from '@utils/helper';
import CreateRequirement from '@components/CreateIssues/create_requirement';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { create4RelationIssue } from '@services/receipt';
import { connTypeMap, connTypeIdMap } from '@shared/ReceiptConfig';
import EpIssueList from '@pages/receipt/components/ep_issue_list';

const formLayout = getFormLayout(4, 20);

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

  getAdviseDetail = () => {
    const { adviseObj } = this.props;
    const advise = adviseObj.advise || {};
    const aid = this.props.location.query.aid || this.props.aid || advise.id;
    if (this.props.callback) {
      this.props.callback();
    } else if (this.props.type === 'list') {
      this.props.getList();
    } else {
      this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: aid } });
    }
  }

  getFullLink = () => {
    const { adviseObj } = this.props;
    const advise = adviseObj.advise || {};

    const aid = this.props.location.query.aid || this.props.aid || advise.id;
    const params = {
      type: connTypeMap.advise,
      id: aid,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  handleNext = () => {
    this.setState({ createVisible: true });
  }

  handleAddReq = () => {
    const { adviseObj, customSelect } = this.props;
    const adviseId = adviseObj && adviseObj.advise && adviseObj.advise.id;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段

      const params = {
        parentIssueType: connTypeMap['advise'],
        parentIssueId: this.props.location.query[connTypeIdMap['advise']] || adviseId,
        issuetype: ISSUE_TYPE_JIRA_MAP.REQUIREMENT,
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
        this.getAdviseDetail();
        this.getFullLink();
        this.setState({ createVisible: false, nextVisible: false });
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  getFooters = () => {
    const { form: { getFieldValue }, adviseObj } = this.props;
    const adviseId = adviseObj && adviseObj.advise && adviseObj.advise.id;
    const action = getFieldValue('action');
    if (action === 1) {
      return <Button onClick={() => this.handleNext()}>下一步</Button>;
    } else {
      return (<EpIssueList
        issueType="requirement"
        type="detail"
        parentIssueType={'advise'}
        nextObj={adviseObj}
        parentIssueId={adviseId}
        isMulti
        next
        callback={() => { this.setState({ nextVisible: false }); this.getAdviseDetail() }}
      />);
    }
  }

  render() {
    const { form: { getFieldDecorator }, adviseObj } = this.props;
    const { visible, nextVisible, createVisible, loading } = this.state;
    const advise = adviseObj.advise || {};
    const product = adviseObj.product || {};
    const productid = product.id;

    const reqObj = { ...adviseObj };
    reqObj.requirement = reqObj.advise || {};
    const arr = [];
    reqObj.adviseCustomFieldRelationInfoList && reqObj.adviseCustomFieldRelationInfoList.forEach(it => {
      arr.push({
        requirementCustomFieldRelation: it.adviseCustomFieldRelation,
        productCustomField: it.productCustomField,
      });
    });
    reqObj.requirementCustomFieldRelationInfoList = arr || [];

    return (<span onClick={(e) => e.stopPropagation()}>
      <Modal
        title="受理确认"
        visible={visible}
        onCancel={() => { this.setState({ visible: false }); this.getAdviseDetail() }}
        onOk={() => this.handleOk()}
        destroyOnClose
        maskClosable={false}
      >
        <div>您确认受理建议【{advise.name}】吗?</div>
      </Modal>

      <Modal
        title="选择下一步动作"
        visible={nextVisible}
        onCancel={() => { this.setState({ nextVisible: false }); this.getAdviseDetail() }}
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
                <Radio key={1} value={1}>创建需求</Radio>
                <Radio key={2} value={2}>关联需求</Radio>
              </RadioGroup>
            )
          }
        </FormItem>

      </Modal>

      <Modal
        visible={createVisible}
        title="创建需求"
        onCancel={() => this.setState({ createVisible: false })}
        onOk={() => this.handleAddReq()}
        width={850}
        okButtonProps={{ loading }}
        destroyOnClose
        maskClosable={false}
      >
        <CreateRequirement {...this.props} productid={productid} requirementDetail={reqObj} />
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
