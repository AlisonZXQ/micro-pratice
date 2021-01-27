import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Button, Modal, Input, Checkbox } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { history } from 'umi';
import { getFinishFlowEP, submitFinishFlowEP, cancelProjectChange } from '@services/project';
import { reportType } from '@shared/ProjectConfig';
import { getFormLayout } from '@utils/helper';
import { warnModal } from '@shared/CommonFun';
import { APPROVAL_FLOW_SETTING_TYPE } from '@shared/ProjectConfig';
import EditUser from '../edit_default_user';
import CustomField from '../../../create_project/components/CustomField';
import styles from './index.less';

const formLayout = getFormLayout(5, 17);
const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;

class FinishProjectEP extends Component {
  state = {
    workFlow: [],
    loading: false,
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  getUserGroup = () => {
    const { data } = this.props;
    const productId = data && data.products && data.products[0] && data.products[0].id;
    if (productId) {
      this.props.dispatch({ type: 'approvalFlow/getUserGroup', payload: { productId } });
    }
  }

  // 恢复变更
  handleReset = () => {
    const { data } = this.props;
    const projectDetail = data.projectDetail || {};
    const projectId = projectDetail.projectId;

    warnModal({
      title: '提示',
      content: '当前有未生效的变更，是否撤回变更？',
      okCallback: () => {
        cancelProjectChange({ projectId }).then((res) => {
          if (res.code !== 200) { return message.error(res.msg) }
          message.success('恢复变更成功！');
          this.setState({ visible: true });
          this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
          this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
        }).catch((err) => {
          return message.error('变更操作异常', err || err.message);
        });
      }
    });

  }

  handleClick = () => {
    const { data, type, changeStatus } = this.props;
    const projectId = data && data.projectDetail && data.projectDetail.projectId;

    // 如果有变更先弹出是否确认恢复变更的弹窗
    if (changeStatus) {
      this.handleReset();
    } else if (type !== 'finishTodo') {
      getFinishFlowEP(projectId).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ workFlow: res.result, visible: true });
          if (res.result.length) {
            this.getUserGroup();
          }
        }
      }).catch((err) => {
        return message.error(err || err.message);
      });
      // 新建
    } else {
      this.setState({ visible: true });
    }
  }

  handleOk = () => {
    const { form: { getFieldsValue }, data } = this.props;
    const { id } = this.props;
    const { workFlow } = this.state;
    const arr = [];
    let params = {};
    const close = data.closureCustomFileds || [];

    this.props.form.validateFields((err, values) => {
      if (err) return;
      const closureCustomFields = []; // 自定义字段
      for (let i in values) {
        if (i.includes('custom')) {
          let obj = close.find(it => it.customFieldId === Number(i.substring(7)));
          closureCustomFields.push({
            projectId: id,
            customFieldId: i.substring(7),
            value: values[i],
            templateId: 1,
            id: obj && obj.id
          });
        }
      }
      const commonParams = {
        projectId: id,
        description: values.description,
        closureCustomFields,
        reportStatus: values.reportStatus && values.reportStatus.join(','),
      };

      if (workFlow.length) {
        workFlow.forEach(it => {
          if (it.updateStatus === APPROVAL_FLOW_SETTING_TYPE.UN_EDIT) {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: it.userList.map(it => it.id),
              usergroupIdList: it.usergroupList.map(it => it.id),
            });
          } else {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: getFieldsValue()[`user-${it.workflowNodeId}`],
              usergroupIdList: getFieldsValue()[`userGroup-${it.workflowNodeId}`],
            });
          }
        });

        // 限制每个审批节点至少有一个人员
        let flagArr = [];
        arr.forEach(it => {
          const con = it.userIdList.concat(it.usergroupIdList);
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
      submitFinishFlowEP(params).then((res) => {
        if (res.code !== 200) {
          this.setState({ loading: false });
          return message.error(res.msg);
        }
        // message.success('操作成功！');
        history.push(`/project/audit_result/finish/${id}/${res.result || 0}`);
        // history.push(`/project/project_finish_approval?id=${id}`);
        this.setState({ visible: false, loading: false });
      }).catch((err) => {
        return message.error(err || err.message);
      });
    });

  }

  render() {
    const { disabled, type, data } = this.props;
    const { form: { getFieldDecorator }, primary } = this.props; // primary标志是否是此状态的主按钮
    const { visible, workFlow, loading } = this.state;
    const projectDetail = data.projectDetail || {};

    return (
      <span>
        <Modal
          title={<span>发起结项
            {
              !workFlow.length && type !== 'finishTodo' &&
              <span style={{ color: '#F04646', fontSize: '12px' }}>(当前审批类型没有审批流配置，发起后将立刻生效)</span>
            }
          </span>}
          visible={visible}
          width={650}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleOk()}
          okButtonProps={{ loading }}
          maskClosable={false}
        >
          <FormItem label="项目结果" {...formLayout}>
            <div className={styles.resultStyle}>
              {type === 'finishTodo' ? '立项未通过' : type === 'finishDoing' ? '异常终止' : '项目完成'}
            </div>
          </FormItem>
          {type !== 'finishTodo' &&
            <span>
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
            </span>
          }

          <FormItem label="说明" {...formLayout}>
            {getFieldDecorator('description', {
            })(
              <TextArea placeholder="请输入结项说明，最多500字" maxLength={500} />
            )}
          </FormItem>

          {
            type !== 'finishTodo' &&
            <FormItem label="合规性检查项" {...formLayout}>
              {
                getFieldDecorator('reportStatus', {
                })(
                  <CheckboxGroup>
                    {Object.keys(reportType).map(it => (
                      <span className='u-mgr10'>
                        <Checkbox key={Number(it)} value={Number(it)}>
                          {reportType[Number(it)]}
                        </Checkbox>
                      </span>
                    ))}
                  </CheckboxGroup>
                )
              }
            </FormItem>
          }

          {
            projectDetail.templateId && <CustomField
              form={this.props.form}
              templateId={projectDetail.templateId}
              type={2}
            />
          }
        </Modal>
        <Button onClick={() => this.handleClick()} disabled={disabled} className="u-mgr10" type={primary ? "primary" : 'default'}>发起结项</Button>
      </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    usergroupList: state.approvalFlow.usergroupList,
    userList: state.approvalFlow.userList,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(FinishProjectEP)));
