import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Card } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { bugTaskNameMap, bugTaskColorMap } from '@shared/CommonConfig';
import IssueProgress from './components/IssueProgress';
import ChangeHistory from './components/ChangeHistory';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const bid = getIssueKey();
    if (bid) {
      this.props.dispatch({ type: 'bug/getBugHistory', payload: { bugid: bid } });
    }
  }

  render() {
    const { bugHistory, bugDetail } = this.props;

    return (<span>
      <div className="bbTitle">
        <span className="name">
          流程进度
        </span>
        <span className="f-fr">
          <StateHistory
            type="bug"
            nameMap={bugTaskNameMap}
            colorMap={bugTaskColorMap}
          />
        </span>
      </div>
      <Card>
        <IssueProgress data={bugDetail || {}} />
      </Card>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={bugHistory} />
      </Card>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    bugHistory: state.bug.bugHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
