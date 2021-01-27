import React, { Component } from 'react';
import { Steps, Tag } from 'antd';
import moment from 'moment';
import { ticketNameArr } from '@shared/CommonConfig';
import { stateMap, rejectReason, resolveResultMap, TICKET_STATUS_MAP } from '@shared/TicketConfig';
import styles from './index.less';

const { Step } = Steps;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  customDot = (dot, { status, index }) => {
    const { data } = this.props;
    const state = data && data.ticket && data.ticket.state;
    let current = ticketNameArr.findIndex(it => it.key === state);
    if (state === TICKET_STATUS_MAP.REJECTED) {
      current = 0;
    }

    if (state === TICKET_STATUS_MAP.REJECTED && index === 3) {
      // 已驳回的直接是红色
      return <div className={styles.dotError}></div>;
    } else {
      // 其他的根据state判断
      return <div className={index <= current ? styles.dotDone : styles.dotTodo}></div>;
    }
  }


  getSteps = (it, index) => {
    const { data } = this.props;
    const state = data && data.ticket && data.ticket.state;
    const acceptstatus = data && data.ticket && data.ticket.acceptStatus;
    const reasontype = data && data.ticket && data.ticket.reasonType;
    const resolveresult = data && data.ticket && data.ticket.resolveResult;

    let current = ticketNameArr.findIndex(it => it.key === state);
    if (state === TICKET_STATUS_MAP.REJECTED) {
      current = 0;
    }

    const progressArr = (data && data.stateTimestampInfoList) || [];
    const obj = (progressArr && progressArr.find(item => item.stateTimestamp && item.stateTimestamp.state === it.key)) || {};
    const des = () => {
      return (<span>
        <div>
          {(obj.optUser && obj.optUser.realname) || '系统触发'}
          {
            it.key === TICKET_STATUS_MAP.ACCEPTED && !!acceptstatus &&
            <Tag color="red" className="u-mgl5">{stateMap[acceptstatus]}</Tag>
          }
          {
            it.key === TICKET_STATUS_MAP.REJECTED && !!reasontype &&
            <Tag color="red" className="u-mgl5">{rejectReason[reasontype]}</Tag>
          }
          {
            it.key === TICKET_STATUS_MAP.CLOSE &&
            <Tag color="red" className="u-mgl5">{resolveResultMap[resolveresult]}</Tag>
          }
        </div>
        <div>{moment(obj.stateTimestamp && obj.stateTimestamp.updatetime).format('YYYY-MM-DD HH:mm')}</div>
      </span>);
    };

    return (
      <Step
        title={it.name}
        description={
          <p className="u-mgt10">
            {/* 已驳回时展示 */}
            {
              state === TICKET_STATUS_MAP.REJECTED && !!Object.keys(obj).length && index === 3 &&
              des()
            }
            {/* 其他情况需要根据current判断 */}
            {
              !!Object.keys(obj).length && index <= current &&
              des()
            }
          </p>}
      />);
  }

  render() {
    const { data } = this.props;
    const state = data && data.ticket && data.ticket.state;
    let current = ticketNameArr.findIndex(it => it.key === state);
    if (state === TICKET_STATUS_MAP.REJECTED) {
      current = 0;
    }

    return (<span>
      <Steps
        current={current}
        progressDot={this.customDot}
        className={`u-mgt10 ${styles.stepsStyle}`}>
        {
          ticketNameArr.map((it, index) => (
            this.getSteps(it, index)
          ))
        }
      </Steps>
    </span>);
  }
}

export default index;
