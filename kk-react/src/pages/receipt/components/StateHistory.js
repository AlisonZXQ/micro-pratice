import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, Modal, Tag } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getIssueKey } from '@utils/helper';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';

class StateHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.columns = [{
      title: '起始状态',
      dataIndex: 'start',
      render: (text, record) => {
        return (
          this.getStartTag(record));
      }
    }, {
      title: '到达状态',
      dataIndex: 'end',
      render: (text, record) => {
        return (record.stateTimestamp && record.stateTimestamp.state &&
          <Tag color={this.props.colorMap[record.stateTimestamp.state]}>
            {this.props.nameMap[record.stateTimestamp.state]}
          </Tag>);
      }
    }, {
      title: '操作人',
      dataIndex: 'user',
      render: (text, record) => {
        return record.optUser ? <div>
          {record.optUser.realname}({record.optUser.email})
        </div> : '系统触发';
      }
    }, {
      title: '操作时间',
      dataIndex: 'opt',
      render: (text, record) => {
        return <div style={{ wordBreak: 'break-all' }}>
          {record.stateTimestampHistory.updatetime ?
            moment(record.stateTimestampHistory.updatetime).format('YYYY-MM-DD HH:mm')
            : '-'}
        </div>;
      }
    }];
  }

  componentDidMount() {
  }

  getStateHistory = () => {
    const { type } = this.props;
    const params = {
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: getIssueKey(),
    };
    this.props.dispatch({ type: 'requirement/getReqStateHistory', payload: params });
  }

  getStartTag = (record) => {
    const { stateHistory } = this.props;
    const id = record.stateTimestampHistory.id;
    const state = record.stateTimestamp.state;
    const index = stateHistory.findIndex(it => it.stateTimestampHistory.id === id);
    const length = stateHistory.length;
    // 最后一个记录，起始状态等于到达状态
    if (index === length - 1) {
      return (state && <Tag color={this.props.colorMap[state]}>
        {
          this.props.nameMap[state]
        }
      </Tag>);
    } else {
      const beginObj = stateHistory[index + 1] || {};
      const beginState = beginObj.stateTimestamp ? beginObj.stateTimestamp.state : 0;
      return (beginState && <Tag color={this.props.colorMap[beginState]}>
        {
          this.props.nameMap[beginState]
        }
      </Tag>);
    }
  }

  render() {
    const { stateHistory } = this.props;
    const { visible } = this.state;

    return (<span>
      <a className="u-mgr10" onClick={() => { this.setState({ visible: true }); this.getStateHistory() }}>查看状态变迁历史</a>

      <Modal
        title="查看状态变迁历史"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        footer={null}
        width={800}
        maskClosable={false}
      >
        <Table
          columns={this.columns}
          dataSource={stateHistory}
        />
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    stateHistory: state.requirement.stateHistory,
  };
};

export default withRouter(connect(mapStateToProps)(StateHistory));
