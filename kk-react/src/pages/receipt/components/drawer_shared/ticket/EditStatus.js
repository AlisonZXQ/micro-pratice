import React, { Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import EditSelectStatus from '@components/EditSelectStatus';
import { updateTicketState } from '@services/ticket';
import DefineDot from '@components/DefineDot';
import AcceptModal from '@pages/receipt/ticket/ticket_detail/components/AcceptModal';
import RejectModal from '@pages/receipt/ticket/ticket_detail/components/RejectModal';
import ReOpenModal from '@pages/receipt/ticket/ticket_detail/components/ReOpenModal';
import { ISSUE_ROLE_VALUE_MAP, ticketNameMap, ticketColorDotMap } from '@shared/CommonConfig';
import { TICKET_STATUS_MAP } from '@shared/TicketConfig';

class EditStatus extends Component {
  rejectThis = null;
  acceptThis = null;
  reopenThis = null;

  handelUpdateState = (state) => {
    const { ticketDetail, listDetail } = this.props;
    let ticket = {};
    if (listDetail) {
      ticket = listDetail.ticket;
    } else {
      ticket = ticketDetail.ticket || {};
    }
    // 8驳回 7受理
    if (state === TICKET_STATUS_MAP.REJECTED) {
      this.rejectThis.setState({ visible: true });
    } else if (state === TICKET_STATUS_MAP.ACCEPTED) {
      this.acceptThis.setState({ visible: true });
    } else if (state === TICKET_STATUS_MAP.REOPEN) {
      this.reopenThis.setState({ visible: true });
    } else {
      const params = {
        id: ticket.id,
        state,
      };
      updateTicketState(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('状态更新成功！');
        this.getRefresh();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  };

  getRefresh = () => {
    const { ticketDetail, listDetail } = this.props;
    const ticket = ticketDetail.ticket || {};
    if (!listDetail) {
      this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: ticket.id } });
    }
    if (this.props.refreshFun) {
      this.props.refreshFun();
    }
  }

  getCurrentUserType = () => {
    const { ticketDetail, listDetail, currentUser, list } = this.props;
    const user = currentUser.user || {};
    let submitUser = {};
    let responseUser = {};
    let requireUser = {};
    if (list && listDetail && Object.keys(listDetail).length) {
      submitUser = listDetail.submitUser || {};
      responseUser = listDetail.responseUser || {};
      requireUser = listDetail.requireUser || {};
    } else if (ticketDetail && Object.keys(ticketDetail).length) {
      submitUser = ticketDetail.submitUser || {};
      responseUser = ticketDetail.responseUser || {};
      requireUser = ticketDetail.requireUser || {};
    }
    const userTypeArr = [];
    if (submitUser.id === user.id) {
      userTypeArr.push('报告人');
    }
    if (responseUser.id === user.id) {
      userTypeArr.push('负责人');
    }
    if (requireUser.id === user.id) {
      userTypeArr.push('验证人');
    }
    return userTypeArr;
  };

  render() {
    const { value, type, ticketDetail, bgHover, listDetail } = this.props;
    let ticket = {};
    if (listDetail) {
      ticket = listDetail.ticket;
    } else {
      ticket = ticketDetail.ticket || {};
    }

    let issueRole = 0;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = ticketDetail.issueRole;
    }

    return (<>
      <AcceptModal
        ticketObj={listDetail || ticketDetail}
        detailThis={(ref) => this.acceptThis = ref}
        callback={() => this.getRefresh()}
      />

      <RejectModal
        ticket={ticket}
        detailThis={ref => this.rejectThis = ref}
        callback={() => this.getRefresh()}
      />

      <ReOpenModal
        ticket={ticket}
        detailThis={ref => this.reopenThis = ref}
        callback={() => this.getRefresh()}
      />

      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type={type}
          handleUpdate={(value) => this.handelUpdateState(value)}
          bgHover={bgHover}
          currentUserType={this.getCurrentUserType()}
        />
      }
      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <span style={{ position: 'relative', top: '-2px' }}>
          <DefineDot
            text={value}
            statusMap={ticketNameMap}
            statusColor={ticketColorDotMap}
          />
        </span>
      }
    </>);
  }
}

const mapStateToProps = (state) => {
  return {
    ticketDetail: state.ticket.ticketDetail,
    currentUser: state.user.currentUser
  };
};

export default connect(mapStateToProps)(EditStatus);
