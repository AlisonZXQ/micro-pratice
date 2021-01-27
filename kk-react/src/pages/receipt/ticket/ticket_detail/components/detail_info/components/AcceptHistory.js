import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

class index extends Component {
  state = {

  }

  columns = [{
    title: '时间',
    dataIndex: 'addtime',
    render: (text) => {
      return text ? <div className="f-pl">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> : '-'
    }
  }, {
    title: '受理情况',
    dataIndex: 'acceptStatus',
    render: (text) => {
      return <div className="f-pl">{text}</div>;
    }
  }, {
    title: '操作人',
    dataIndex: 'realname',
    render: (text) => {
      return <div className="f-pl">{text}</div>;
    }
  }, {
    title: '备注',
    dataIndex: 'remark',
    render: (text) => {
      return <div className="f-pl">{text}</div>;
    }
  }]

  componentDidMount() {
  }

  getTicketHistory = () => {
    const { ticketHistory } = this.props;
    const arr = [];
    ticketHistory.forEach(it => {
      const ticketObj = it.ticketHistory || {};
      const optUser = it.optUser || {};

      let changelog =[];
      if( ticketObj.changelog ){
        try{
          changelog = JSON.parse(ticketObj.changelog);
        }catch(e){
          changelog = [];
        }
      }

      if (!changelog.length) {
        return;
      }

      const stateChangelog = this.getStateChangelog(changelog);
      if(!stateChangelog){
        return;
      }


      //已驳回
      if(this.isRejectState(changelog)){
        const rejectDescChangelog = this.getRejectDescChangelog(changelog);
        const reasonTypeChangelog = this.getReasonTypeChangelog(changelog);

        arr.unshift({
          addtime: ticketObj.addtime,
          acceptStatus: stateChangelog.newvalue,
          realname: optUser.realname,
          reason: reasonTypeChangelog && reasonTypeChangelog.newvalue ? reasonTypeChangelog.newvalue : '-',
          remark: rejectDescChangelog && rejectDescChangelog.newvalue ? rejectDescChangelog.newvalue : '-'
        });
      }
      //已受理
      else if(this.isAcceptState(changelog)){
        const acceptStatusChangelog = this.getAcceptStatusChangelog(changelog);
        arr.unshift({
          addtime: ticketObj.addtime,
          acceptStatus: stateChangelog.newvalue,
          realname: optUser.realname,
          reason: acceptStatusChangelog && acceptStatusChangelog.newvalue ? acceptStatusChangelog.newvalue : '-',
          remark: '-',
        });
      }
      //重新打开
      else if(this.isReopenState(changelog)){
        const rejectDescChangelog = this.getRejectDescChangelog(changelog);
        arr.unshift({
          addtime: ticketObj.addtime,
          acceptStatus: stateChangelog.newvalue,
          realname: optUser.realname,
          reason: '-',
          remark: rejectDescChangelog && rejectDescChangelog.newvalue ? rejectDescChangelog.newvalue : '-',
        });
      }
    });
    return arr;
  }

  getStateChangelog = (changelog) => {
    return changelog.find(item=> item.key === 'state');
  }

  getRejectDescChangelog = (changelog) => {
    return changelog.find(item=>item.key === 'rejectdesc');
  }

  getAcceptStatusChangelog = (changelog) => {
    return changelog.find(item=>item.key === 'acceptstatus');
  }

  getReasonTypeChangelog =(changelog) => {
    return changelog.find(item=>item.key === 'reasontype');
  }

  isRejectState = (changelog) => {
    const stateChangelog = this.getStateChangelog(changelog);
    return stateChangelog.newvalue === '已驳回';
  }

  isAcceptState = (changelog) => {
    const stateChangelog = this.getStateChangelog(changelog);
    return stateChangelog.newvalue === '已受理';
  }

  isReopenState = (changelog) => {
    const stateChangelog = this.getStateChangelog(changelog);
    return stateChangelog.newvalue === '重新打开';
  }

  render() {
    // const { drawer } = this.props;

    return ([
      <Table
        columns={this.columns}
        dataSource={this.getTicketHistory()}
        pagination={false}
        // scroll={{ y: 300, x: drawer ? 1200 : '' }}
      />]);
  }
}

export default withRouter(connect()(index));
