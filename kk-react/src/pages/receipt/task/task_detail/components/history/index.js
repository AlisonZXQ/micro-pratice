import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Card, Tag } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { bugTaskNameMap, bugTaskColorMap } from '@shared/CommonConfig';
import { TASK_STATUS_MAP } from '@shared/TaskConfig';
import IssueProgress from './components/IssueProgress';
import ChangeHistory from './components/ChangeHistory';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const tid = getIssueKey();
    if (tid) {
      this.props.dispatch({ type: 'task/getTaskHistory', payload: { taskid: tid } });
    }
  }

  getStatusTitle = () => {
    const { taskDetail } = this.props;
    const task = taskDetail.task || {};
    const status = task.state;
    const uem_close_msg = task.uem_close_msg;
    const uem_cancel_msg = task.uem_cancel_msg;

    switch (status) {
      case TASK_STATUS_MAP.CLOSE: return (<span>
        <Tag color={bugTaskColorMap[status]}>{bugTaskNameMap[status]}</Tag>
        被关闭的原因为：{uem_close_msg ? uem_close_msg : '-'}
      </span>);
      case TASK_STATUS_MAP.CANCLE: return (<span>
        <Tag color={bugTaskColorMap[status]}>{bugTaskNameMap[status]}</Tag>
        被取消的原因为：{uem_cancel_msg ? uem_cancel_msg : '-'}
      </span>);
      default:
        return <Tag color={bugTaskColorMap[status]}>{bugTaskNameMap[status]}</Tag>;
    }
  }

  render() {
    const { taskHistory, taskDetail } = this.props;

    return (<span>
      <div className='bbTitle'>
        <span className="name">
          当前状态：
        </span>
        {this.getStatusTitle()}
        <span className="f-fr">
          <StateHistory
            type="task"
            nameMap={bugTaskNameMap}
            colorMap={bugTaskColorMap}
          />
        </span>
      </div>

      <Card>
        <IssueProgress data={taskDetail || {}} />
      </Card>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={taskHistory} />
      </Card>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    taskHistory: state.task.taskHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
