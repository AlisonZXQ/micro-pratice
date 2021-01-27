import React, { useEffect } from 'react';
import { Tag, Table } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import TextOverFlow from '@components/TextOverFlow';

function StatusHistory(props) {
  const { stateHistory, nameMap, colorMap, type, connid } = props;

  const columns = [{
    title: '起始状态',
    dataIndex: 'start',
    render: (text, record) => {
      return (
        getStartTag(record));
    }
  }, {
    title: '到达状态',
    dataIndex: 'end',
    render: (text, record) => {
      return (record.stateTimestamp && record.stateTimestamp.state &&
        <Tag color={colorMap[record.stateTimestamp.state]}>
          {nameMap[record.stateTimestamp.state]}
        </Tag>);
    }
  }, {
    title: '操作人',
    dataIndex: 'user',
    width: '250px',
    render: (text, record) => {
      return record.optUser ?
        <TextOverFlow maxWidth={250} content={`${record.optUser.realname}(${record.optUser.email})`} />
        : '系统触发';
    }
  }, {
    title: '操作时间',
    dataIndex: 'opt',
    width: 200,
    render: (text, record) => {
      return <div>
        {record.stateTimestampHistory.updatetime ?
          moment(record.stateTimestampHistory.updatetime).format('YYYY-MM-DD HH:mm')
          : '-'}
      </div>;
    }
  }];

  useEffect(() => {
    const params = {
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: connid,
    };
    props.dispatch({ type: 'requirement/getReqStateHistory', payload: params });
  }, [connid, type]);

  const getStartTag = (record) => {
    const id = record.stateTimestampHistory.id;
    const state = record.stateTimestamp.state;
    const index = stateHistory.findIndex(it => it.stateTimestampHistory.id === id);
    const length = stateHistory.length;
    // 最后一个记录，起始状态等于到达状态
    if (index === length - 1) {
      return (state && <Tag color={colorMap[state]}>
        {
          nameMap[state]
        }
      </Tag>);
    } else {
      const beginObj = stateHistory[index + 1] || {};
      const beginState = beginObj.stateTimestamp ? beginObj.stateTimestamp.state : 0;
      return (beginState && <Tag color={colorMap[beginState]}>
        {
          nameMap[beginState]
        }
      </Tag>);
    }
  };

  return (<>
    <Table
      columns={columns}
      dataSource={stateHistory}
    />
  </>);
}

const mapStateToProps = (state) => {
  return {
    stateHistory: state.requirement.stateHistory,
  };
};

export default connect(mapStateToProps)(StatusHistory);
