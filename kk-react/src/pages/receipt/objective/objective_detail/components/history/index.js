import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Tag, Card } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { aimColorMap, aimNameMap } from '@shared/CommonConfig';
import { OBJECTIVE_STATUS_MAP } from '@shared/ObjectiveConfig';
import IssueProgress from './components/IssueProgress';
import ChangeHistory from './components/ChangeHistory';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const oid = getIssueKey();
    if (oid) {
      this.props.dispatch({ type: 'objective/getObjectiveHistory', payload: { objectiveid: oid } });
    }
  }

  render() {
    const { objectiveHistory, objectiveDetail } = this.props;
    const objective = objectiveDetail.objective || {};
    const state = objective.state;
    const cancel_msg = objective.cancel_msg;

    return (<span>
      <div className="bbTitle">
        <span className="name">
          当前状态：<Tag color={aimColorMap[state]}>{aimNameMap[state]}</Tag>
          {
            state === OBJECTIVE_STATUS_MAP.CANCLE &&
            <span>
              取消原因：{cancel_msg}
            </span>
          }
        </span>
        <span className="f-fr">
          <StateHistory
            type="objective"
            nameMap={aimNameMap}
            colorMap={aimColorMap}
          />
        </span>
      </div>
      <Card>
        <IssueProgress data={objectiveDetail || {}} />
      </Card>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={objectiveHistory} />
      </Card>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    objectiveHistory: state.objective.objectiveHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
