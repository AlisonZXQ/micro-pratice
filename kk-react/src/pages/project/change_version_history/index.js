/**
 * @description 已弃用，改v2
 */
import React, { Component } from 'react';
import { Card, Spin } from 'antd';
import { connect } from 'dva';
import ApprovalHeader from '../change_detail/components/approval_header'; // 废弃了老的逻辑 变更历史页面也需要高亮
import AimList from '../change_detail/components/aim_list'; // 废弃了老的逻辑 变更历史页面也需要高亮
import DetailContent from '../project_detail/components/detail_content/index';
import styles from './index.less';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const { id, changeId } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);
    if (changeId) {
      this.props.dispatch({ type: 'project/getChangeVersionInfo', payload: { changeId } });
    }
  }

  getChangeAims = (diffObjectives) => {
    const objectives = [];
    diffObjectives && diffObjectives.forEach(it => {
      const obj = {
        action: it.action,
        ...JSON.parse(it.data),
      };
      objectives.push(obj);
    });

    return objectives;
  }

  render() {
    const { changeVersionInfo, loading } = this.props;
    return (<Spin spinning={loading}>
      <ApprovalHeader list={changeVersionInfo} {...this.props} title="变更历史" />

      <div style={{ padding: '0px 15px' }}>

        <div className="bbTitle">
          <span className="name">项目目标</span>
        </div>
        <Card
          className={`${styles.cardStyle} u-mgt10`}
        >
          <AimList
            objectives={changeVersionInfo && changeVersionInfo.newObjectives}
            oldObjectives={changeVersionInfo && changeVersionInfo.oldObjectives}
            changeData={this.getChangeAims(changeVersionInfo && changeVersionInfo.diffObjectives)}
            type="history"
          />
        </Card>

        <div className="u-mgt10">
          <DetailContent
            projectBasic={changeVersionInfo}
            projectPlanning={changeVersionInfo}
            type="change"
          />
        </div>
      </div>
    </Spin>);
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loading.effects['project/getChangeVersionInfo'],
    changeVersionInfo: state.project.changeVersionInfo,
    operationPerm: state.project.operationPerm,
  };
};

export default connect(mapStateToProps)(index);

