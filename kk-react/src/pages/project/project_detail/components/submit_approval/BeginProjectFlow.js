import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { history } from 'umi';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { getInitiateFlowEP, submitInitiateFlowEP } from '@services/project';
import { APPROVAL_FLOW_SETTING_TYPE } from '@shared/ProjectConfig';
import EditUser from '../edit_default_user';
import styles from './index.less';

const formLayout = getFormLayout(6, 16);
const FormItem = Form.Item;

class BeginProjectEP extends Component {
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

  handleClick = () => {
    const { data } = this.props;
    const projectId = data && data.projectDetail && data.projectDetail.projectId;

    getInitiateFlowEP(projectId).then((res) => {
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
  }

  handleOk = () => {
    const { form: { getFieldsValue } } = this.props;
    const { id } = this.props;
    const { workFlow } = this.state;
    const arr = [];
    let params = {};
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
        projectId: id,
        workflowApplyUserDtoList: arr,
      };
    } else {
      params = {
        projectId: id,
        workflowApplyUserDtoList: [],
      };
    }

    this.setState({ loading: true });
    submitInitiateFlowEP(params).then((res) => {
      if (res.code !== 200) {
        this.setState({ loading: false });
        return message.error(res.msg);
      }
      // message.success('操作成功！');
      history.push(`/project/audit_result/begin/${id}/${res.result || 0}`);
      // history.push(`/project/project_begin_approval?id=${id}`);
      this.setState({ visible: false, loading: false });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { disabled } = this.props;
    const { visible, workFlow, loading } = this.state;
    return (
      <span>
        <Modal
          title={<span>发起立项
          </span>}
          visible={visible}
          width={650}
          maskClosable={false}
          onCancel={() => this.setState({ visible: false })}
          footer={<span className='btn98'>
            <Button onClick={() => this.setState({ visible: false })}>
              取消
            </Button>
            <Button type="primary" onClick={() => this.handleOk()} loading={loading}>
              确定
            </Button>
          </span>}
        >
          {
            !workFlow.length &&
            <span style={{ color: '#F04646', fontSize: '12px' }}>(当前审批类型没有审批流配置，发起后将立刻生效)</span>
          }
          {
            !!workFlow.length &&
            workFlow.map(it => (
              <FormItem style={{ marginBottom: '10px' }} label={<span><span className="u-mgr5" style={{ color: '#F04646' }}>*</span>审批人</span>} {...formLayout}>
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
        </Modal>
        <Button onClick={() => this.handleClick()} disabled={disabled} className="u-mgr10" type="primary">发起立项</Button>
      </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    usergroupList: state.approvalFlow.usergroupList,
    userList: state.approvalFlow.userList,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(BeginProjectEP)));
