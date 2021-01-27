import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Tag, Menu, message, Card } from 'antd';
import { getIssueKey } from '@utils/helper';
import StateHistory from '@pages/receipt/components/StateHistory';
import { updateAcceptStateAdvise } from '@services/advise';
import { adviseNameMap, adviseColorMap } from '@shared/CommonConfig';
import { stateMap, rejectReason, resolveResultMap, ADVISE_STATUS_MAP } from '@shared/AdviseConfig';
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
    const aid = getIssueKey();
    if (aid) {
      this.props.dispatch({ type: 'advise/getAdviseHistory', payload: { adviseid: aid } });
    }
  }

  getAdviseDetail = () => {
    const aid = getIssueKey();
    this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: aid } });
  }

  updateAcceptStateAdvise = (state) => {
    const aid = getIssueKey();
    const params = {
      id: aid,
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
    const { adviseDetail } = this.props;
    const advise = adviseDetail.advise || {};
    const status = advise.state;
    const reasontype = advise.reasontype;
    const rejectdesc = advise.rejectdesc;
    const resolveresult = advise.resolve_result;

    switch (status) {
      case ADVISE_STATUS_MAP.CLOSE: return (<span>
        <Tag color={adviseColorMap[status]}>{adviseNameMap[status]}</Tag>
        【{resolveResultMap[resolveresult]}】
      </span>);

      case ADVISE_STATUS_MAP.ACCEPTED: return (<span>
        <Tag color={adviseColorMap[status]}>{adviseNameMap[status]}</Tag>
      </span>);

      case ADVISE_STATUS_MAP.REJECTED: return (<span>
        <Tag color={adviseColorMap[status]}>{adviseNameMap[status]}</Tag>
        【{rejectReason[reasontype]}】{rejectdesc}
      </span>);
      default:
        return <Tag color={adviseColorMap[status]}>{adviseNameMap[status]}</Tag>;
    }
  }

  render() {
    const { adviseHistory, adviseDetail } = this.props;

    return (<span>
      <div className="bbTitle">
        <span className="name">
          当前状态：
        </span>
        {this.getStatusTitle()}
        <span className="f-fr">
          <StateHistory
            type="advise"
            nameMap={adviseNameMap}
            colorMap={adviseColorMap}
          />
        </span>
      </div>

      <div className={styles.container}>
        <Card style={{marginTop: '0px'}}>
          <IssueProgress data={adviseDetail || {}} />
        </Card>
      </div>

      <div className="bbTitle">
        <span className="name">活动日志</span>
      </div>
      <Card>
        <ChangeHistory history={adviseHistory} />
      </Card>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    adviseHistory: state.advise.adviseHistory,
  };
};

export default withRouter(connect(mapStateToProps)(index));
