import React, { Component } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import ProjectList from '@components/ProjectList';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';

import RiskTable from './components/RiskTable';

const DrawerComponent = DrawerHOC()(DrawerShared);

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      orderby: 'addtime',
      order: 'desc',
      filterObj: {},
      current: 1,
      editData: {},
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    if (projectId) {
      this.getDefaultRequest(projectId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.projectId !== this.props.projectId) {
      this.getDefaultRequest(this.props.projectId);
    }
  }

  getDefaultRequest = (id) => {
    sessionStorage.setItem('currentPid', id);
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id } });
  };

  render() {
    const { drawerIssueId, projectId } = this.props;
    const extra = [{ name: '风险管理', link: null }];
    const { id } = this.props.location.query;

    return (<span>
      <Card
      >
        <ProjectList id={id || projectId} extra={extra} />
      </Card>

      <div className='u-pdl20 u-pdr20'>
        <RiskTable title="风险列表" id={id || projectId} />
      </div>

      {
        drawerIssueId &&
        <DrawerComponent
          refreshFun={() => {
            const params = {
              limit: 10,
              offset: 0,
              orderby: 'addtime',
              order: 'desc',
            };

            this.props.dispatch({ type: 'risk/getRiskList', payload: params });
          }}
        />
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,
    projectId: state.project.projectId
  };
};

export default connect(mapStateToProps)(index);
