import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, message } from 'antd';
import MyIcon from '@components/MyIcon';
import { updateTaskState } from '@services/task';

import { TASK_STATUS_MAP } from '@shared/TaskConfig';
import styles from '../index.less';

const getIconStyle = () => {
  return {
    fontSize: '24px',
    position: 'relative',
    top: '3px',
    marginRight: '10px',
  };
};

const getContentStyle = () => {
  return {
    marginLeft: '34px',
    marginTop: '10px',
    color: '#8791A0',
    fontSize: '12px',
  };
};

class AutoCloseSubTaskModal extends Component {
  state = {
    visible: false,
    loading: false
  }

  componentDidMount() {
    this.props.getThis(this);
  }

  openModal = () => {
    this.setState({ visible: true });
  }

  closeModal = () => {
    this.setState({ visible: false });
  }

  handleOk4NotNeedCloseSubTask = () => {
    this.doHandleOk(false);
  }

  handleOk4NeedCloseSubTask = () => {
    this.doHandleOk(true);
  }

  doHandleOk = (closeSubTasks) => {
    const { taskIds } = this.props;

    this.setState({
      loading: true
    });
    const params = [];
    taskIds.map(taskId => params.push({
      id: taskId,
      state: TASK_STATUS_MAP.CLOSE,
      closeSubTasks: closeSubTasks
    }));

    updateTaskState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新状态成功！');
      this.setState({ visible: false });
      this.setState({ loading: false });

      if (this.props.refreshFn) {
        this.props.refreshFn();
      }

    }).catch((err) => {
      this.setState({
        loading: false
      });
      return message.error(err || err.message);
    });
  }

  handleCancel = () => {
    this.closeModal();
  }

  getFooter = () => {
    const { loading } = this.state;

    return [
      <Button key="back" onClick={this.handleCancel}>
        取消
      </Button>,
      <Button key="no" loading={loading} onClick={this.handleOk4NotNeedCloseSubTask}>
        否
      </Button>,
      <Button key="yes" type="primary" loading={loading} onClick={this.handleOk4NeedCloseSubTask}>
        是
      </Button>
    ];
  }

  render() {
    const { visible } = this.state;

    return (<span>
      <Modal
        visible={visible}
        onCancel={() => this.handleCancel()}
        width={400}
        footer={this.getFooter()}
        maskClosable={false}
      >
        <div>
          <MyIcon style={getIconStyle()} type="icon-tishigantanhao" />
          <span className={styles.modalTitle}>任务关闭确认</span>
        </div>
        <div style={getContentStyle()}>
          您是否需要自动关闭下级所有子任务？
        </div>
      </Modal>
    </span >);
  }
}

export default connect()(AutoCloseSubTaskModal);
