import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Modal } from 'antd';
import { connect } from 'dva';
import DefineDot from '@components/DefineDot';
import EditSelectStatus from '@components/EditSelectStatus';
import { updateBugState } from '@services/bug';
import { bugTaskNameArr, ISSUE_ROLE_VALUE_MAP, bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';

class EditStatus extends Component {
  state = {
    currentState: {},
    visible: false,
  }
  rejectThis = null;
  acceptThis = null;


  handelUpdateState = (value) => {
    const obj = bugTaskNameArr.find(it => it.key === value) || {};
    this.setState({ currentState: obj}, ()=>{
      this.handleOk();
    });
  }

  handleOk = () => {
    const { bugDetail, listDetail } = this.props;
    let bug = {};
    if (listDetail) {
      bug = listDetail.bug;
    } else {
      bug = bugDetail.bug || {};
    }

    const { currentState } = this.state;
    const params = [{
      id: bug.id,
      state: currentState.key,
    }];
    this.updateBugState(params);
  }

  updateBugState = (params) => {
    const { listDetail } = this.props;
    updateBugState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      if (this.props.refreshFun) {
        this.props.refreshFun();
      }
      if(!listDetail) {
        this.getBugDetail();
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getBugDetail = () => {
    const { bugDetail } = this.props;
    const bug = bugDetail.bug || {};
    this.props.dispatch({ type: 'bug/getBugDetail', payload: { id: bug.id } });
  }

  render() {
    const { value, bugDetail, bgHover, listDetail } = this.props;
    const { visible, currentState } = this.state;
    let issueRole;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = bugDetail.issueRole;
    }

    return (<>
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type="bug"
          handleUpdate={(value) => this.handelUpdateState(value)}
          bgHover={bgHover}
        />
      }

      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <span style={{ position: 'relative', top: '-2px' }}>
          <DefineDot
            text={value}
            statusMap={bugTaskNameMap}
            statusColor={bugTaskColorDotMap}
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
          <span>
            您确认设置当前缺陷的状态为【{currentState.name}】吗？
          </span>
        }
      </Modal>
    </>);
  }
}

const mapStateToProps = (state) => {
  return {
    bugDetail: state.bug.bugDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(EditStatus));
