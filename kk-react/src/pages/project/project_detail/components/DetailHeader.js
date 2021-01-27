import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { CaretDownOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Breadcrumb, Menu, Col, Button, Row, Dropdown, Tooltip, message } from 'antd';
import { Link } from 'umi';
import { history } from 'umi';
import img from '@assets/tou.jpg';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import CollectStar from '@components/CollectStar';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import { cancelCollectProject, addCollectProject, updateProjectDescription, updateProjectTitle, cancelProjectChange } from '@services/project';
import { AIM_TASK_BUG_STATUS_MAP, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { PROJECT_STATUS_MAP, PROEJCT_PERMISSION, statusMap, statusColor, priorityMap } from '@shared/ProjectConfig';
import { warnModal } from '@shared/CommonFun';
import BeginProjectFlow from './submit_approval/BeginProjectFlow';
import FinishProjectFlow from './submit_approval/FinishProjectFlow';
import CommonHeaderText from './common_header_text';
import ChangeDetailModal from './ChangeDetailModal';
import styles from '../index.less';

const MenuItem = Menu.Item;
const style = {
  height: '250px',
  overflow: 'auto',
};
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '',
      firstViewList: [],
      secondViewList: [],
      visibleDrop: false,
      down: true,
    };
  }

  componentDidMount() {
    const defaultDown = localStorage.getItem('projectHeaderDown');
    this.setState({ down: defaultDown === "up" ? false : true });
  }

  menu = () => {
    const { projectList } = this.props;
    const len = projectList && projectList.length;
    const { id } = this.props.history.location.query;
    let filterList = projectList;
    if (id) {
      filterList = projectList.filter(it => it.id !== Number(id));
    }
    return (
      <Menu>
        <div className={styles.projectMenu} style={(len && len > 10) ? style : null}>
          {
            filterList && filterList.map(item => (
              <div className={styles.linkItem} key={item.id}>
                <a href={`/v2/project/detail?id=${item.id}`} target="_blank" rel="noopener noreferrer">
                  <div
                    onClick={() => this.setState({ visibleDrop: false })}
                    className={styles.project}
                  >
                    <img src={img} alt="头像" className={styles.pic} />
                    <span>
                      {item.title && item.title.length > 15 ? `${item.title.substring(0, 14)}...` : item.title}
                    </span>
                  </div>
                </a>
              </div>
            ))
          }
        </div>
        {
          projectList && <Menu.Divider />
        }
        <MenuItem key="创建项目" className="u-mgl10">
          <Link to={'/project/create_project'} target="_blank">+创建项目</Link>
        </MenuItem>
      </Menu>);
  }

  handleEdit = (projectId) => {
    history.push(`/project/edit_project?id=${projectId}`);
  }

  getCancelAndCloseFlag = (objectives) => {
    const flag = objectives.length && objectives.some(it => it.objectiveVO && it.objectiveVO.objectiveStatus !== AIM_TASK_BUG_STATUS_MAP.CANCLE && it.objectiveVO && it.objectiveVO.objectiveStatus !== AIM_TASK_BUG_STATUS_MAP.CLOSE);

    if (!objectives) {
      return false;
    } else if (flag) {
      return true;
    } else if (!objectives.length) {
      return false;
    }
    return false;
  }

  getCancelFlag = (objectives) => {
    return objectives.length && objectives.some(it => it.objectiveVO && it.objectiveVO.objectiveStatus === AIM_TASK_BUG_STATUS_MAP.CANCLE);
  }

  getButtons = (status) => {
    const { projectBasic, currentMemberInfo, projectObjective } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const projectDetail = projectBasic.projectDetail || {};
    const projectId = projectDetail.projectId;
    const changeStatus = projectDetail.changeStatus;
    const objectives = projectObjective.objectives || [];
    // 项目下还有关联目标，请解除关联或取消目标后再发起结项(新建和进行中)
    const hasCancelAndCloseFlag = this.getCancelAndCloseFlag(objectives);
    const hasCancelFlag = this.getCancelFlag(objectives);

    const flagDoing = objectives && objectives.some(it => it.objectiveVO && it.objectiveVO.objectiveStatus === AIM_TASK_BUG_STATUS_MAP.TODO);

    // 首先根据是否是管理组别判断是否展示按钮，在根据是否处于相应的流程是否置灰
    switch (status) {
      case PROJECT_STATUS_MAP.NEW: // 新建
        return (roleGroup === PROEJCT_PERMISSION.MANAGE && <span>
          <Button
            className="u-mgr10"
            onClick={() => this.handleEdit(projectId)}
            disabled={roleGroup !== PROEJCT_PERMISSION.MANAGE}>
            编辑项目
          </Button>
          {
            objectives.length ?
              <BeginProjectFlow disabled={roleGroup !== PROEJCT_PERMISSION.MANAGE} data={projectBasic} id={projectId} />
              :
              <Tooltip title="项目下没有目标，无法立项">
                <Button className="u-mgr10" disabled >
                  发起立项
                </Button>
              </Tooltip>
          }
          {
            hasCancelAndCloseFlag ?
              <Tooltip title="请解除或取消项目下的未验收目标再发起结项">
                <Button className="u-mgr10" disabled>发起结项</Button>
              </Tooltip> :
              <FinishProjectFlow disabled={roleGroup !== PROEJCT_PERMISSION.MANAGE} data={projectBasic} type="finishTodo" id={projectId} />
          }
        </span>);
      case PROJECT_STATUS_MAP.BEGIN_APPROVAL: // 立项审批中
        return (<span>
          <Button onClick={() => history.push(`/project/project_begin_approval?id=${projectId}`)} className="u-mgr10">立项详情</Button>
        </span>);
      case PROJECT_STATUS_MAP.FINISH_APPROVAL: // 结项审批中
        return (<span>
          <Button onClick={() => history.push(`/project/project_finish_approval?id=${projectId}`)} className="u-mgr10">结项详情</Button>
        </span>);
      case PROJECT_STATUS_MAP.DOING: // 进行中
      case PROJECT_STATUS_MAP.AIM_COMPLETE: // 已验收
        return (roleGroup === PROEJCT_PERMISSION.MANAGE && <span>
          <Button
            className="u-mgr10"
            onClick={() => history.push(`/project/change_project?id=${projectId}`)}
            disabled={roleGroup !== PROEJCT_PERMISSION.MANAGE}>
            编辑项目
          </Button>
          {
            changeStatus &&
            <Button
              type="primary"
              className="u-mgr10"
              onClick={() => {
                if (flagDoing) {
                  return message.error(`当前项目中有目标正在验收中，不可发起变更审批！`);
                } else {
                  history.push(`/project/change?projectId=${projectId}`);
                }
              }}
            >发起变更</Button>
          }
          {
            changeStatus && <Button className="u-mgr10" type="primary"
              onClick={() => this.handleReset()}>恢复变更</Button>
          }
          {
            hasCancelAndCloseFlag ?
              <Tooltip title="请解除或取消项目下的未验收目标再发起结项">
                <Button className="u-mgr10" disabled>发起结项</Button>
              </Tooltip> :
              <span>
                {
                  hasCancelFlag ?
                    <FinishProjectFlow data={projectBasic} type="finishDoing" changeStatus={changeStatus} id={projectId} />
                    :
                    <FinishProjectFlow data={projectBasic} type="finishDone" primary changeStatus={changeStatus} id={projectId} />
                }
              </span>
          }
        </span>);
      case PROJECT_STATUS_MAP.DOING_CHANGE: // 进行中－变更中
        return (<span>
          <Button onClick={() => history.push(`/project/project_change_approval?id=${projectId}`)} className="u-mgr10">变更详情</Button>
        </span>);
      default:
        return (<span
        >
        </span>);
    }
  }

  handleVisibleChange = flag => {
    this.setState({ visibleDrop: flag });
  }

  handleUpDown = () => {

    this.setState({ down: !this.state.down }, () => {
      localStorage.setItem('projectHeaderDown', this.state.down ? 'down' : 'up');
    });
  }

  collectOrNot = () => {
    const { projectBasic } = this.props;
    const data = projectBasic.projectDetail || {};
    const collectStatus = data.collectStatus;
    const projectId = data.projectId;

    let promise = null;
    if (collectStatus) {
      promise = cancelCollectProject({ projectId: projectId });
    } else {
      promise = addCollectProject({ projectId: projectId });
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
      message.success(collectStatus ? '取消收藏成功！' : '添加收藏成功！');
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleUpdateProject = (type, value) => {
    const { projectBasic } = this.props;
    const data = projectBasic.projectDetail || {};
    const projectId = data.projectId;

    const params = {
      id: projectId,
      [type]: value,
    };
    let promise = null;
    if (type === 'description') {
      promise = updateProjectDescription(params);
    } else if (type === 'title') {
      promise = updateProjectTitle(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  // 恢复变更
  handleReset = () => {
    const { projectBasic } = this.props;
    const data = projectBasic.projectDetail || {};
    const projectId = data.projectId;

    warnModal({
      title: '确认恢复',
      content: '恢复后该项目已编辑的内容将不再保留。',
      okCallback: () => {
        cancelProjectChange({ projectId }).then((res) => {
          if (res.code !== 200) { return message.error(res.msg) }
          message.success('操作成功！');
          this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectId } });
          this.props.dispatch({ type: 'project/getProjectObjective', payload: { id: projectId } });
        }).catch((err) => {
          return message.error('变更操作异常', err || err.message);
        });
      }
    });

  }

  render() {
    const { projectBasic } = this.props;
    const { down } = this.state;
    const data = projectBasic.projectDetail || {};
    const projectId = data.projectId;

    const productData = projectBasic.subProductVO || {};
    const productid = productData.productId;
    // 除了标题和描述外均收起展示
    const flag = true;
    const collectStatus = data.collectStatus;
    const changeStatus = data.changeStatus;

    return [<Card>
      <Col span={16}>
        <Breadcrumb>
          <Breadcrumb.Item><Link to={'/project/list'}>项目列表</Link></Breadcrumb.Item>
          <Dropdown
            overlay={this.menu}
            onVisibleChange={this.handleVisibleChange}
            visible={this.state.visibleDrop}
          >
            <a>
              <span className={styles.return}>
                {
                  data.title && data.title.length > 15 ? `${data.title.substring(0, 14)}...` : data.title
                }
              </span>
              <CaretDownOutlined style={{ fontSize: '12px' }} />
            </a>
          </Dropdown>
          <CollectStar
            style={{ fontSize: '20px', position: 'relative', left: '10px', top: '2px' }}
            callback={this.collectOrNot}
            collect={collectStatus}
          />

          {
            changeStatus &&
            <span className={styles.changeIcon}>
              <MyIcon type="icon-tishigantanhaohuang" className={styles.icon} />
              <span className={styles.changeText}>当前项目内容/目标已变更，请项目负责人发起审批</span>
              <ChangeDetailModal
                children={<a className={styles.link}>
                  查看详情
                  <MyIcon type="icon-fanhuitubiao" className={styles.arrow} />
                </a>}
                projectId={projectId}
              />

            </span>
          }

        </Breadcrumb>

        <div className={styles.headerC}>
          <div className={styles.imgC}>
            <MyIcon type="icon-xiangmumingchengicon" className={styles.img} />
          </div>
          <div className={styles.textC}>
            <CommonHeaderText projectBasic={projectBasic} down={down} handleUpdateProject={this.handleUpdateProject} {...this.props} />
          </div>
        </div>
      </Col>

      <Col span={8}>
        <div className="btn98 f-tar" style={{ position: 'absolute', right: '0px', width: '620px' }}>
          <span>
            <span className='u-mgr10'>
              <SubscribeUser
                type="project"
                productid={productid}
                connid={projectId}
                issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE} />
            </span>
            {this.getButtons(data.status)}
          </span>

          <div style={{ position: 'absolute', right: '0px', width: '410px' }}>
            <Row className="u-mgt30">
              <Col span={8} className="f-pr" offset={2}>
                <div className="f-fs2 u-thirdtitle f-fr f-clb">状态</div>
                <div className="f-fs4 f-clb f-fr" style={{ marginTop: '2px' }}>
                  {
                    data.status ?
                      <DefineDot
                        text={data.status}
                        statusMap={statusMap}
                        statusColor={statusColor}
                      />
                      : '-'
                  }
                </div>
              </Col>
              <Col span={6}>
                <div className="f-fs2 u-thirdtitle f-fr f-clb">负责人</div>
                <div className="u-mgt5 f-fs4 f-fr f-clb f-wwb">{data.owner}</div>
              </Col>
              <Col span={6}>
                <div className="f-fs2 u-thirdtitle f-fr f-clb">优先级</div>
                <div className="u-mgt5 f-fs4 f-fr f-clb">{data.priority ? priorityMap[data.priority] : '-'}</div>
              </Col>
            </Row>
          </div>
        </div>
      </Col>
    </Card>,
    flag &&
    <div className={styles.iconC} onClick={() => this.handleUpDown()}>
      <div className={styles.iconBall}>
        <MyIcon type="icon-zhankaijiantou" className={down ? styles.iconDown : styles.iconUp} />
      </div>
    </div>
    ];
  }
}

export default withRouter(Form.create()(index));
