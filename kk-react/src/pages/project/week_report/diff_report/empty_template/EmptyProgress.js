import React, { Component } from 'react';
import { Row, Col, Tag, Progress } from 'antd';
import DetailMileStones from '@pages/project/project_detail/components/mile_stone';
import { deepCopy } from '@utils/helper';
import { statusMap, statusColor, MILESTONE_MAP } from '@shared/ProjectConfig';
import styles from '../index.less';

class ReportProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  getNum = (milestoneData) => {
    const timelineNodes = milestoneData && milestoneData.timelineNodes;
    let done = 0;
    let total = 0;
    timelineNodes && timelineNodes.forEach(it => {
      const stones = it.milestones ? it.milestones.filter(i => i.relateIssue || i.isRelateIssue) : [];
      total += stones.length;
      stones.forEach(item => {
        if (item.status === MILESTONE_MAP.COMPLETE) {
          done += 1;
        }
      });
    });
    return [done, total];
  }

  getStoneAndTime = (milestoneData) => {
    const timelineNodes = milestoneData && milestoneData.timelineNodes;
    let total = 0;
    timelineNodes && timelineNodes.forEach(it => {
      const stones = it.milestones ? it.milestones : [];
      total += stones.length;
    });
    return total;
  }

  getDefaultDes = () => {
    const { data, reqData } = this.props;

    const requirement = reqData ? reqData.requirement : {};
    let des = '';
    if (data && data.description) {
      des = data.description;
    } else if (requirement && requirement.description) {
      des = requirement.description;
    }

    // 针对设计流程提单保存的富文本内容
    this.props.dispatch({ type: 'design/saveDes', payload: des });
    return des;
  }

  getStoneData = (data) => {
    const newData = deepCopy(data) || [];
    newData && newData.timelineNodes && newData.timelineNodes.forEach(it => {
      it.milestones.forEach(i => {
        i.isRelateIssue = i.relateIssue || i.isRelateIssue;
      });
    });
    return newData;
  }

  render() {
    const { reportData } = this.props;

    // 处理里程碑需要的字段信息
    const data = {};
    const projectDetail = {
      status: reportData.status,
      startTime: reportData.projectData && reportData.projectData.startTime,
      endTime: reportData.projectData && reportData.projectData.endTime,
    };
    data.projectDetail = projectDetail;
    data.milestoneTimeline = this.getStoneData(reportData.milestoneData) || {};

    // 计算里程碑的进度
    const num = this.getNum(reportData.milestoneData);
    const percent = num[1] !== 0 ? (num[0] / num[1]).toFixed(2) * 100 : 0;

    return (<Row className='bgWhiteModel'>
      <Col span={24} style={{ padding: '0px 30px' }}>
        <Row className='u-mgt30'>
          <span className='u-mgr10'>整体进度：</span>
          <Tag color={statusColor[reportData && reportData.status + 1000]}>{statusMap[reportData && reportData.status]}</Tag>
        </Row>
        <Row className='u-mgt6'>
          <Progress style={{ width: '300px' }} percent={percent} format={() => `${percent}%（已验收里程碑:${num[0]}/里程碑总数:${num[1]}）`} />
        </Row>
        <div className={`u-mgt30 u-mgb30 ${styles.dashedLine}`}></div>
        <Row className='u-mgb10'>
          <div className="u-mgb20">项目时间线与里程碑：</div>
          {
            <div style={{ marginTop: '-22px' }}>
              <DetailMileStones
                projectPlanning={data}
                projectBasic={data}
                data={data || {}}
                {...this.props}
                type="weekReport"
                updateValue={this.updateValue}
              />
            </div>
          }
        </Row>
      </Col>
    </Row>);
  }
}

export default ReportProgress;
