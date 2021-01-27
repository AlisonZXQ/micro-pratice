import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Modal, Radio, Input } from 'antd';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import EditSelectStatus from '@components/EditSelectStatus';
import { setRequirementState } from '@services/requirement';
import DefineDot from '@components/DefineDot';
import { requirementNameArr, ISSUE_ROLE_VALUE_MAP, requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import { REQUIREMENT_STATUS_MAP, REVIEW_RESULE_MAP } from '@shared/RequirementConfig';
import ReviewResultForm from './ReviewResultForm';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const RadioGroup = Radio.Group;
const { TextArea } = Input;

class EditStatus extends Component {
  state = {
    currentState: {},
    visible: false,
  }
  rejectThis = null;
  acceptThis = null;


  handelUpdateState = (value) => {
    const obj = requirementNameArr.find(it => it.key === value) || {};
    if (obj.key === REQUIREMENT_STATUS_MAP.EVALUATION) {
      this.setState({ currentState: obj, visible: true });
    }
    else {
      this.setState({ currentState: obj }, () => {
        this.handleOk();
      });
    }
  }

  handleOk = () => {
    const { requirementDetail: detail, issueId, listDetail, planListDetail } = this.props;
    const requirementDetail = detail || {};
    let requirement = {};
    if (listDetail) {
      requirement = listDetail.requirement;
    } else if (planListDetail) {
      requirement = planListDetail;
    } else {
      requirement = requirementDetail.requirement || {};
    }
    const { form: { getFieldValue } } = this.props;
    const { currentState } = this.state;

    if (currentState.key !== REQUIREMENT_STATUS_MAP.EVALUATION) {
      const params = [{
        id: requirement.id || issueId,
        state: currentState.key,
        reviewResult: "",
        rejectDesc: "",
      }];
      this.setRequirementState(params);
    } else {
      const arr = getFieldValue('reviewresult') === REVIEW_RESULE_MAP.PASS ? ['reviewresult'] : ['reviewresult', 'rejectdesc'];
      this.props.form.validateFields(arr, (err, values) => {
        if (err) return;
        const params = [{
          id: requirement.id || issueId,
          state: currentState.key,
          reviewResult: values.reviewresult,
          rejectDesc: values.rejectdesc ? values.rejectdesc : '',
        }];
        this.setRequirementState(params);
      });
    }
  }

  setRequirementState = (params) => {
    setRequirementState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      this.getReqirementDetail();
      if (this.props.refreshFun) {
        this.props.refreshFun({ state: params[0].state });
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getReqirementDetail = () => {
    const { requirementDetail } = this.props;
    const requirement = requirementDetail.requirement || {};
    if (requirementDetail && requirement.id) {
      this.props.dispatch({ type: 'requirement/getReqirementDetail', payload: { id: requirement.id } });
    }
  }

  render() {
    const {
      value, form: { getFieldValue, getFieldDecorator }, requirementDetail, issueRole: role,
      bgHover, listDetail
    } = this.props;
    const { visible, currentState } = this.state;
    let issueRole;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = requirementDetail.issueRole || role;
    }

    return (<span onClick={e => e.stopPropagation()}>
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type="requirement"
          handleUpdate={(value) => this.handelUpdateState(value)}
          bgHover={bgHover}
        />
      }

      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <span style={{ position: 'relative', top: '-2px' }}>
          <DefineDot
            text={value}
            statusMap={requirementNameMap}
            statusColor={requirementColorDotMap}
          />
        </span>
      }

      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.handleOk()}
        maskClosable={false}
      >
        {
          currentState.key === REQUIREMENT_STATUS_MAP.EVALUATION &&
          <ReviewResultForm form={this.props.form} />
        }
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    requirementDetail: state.requirement.requirementDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(EditStatus));
