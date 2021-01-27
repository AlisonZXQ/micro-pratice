import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Modal, Input } from 'antd';
import { connect } from 'dva';
import DefineDot from '@components/DefineDot';
import { getFormLayout } from '@utils/helper';
import EditSelectStatus from '@components/EditSelectStatus';
import { updateObjectiveState } from '@services/objective';
import { aimNameArr, ISSUE_ROLE_VALUE_MAP, aimNameMap, aimColorDotMap } from '@shared/CommonConfig';
import { OBJECTIVE_STATUS_MAP } from '@shared/ObjectiveConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const { TextArea } = Input;
/**
 * @objectiveDetail 详情页和抽屉编辑
 * @listDetail - 列表页编辑
 * @planListDetail - 需求规划编辑
 * @issueId 需求规划
 */
class EditStatus extends Component {
  state = {
    currentState: {},
    visible: false,
  }
  rejectThis = null;
  acceptThis = null;


  handleUpdateState = (value) => {
    const obj = aimNameArr.find(it => it.key === value) || {};
    if (obj.key === OBJECTIVE_STATUS_MAP.CANCLE) {
      this.setState({ currentState: obj, visible: true });
    }
    else {
      this.setState({ currentState: obj }, () => {
        this.handleOk();
      });
    }
  }

  handleOk = () => {
    const { objectiveDetail: detail, issueId, listDetail, planListDetail } = this.props;
    const objectiveDetail = detail || {};
    let objective = {};
    if (listDetail) {
      objective = listDetail.objective;
    } else if (planListDetail) {
      objective = planListDetail;
    } else {
      objective = objectiveDetail.objective || {};
    }

    const { form: { getFieldValue } } = this.props;
    const { currentState } = this.state;

    if (currentState.key !== OBJECTIVE_STATUS_MAP.CANCLE) {
      const params = [{
        id: objective.id || issueId,
        state: currentState.key
      }];
      this.updateObjectiveState(params);
    } else {
      this.props.form.validateFields((err, values) => {
        if (err) return;
        const params = [{
          id: objective.id || issueId,
          state: currentState.key,
          cancelMsg: getFieldValue('cancel_msg'),
        }];
        this.updateObjectiveState(params);
      });
    }
  }

  updateObjectiveState = (params) => {
    updateObjectiveState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      this.getObjectiveDetail();
      if (this.props.refreshFun) {
        this.props.refreshFun();
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getObjectiveDetail = () => {
    const { objectiveDetail } = this.props;
    const objective = objectiveDetail.objective || {};
    if (objectiveDetail && objective.id) {
      this.props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: objective.id } });
    }
  }

  getCurrentUserType = () => {
    const { objectiveDetail, listDetail, planListDetail, currentUser, list } = this.props;
    const user = currentUser.user || {};
    let submitUser = {};
    let responseUser = {};
    let requireUser = {};
    if (list && listDetail && Object.keys(listDetail).length) {
      submitUser = listDetail.submitUser || {};
      responseUser = listDetail.responseUser || {};
      requireUser = listDetail.requireUser || {};
    } else if (planListDetail && Object.keys(planListDetail).length) {
      submitUser = planListDetail.submitUser || {};
      responseUser = planListDetail.responseUser || {};
      requireUser = planListDetail.requireUser || {};
    } else if (objectiveDetail && Object.keys(objectiveDetail).length) {
      submitUser = objectiveDetail.submitUser || {};
      responseUser = objectiveDetail.responseUser || {};
      requireUser = objectiveDetail.requireUser || {};
    }
    const userTypeArr = [];
    if (submitUser.id === user.id) {
      userTypeArr.push('报告人');
    }
    if (responseUser.id === user.id) {
      userTypeArr.push('负责人');
    }
    if (requireUser.id === user.id) {
      userTypeArr.push('验证人');
    }
    return userTypeArr;
  }

  render() {
    const { value, form: { getFieldDecorator }, objectiveDetail, issueRole: role, bgHover, listDetail, planListDetail } = this.props;
    const { visible, currentState } = this.state;
    let issueRole;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = objectiveDetail.issueRole || role;
    }

    return (<span onClick={(e) => e.stopPropagation()}>
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type="objective"
          handleUpdate={(value) => this.handleUpdateState(value)}
          bgHover={bgHover}
          currentUserType={this.getCurrentUserType()}
        />
      }

      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <span style={{ position: 'relative', top: '-2px' }}>
          <DefineDot
            text={value}
            statusMap={aimNameMap}
            statusColor={aimColorDotMap}
          />
        </span>
      }

      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.handleOk()}
        title={'状态设置'}
        destroyOnClose
        maskClosable={false}
      >
        {
          currentState.key === OBJECTIVE_STATUS_MAP.CANCLE &&
          <span>
            <FormItem label="取消原因" {...formLayout}>
              {
                getFieldDecorator('cancel_msg', {
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <TextArea />
                )
              }
            </FormItem>
          </span>
        }
        {currentState.key !== OBJECTIVE_STATUS_MAP.CANCLE &&
          <span>
            您确认设置当前目标的状态为【{currentState.name}】吗？
          </span>
        }
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    objectiveDetail: state.objective.objectiveDetail,
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(Form.create()(EditStatus));
