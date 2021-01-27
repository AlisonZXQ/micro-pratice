import React, { Component } from 'react';
import { Steps, Tag } from 'antd';
import moment from 'moment';
import { requirementNameArr } from '@shared/CommonConfig';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';
import styles from './index.less';

const { Step } = Steps;
const colorMap = {
  1: 'green',
  2: 'red'
};

const nameMap = {
  1: '通过',
  2: '不通过'
};

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  customDot = (dot, { status, index }) => {
    const { data } = this.props;
    const state = data && data.requirement && data.requirement.state;
    let current = requirementNameArr.findIndex(it => it.key === state);
    if (state === REQUIREMENT_STATUS_MAP.CANCLE) {
      current = 0;
    }
    if (state === REQUIREMENT_STATUS_MAP.CANCLE && index === 10) {
      return <div className={styles.dotError}></div>;
    } else {
      return <div className={index <= current ? styles.dotDone : styles.dotTodo}></div>;
    }
  }

  getSteps = (it, index) => {
    const { data } = this.props;
    const state = data && data.requirement && data.requirement.state;
    const reviewresult = data && data.requirement && data.requirement.reviewresult;
    let current = requirementNameArr.findIndex(it => it.key === state);
    if (state === REQUIREMENT_STATUS_MAP.CANCLE) {
      current = 0;
    }

    const progressArr = (data && data.stateTimestampInfoList) || [];
    const obj = (progressArr && progressArr.find(item => item.stateTimestamp && item.stateTimestamp.state === it.key)) || {};

    const des = () => {
      return (<span>
        <div>
          {(obj.optUser && obj.optUser.realname) || '系统触发'}
          {
            it.key === REQUIREMENT_STATUS_MAP.EVALUATION && !!reviewresult &&
            <Tag color={colorMap[reviewresult]} className="u-mgl5">{nameMap[reviewresult]}</Tag>
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
            {
              state === REQUIREMENT_STATUS_MAP.CANCLE && !!Object.keys(obj).length && index === 10 &&
              des()
            }
            {
              !!Object.keys(obj).length && index <= current &&
              des()
            }
          </p>}
      />);
  }

  render() {
    const { data } = this.props;
    const state = data && data.requirement && data.requirement.state;
    let current = requirementNameArr.findIndex(it => it.key === state);
    if (state === REQUIREMENT_STATUS_MAP.CANCLE) {
      current = 0;
    }

    return (<span>
      <Steps
        current={current}
        progressDot={this.customDot}
        className={`u-mgt10 ${styles.stepsStyle}`}>
        {
          requirementNameArr.map((it, index) => (
            this.getSteps(it, index)
          ))
        }
      </Steps>
    </span>);
  }
}

export default index;
