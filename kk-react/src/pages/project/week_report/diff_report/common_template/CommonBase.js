import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Input, DatePicker, Tag, Divider } from 'antd';
import Progress from '@components/CustomAntd/progress';
import { getFormLayout, deepCopy } from '@utils/helper';
import Modal from '@components/CustomAntd/modal';
import MyIcon from '@components/MyIcon';
import TinyMCE from '@components/TinyMCE';
import TextOverFlow from '@components/TextOverFlow';
import { riskTypeColorMap, riskTypeNameMap, RISK_LEVEL_MAP, priorityMap, MILESTONE_MAP } from '@shared/ProjectConfig';
import DetailMileStones from '@pages/project/project_detail/components/mile_stone';
import { OBJECTIVE_STATUS_MAP } from '@shared/ObjectiveConfig';
import RiskForm from '../../../project_risk/components/RiskForm';
import ReportTextDisplay from '../components/ReportTextDisplay';
import styles from '../index.less';

const formLayout = getFormLayout(4, 16);
const bigFormLayout = getFormLayout(2, 20);
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const controls = [
  'headings', 'list-ul', 'list-ol', 'separator',
  'text-indent', 'separator',
  'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
  'remove-styles', 'separator',
  'link', 'media', 'separator',
  'clear', 'fullscreen', 'table', 'separator',
];

/**
 * @description 通用模版的基本信息包括里程碑进度
 */
class ReportBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      visible: false,
      editData: {}, // 查看风险
    };
  }

  emptyDisplay = (data) => {
    return data ? data : '-';
  }

  getDes = () => {
    const { reportData } = this.props;

    // 这里的getFieldDecorator的默认值恢复有问题，所以这里的富文本都需要这样处理
    // this.props.dispatch({ type: 'design/saveDes', payload: reportData.description });
    return reportData && reportData.description ? reportData.description : '';
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

  getHighLevelRisk = (highRisk) => {
    return highRisk && highRisk.map(it => <div className={`${styles.riskList} f-jcsb-aic`}>
      <span>
        <MyIcon type="icon-gaofengxian" className={styles.highImg} />
        <Divider type="vertical" className="u-mgl65" />
        <TextOverFlow content={<span className={styles.text}>{it.projectRisk && it.projectRisk.name}</span>} maxWidth={'300px'} />
      </span>
      <span>
        <span>负责人：</span>
        <span className={styles.text}>{it.responseUser && it.responseUser.name}</span>
        <a
          className="u-mgl20 u-mgr10"
          onClick={() => this.setState({
            visible: true,
            editData: {
              ...it.projectRisk,
              ...it,
            }
          })}>详情</a>
      </span>

    </div>);
  }

  getMileStoneExcludeTimeLine = (data) => {
    const mileObj = data || {};
    const mileStones = [];
    const timelineNodes = mileObj.timelineNodes || [];
    timelineNodes.forEach(item => {
      const milestones = item.milestones || [];
      milestones.forEach(it => {
        if (it.isRelateIssue || it.relateIssue) {
          mileStones.push(it);
        }
      });
    });
    return mileStones;
  }

  render() {
    const { form: { getFieldDecorator }, actionType, reportData, riskList } = this.props;
    const { visible, editData } = this.state;

    const objectiveData = reportData.objectiveData || [];
    const completeObjective = objectiveData.filter(it => it.objectiveStatus === OBJECTIVE_STATUS_MAP.CLOSE).length;

    const objectiveCompleteRate = objectiveData.length ? ((completeObjective / objectiveData.length) * 100).toFixed(2) : 0;
    const projectData = reportData.projectData || {};
    const reportTimeRange = `${moment(reportData.starttime).format('YYYY-MM-DD')}~${moment(reportData.endtime).format('YYYY-MM-DD')}`;
    const projectTimeRange = `${moment(projectData.startTime).format('YYYY-MM-DD')}~${moment(projectData.endTime).format('YYYY-MM-DD')}`;

    const reportTimeArr = (reportData.starttime && reportData.endtime) ? [moment(reportData.starttime), moment(reportData.endtime)] : undefined;
    const projectTimeArr = (projectData.startTime && projectData.endTime) ? [moment(projectData.startTime), moment(projectData.endTime)] : undefined;

    const mileStoneData = {};
    const projectDetail = {
      status: reportData.status,
      startTime: reportData.projectData && reportData.projectData.startTime,
      endTime: reportData.projectData && reportData.projectData.endTime,
    };
    mileStoneData.projectDetail = projectDetail;
    mileStoneData.milestoneTimeline = this.getStoneData(reportData.milestoneData) || {};

    const mileStoneExcludeTimeLine = this.getMileStoneExcludeTimeLine(reportData.milestoneData) || [];
    const completeStone = mileStoneExcludeTimeLine.filter(it => it.status === MILESTONE_MAP.COMPLETE).length;
    const completeStoneRate = mileStoneExcludeTimeLine.length ? ((completeStone / mileStoneExcludeTimeLine.length) * 100).toFixed(2) : 0;

    const manPowerProgress = Number(reportData.plan_manpower) ? (Number(reportData.act_manpower) / Number(reportData.plan_manpower) * 100).toFixed(2) : 0;

    return (<div className={`bgWhiteModel ${styles.commonBaseContainer}`} style={{ paddingTop: '20px' }}>
      <Row>
        <Col span={12} className="u-form">

          <FormItem label="日期" {...formLayout}>
            {
              actionType === 'view' ?
                reportTimeRange :
                getFieldDecorator('timeRange', {
                  initialValue: reportTimeArr,
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <RangePicker
                    className="f-fw"
                    suffixIcon={<MyIcon type="icon-riqi" />} />
                )
            }
          </FormItem>

          <FormItem label="项目周期" {...formLayout}>
            {
              actionType === 'view' ?
                projectTimeRange :
                getFieldDecorator('projectRange', {
                  initialValue: projectTimeArr,
                })(
                  <RangePicker
                    className="f-fw"
                    suffixIcon={<MyIcon type="icon-riqi" />}
                    disabled
                  />
                )
            }
          </FormItem>

          <FormItem label="人力进度" {...formLayout} >
            <Progress
              percent={manPowerProgress}
              style={{ width: '250px' }}
              size="small"
              status={"active"}
              format={(percent, successPercent) => `${percent}%（实际人力投入:${Number(reportData.act_manpower || 0)}人日/人力预算:${Number(reportData.plan_manpower || 0)}人日）`}
            />
          </FormItem>

          <FormItem label="里程碑进度" {...formLayout}>
            <Progress
              percent={completeStoneRate}
              style={{ width: '250px' }}
              size="small"
              status={"active"}
              format={(percent, successPercent) => `${percent}%（已完成里程碑:${completeStone}/总里程碑数:${mileStoneExcludeTimeLine.length}）`}
            />
          </FormItem>

          <FormItem label="风险等级" {...formLayout}>
            <div>
              <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.HIGH]}>{riskTypeNameMap[RISK_LEVEL_MAP.HIGH]}</Tag>
              <span style={{ color: riskTypeColorMap[RISK_LEVEL_MAP.HIGH] }} className="u-mgr20">{riskList && riskList.filter(it => it.projectRisk && it.projectRisk.level === RISK_LEVEL_MAP.HIGH).length}</span>
              <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.MIDDLE]}>{riskTypeNameMap[RISK_LEVEL_MAP.MIDDLE]}</Tag>
              <span style={{ color: riskTypeColorMap[RISK_LEVEL_MAP.MIDDLE] }} className="u-mgr20">{riskList && riskList.filter(it => it.projectRisk && it.projectRisk.level === RISK_LEVEL_MAP.MIDDLE).length}</span>
              <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.LOW]}>{riskTypeNameMap[RISK_LEVEL_MAP.LOW]}</Tag>
              <span style={{ color: riskTypeColorMap[RISK_LEVEL_MAP.LOW] }}>{riskList && riskList.filter(it => it.projectRisk && it.projectRisk.level === RISK_LEVEL_MAP.LOW).length}</span>
            </div>
            <div>
              {this.getHighLevelRisk(riskList ? riskList.filter(it => it.projectRisk && it.projectRisk.level === RISK_LEVEL_MAP.HIGH) : [])}
            </div>
          </FormItem>
        </Col>

        <Col span={12} className="u-form">
          <FormItem label="项目负责人" {...formLayout} >
            <Input className="f-fw" disabled value={reportData.responseUser && reportData.responseUser.realname} />
          </FormItem>

          <FormItem label="项目优先级" {...formLayout}>
            <Input className="f-fw" disabled value={priorityMap[projectData.priority]} />
          </FormItem>

          <FormItem label="目标完成率" {...formLayout}>
            <Progress
              percent={objectiveCompleteRate}
              size="small"
              style={{ width: '250px' }}
              status={"active"}
              format={(percent, successPercent) => `${percent}%（已完成目标数:${completeObjective}/总目标数:${objectiveData.length}）`}
            />
          </FormItem>
        </Col>
      </Row>

      <FormItem label="项目里程碑" {...bigFormLayout}>
        <DetailMileStones
          projectPlanning={mileStoneData}
          projectBasic={mileStoneData}
          data={mileStoneData || {}}
          {...this.props}
          type="weekReport"
        />
      </FormItem>

      <Row>
        <Col className="u-mgt10">
          <FormItem label="项目详情描述" {...bigFormLayout}>
            {
              actionType === 'view' ?
                <ReportTextDisplay data={reportData && reportData.description} /> :
                getFieldDecorator('description', {
                  initialValue: this.getDes(),
                })(
                  <TinyMCE placeholder="请输入项目详情描述" controls={controls} extend height={450} />,
                )
            }
          </FormItem>
        </Col>
      </Row>

      <Modal
        visible={visible}
        footer={null}
        onCancel={() => this.setState({ visible: false })}
      >
        <RiskForm editData={editData} view {...this.props} />
      </Modal>
    </div>);
  }
}

export default connect()(ReportBase);
