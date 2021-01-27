import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Input, Card, Checkbox, Button, Radio, message, Spin, Modal } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import { Link } from 'umi';
import moment from 'moment';
import { getInitiateDetail, saveAimApproval, getAimCompleteStatus } from '@services/project';
import { getFormLayout, dateDiff } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { AIM_TASK_BUG_STATUS_MAP } from '@shared/CommonConfig';
import { OBJECTIVE_ACHIEVE_TYPE } from '@shared/ObjectiveConfig';
import ApprovalSteps from '../project_detail/components/approval_steps';
import AimDetail from './components/AimDetail';
import styles from './index.less';

const FormItem = Form.Item;
const formLayoutLong = getFormLayout(6, 18);
const { TextArea } = Input;

class AcceptApproval extends Component {
  state = {
    detailQuery: {},
    aimCompleteStatus: {},
    loading: false,
    visible: false,
    type: '',
  }

  componentDidMount() {
    const { pid, oid, wfid } = this.props.location.query;
    let params = {
      objectiveId: oid,
    };
    if (pid) {
      params = {
        ...params,
        projectId: pid,
      };
    }
    if (wfid) {
      params = {
        ...params,
        workflowSnapshotId: wfid,
      };
    }
    this.getInitiateDetail(params);
    this.getAimCompleteStatus(oid);
    this.props.dispatch({ type: 'project/getOperationPerm', payload: params });
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id: pid } });
  }

  getAimCompleteStatus = (oid) => {
    const params = {
      objectiveId: oid,
    };

    getAimCompleteStatus(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ aimCompleteStatus: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getInitiateDetail = (params) => {

    this.setState({ loading: true });
    getInitiateDetail(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ detailQuery: res.result });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  handleSubmit = () => {
    const { pid, oid } = this.props.location.query;
    const { form: { getFieldValue, resetFields } } = this.props;
    const { type } = this.state;

    let params = {};
    const commonParams = {
      projectId: Number(pid),
      objectiveId: oid,
      continueStatus: getFieldValue('continueStatus')
    };

    const arr = type === 'pass' ? ['achievementEvaluation'] : ['failReason'];
    this.props.form.validateFieldsAndScroll(arr, (err, values) => {
      if (err) return;
      if (type === 'pass') {
        params = {
          ...commonParams,
          initiateResult: true,
          achievementEvaluation: values.achievementEvaluation,
          initiateSuggestion: getFieldValue('initiateSuggestion') && getFieldValue('initiateSuggestion').trim(),
        };
      } else {
        params = {
          ...commonParams,
          initiateResult: false,
          failReason: values.failReason,
        };
      }

      this.setState({ loading: true });
      saveAimApproval(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        // message.success('成功审批该目标！');
        resetFields();
        history.push(`/project/audit_result/aim_approval/${pid}/${res.result.workflowSnapshotId}/?objectiveId=${oid}`);

        // if (res.result && res.result.continueStatus) {
        //   const r = res.result.objectiveInitiateDetailVO || {};
        //   this.setState({ detailQuery: r, visible: false });
        //   this.props.dispatch({ type: 'project/getOperationPerm', payload: { objectiveId: oid, projectId: pid } });
        //   history.push(`/project/aim_accept?pid=${pid}&oid=${r.objectiveId}`);
        // } else {
        //   history.push(`/project/detail?id=${pid}`);
        // }
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(err || err.message);
      });
    });
  }

  isEmpty = (text) => {
    return text ? text : '-';
  }

  getButtons = () => {
    const { pid } = this.props.location.query;
    const { operationPerm } = this.props;
    const { detailQuery } = this.state;
    const status = detailQuery.objectiveState;

    // 待验收才会出现目标的操作按钮
    return (status === AIM_TASK_BUG_STATUS_MAP.TODO && <span>
      <Button type="primary" onClick={() => this.setState({ visible: true, type: 'pass' })} disabled={!operationPerm.reviewStatus}>审批通过</Button>
      <Button type="danger" className="u-mgl10" disabled={!operationPerm.reviewStatus} onClick={() => this.setState({ visible: true, type: 'fail' })}>不通过</Button>
      <Button className="u-mgl10" disabled={!operationPerm.withdrawStatus} onClick={() => history.push(`/project/detail?id=${pid}`)}>取消</Button>
    </span>);
  }

  render() {
    const { pid } = this.props.location.query;
    const { form: { getFieldDecorator } } = this.props;
    const { detailQuery, loading, visible, type, aimCompleteStatus } = this.state;
    const auditDate = detailQuery.auditDate || moment().format('YYYY-MM-DD');
    const diffDay = detailQuery.dueDate ?
      dateDiff(detailQuery.dueDate, auditDate)
      : 0;
    const status = detailQuery.objectiveState;

    return (<Spin spinning={loading}>
      <Card className="btn98">
        <Row className="f-csp f-fs2">
          <Link to={`/project/detail?id=${pid}`} className="u-subtitle">
            <span>
              <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
              返回项目
            </span>
          </Link>
        </Row>

        <Row>
          <Col span={14} className="u-mgt10">
            <span className={`f-fs3 f-fwb u-mgt10`}>验收审批</span>
            <span className="u-mgl20 f-fs2">({this.isEmpty(detailQuery.summary)})</span>
          </Col>
          {
            status === AIM_TASK_BUG_STATUS_MAP.TODO &&
            <Col span={10}>
              <span className="f-fr">
                {/* {detailQuery.continueStatus &&
                  getFieldDecorator('continueStatus', {
                    initialValue: false,
                    valuePropName: 'checked',
                  })(
                    <Checkbox className="u-mgl10">
                      <span className="f-fs1">继续发起下一个</span>
                    </Checkbox>
                  )
                } */}
                {this.getButtons()}
              </span>
            </Col>
          }
        </Row>

        <Modal
          title={type === 'pass' ? '验收通过' : '不通过'}
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={() => this.handleSubmit()}
          okButtonProps={{ loading }}
          destroyOnClose
        >
          {
            type === 'pass' &&
            <span>
              <FormItem label="目标达成评价" {...formLayoutLong} >
                {
                  getFieldDecorator('achievementEvaluation', {
                    rules: [{ required: true, message: '此项必填!' }]
                  })(
                    <Radio.Group onChange={this.onChange} value={this.state.value}>
                      <Radio value={OBJECTIVE_ACHIEVE_TYPE.OVER_PLAN}>超出预期</Radio>
                      <Radio value={OBJECTIVE_ACHIEVE_TYPE.ACHIEVE_PLAN}>达到预期</Radio>
                      <Radio value={OBJECTIVE_ACHIEVE_TYPE.BEHIND_PLAN}>未达预期</Radio>
                    </Radio.Group>
                  )
                }
              </FormItem>
              <FormItem label="其他验收意见" {...formLayoutLong} >
                {
                  getFieldDecorator('initiateSuggestion', {
                  })(
                    <TextArea maxLength={500} />
                  )
                }
              </FormItem>
            </span>
          }

          {
            type === 'fail' &&
            <FormItem label="不通过原因" {...formLayoutLong} >
              {
                getFieldDecorator('failReason', {
                  rules: [{ required: true, message: '此项必填!' }]
                })(
                  <TextArea />
                )
              }
            </FormItem>
          }

        </Modal>
      </Card>

      <Card className={`${styles.cardStyle} u-mg20`}>
        <ApprovalSteps data={detailQuery} />
      </Card>

      <div style={{ padding: '0px 20px' }}>
        <AimDetail diffDay={diffDay} detailQuery={detailQuery} aimCompleteStatus={aimCompleteStatus} />
      </div>
    </Spin>);
  }
}

const mapStateToProps = (state) => {
  return {
    operationPerm: state.project.operationPerm,
    currentMemberInfo: state.user.currentMemberInfo,
  };
};

export default connect(mapStateToProps)(Form.create()(AcceptApproval));
