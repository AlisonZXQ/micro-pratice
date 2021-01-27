import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Button, Modal, Checkbox, Spin } from 'antd';
import { withRouter } from 'react-router-dom';
import { history } from 'umi';
import { getFormLayout } from '@utils/helper';
import { connect } from 'dva';
import { getInitiateQuery, saveAimSubmit } from '@services/project';
import { APPROVAL_FLOW_SETTING_TYPE } from '@shared/ProjectConfig';
import BeginAccept from '../../../project_detail/components/detail_content/components/aim_list/components/BeginAccept';
import EditUser from '../edit_default_user';
import styles from './index.less';

const formLayout = getFormLayout(4, 16);
const FormItem = Form.Item;

class AimApprovalFlow extends Component {
  state = {
    aimQuery: {},
    loading: false,
    visible: false,
    getLoading: false
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  getUserGroup = () => {
    const { productId } = this.props;
    if (productId) {
      this.props.dispatch({ type: 'approvalFlow/getUserGroup', payload: { productId } });
    }
  }

  handleClick = () => {
    this.setState({ visible: true });
    this.getInitiateQuery();
  }

  getInitiateQuery = () => {
    const { record } = this.props;
    const params = {
      projectId: record.projectId,
      objectiveId: record.objectiveId,
    };

    this.setState({ getLoading: true });
    getInitiateQuery(params).then((res) => {
      this.setState({ getLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ aimQuery: res.result });
      if (res.result && res.result.workflowQueryVOList && res.result.workflowQueryVOList.length) {
        this.getUserGroup();
      }
    }).catch((err) => {
      this.setState({ getLoading: false });
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { form: { getFieldsValue } } = this.props;
    const { record } = this.props;
    const { aimQuery } = this.state;
    const workFlow = aimQuery.workflowQueryVOList || [];

    let params = {};
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (values.completeDescription && !values.completeDescription.trim().length) {
        return message.warn('目标达成情况必填且不能为空！');
      }

      const commonParams = {
        projectId: aimQuery.projectId,
        objectiveId: aimQuery.objectiveId,
        completeDescription: values.completeDescription && values.completeDescription.trim(),
        continueStatus: values.continueStatus,
      };

      const arr = [];
      if (workFlow.length) {
        workFlow.forEach(it => {
          if (it.updateStatus === APPROVAL_FLOW_SETTING_TYPE.UN_EDIT) {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: it.userList.map(it => it.id),
              usergroupIdList: it.usergroupList.map(it => it.id),
              appointTypeList: it.workflowAppointTypeVOList.map(it => it.id),
            });
          } else {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: getFieldsValue()[`user-${it.workflowNodeId}`],
              usergroupIdList: getFieldsValue()[`userGroup-${it.workflowNodeId}`],
              appointTypeList: getFieldsValue()[`appoint-${it.workflowNodeId}`],
            });
          }
        });

        // 限制每个审批节点至少有一个人员
        let flagArr = [];
        arr.forEach(it => {
          const con = it.userIdList.concat(it.usergroupIdList).concat(it.appointTypeList);
          if (con && !con.length) {
            flagArr.push(it);
          }
        });

        if (flagArr.length) {
          return message.warn(`${flagArr.map(it => it.workflowNodeName).join(',')}人员不能为空！`);
        }

        params = {
          ...commonParams,
          workflowApplyUserDtoList: arr,
        };
      } else {
        params = {
          ...commonParams,
          workflowApplyUserDtoList: [],
        };
      }

      this.setState({ loading: true });
      saveAimSubmit(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        // message.success('操作成功！');
        this.props.form.resetFields();
        this.setState({ visible: false });
        history.push(`/project/audit_result/aim_approval/${record.projectId}/${res.result.workflowSnapshotId || 0}/?objectiveId=${record.objectiveId}`);

        // if (res.result && res.result.continueStatus) {
        //   this.setState({
        //     aimQuery: res.result.objectiveInitiateQueryVO,
        //   });
        // } else {
        //   this.setState({ visible: false });
        //   this.props.dispatch({ type: 'project/getProjectObjective', payload: { id } });
        // }

      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(err || err.message);
      });
    });
  }

  handleCancel = () => {
    const { record } = this.props;
    this.setState({ visible: false });
    this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: record.projectId } });
  }

  getFooter = () => {
    const { form: { getFieldDecorator } } = this.props;
    const { aimQuery, getLoading } = this.state;

    return (<div className="f-tar">
      <Button className="u-mgl30" onClick={() => this.handleCancel()}>取消</Button>
      <Button type="primary" className="u-mgl10" onClick={() => this.handleOk()} disabled={getLoading}>确定</Button>
      {/* {aimQuery.continueStatus &&
        getFieldDecorator('continueStatus', {
          initialValue: false,
          valuePropName: 'checked',
        })(
          <Checkbox className="u-mgl10"><span className="f-fs1">继续发起下一个</span></Checkbox>
        )
      } */}
    </div>);
  }

  render() {
    const { disabled, trigger } = this.props;
    const { visible, aimQuery, loading } = this.state;
    const workFlow = aimQuery.workflowQueryVOList || [];

    return (
      <span onClick={(e) => e.stopPropagation()}>
        <Modal
          maskClosable={false}
          title={<span>发起验收
            {
              !workFlow.length &&
              <span style={{ color: '#F04646', fontSize: '12px' }}>(当前审批类型没有审批流配置，发起后将立刻生效)</span>
            }
          </span>}
          visible={visible}
          width={700}
          onCancel={() => this.handleCancel()}
          footer={this.getFooter()}
        >
          <Spin spinning={loading}>
            <BeginAccept aimQuery={aimQuery} form={this.props.form} />
            {
              !!workFlow.length &&
              workFlow.map(it => (
                <FormItem label={<span><span className="u-mgr5" style={{ color: '#F04646' }}>*</span>审批人</span>} {...formLayout}>
                  {
                    it.updateStatus === APPROVAL_FLOW_SETTING_TYPE.UN_EDIT && <div>
                      {it.userList && it.userList.map(it => <div className={`${styles.name} f-ib u-mgr10`}>{it.name}</div>)}
                      {it.usergroupList && it.usergroupList.map(it => <div className={`${styles.name} f-ib u-mgr10`}>{it.name}</div>)}
                      {it.workflowAppointTypeVOList && it.workflowAppointTypeVOList.map(it => <div className={`${styles.name} f-ib u-mgr10`}>{it.name}</div>)}
                      <div>
                        <span className={styles.nodeName}>
                          {it.workflowNodeName}
                        </span>
                      </div>
                    </div>
                  }
                  {
                    it.updateStatus === APPROVAL_FLOW_SETTING_TYPE.EDIT &&
                    <EditUser
                      defaultData={it}
                      form={this.props.form}
                      {...this.props}
                    />
                  }
                </FormItem>
              ))
            }
          </Spin>
        </Modal>
        <span onClick={(e) => {
          e.stopPropagation();
          this.props.callback && this.props.callback(e);
          this.handleClick();
        }}
        disabled={disabled}>
          {
            trigger ? trigger : <span>发起验收</span>
          }
        </span>
      </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    usergroupList: state.approvalFlow.usergroupList,
    userList: state.approvalFlow.userList,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(AimApprovalFlow)));
