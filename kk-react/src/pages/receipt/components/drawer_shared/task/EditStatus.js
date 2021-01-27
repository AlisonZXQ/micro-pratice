import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Modal } from 'antd';
import { connect } from 'dva';
import EditSelectStatus from '@components/EditSelectStatus';
import { updateTaskState } from '@services/task';
import DefineDot from '@components/DefineDot';
import { bugTaskNameArr, ISSUE_ROLE_VALUE_MAP, bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import AutoCloseSubTaskModal from '@pages/receipt/task/task_detail/components/AutoCloseSubTaskModal';

import { TASK_STATUS_MAP } from '@shared/TaskConfig';

class EditStatus extends Component {
  state = {
    currentState: {},
    visible: false,
    taskIds: []
  }
  autoCloseSubTaskRef = null;

  handelUpdateState = (value) => {
    const { taskDetail, listDetail } = this.props;
    let task = {};
    if (listDetail) {
      task = listDetail.task;
    } else {
      task = taskDetail.task || {};
    }

    const obj = bugTaskNameArr.find(it => it.key === value) || {};

    // 任务关闭，有子任务的情况下
    if (obj.key === TASK_STATUS_MAP.CLOSE && task.parentid === 0 && !!task.total) {
      this.setState({
        taskIds: [task.id]
      });
      this.autoCloseSubTaskRef.setState({ visible: true });
    }
    //非关闭
    else {
      this.setState({ currentState: obj }, () => {
        this.handleOk();
      });
    }

  }

  handleOk = () => {
    const { taskDetail, listDetail } = this.props;
    let task = {};
    if (listDetail) {
      task = listDetail.task;
    } else {
      task = taskDetail.task || {};
    }

    const { currentState } = this.state;
    const params = [{
      id: task.id,
      state: currentState.key,
    }];
    this.setTaskState(params);
  }

  setTaskState = (params) => {
    const { listDetail } = this.props;
    updateTaskState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false });
      message.success('状态更新成功！');
      if (!listDetail) {
        this.getTaskDetail();
      }
      if (this.props.refreshFun && typeof this.props.refreshFun === 'function') {
        this.props.refreshFun();
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getTaskDetail = () => {
    const { taskDetail } = this.props;
    const task = taskDetail.task || {};
    this.reloadDetail(task.id);
  }

  reloadDetail = (taskid) => {
    const { listDetail } = this.props;
    if (!listDetail) {
      this.props.dispatch({ type: 'task/getTaskDetail', payload: { id: taskid } });
    }
    if (this.props.refreshFun && typeof this.props.refreshFun === 'function') {
      this.props.refreshFun();
    }
  }

  render() {
    const { value, taskDetail, listDetail, bgHover } = this.props;
    const { visible, currentState, taskIds } = this.state;
    let issueRole;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = taskDetail.issueRole;
    }

    return (<span onClick={(e) => e.stopPropagation()}>
      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type="task"
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
            您确认设置当前任务的状态为【{currentState.name}】吗？
          </span>
        }
      </Modal>
      <AutoCloseSubTaskModal
        taskIds={taskIds}
        getThis={(ref) => this.autoCloseSubTaskRef = ref}
        refreshFn={() => {
          this.reloadDetail(this.state.taskIds[0]);
        }}
      />
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    taskDetail: state.task.taskDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(EditStatus));
