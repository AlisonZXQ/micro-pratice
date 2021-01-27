import React, { Component } from 'react';
import { Card, Radio, Row, Spin, Dropdown, Menu, Button } from 'antd';
import { connect } from 'dva';
import ProjectContents from '@pages/project/components/project_contents';
import RiskTable from '@pages/project/project_risk/components/RiskTable';
import { PROJECT_STATUS_MAP, PROEJCT_PERMISSION, PROJECT_DATASOURCE } from '@shared/ProjectConfig';
import ProjectAimsEP from '@pages/project/components/project_aims_ep';
import ManPower from '@components/ManPower';
import MyIcon from '@components/MyIcon';
import { equalsObj } from '@utils/helper';
import OKRObjective from '@components/OKRObjective';
import OrganizeObjective from '@components/OrganizeObjective';
import DetailTable from './components/plan_issue';
import CreateSingleIssue from './components/plan_issue/components/CreateSingleIssue';
import PlanningManPower from './components/plan_issue/components/PlanningManPower';
import AimList from './components/aim_list';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

/**
 * detailType 当前radiobutton选中的是哪一个
 */
class index extends Component {
  state = {
    detailType: 'objective',
    visible: false,
  };

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.clickStone !== this.props.clickStone && this.props.clickStone && this.state.detailType !== 'planning') {
      this.setState({ detailType: 'planning' });
    }

    // 进行中时选择内容tab其他选中目标tab
    if (!equalsObj(prevProps.projectBasic, this.props.projectBasic)) {
      const data = this.props.projectBasic || {};
      const projectDetail = data.projectDetail || {};
      const status = projectDetail.status;
      if (status === PROJECT_STATUS_MAP.DOING && this.state.detailType !== 'planning') {
        this.setState({ detailType: 'planning' });
      } else if (status !== PROJECT_STATUS_MAP.DOING && this.state.detailType !== 'objective') {
        this.setState({ detailType: 'objective' });
      }
    }
  }

  handleChangeDetailType = (e) => {
    const { projectBasic, productList, type } = this.props;
    const data = projectBasic || {};
    const projectDetail = data.projectDetail || {};
    const projectId = projectDetail.projectId;
    const value = e.target.value;

    this.setState({ detailType: e.target.value });
    if (type === 'detail') {
      if (value === "objective") {
        this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
      } else if (value === 'planning') {
        this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
        const params = {
          projectId,
          products: productList.map(it => it.id),
        };
        this.props.dispatch({ type: 'project/getPlanningData', payload: params });
      } else {
        const params = {
          limit: 10,
          offset: 0,
          orderby: 'addtime',
          order: 'desc',
        };
        this.props.dispatch({ type: 'risk/getRiskList', payload: params });
      }
    }
  }

  handleChangeDiff = (projectId) => {
    this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
    this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
    this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
  }

  getDiffButtons = () => {
    const { projectBasic, currentMemberInfo, projectPlanning } = this.props;
    const { detailType, visible } = this.state;
    const data = projectBasic ? projectBasic : {};
    const productid = data.products && data.products[0] && data.products[0].id;
    const subProductId = data.subProductVO && data.subProductVO.id;
    const projectDetail = data.projectDetail || {};
    const projectId = projectDetail.projectId;
    const datasource = projectDetail.datasource;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const status = projectDetail.status;

    switch (detailType) {
      case 'objective':
        return <span className="btn98">
          {
            roleGroup !== PROEJCT_PERMISSION.READ && status !== PROJECT_STATUS_MAP.DOING_CHANGE &&
            <span>
              <Dropdown
                overlay={<Menu>
                  {/* <div onClick={() => this.setState({ visible: false })}>
                    <ProjectAimsEP type="new" projectId={projectId} handleObjectiveCallback={() => this.handleChangeDiff(projectId)} isNotChange={status !== PROJECT_STATUS_MAP.DOING} />
                  </div>
                  <div onClick={() => this.setState({ visible: false })}>
                    <ProjectAimsEP type="exist" projectId={projectId} handleObjectiveCallback={() => this.handleChangeDiff(projectId)} isNotChange={status !== PROJECT_STATUS_MAP.DOING} />
                  </div> */}
                  <div onClick={() => this.setState({ visible: false })}>
                    <OrganizeObjective
                      trigger={<span className="menuItem">添加组织目标</span>}
                      productId={productid}
                      refreshFun={() => this.handleChangeDiff(projectId)}
                      projectId={projectId}
                      isNotChange={status !== PROJECT_STATUS_MAP.DOING}
                    />
                  </div>
                  <div onClick={() => this.setState({ visible: false })}>
                    <OKRObjective
                      trigger={<span className="menuItem">导入OKR系统目标</span>}
                      productId={productid}
                      refreshFun={() => this.handleChangeDiff(projectId)}
                      projectId={projectId}
                      isNotChange={status !== PROJECT_STATUS_MAP.DOING}
                    />
                  </div>
                </Menu>}
                visible={visible}
                onVisibleChange={visible => this.setState({ visible })}
              >
                <Button>添加目标</Button>
              </Dropdown>
            </span>
          }
        </span>;
      case 'planning':
        return status !== PROJECT_STATUS_MAP.FINISH && <span>
          {datasource === PROJECT_DATASOURCE.EP && <PlanningManPower projectPlanning={projectPlanning} />}
          <ProjectContents type="关联单据" dataType="all" data={projectBasic} edit disabled={roleGroup === PROEJCT_PERMISSION.READ} />
          <CreateSingleIssue disabled={roleGroup === PROEJCT_PERMISSION.READ} subProductId={subProductId} productid={productid} id={projectId} />
        </span>;
      case 'risk':
        return <span>
        </span>;
      default:
        return null;
    }

  }

  render() {
    const { projectBasic, type, projectPlanning, objectiveLoading, riskListLoading, planningLoading, projectRiskList,
      riskObj, projectObjective } = this.props;
    const { detailType } = this.state;
    const data = projectBasic || {};
    const projectDetail = data.projectDetail || {};
    const projectId = projectDetail.projectId;
    const objectives = projectObjective.objectives || [];
    const ObjectiveChangeStatus = objectives.some(it => it.action && it.action !== '未变更');
    const rightHeight = document.getElementById('projectRight') && document.getElementById('projectRight').offsetHeight;
    const leftTopHeight = document.getElementById('projectLeftTop') && document.getElementById('projectLeftTop').offsetHeight;
    let currentHeight;
    if (rightHeight && leftTopHeight) {
      currentHeight = rightHeight - leftTopHeight - 54;
    } else {
      currentHeight = 700;
    }

    return (<span className={styles.projectDetail}>
      <div className="bbTitle">
        <span className="name">项目内容</span>
        <span className={styles.workload}>
          <ManPower type="project" id={projectId} dataSource={projectDetail.datasource} />
        </span>

        {
          type === 'detail' &&
          <span style={{ position: 'absolute', top: '6px', right: '0px' }}>
            {this.getDiffButtons()}
          </span>
        }

      </div>

      <Card className={styles.detailCard} style={{ height: `${currentHeight}px` }}>
        <RadioGroup onChange={this.handleChangeDetailType} value={detailType}>
          <RadioButton value="objective">
            {ObjectiveChangeStatus &&
              <MyIcon type="icon-tishigantanhaohuang" className="u-mgr5" />
            }
            目标({objectives && objectives.length})
          </RadioButton>
          <RadioButton value="planning">内容({projectPlanning.plannings && projectPlanning.plannings.length})</RadioButton>
          <RadioButton value='risk'>风险({
            (type === 'begin' || type === 'finish') ? projectRiskList.length : riskObj.totalCount
          })</RadioButton>
        </RadioGroup>

        <div style={{ display: detailType === "objective" ? 'block' : 'none' }}>
          <Row>
            <Spin spinning={objectiveLoading}>
              <AimList currentHeight={currentHeight} id={projectId} {...this.props} type={type} />
            </Spin>
          </Row>
        </div>

        <div style={{ display: detailType === "planning" ? 'block' : 'none' }}>
          <Row>
            <Spin spinning={planningLoading}>
              <DetailTable
                plannings={projectPlanning.plannings}
                projectBasic={projectBasic}
                type={type}
                id={projectId}
                currentHeight={currentHeight}
                {...this.props}
              />
            </Spin>
          </Row>
        </div>

        <div style={{ display: detailType === "risk" ? 'block' : 'none' }}>
          <Row className="u-mgt10">
            <Spin spinning={type === 'detail' ? riskListLoading : false}>
              <RiskTable title="项目风险" from={type} id={projectId} projectRiskList={projectRiskList} />
            </Spin>
          </Row>
        </div>
      </Card>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productList: state.product.productList,
    currentMemberInfo: state.user.currentMemberInfo,
    customSelect: state.aimEP.customSelect,
    stoneName: state.createProject.stoneName,
    projectMember: state.project.projectMember,

    riskObj: state.risk.riskObj,
    riskListLoading: state.loading.effects['risk/getRiskList'],

    clickStone: state.createProject.clickStone,
  };
};

export default connect(mapStateToProps)(index);
