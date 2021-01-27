//顶部组件
//项目详情组件
//项目动态组件
//项目内容组件
//项目成员组件
import React, { Component } from 'react';
import { Row, Col, Spin, message, Card } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { queryProjectList, getProjectId, getProjectCode } from '@services/project';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import ProjectMileStone from '@pages/project/components/project_milestone/index';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import NoPermission from '@components/403';
import DetailMileStones from './components/mile_stone';
import DetailHeader from './components/DetailHeader';
import DetailContent from './components/detail_content/index';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectMembers from './components/ProjectMembers';
import ProjectAttachment from './components/ProjectAttachment';
import ProjectWeekReport from './components/ProjectWeekReport';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectList: [],
    };
    this.detailThis = null;
  }

  componentDidMount() {
    const { id } = this.props.location.query;
    const { pathname } = this.props.location;
    this.handleProjectDetailCode(id, pathname);
  }

  handleProjectDetailCode = (id, pathname) => {
    const { projectId } = this.props;
    if (id) {
      getProjectCode(id).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.dispatch({ type: 'project/saveProjectCode', payload: res.result });
        this.props.dispatch({ type: 'project/saveProjectId', payload: id });
        history.push(`/project/detail/${res.result}`);
        this.getDefaultRequest(id);
      }).catch(err => {
        return message.error(err || err.message);
      });
    // 避免router.replace之后的重新找didmount的问题
    } else if (pathname.includes('P') && !projectId) {
      const projectCode = pathname.split('/').pop();
      getProjectId(projectCode).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.dispatch({ type: 'project/saveProjectId', payload: res.result });
        this.props.dispatch({ type: 'project/saveProjectCode', payload: projectCode });
        this.getDefaultRequest(res.result);
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  getDefaultRequest = (id) => {
    sessionStorage.setItem('currentPid', id);
    this.props.dispatch({ type: 'createProject/saveTimeRange', payload: [] });
    // 调用主页的五个接口
    this.props.dispatch({ type: 'project/getProject', payload: { id: id } });
    this.props.dispatch({ type: 'user/getCurrentMemberInfo', payload: { id: id } });
    this.getProjectList();
  }

  getProjectList = () => {
    const params = {
      order: 2,
      orderField: 1,
      pageSize: 300,
      pageNo: 1,
    };
    queryProjectList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询项目列表失败, ${res.msg}`);
      }
      this.setState({
        projectList: res.result.list || [],
      });
    }).catch((err) => {
      return message.error(`查询项目列表异常, ${err || err.message}`);
    });
  }

  getFlag = (timelineNodes) => {
    let flag = '';
    let timeCount = 0;
    let total = 0;
    timelineNodes.forEach(it => {
      total += it.milestones.length || 0;
      const timeArr = it.milestones.filter(it => !it.isRelateIssue);
      timeCount += timeArr.length || 0;
    });
    if (timeCount > 0 && timeCount === total) {
      flag = 'allTime';
    } else if (timeCount < total && timeCount > 0) {
      flag = 'partTime';
    } else if (!timeCount) {
      flag = 'noneTime';
    }
    return flag;
  }

  render() {
    const { projectBasic, basicLoading, memberLoading, eventLoading, planningLoading, weekListLoading, drawerIssueId, projectPlanning, currentMemberInfo } = this.props;
    const { projectList } = this.state;
    const projectDetail = projectBasic.projectDetail || {};
    const status = projectDetail.status;
    const projectId = projectDetail.projectId;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const hasPermission = projectBasic.hasPermission;

    if (projectDetail.title) {
      document.title = projectDetail.title;
    }

    // 预设时间
    if (projectDetail.startTime && projectDetail.endTime) {
      const arr = [projectDetail.startTime, projectDetail.endTime];
      this.props.dispatch({ type: 'createProject/saveTimeRange', payload: arr });
    } else {
      this.props.dispatch({ type: 'createProject/saveTimeRange', payload: [] });
    }

    return (hasPermission ? <span>
      <Spin spinning={basicLoading}>
        <DetailHeader {...this.props} projectList={projectList} />
      </Spin>

      <Row gutter={16} style={{ margin: '-12px 10px 0px 10px' }}>
        <Col span={19}>
          <Row id='projectLeftTop'>
            <Spin spinning={planningLoading}>
              <div className="bbTitle">
                <span className="name">项目里程碑</span>
                {
                  projectPlanning.milestoneTimeline && projectPlanning.milestoneTimeline.timelineNodes && !!projectPlanning.milestoneTimeline.timelineNodes.length &&
                  !projectPlanning.milestoneTimeline.allExpired &&
                  <span className="f-fs1 u-mgl20 f-fwn">
                    距下一个里程碑到期还有
                    <span style={{ color: '#F04646' }}>{projectPlanning && projectPlanning.milestoneTimeline && projectPlanning.milestoneTimeline.nextDueDate}</span>天
                  </span>
                }
                {
                  (status !== 5 && status !== 6) &&
                  <span style={{ position: 'absolute', top: '-5px', right: '0px' }}>
                    <ProjectMileStone
                      type="创建时间节点"
                      projectId={projectId}
                      disabled={(roleGroup === ISSUE_ROLE_VALUE_MAP.READ)} />
                  </span>
                }
              </div>

              <Card className={`${styles.mileStone} u-mgt10`}>
                <DetailMileStones
                  projectBasic={projectBasic}
                  projectPlanning={projectPlanning}
                  {...this.props}
                  type="detail"
                />
              </Card>
            </Spin>
          </Row>

          <Row>
            <DetailContent
              type="detail"
              {...this.props}
            />
          </Row>
        </Col>

        <Col span={5} id='projectRight'>
          <Row >
            <Spin spinning={weekListLoading}>
              <ProjectWeekReport id={projectId} {...this.props} />
            </Spin>
          </Row>

          <Row>
            <ProjectAttachment id={projectId} {...this.props} />
          </Row>

          <Row>
            <Spin spinning={memberLoading}>
              <ProjectMembers id={projectId} {...this.props} />
            </Spin>
          </Row>

          <Row className="u-mgb10">
            <Spin spinning={eventLoading}>
              <ProjectTimeline id={projectId} {...this.props} />
            </Spin>
          </Row>

        </Col>

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
              this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
              this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
              this.props.dispatch({ type: 'risk/getRiskList', payload: params });
            }}
          />
        }
      </Row>
    </span> : <NoPermission />);
  }
}
const mapStateToProps = (state) => {
  return {
    projectBasic: state.project.projectBasic,
    projectMember: state.project.projectMember,
    projectEvent: state.project.projectEvent,
    projectObjective: state.project.projectObjective,
    projectPlanning: state.project.projectPlanning,

    basicLoading: state.loading.effects['project/getProjectBasic'],
    memberLoading: state.loading.effects['project/getProjectMember'],
    eventLoading: state.loading.effects['project/getProjectEvent'],
    objectiveLoading: state.loading.effects['project/getProjectObjective'],
    planningLoading: state.loading.effects['project/getProjectPlanning'],
    weekListLoading: state.loading.effects['weekReport/getWeekReportAll'],

    currentMemberInfo: state.user.currentMemberInfo,
    currentUser: state.user.currentUser,

    drawerIssueId: state.receipt.drawerIssueId,

    projectId: state.project.projectId,
    projectCode: state.project.projectCode,
  };
};

export default connect(mapStateToProps)(index);

