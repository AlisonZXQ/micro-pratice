import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Popover, Empty, Button, message, Divider } from 'antd';
import moment from 'moment';
import { deleteMileStone } from '@services/project';
import { getContainer, deepCopy, isObjective, isAdvise, isRequirement, isTask, isSubTask, isBug, generateEpUrl, generateJiraUrl } from '@utils/helper';
import ProjectMileStones from '@pages/project/components/project_milestone';
import { mileStatus } from '@shared/ProjectConfig';
import { PROEJCT_PERMISSION, MILESTONE_MAP } from '@shared/ProjectConfig';
import { deleteModal } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';

import styles from './index.less';

class DetailMileStones extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  isEmpty = (text) => {
    return text ? text : '-';
  }

  handleDelete = (it, index) => {
    this.setState({
      [`${index}-visible`]: false,
    });

    const that = this;
    deleteModal({
      title: `${it.isRelateIssue ? '删除里程碑后关联的单据将自动解绑，你确定要继续吗' : `你确定要删除当前时间线【${it.name}】吗`}？`,
      okCallback: () => {
        deleteMileStone(it.id).then((res) => {
          if (res.code !== 200) return message.error(`删除失败，${res.msg}`);
          message.success('删除成功！');
          that.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: it.projectId } });
        }).catch((err) => {
          return message.error(`删除异常，${err.msg}`);
        });
      }
    });
  }

  handleViewStone = (milestone) => {
    if (!milestone) {
      return;
    }
    const { issueKeys } = milestone;
    if (!issueKeys.length) {
      return;
    }

    let targetUrl = '';
    const prefixUrl = document.location.origin + '/v2/manage';
    const issueKey = issueKeys[0];
    if (isObjective(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/objectivedetail', issueKey);
    }
    else if (isAdvise(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/advisedetail', issueKey);
    }
    else if (isRequirement(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/requirementdetail', issueKey);
    }
    else if (isTask(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/taskdetail', issueKey);
    }
    else if (isSubTask(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/taskdetail', issueKey);
    }
    else if (isBug(issueKey)) {
      targetUrl = generateEpUrl(prefixUrl + '/bugdetail', issueKey);
    }
    else {
      targetUrl = generateJiraUrl(issueKey);
    }

    window.open(targetUrl);
  }

  getSignalContent = (it, index) => {
    const { type, currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const diffDay = moment(it.dueDate).diff(moment().format('YYYY-MM-DD'), 'day');

    const stoneContent = () => {
      return (<div style={{ fontWeight: 'normal', width: '500px' }}>
        <div className="u-mgt5">
          <span className="u-title">名称：</span>
          <span className="u-subtitle">{this.isEmpty(it.name)}</span>
        </div>
        <div className="u-mgt5">
          <span className="u-title">验证人：</span>
          <span className="u-subtitle">{this.isEmpty(it.acceptor && it.acceptor.name)}</span>
        </div>
        <div className="u-mgt5">
          <span className="u-title">负责人：</span>
          <span className="u-subtitle">{this.isEmpty(it.owner && it.owner.name)}</span>
        </div>
        <div className="u-mgt5">
          <span className="u-title">状态：</span>
          {
            it.status ?
              <span>
                {it.status === MILESTONE_MAP.COMPLETE && <span className={styles.nodeSuccess}></span>}
                {it.status === MILESTONE_MAP.NEW && diffDay >= 0 && <span className={styles.nodeBegin}></span>}
                {it.status === MILESTONE_MAP.NEW && diffDay < 0 && <span className={styles.nodeFail}></span>}
                {it.status === MILESTONE_MAP.TODO && <span className={styles.nodePend}></span>}
                <span className="u-mgl5">{mileStatus[it.status]}</span>
              </span>
              :
              '-'
          }
        </div>
        <div className="u-mgt5">
          <span className="u-title">备注：</span>
          <div
            dangerouslySetInnerHTML={{ __html: this.isEmpty(it.description) }}
            className={`${styles.description} u-subtitle`}
          >
          </div>
        </div>
        <div className="u-mgt10 u-mgb10">
          {
            type !== 'weekReport' &&
            <a onClick={() => this.handleViewStone(it)}>查看单据</a>
          }
          {
            type === 'detail' && roleGroup !== PROEJCT_PERMISSION.READ &&
            <span style={{ float: 'right' }}>
              {/* 采用回调函数关闭popover */}
              <Button type="danger" className="u-mgl10" onClick={() => this.handleDelete(it, index)}>删除</Button>
            </span>
          }
        </div>
      </div>);
    };

    const timeContent = () => {
      return (<div style={{ fontWeight: 'normal', width: '500px' }}>
        <div className="u-mgt5">
          <span className="u-title">名称：</span>
          <span className="u-subtitle">{this.isEmpty(it.name)}</span>
        </div>
        <div className="u-mgt5">
          <span className="u-title">到期日：</span>
          <span className="u-subtitle">{this.isEmpty(it.dueDate)}</span>
        </div>
        <div className="f-tar">
          {
            type === 'detail' && roleGroup !== PROEJCT_PERMISSION.READ &&
            <span>
              {/* 采用回调函数关闭popover */}
              {
                // 非wbs创建的里程碑可以编辑
                !it.isRelateIssue &&
                <ProjectMileStones type="编辑" callback={() => this.setState({ [`${index}-visible`]: false })} id={it.id} projectId={it.projectId} disabled={(roleGroup === PROEJCT_PERMISSION.READ)} />
              }
              <Button type="danger" className="u-mgl10" onClick={() => this.handleDelete(it, index)}>删除</Button>
            </span>
          }
        </div>
      </div>);
    };

    return (it.isRelateIssue ? stoneContent() : timeContent());
  }

  getMutilContent = (it, index) => {
    const { type, currentMemberInfo } = this.props;
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const timeNodes = it.filter(i => !i.isRelateIssue); // 时间线
    const stoneNodes = it.filter(i => i.isRelateIssue); // 里程碑

    const getNode = (it) => {
      return (
        it.map(item => {
          const diffDay = moment(item.dueDate).diff(moment().format('YYYY-MM-DD'), 'day');
          return (
            <div className={styles.multiNode}>
              {item.status === MILESTONE_MAP.COMPLETE && <span className={styles.nodeSuccess}></span>}
              {item.status === MILESTONE_MAP.NEW && diffDay >= 0 && <span className={styles.nodeBegin}></span>}
              {item.status === MILESTONE_MAP.NEW && diffDay < 0 && <span className={styles.nodeFail}></span>}
              {item.status === MILESTONE_MAP.TODO && <span className={styles.nodePend}></span>}
              <span className="u-mgl10 u-mgr10 f-ib" style={{ width: '250px' }}>{item.name}</span>
              <span style={{ width: '180px' }} className="f-ib">
                {
                  type !== 'weekReport' && item.isRelateIssue &&
                  <span>
                    <a className="u-mgr10" onClick={() => this.handleViewStone(item)}>查看单据</a>
                    <Divider type="vertical" />
                  </span>
                }
                {
                  type === 'detail' && roleGroup !== PROEJCT_PERMISSION.READ &&
                  <span>
                    {
                      !item.isRelateIssue &&
                      <span>
                        <ProjectMileStones type="链接编辑时间线" callback={() => this.setState({ [`${index}-visible`]: false })} id={item.id} projectId={item.projectId} disabled={(roleGroup === PROEJCT_PERMISSION.READ)} />
                        <Divider type="vertical" />
                      </span>
                    }
                    <a className={`u-mgl10 delColor`} onClick={() => this.handleDelete(item, index)}>删除</a>
                  </span>
                }
              </span>
            </div >
          );
        })
      );
    };

    return ([
      <div className="u-mgb20">
        {getNode(timeNodes)}
      </div>,
      getNode(stoneNodes),
    ]);
  }

  handleVisibleChange = (visible, it, index) => {
    this.setState({
      [`${index}-visible`]: visible,
    });
  }

  // 一个时间节点对应多个里程碑
  getMultiStones = (it, index, flag) => {
    const { projectBasic } = this.props;

    const projectDetail = projectBasic.projectDetail || {};
    const startTime = projectDetail.startTime;
    const endTime = projectDetail.endTime;

    const stoneArr = it.milestones.filter(item => item.isRelateIssue) || [];
    const stoneName = stoneArr.map(i => i.name).join(',');
    const timeArr = it.milestones.filter(item => !item.isRelateIssue) || [];
    const timeName = timeArr.map(i => i.name).join(',');

    return (
      [<Popover
        overlayClassName={styles.multiNode}
        content={this.getMutilContent(it.milestones, index)}
        trigger="hover"
        placement="topLeft"
        visible={this.state[`${index}-visible`]} // 维护唯一的里程碑state，后面要更新为id
        onVisibleChange={(visible) => this.handleVisibleChange(visible, it, index)}
        getPopupContainer={getContainer}
      >
        <li
          className={styles.item}
          style={{ marginRight: '1px', marginLeft: '1px' }}
        >
          {
            flag !== 'noneTime' &&
            <span>
              <div className={timeArr.length ? styles.timeNode : styles.timeNodeWhite}>
                {timeName.length > 6 && timeArr.length > 1 ?
                  <span>
                    {timeName.substring(0, 6)}
                    <span className={styles.extraText}>等{timeArr.length}个时间线</span>
                  </span>
                  : timeName}
              </div>
              <div className={timeArr.length ? styles.timeLine : styles.timeLineWhite}></div>
            </span>
          }

          <div className="f-jcc-aic">
            <div className={styles.time}>
              <MyIcon type="icon-shijian" />
              <span className="u-mgl5">{moment(it.dueDate).format('YYYY-MM-DD')}</span>
            </div>
          </div>

          <div className={styles.node} style={{ margin: '5px 0px' }}>
            {
              it.dueDate === startTime && <span className={styles.nodeTextStartTime}>{it.count}</span>
            }
            {
              it.dueDate === endTime && <span className={styles.nodeTextEndTime}>{it.count}</span>
            }
            {
              it.dueDate !== startTime && it.dueDate !== endTime && <span className={styles.nodeText}>{it.count}</span>
            }
          </div>

          {
            !!stoneArr.length &&
            <div className={styles.text}>
              {stoneName.length > 10 && stoneArr.length > 1 ?
                <span>
                  {stoneName.substring(0, 10)}
                  <span className={styles.extraText}>等{stoneArr.length}个里程碑</span>
                </span>
                : stoneName}
            </div>
          }
        </li>
      </Popover>,
      <span>
        {
          it.todayNode &&
          <div className={styles.todayStone}>
            <MyIcon type="icon-jinri" />
          </div>
        }
      </span>
      ]);
  }

  // 一个时间节点对应一个里程碑
  getSingleStone = (it, index, flag) => {
    const { projectBasic } = this.props;

    const projectDetail = projectBasic.projectDetail || {};
    const startTime = projectDetail.startTime;
    const endTime = projectDetail.endTime;

    const item = (it && it.milestones && it.milestones[0]) || {};
    // 与当前时间比较得出里程碑的状态颜色
    const diffDay = moment(item.dueDate).diff(moment().format('YYYY-MM-DD'), 'day');

    return (<span>
      <Popover
        content={this.getSignalContent(item, index)}
        trigger="hover"
        // visible={true}
        visible={(item.type === 'startTime' || item.type === 'endTime') ? false : this.state[`${index}-visible`]} // 维护唯一的里程碑state，后面要更新为id
        onVisibleChange={(visible) => this.handleVisibleChange(visible, it, index)}
        getPopupContainer={getContainer}
        placement="topLeft"
      >
        <li
          className={styles.item}
          style={{ marginRight: '1px', marginLeft: '1px' }}
        >
          {
            flag !== 'noneTime' &&
            <span>
              <div className={!item.isRelateIssue ? styles.timeNode : styles.timeNodeWhite}>
                {item.name.length > 8 ? `${item.name.substring(0, 8)}...` : item.name}
              </div>
              <div className={!item.isRelateIssue ? styles.timeLine : styles.timeLineWhite}></div>
            </span>
          }

          <div className="f-jcc-aic">
            <div className={styles.time}>
              <MyIcon type="icon-shijian" />
              <span className="u-mgl5">{moment(it.dueDate).format('YYYY-MM-DD')}</span>
            </div>
          </div>

          <div className={styles.node}>

            {/* 开始结束时间 */}
            {item.type === 'startTime' && <span className={styles.nodeStartTime}></span>}
            {item.type === 'endTime' && <span className={styles.nodeEndTime}></span>}

            {
              !item.type &&
              [
                item.dueDate === startTime && <span className={styles.nodeStartTime}></span>,
                item.dueDate === endTime && <span className={styles.nodeEndTime}></span>
              ]
            }

            {
              (item.dueDate !== startTime && item.dueDate !== endTime) &&
              [
                !item.isRelateIssue && <span className={styles.timeNodeStyle}></span>,
                item.isRelateIssue && item.status === MILESTONE_MAP.COMPLETE && <span className={styles.nodeSuccess}></span>,
                item.isRelateIssue && item.status === MILESTONE_MAP.NEW && diffDay >= 0 && <span className={styles.nodeBegin}></span>,
                item.isRelateIssue && item.status === MILESTONE_MAP.NEW && diffDay < 0 && <span className={styles.nodeFail}></span>,
                item.isRelateIssue && item.status === MILESTONE_MAP.TODO && <span className={styles.nodePend}></span>,
              ]
            }

          </div>

          {
            item.isRelateIssue &&
            <div className={styles.text}>
              {item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name}
            </div>
          }
        </li>
      </Popover>

      <span>
        {
          it.todayNode &&
          <div className={styles.todayStone}>
            <MyIcon type="icon-jinri" />
          </div>
        }
      </span>
    </span>);
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

  getToday = (bigIndex, mileStones, sameIndex) => {
    let style = '';
    if (sameIndex !== -1) {
      style = styles.todaySame;
    } else if (bigIndex !== -1) {
      style = styles.todayLeft;
    } else if (bigIndex === -1) {
      style = styles.todayRight;
    }

    return (<div
      className={style}
    >
      <MyIcon type="icon-jinri" />
    </div>);
  }

  getTimelineNodes = () => {
    const { projectPlanning, projectBasic } = this.props;
    const timelineNodes = (projectPlanning && projectPlanning.milestoneTimeline && projectPlanning.milestoneTimeline.timelineNodes) || [];
    const detail = projectBasic.projectDetail || {};
    const startTime = detail.startTime;
    const endTime = detail.endTime;

    let timelineNodesNew = deepCopy(timelineNodes, []);
    if (!timelineNodesNew.some(it => it.dueDate === startTime) && startTime) {
      const index = timelineNodesNew.findIndex(it => it.dueDate > startTime);
      const startTimeObj = {
        count: 1,
        dueDate: startTime,
        milestones: [{
          name: '开始时间',
          type: 'startTime',
          dueDate: startTime,
          isRelateIssue: true,
        }],
      };
      if (index === -1) {
        timelineNodesNew.push(startTimeObj);
      } else {
        timelineNodesNew.splice(index, 0, startTimeObj);
      }
    }

    if (!timelineNodesNew.some(it => it.dueDate === endTime) && endTime) {
      let index = timelineNodesNew.findIndex(it => it.dueDate > endTime);
      const endTimeObj = {
        count: 1,
        dueDate: endTime,
        milestones: [{
          name: '结束时间',
          type: 'endTime',
          dueDate: endTime,
          isRelateIssue: true,
        }],
      };
      if (index === -1) {
        timelineNodesNew.push(endTimeObj);
      } else {
        timelineNodesNew.splice(index, 0, endTimeObj);
      }
    }
    return timelineNodesNew;
  }

  render() {
    const { projectPlanning } = this.props;
    const timelineNodes = (projectPlanning && projectPlanning.milestoneTimeline && projectPlanning.milestoneTimeline.timelineNodes) || [];
    const flag = this.getFlag(timelineNodes);

    const today = moment().format('YYYY-MM-DD');

    let timelineNodesNew = this.getTimelineNodes();

    // 第一个比当前时间点大的里程碑
    let bigIndex = timelineNodesNew.findIndex(it => it.dueDate >= today);
    let sameIndex = timelineNodesNew.findIndex(it => it.dueDate === today);

    return ([timelineNodesNew && timelineNodesNew.length ?
      <div className={flag === 'allTime' ? styles.allTimeContainer : flag === 'partTime' ? styles.partTimeContainer : styles.noneTimeContainer} id="container">
        <ul className={styles.mileContainer}>
          {
            timelineNodesNew && timelineNodesNew.map((it, index) => {
              return (<span className="f-pr">
                {
                  bigIndex === index && this.getToday(bigIndex, timelineNodesNew, sameIndex)
                }
                {
                  !it.type &&
                  <span>
                    {it.count > 1 ? this.getMultiStones(it, index, flag) : this.getSingleStone(it, index, flag)}
                  </span>
                }
                {
                  bigIndex === -1 && index === timelineNodesNew.length - 1 && this.getToday(bigIndex, timelineNodesNew, sameIndex)
                }
              </span>);
            })
          }

        </ul>
        <div className={styles.line}></div>
      </div> : <Empty className="u-mgt10 u-mgb10" />]);
  }
}

export default Form.create()(DetailMileStones);
