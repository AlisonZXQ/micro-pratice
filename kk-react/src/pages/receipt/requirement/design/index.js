import React, { Component } from 'react';
import { InfoCircleTwoTone } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Steps, Row, Col, Button, message, Popconfirm, Card } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import uuid from 'uuid';
import debounce from 'lodash/debounce';
import { deepCopy } from '@utils/helper';
import { addUemRequirement, updateUemRequirement, uemDemandNotify } from '@services/requirement';
import { connTypeMap, connTypeIdMap, ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { create4RelationIssue } from '@services/receipt';
import { DESIGN_TYPE } from '@shared/RequirementConfig';
import FirstStep from './components/FirstStep';
import SecondStep from './components/SecondStep';
import { diffType, plainOptions, spreadRate, dengji } from './components/shared/Config';
import styles from './index.less';

const { Step } = Steps;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      workHour: {},
      loading: false,
    };
    this.getWorkHour = debounce(this.getWorkHour, 800);
  }

  componentDidMount() {
    const { requirementDetail } = this.props;
    if (Object.keys(requirementDetail).length) {
      this.getDefault(requirementDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(this.props.requirementDetail).length !== Object.keys(nextProps.requirementDetail).length) {
      this.getDefault(nextProps.requirementDetail);
    }

    const { currentStep } = this.state;
    const { form: { getFieldsValue } } = nextProps;
    const { obj } = this.state;
    const arr = ['designType', 'INTERACTION', 'VISION', 'expandType', 'pageNum1', 'pageNum2', 'pageNum3', 'pageNum4', 'pageNum5', 'pageNum6',
      'historyLogic', 'platformNum', 'processDepth', 'cases', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    const newObj = { ...obj };

    // 第二步才会调用时间
    if (currentStep !== 0) {
      arr.forEach(it => {
        if (getFieldsValue()[it] !== newObj[it]) {
          newObj[it] = getFieldsValue()[it];
          this.setState({ obj: newObj }, () => this.handleWorkHour());
        }
      });
    }
  }

  getDefault = (requirementDetail) => {
    const requirement = requirementDetail.requirement || {};
    const params = {
      conntype: 2,
      connid: requirement.id,
    };
    this.props.dispatch({ type: 'design/getByRequirementid', payload: { requirementid: requirement.id } });
    this.props.dispatch({ type: 'design/getReqAttachment', payload: params });
  }

  getFullLink = () => {
    const { issueType, requirementDetail } = this.props;
    const requirement = requirementDetail.requirement || {};

    const params = {
      type: connTypeMap[issueType],
      id: this.props.location.query[connTypeIdMap[issueType]] || requirement.id,
    };
    this.props.dispatch({ type: 'receipt/getRelationLink', payload: params });
  }

  handleWorkHour = () => {
    const { obj } = this.state;

    const params = {};
    const commonArr = ['historyLogic', 'platformNum', 'processDepth', 'cases'];

    if (obj.designType) {
      params['designType'] = plainOptions[obj.designType];
    }
    if (obj.expandType) {
      params['expandType'] = spreadRate[obj.expandType];
    }

    commonArr.forEach(it => {
      if (obj[it]) {
        params[it] = obj[it];
      }
    });

    if (obj.INTERACTION && obj.VISION) {
      params['assignType'] = 'INTERACTION,VISION';
    } else if (!obj.INTERACTION && obj.VISION) {
      params['assignType'] = 'VISION';
    } else {
      params['assignType'] = 'INTERACTION';
    }

    if (obj.designType === 1) {
      const a = obj.pageNum1 || '';
      const flag = (/(^[1-9]\d*$)/.test(a));
      if ((obj.INTERACTION || obj.VISION) && obj.pageNum1 && flag) {
        // 调用接口
        this.getWorkHour({ ...params, pageNum: obj.pageNum1 });
      } else {
        this.props.dispatch({ type: 'design/saveEstimateHour', payload: {} });
      }
    } else if (obj.designType === 2) {
      const a = obj.pageNum2 || '';
      const flag = (/(^[1-9]\d*$)/.test(a));
      if (obj.grade2 && obj.pageNum2 && obj.expandType && flag) {
        this.getWorkHour({ ...params, grade: dengji[obj.grade2], pageNum: obj.pageNum2 });
        // 调用接口
      } else {
        this.props.dispatch({ type: 'design/saveEstimateHour', payload: {} });
      }
    } else {
      const num = obj.designType;
      const a = obj[`pageNum${num}`] || '';
      const flag = (/(^[1-9]\d*$)/.test(a));
      if (obj[`grade${num}`] && obj[`pageNum${num}`] && flag) {
        this.getWorkHour({ ...params, grade: dengji[obj[`grade${num}`]], pageNum: obj[`pageNum${num}`] });
      } else {
        this.props.dispatch({ type: 'design/saveEstimateHour', payload: {} });
      }
    }
  }

  getWorkHour = (params) => {
    const diffParams = this.getDiffParams(params);
    this.props.dispatch({ type: 'design/getEstimateHour', payload: diffParams });
  }

  handleNext = () => {
    const arr = ['name', 'description', 'platform', 'priority', 'dueDate', 'responseId'];
    this.props.form.validateFieldsAndScroll(arr, (err, values) => {
      if (err) return;
      if (values.description === '<p></p>') return message.error('需求描述必填！');
      this.setState({ currentStep: 1 });
    });
  }

  handleBefore = () => {
    this.setState({ currentStep: 0 });
  }

  getOrder = (arr) => {
    const newArr = [];
    arr.forEach(it => {
      if (newArr.every(item => item.count <= it.count)) {
        newArr.unshift(it);
      } else if (newArr.every(item => item.count >= it.count)) {
        newArr.push(it);
      } else {
        const index = newArr.findIndex(item => item.count < it.count);
        newArr.splice(index, 0, it);
      }
    });
    return newArr;
  }

  setLocalStorage = (data) => {
    const oldObj = localStorage.getItem('designUser') ? JSON.parse(localStorage.getItem('designUser')) : {};
    let newObj = { ...oldObj };
    for (let i in data) {
      let newArr = [];
      if (i.includes('interUser') || i.includes('visionUser')) {

        const record = data[i];
        const oldArr = oldObj[i] || [];
        newArr = [...oldArr];
        if (oldArr.some(it => it.email && record.email && it.email === record.email)) {
          const index = oldArr.findIndex(it => it.email === record.email);
          const obj = oldArr.find(it => it.email === record.email);
          const newObj = { ...data[i], count: obj.count + 1 };
          newArr.splice(index, 1, newObj);
        } else if (data[i]){
          newArr.push({ ...data[i], count: 1 });
        }
        const orderArr = this.getOrder(newArr);
        newObj[i] = orderArr;
      }
    }
    localStorage.setItem('designUser', JSON.stringify(newObj));
  }

  setLocalStorageSize = (data) => {
    const localSize = localStorage.getItem('designSize') ? JSON.parse(localStorage.getItem('designSize')) : [];
    const arr = [...localSize];
    if (data.size) {
      data.size.forEach(it => {
        if (!arr.some(item => item === it)) {
          arr.push(it);
        }
      });
      localStorage.setItem('designSize', JSON.stringify(arr));
    }
  }

  getDiffParams = (data) => {
    const { form: { getFieldsValue } } = this.props;
    let params = {};

    const num = getFieldsValue().designType;
    for (let i in data) {
      if (diffType[`designType${num}`].some(it => it.includes(i))) {
        params[i] = data[i];
      }
    }

    return params;
  }

  getChannel = () => {
    const { form: { getFieldsValue }, channelObj } = this.props;
    const channelList = channelObj.channelList;

    const selectSize = getFieldsValue().selectSize || [];
    const addSize = getFieldsValue().addSize || [];
    const arr = [];
    let sizeMap = {};
    // 处理选择的已有处理
    selectSize.forEach(it => {
      let obj = {};
      if (it.id.includes('source')) {
        const sourceId = Number(it.id.split('-')[1]);
        const sourceObj = channelList.find(item => item.id === sourceId);
        obj.id = sourceId;
        obj.name = it.name;
        obj.sizeList = sourceObj.sizeList;
        arr.push(obj);
      } else if (it.id.includes('size')) {
        const sourceId = Number(it.id.split('-')[1]);
        const sizeId = Number(it.id.split('-')[2]);
        const arr = sizeMap[sourceId] ? sizeMap[sourceId] : [];
        sizeMap[sourceId] = deepCopy(arr, []);
        sizeMap[sourceId].push({
          id: sizeId,
          name: it.name,
          description: it.description,
        });
      }
    });

    for (let i in sizeMap) {
      const obj = channelList.find(item => item.id === Number(i)) || {};
      arr.push({
        id: Number(i),
        name: obj.name,
        sizeList: sizeMap[i],
      });
    }

    // 处理自定义尺寸
    if (addSize && !!addSize.length) {
      arr.push({
        id: `ZXQHAPPYSIZE-${uuid()}`,
        name: '自定义',
        sizeList: addSize,
      });
    }

    return arr;
  }

  handleSubmit = () => {
    const { form: { getFieldValue, getFieldsValue }, uemReqInfo, workHour, spreadEdit } = this.props;
    const reqid = uemReqInfo && uemReqInfo.requirementInfo && uemReqInfo.requirementInfo.requirement && uemReqInfo.requirementInfo.requirement.id;
    const uemid = uemReqInfo && uemReqInfo.uemRequirement && uemReqInfo.uemRequirement.id;

    let arr = [];
    const designTypeNum = getFieldValue('designType');
    arr = diffType[`designType${designTypeNum}`];

    this.props.form.validateFieldsAndScroll(arr, (err, values) => {
      if (err) return;
      if (designTypeNum === DESIGN_TYPE.PRODUCT_DESIGN && !(values.INTERACTION || values.VISION)) {
        return message.error('指派设计师必填!');
      }

      if (designTypeNum === DESIGN_TYPE.SPREAD_DESIGN) {
        if (spreadEdit) {
          return message.warn('请先保存常用尺寸!');
        }
        let flag = true;
        if (values.addSize && values.addSize.length) {
          flag = false;
        }
        if (values.selectSize && values.selectSize.length) {
          flag = false;
        }
        if (flag) {
          return message.warn('推广尺寸必填!');
        }
      }

      const diffOtherParams = this.getDiffParams(getFieldsValue());
      let diffParams = diffOtherParams;
      // 如果是推广设计加入尺寸相关的数据
      if (designTypeNum === DESIGN_TYPE.SPREAD_DESIGN) {
        diffParams = {
          ...diffOtherParams,
          channel: this.getChannel(),
          addSize: getFieldsValue().addSize,
          selectSize: getFieldsValue().selectSize,
          size: [],
        };
      }

      this.setLocalStorage(getFieldsValue());
      this.setLocalStorageSize(getFieldsValue());

      if (uemid) { // 更新
        const params = {
          ...diffParams,
          dueDate: getFieldsValue().dueDate && moment(getFieldsValue().dueDate).format('YYYY-MM-DD'),
          workHour,
        };

        const newParams = {
          id: uemid,
          data: JSON.stringify(params),
        };

        this.setState({ loading: true });
        updateUemRequirement(newParams).then((res) => {
          if (res.code !== 200) {
            this.setState({ loading: false });
            return message.error(res.msg);
          }
          this.handleTask(res.result.id, params);
          this.setState({ loading: false, currentStep: 2 });
        }).catch((err) => {
          this.setState({ loading: false });
          return message.error(err || err.msg);
        });

      } else if (reqid) { // 新建

        const params = {
          ...diffParams,
          dueDate: getFieldsValue().dueDate && moment(getFieldsValue().dueDate).format('YYYY-MM-DD'),
          workHour,
        };

        const newParams = {
          requirementid: reqid,
          data: JSON.stringify(params),
        };

        this.setState({ loading: true });
        addUemRequirement(newParams).then((res) => {
          if (res.code !== 200) {
            return message.error(res.msg);
          }
          if (res.result) {
            this.handleTask(res.result.id, params);
          }

        }).catch((err) => {
          this.setState({ loading: false });
          return message.error(err || err.msg);
        });
      }
    });
  }

  // 只有需求可以创建设计任务
  handleTask = (uemid, data) => {
    const { form: { getFieldsValue }, currentUser, objectiveDetail, requirementDetail, issueType } = this.props;
    let detail = issueType === 'requirement' ? requirementDetail : objectiveDetail;
    const productid = detail && detail.product && detail.product.id;
    const subProductId = detail && detail.subproduct && detail.subproduct.id;
    const requirementBasic = detail.requirement || {};
    const objectiveBasic = detail.objective || {};
    const basic = issueType === 'requirement' ? requirementBasic : objectiveBasic;

    const email = currentUser.user && currentUser.user.email;
    let interEmail = '';
    let visionEmail = '';
    for(let key in data) {
      if (key.includes('interId')) {
        interEmail = data[key] || '';
      } else if (key.includes('visionId')) {
        visionEmail = data[key] || '';
      }
    }

    const visionParams = {
      parentIssueType: connTypeMap[issueType],
      parentIssueId: this.props.location.query[connTypeIdMap[issueType]] || basic.id,
      parentid: 0,
      productid,
      subProductId,
      moduleid: 0,
      name: `【视觉】${data.name}`,
      expect_releasetime: getFieldsValue().dueDate && moment(getFieldsValue().dueDate).valueOf(),
      estimate_cost: data.workHour && data.workHour.vision && data.workHour.vision.max,
      description: data.description,
      responseemail: visionEmail,
      submitemail: email,
      requireemail: '',
      level: data.priority,
      // jirakey: basic.jirakey,
      custom_field_values: [],
      attachments: [],
      // epic: basic.epic,
      system_estimate_cost: data.workHour && data.workHour.vision && `${data.workHour.vision.min}-${data.workHour.vision.max}`,
      tasktype: 2,
      fixversionid: 0,
      issuetype: ISSUE_TYPE_JIRA_MAP.TASK,
    };

    const interParams = {
      ...visionParams,
      name: `【交互】${data.name}`,
      estimate_cost: data.workHour && data.workHour.interaction && data.workHour.interaction.max,
      system_estimate_cost: data.workHour && data.workHour.interaction && `${data.workHour.interaction.min}-${data.workHour.interaction.max}`,
      responseemail: interEmail,
    };

    if (data.designType === DESIGN_TYPE.PRODUCT_DESIGN && interEmail) {
      this.handleSaveTask(uemid, interParams);
    }
    if (visionEmail) {
      this.handleSaveTask(uemid, visionParams);
    }
  }

  handleSaveTask = (uemid, params) => {
    create4RelationIssue(params).then((res) => {
      if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
      message.success('创建设计任务成功！');
      this.getFullLink();
      this.uemDemandNotify(uemid, res.result);
      this.props.closeModal();
      this.setState({ loading: false, currentStep: 2 });
    }).catch((err) => {
      return message.error(`新建异常, ${err || err.message}`);
    });
  }

  uemDemandNotify = (uemrequirementid, demandId) => {
    const params = {
      uemrequirementid,
      demandId,
    };
    uemDemandNotify(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getFormatDate = (min, max, type) => {
    const minDay = min / 8;
    const minHour = min % 8;

    const maxDay = max / 8;
    const maxHour = max % 8;

    return (<span style={{ color: '#FF852D', fontSize: type === 'system' ? '20px' : '14px', fontWeight: '600px' }}>
      {minDay >= 1 ? <span>{parseInt(minDay)}天 </span> : ''}
      {minHour > 0 ? <span>{minHour.toFixed(1)}小时</span> : ''}

      {
        min !== max &&
        <span>
          {(minDay >= 1 || minHour > 0) ? '~' : ''}
          {maxDay >= 1 ? <span>{parseInt(maxDay)}天 </span> : ''}
          {maxHour > 0 ? <span>{maxHour.toFixed(1)}小时</span> : ''}
        </span>
      }
    </span>);
  };

  getTime = () => {
    const { workHour } = this.props;
    const interMax = workHour.interaction ? workHour.interaction.max : 0;
    const interMin = workHour.interaction ? workHour.interaction.min : 0;
    const visionMax = workHour.vision ? workHour.vision.max : 0;
    const visionMin = workHour.vision ? workHour.vision.min : 0;

    const totalMax = interMax + visionMax;
    const totalMin = interMin + visionMin;

    return (
      <div className={styles.time}>
        {(totalMax || totalMin) ?
          <div>
            系统预估总耗时：{this.getFormatDate(totalMin, totalMax, 'system')}
         （
            {
              workHour.interaction && <span>交互：{this.getFormatDate(interMin, interMax, 'inter')}</span>
            }
            {
              workHour.interaction && workHour.vision && '；'
            }
            {
              workHour.vision && <span>视觉{this.getFormatDate(visionMin, visionMax, 'vision')}</span>
            }
          ）
            <div className="f-fs1"><InfoCircleTwoTone className="u-mgr5 f-fs2" />
            当前为系统预估工时，设计师评审后可能会有变动，请以最终确认的预估工时为准
            </div>
          </div> :
          <div>系统预估总耗时：--</div>
        }
      </div>
    );
  }

  getFooter = () => {
    const { currentStep, loading } = this.state;

    if (currentStep === 0) {
      return (<div className={styles.foot}>
        <Button type="primary" className="u-mgr10" onClick={() => this.handleNext()}>
          <a href="#second">下一步</a>
        </Button>
        <Popconfirm
          title="取消后已填写信息将不被保留，确认退出吗？"
          onConfirm={() => this.props.closeModal()}
          okText="退出"
          cancelText="不退出"
        >
          <Button>取消</Button>
        </Popconfirm>
      </div>);
    } else {
      return (<div className={styles.foot}>
        <Button type="primary" className="u-mgr10" onClick={() => this.handleSubmit()} loading={loading}>提交</Button>
        <Popconfirm
          title="取消后已填写信息将不被保留，确认退出吗？"
          onConfirm={() => this.props.closeModal()}
          okText="退出"
          cancelText="不退出"
        >
          <Button className="u-mgr10">取消</Button>
        </Popconfirm>
        <Button onClick={() => this.handleBefore()}>
          <a href="#first">上一步</a>
        </Button>
      </div>);
    }
  }

  render() {
    const { uemReqInfo } = this.props;
    const { currentStep } = this.state;
    const uemData = uemReqInfo && uemReqInfo.uemRequirement && uemReqInfo.uemRequirement.data && JSON.parse(uemReqInfo.uemRequirement.data);
    const reqData = uemReqInfo && uemReqInfo.requirementInfo;

    return (<div className={styles.allFormBottom} style={{ background: '#F4F4F4' }}>
      <Card className={styles.stepCardStyle}>
        <Row>
          <Col offset={6} span={12}>
            <Steps current={currentStep}>
              <Step title="需求内容描述" key="0" />
              <Step title="设计要求及评估" key="1" />
            </Steps>
          </Col>
        </Row>
      </Card>

      <Row className={currentStep === 0 ? styles.contentFirst : styles.contentSecond}>
        {/* 保证回退或者下一步数据还在 */}
        <span style={{ display: currentStep === 0 ? 'block' : 'none' }} id="first">
          <FirstStep form={this.props.form} {...this.props} data={uemData} reqData={reqData} />
        </span>
        <span style={{ display: currentStep !== 0 ? 'block' : 'none' }} id="second">
          <SecondStep form={this.props.form} {...this.props} data={uemData} reqData={reqData} />
        </span>
      </Row>

      <div>
        {currentStep !== 0 && this.getTime()}
        {this.getFooter()}
      </div>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    objectiveDetail: state.objective.objectiveDetail,
    requirementDetail: state.requirement.requirementDetail,
    workHour: state.design.workHour,
    reqAttachment: state.design.reqAttachment,
    uemReqInfo: state.design.uemReqInfo,
    channelObj: state.design.channelObj,
    channelAll: state.design.channelAll,
    spreadEdit: state.design.spreadEdit,
    currentUser: state.user.currentUser,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
