import React, { Component } from 'react';
import { Steps } from 'antd';
import moment from 'moment';
import { aimNameArr } from '@shared/CommonConfig';
import { OBJECTIVE_STATUS_MAP } from '@shared/ObjectiveConfig';
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
    const state = data && data.objective && data.objective.state;
    let current = aimNameArr.findIndex(it => it.key === state);
    if (state === OBJECTIVE_STATUS_MAP.REOPEN) {
      current = 0;
    }

    if (state === OBJECTIVE_STATUS_MAP.REOPEN && index === 5) {
      // 已驳回的直接是蓝色
      return <div className={styles.dotDone}></div>;
    } else {
      // 其他的根据state判断
      return <div className={index <= current ? styles.dotDone : styles.dotTodo}></div>;
    }
  }

  getSteps = (it, index) => {
    const { data } = this.props;
    const state = data && data.objective && data.objective.state;

    let current = aimNameArr.findIndex(it => it.key === state);
    if (state === OBJECTIVE_STATUS_MAP.REOPEN) {
      current = 0;
    }

    const progressArr = (data && data.stateTimestampInfoList) || [];
    const obj = (progressArr && progressArr.find(item => item.stateTimestamp && item.stateTimestamp.state === it.key)) || {};
    const des = () => {
      return (<span>
        <div>
          {(obj.optUser && obj.optUser.realname) || '系统触发'}
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
              state === OBJECTIVE_STATUS_MAP.REOPEN && !!Object.keys(obj).length && index === 5 &&
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
    const state = data && data.objective && data.objective.state;
    let current = aimNameArr.findIndex(it => it.key === state);
    if (state === OBJECTIVE_STATUS_MAP.REOPEN) {
      current = 0;
    }

    return (<span>
      <Steps
        current={current}
        progressDot={this.customDot}
        className={`u-mgt10 ${styles.stepsStyle}`}>
        {
          aimNameArr.map((it, index) => (
            this.getSteps(it, index)
          ))
        }
      </Steps>
    </span>);
  }
}

export default index;
