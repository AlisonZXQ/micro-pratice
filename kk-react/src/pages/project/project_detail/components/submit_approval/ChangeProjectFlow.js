import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { getFormLayout, equalsObj } from '@utils/helper';
import { APPROVAL_FLOW_SETTING_TYPE } from '@shared/ProjectConfig';
import EditUser from '../edit_default_user';
import styles from './index.less';

const formLayout = getFormLayout(2, 16);
const FormItem = Form.Item;

class ChangeProjectFlow extends Component {
  state = {
    workFlow: [],
  }

  componentDidMount() {
    const { projectId } = this.props.location.query;
    this.props.dispatch({ type: 'project/getChangeFlowEP', payload: { projectId } });

    this.getUserGroup(this.props);

  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      this.getUserGroup(nextProps);
    }
  }

  getUserGroup = (props) => {
    const { data, workFlow } = props;
    const productId = data && data.product && data.product[0] && data.product[0].id;
    if (productId && workFlow && workFlow.length) {
      this.props.dispatch({ type: 'approvalFlow/getUserGroup', payload: { productId } });
    }
  }

  render() {
    const { workFlow } = this.props;
    return (
      <span>
        {
          !!workFlow.length && workFlow.map(it => (
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
        {
          !workFlow.length &&
          <Col offset={5} className="u-mgb20">
            <span style={{ color: '#F04646' }}>*当前审批类型没有审批流配置，发起后将立即生效</span>
          </Col>
        }
      </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    workFlow: state.project.changeWorkFlow,
    usergroupList: state.approvalFlow.usergroupList,
    userList: state.approvalFlow.userList,
  };
};

export default withRouter(connect(mapStateToProps)(ChangeProjectFlow));
