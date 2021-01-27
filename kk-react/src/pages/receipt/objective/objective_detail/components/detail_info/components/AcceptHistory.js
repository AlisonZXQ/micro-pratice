import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, Modal } from 'antd';
import { connect } from 'dva';
import { Link } from 'umi';
import moment from 'moment';
import TextOverFlow from '@components/TextOverFlow';

class index extends Component {
  state = {
    visible: false,
    content: '',
  }

  columns = [{
    title: '时间',
    dataIndex: 'updateTime',
    width: 200,
    render: (text) => {
      return text ? <div className="f-pl">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '-';
    }
  }, {
    title: '验收结论',
    dataIndex: 'status',
    width: 100,
    render: (text) => {
      return text === 2 ? '验收通过' : '验收退回';
    }
  }, {
    title: '验收人',
    dataIndex: 'reviewer',
    width: 100,
    render: (text) => {
      return text ? <TextOverFlow content={text.name} maxWidth={80} /> : '-';
    }
  }, {
    title: '实际人力投入',
    dataIndex: 'actualManPower',
    width: 120,
    render: (text) => {
      return text ? <span className="f-pl">{`${Number(text).toFixed(2)}人天`}</span> : '-';
    }
  }, {
    title: '目标完成情况',
    dataIndex: 'completeDescription',
    width: 380,
    render: (text) => {
      return (<div style={{ whiteSpace: 'pre-line' }}>
        <span>{text}</span>
      </div>);
    }
  }, {
    title: '验收评价',
    dataIndex: 'achievementEvaluation',
    width: 100,
    render: (text) => {
      return text ? <TextOverFlow content={text} maxWidth={100} /> : '--';
    }
  }, {
    title: '其他验收意见',
    dataIndex: 'initiateSuggestion',
    width: 300,
    render: (text) => {
      return text ? <TextOverFlow content={text} maxWidth={300} /> : '--';
    }
  }, {
    title: '操作',
    dataIndex: 'time',
    width: 80,
    render: (text, record) => {
      const { objectiveDetail } = this.props;
      const objective = objectiveDetail.objective || {};

      if (record.projectId) {
        return <Link to={`/project/aim_accept?pid=${record.projectId}&oid=${objective.id}&wfid=${record.workflowSnapshotId}`} target="_blank">查看详情</Link>;
      } else {
        return '--';
      }
    }
  }]

  componentDidMount() {
  }

  render() {
    const { acceptList, drawer } = this.props;
    const { visible, content } = this.state;

    return ([
      <Table
        columns={this.columns}
        dataSource={acceptList}
        pagination={false}
        scroll={{ x: drawer ? 1200 : '' }}
      />,
      <Modal
        title="目标完成情况"
        visible={visible}
        footer={null}
        onCancel={() => this.setState({ visible: false })}
        maskClosable={false}
      >
        {content}
      </Modal>
    ]);
  }
}

const mapStateToProps = (state) => {
  return {
    acceptList: state.objective.acceptList,
    objectiveDetail: state.objective.objectiveDetail,
  };
};

export default withRouter(connect(mapStateToProps)(index));
