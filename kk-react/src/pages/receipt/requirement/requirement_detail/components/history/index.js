import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Tag, Card } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { requirementNameMap, requirementColorMap } from '@shared/CommonConfig';
import { REQUIREMENT_STATUS_MAP, REVIEW_RESULE_MAP } from '@shared/RequirementConfig';
import IssueProgress from './components/IssueProgress';
import ChangeHistory from './components/ChangeHistory';
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const rid = getIssueKey();
    if (rid) {
      this.props.dispatch({ type: 'requirement/getReqHistory', payload: { requirementid: rid } });
    }
  }

  render() {
    const { reqHistory, requirementDetail } = this.props;
    const requirement = requirementDetail.requirement || {};
    const state = requirement.state;
    const rejectdesc = requirement.rejectdesc;
    const reviewresult = requirement.reviewresult;

    return (<div>
      <div className="bbTitle">
        <span className="name">
          当前状态：<Tag color={requirementColorMap[state]}>{requirementNameMap[state]}</Tag>
          {
            state === REQUIREMENT_STATUS_MAP.EVALUATION && reviewresult === REVIEW_RESULE_MAP.FAIL &&
            <span>
              不通过原因：{rejectdesc}
            </span>
          }
        </span>

        <span className="f-fr">
          <StateHistory
            type="requirement"
            nameMap={requirementNameMap}
            colorMap={requirementColorMap}
          />
        </span>
      </div>

      <div className={styles.container}>
        <Card>
          <IssueProgress data={requirementDetail || {}} />
        </Card>
      </div>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={reqHistory} />
      </Card>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    reqHistory: state.requirement.reqHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
