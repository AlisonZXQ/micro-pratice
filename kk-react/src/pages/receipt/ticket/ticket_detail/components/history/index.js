import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Tag, Menu, message, Card } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { updateAcceptStateAdvise } from '@services/advise';
import { ticketNameMap, ticketColorMap } from '@shared/CommonConfig';
import { stateMap, rejectReason, resolveResultMap, TICKET_STATUS_MAP } from '@shared/TicketConfig';
import ChangeHistory from './components/ChangeHistory';
import IssueProgress from './components/IssueProgress';
import styles from './index.less';

const MenuItem = Menu.Item;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const tid = getIssueKey();
    if (tid) {
      this.props.dispatch({ type: 'ticket/getTicketHistory', payload: { ticketId: tid } });
    }
  }

  getAdviseDetail = () => {
    const tid = getIssueKey();
    this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: tid } });
  }

  updateAcceptStateAdvise = (state) => {
    const tid = getIssueKey();
    const params = {
      id: tid,
      acceptstatus: state,
    };

    updateAcceptStateAdvise(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新状态成功！');
      this.getAdviseDetail();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  menu = () => {
    return (<Menu>
      {
        Object.keys(stateMap).map(it => <MenuItem key={Number(it)}>
          <a
            onClick={() => this.updateAcceptStateAdvise(Number(it))}
          >
            {stateMap[Number(it)]}
          </a>
        </MenuItem>)
      }
    </Menu>);
  }

  getStatusTitle = () => {
    const { ticketDetail } = this.props;
    const ticket = ticketDetail.ticket || {};
    const status = ticket.state;
    const reasontype = ticket.reasonType;
    const rejectdesc = ticket.rejectDesc;
    const resolveresult = ticket.resolveResult;

    switch (status) {
      case TICKET_STATUS_MAP.CLOSE: return (<span>
        <Tag color={ticketColorMap[status]}>{ticketNameMap[status]}</Tag>
        【{resolveResultMap[resolveresult]}】
      </span>);

      case TICKET_STATUS_MAP.ACCEPTED: return (<span>
        <Tag color={ticketColorMap[status]}>{ticketNameMap[status]}</Tag>
      </span>);

      case TICKET_STATUS_MAP.REJECTED: return (<span>
        <Tag color={ticketColorMap[status]}>{ticketNameMap[status]}</Tag>
        【{rejectReason[reasontype]}】{rejectdesc}
      </span>);
      default:
        return <Tag color={ticketColorMap[status]}>{ticketNameMap[status]}</Tag>;
    }
  }

  render() {
    const { ticketHistory, ticketDetail } = this.props;
    // console.log(ticketHistory)

    return (<span>
      <div className="bbTitle">
        <span className="name">
          当前状态：
        </span>
        {this.getStatusTitle()}
        <span className="f-fr">
          <StateHistory
            type="ticket"
            nameMap={ticketNameMap}
            colorMap={ticketColorMap}
          />
        </span>
      </div>

      <div className={styles.container}>
        <Card style={{marginTop: '0px'}}>
          <IssueProgress data={ticketDetail || {}} />
        </Card>
      </div>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={ticketHistory} />
      </Card>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    ticketHistory: state.ticket.ticketHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
