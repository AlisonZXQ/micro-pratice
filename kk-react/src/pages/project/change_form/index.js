/**
 * @description 已弃用，改v2
 */
import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Button, message, Spin, Divider } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import moment from 'moment';
import { getEditProject, submitChangeFlowEP } from '@services/project';
import { equalsObj } from '@utils/helper';
import EditInfoChange from './components/edit_project_ep/EditInfoChange';
import ChangeProjectFlow from '../project_detail/components/submit_approval/ChangeProjectFlow';
import ChangeReasonForm from './components/ChangeReasonForm';
import styles from './index.less';

const FormItem = Form.Item;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editData: {},
      loading: false,
      changeLoading: false,
      visible: false,
      changeParams: {},

    };
  }

  componentDidMount() {
    const { projectId } = this.props.location.query;
    sessionStorage.setItem('currentPid', projectId);
    this.getEditData();
  }

  getEditData = () => {
    const { projectId } = this.props.location.query;
    this.setState({ loading: true });
    getEditProject(projectId).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ editData: res.result });
        const productid = res.result.product && res.result.product[0] && res.result.product[0].id;
        // 获取级联列表数据
        this.getCascadeList(productid);
        this.props.dispatch({ type: 'createProject/saveProductList', payload: res.result.product });
      }
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.msg);
    });
  }

  getCascadeList = (id) => {
    const params = {
      productid: id,
      type: 1,
    };
    this.props.dispatch({ type: 'projectCascade/getCascadeList', payload: params });
  }

  getCustomFieldsDiff = (editData, params) => {
    const oldObj = {};
    const newObj = {};

    editData.createCustomFileds && editData.createCustomFileds.forEach(it => {
      oldObj[it.id] = it.value && it.value.toString();
    });
    params.createCustomFields && params.createCustomFields.forEach(it => {
      newObj[it.id] = it.value && it.value.toString();
    });
    for (let i in oldObj) {
      if (oldObj[i] !== newObj[i] && newObj[i] && newObj[i].trim().length) {
        return true;
      }
    }
    return false;
  }

  getCascadeDiff = (editData) => {
    const { form: { getFieldsValue }, categoryObj, cascadeList } = this.props;

    const cascadeValueInfoList = editData.cascadeValueInfoList || [];
    const diffCascade = [];
    const newObj = {};
    for (let i in getFieldsValue()) {
      if (i.includes('cascadeField') && getFieldsValue()[i]) {
        const id = Number(i.split('-')[1]);
        newObj[id] = getFieldsValue()[i];
      }
    }

    const oldObj = {};
    cascadeValueInfoList.forEach(it => {
      const arr = oldObj[it.cascadeField.id] || [];
      if (it.cascadeCategory.parentid) {
        arr.push(it.cascadeCategory.id);
      } else {
        arr.unshift(it.cascadeCategory.id);
      }
      oldObj[it.cascadeField.id] = arr;
    });

    const getNewCascadeField = (id) => {
      const obj = cascadeList.find(item => item.cascadeField && item.cascadeField.id === Number(id)) || {};
      return obj.cascadeField;
    };

    const getOldCascadeField = (id) => {
      const obj = cascadeValueInfoList.find(item => item.cascadeField && item.cascadeField.id === Number(id)) || {};
      return obj.cascadeField;
    };

    const getOldObj = (oldValue) => {
      const oldObj = {};
      oldValue.forEach(it => {
        const obj = cascadeValueInfoList.find(item => item.cascadeCategory.id === it) || {};
        oldObj[it] = obj.cascadeCategory;
      });
      return oldObj;
    };

    const getNewObj = (i, newValue) => {
      const arr = categoryObj[i];
      const newObj = {};
      const obj = arr.find(it => it.id === newValue[0]);
      newObj[newValue[0]] = obj;
      if (newValue.length === 2) {
        const children = obj.children.find(it => it.id === newValue[1]);
        newObj[newValue[1]] = children;
      }
      return newObj;
    };

    for (let i in newObj) {
      let oldValue = oldObj[i];
      let newValue = newObj[i];
      if (oldValue && newValue && oldValue.length && newValue.length &&
        !equalsObj(oldValue, newValue)) {
        const data = {
          cascadeFieldId: Number(i),
          cascadeField: getNewCascadeField(i),
          oldValue: oldValue,
          oldValueObj: getOldObj(oldValue),
          newValue: newValue,
          newValueObj: getNewObj(i, newValue),
        };
        diffCascade.push({
          action: 'update',
          data: JSON.stringify(data),
        });
      } else if (oldValue && newValue && oldValue.length && newValue.length &&
        equalsObj(oldValue, newValue)) {
        const data = {
          cascadeFieldId: Number(i),
          cascadeField: getNewCascadeField(i),
          oldValue: oldValue,
          oldValueObj: getOldObj(oldValue),
          newValue: newValue,
          newValueObj: getNewObj(i, newValue),
        };
        diffCascade.push({
          action: 'noChange',
          data: JSON.stringify(data),
        });
      } else if (!oldObj[i]) {
        const data = {
          cascadeFieldId: i,
          cascadeField: getNewCascadeField(i),
          oldValue: null,
          newValue: newValue,
          newValueObj: getNewObj(i, newValue),
        };
        diffCascade.push({
          action: 'add',
          data: JSON.stringify(data),
        });
      }
    }

    for (let i in oldObj) {
      const oldValue = oldObj[i];
      if (!newObj[i] || !newObj[i].length) {
        const data = {
          cascadeFieldId: i,
          cascadeField: getOldCascadeField(i),
          oldValue: oldValue,
          oldValueObj: getOldObj(oldValue),
          newValue: null,
        };
        diffCascade.push({
          action: 'delete',
          data: JSON.stringify(data),
        });
      }
    }

    return diffCascade;
  }

  getUnEqualArr = (editData, params) => {
    const oldDataArr = ['title', 'ownerId', 'priority', 'startTime', 'endTime',
      'departmentId', 'budget', 'description', 'managerIds', 'createCustomFields', 'subProductId'];
    const diffOther = [];

    oldDataArr.forEach(it => {
      if (it === 'ownerId') {
        if (!equalsObj(params[it], editData.owner.id)) {
          diffOther.push({
            field: it,
            oldvalue: editData.owner.id,
            newvalue: params[it],
          });
          // 拿到负责人的人名(owner类型的newvalue暂时用id代替为了变更差异处理)
          diffOther.push({
            field: 'owner',
            oldvalue: editData.owner.name,
            newvalue: params[it],
          });
        }
      } else if (it === 'budget') {
        if (!equalsObj(params[it], editData.budget)) {
          diffOther.push({
            field: it,
            oldvalue: editData.budget,
            newvalue: params[it],
          });
        }
      } else if (it === 'departmentId') {
        if (!equalsObj(params[it], editData.department)) {
          diffOther.push({
            field: it,
            oldvalue: JSON.stringify(editData.department),
            newvalue: JSON.stringify(params[it]),
          });
        }
      } else if (it === 'managerIds') {
        const ids = editData.manager && editData.manager.map(it => it.id);
        if (!equalsObj(params[it].sort(), ids.sort())) {
          diffOther.push({
            field: it,
            oldvalue: JSON.stringify(ids),
            newvalue: JSON.stringify(params[it]),
          });
        }
      } else if (it === 'createCustomFields') {
        // 展示的时候在比较得出高亮字段
        if (this.getCustomFieldsDiff(editData, params)) {
          diffOther.push({
            field: it,
            oldvalue: JSON.stringify(editData.createCustomFileds),
            newvalue: JSON.stringify(params.createCustomFields),
          });
        }
      } else if (params[it] && !equalsObj(params[it], editData[it])) {
        let i = 1;
        if (typeof params[it] === 'string' && !params[it].trim().length) {
          i = 0;
        }
        if (i === 1) {
          diffOther.push({
            field: it,
            oldvalue: editData[it],
            newvalue: params[it],
          });
        }
      }
    });

    return diffOther;
  }

  getObjData = (obj) => {
    obj.data.objectiveId = obj.data.objectiveId;
    obj.data.issueKey = obj.data.issueKey;
    obj.data.priority = obj.data.priorityValue;
    obj.data.productId = obj.data.product && obj.data.product.id;
    obj.data.assigneeId = obj.data.assigneeUser && obj.data.assigneeUser.id;
    obj.data.verifierId = obj.data.verifierUser && obj.data.verifierUser.id;
    return JSON.stringify(obj.data);
  }

  getAimCustomDiff = (newArr, oldArr) => {
    const arr = [];
    newArr && !!newArr.length && newArr.forEach(newItem => {
      const productCustomField = newItem.productCustomField || {};
      const newObjRelation = newItem.objectiveCustomFieldRelation || {};

      if (productCustomField.type === 1 || productCustomField.type === 3) {
        const oldObj = oldArr.find(oldItem => oldItem.productCustomField && newItem.productCustomField && oldItem.productCustomField.id === newItem.productCustomField.id) || {};
        // 兼容为空
        const oldObjRelation = oldObj.objectiveCustomFieldRelation || {};
        // type为1时比较customvalue
        if (newObjRelation.customvalue !== oldObjRelation.customvalue) {
          arr.push(newItem);
        }
        // type为2时比较customfieldvalueid
      } else if (productCustomField.type === 2) {
        const oldObj = oldArr.find(oldItem => oldItem.productCustomField && newItem.productCustomField && oldItem.productCustomField.id === newItem.productCustomField.id) || {};
        // 兼容为空
        const oldObjRelation = oldObj.objectiveCustomFieldRelation || {};
        if (newObjRelation.customfieldvalueid !== oldObjRelation.customfieldvalueid) {
          arr.push(newItem);
        }
      } else if (productCustomField.type === 4 || productCustomField.type === 5) {
        const customfieldvalueid = newObjRelation.customfieldvalueid;
        const flag = oldArr.some(it => it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customfieldvalueid === customfieldvalueid);
        if (!flag) {
          arr.push(newItem);
        }
      }
    });

    return arr;
  }

  getDiffObjectives = (newObjective) => {
    const { editData: { objective } } = this.state;
    const objectiveArr = [];
    const diffArr = ['summary', 'dueDate', 'priorityValue', 'description', 'remark', 'product', 'assigneeUser', 'verifierUser', 'type', 'objectiveCustomFieldRelationInfoList', 'subProductId', 'objectiveStatus'];
    // 删除的
    objective.forEach(it => {
      if (!newObjective.some(item => item.issueKey === it.issueKey)) {
        let obj = {};
        obj.data = it;
        obj.action = 'delete';
        obj.data = this.getObjData(obj);
        objectiveArr.push(obj);
      }
    });

    // 新增的(新建或者下拉选择的)
    newObjective.forEach(it => {
      if (!objective.some(item => item.issueKey === it.issueKey)) {
        const obj = {};
        obj.data = it;
        if (it.issueKey && it.issueKey.includes('ZXQHAPPY')) {
          obj.action = 'create';
        } else {
          obj.action = 'select';
        }
        obj.data = this.getObjData(obj);
        objectiveArr.push(obj);
        // 编辑更改的
      } else {
        const oldObj = objective.find(item => item.issueKey === it.issueKey);
        const obj = {};
        obj.data = {};
        obj.data.issueKey = it.issueKey;
        obj.data.objectiveId = it.objectiveId;

        diffArr.forEach(i => {
          if (i === 'product' || i === 'assigneeUser' || i === 'verifierUser') {
            if (!equalsObj(it[i] && it[i].id, oldObj[i] && oldObj[i].id)) {
              obj.data[i] = it[i];
            }
          } else if (i === 'objectiveCustomFieldRelationInfoList') {
            const arr = this.getAimCustomDiff(it[i], oldObj[i]);
            if (arr.length) {
              obj.data['diffCustom'] = arr;
            }
          } else if (!equalsObj(it[i], oldObj[i])) {
            obj.data[i] = it[i];
          }
        });
        // 等于2是只有issueKey||objectiveId没有更改的
        if (Object.keys(obj.data).length !== 2) {
          obj.action = 'update';
          obj.data = this.getObjData(obj);
          objectiveArr.push(obj);
        }
      }
    });

    return objectiveArr;
  }

  handleUpdate = () => {
    const { projectId } = this.props.location.query;
    const { editData } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      // 项目起止时间在里程碑范围内
      const timelineNodes = (editData.milestoneTimeline && editData.milestoneTimeline.timelineNodes) || [];
      const start = timelineNodes && timelineNodes[0] && timelineNodes[0].dueDate;
      const end = timelineNodes.length > 1 && timelineNodes[timelineNodes.length - 1].dueDate;
      if (start && values.timeRange && values.timeRange[0] && moment(values.timeRange[0]).diff(moment(start).format('YYYY-MM-DD'), 'day') > 0) {
        return message.error(`项目开始时间要早于里程碑最早时间${start}!`);
      }
      if (end && values.timeRange && values.timeRange[1] && moment(values.timeRange[1]).diff(moment(end).format('YYYY-MM-DD'), 'day') < 0) {
        return message.error(`项目结束时间要晚于里程碑最晚时间${end}!`);
      }

      // 级联值
      const cascadeValues = [];
      for (let i in values) {
        if (i.includes('cascadeField') && values[i]) {
          values[i].map(item => {
            cascadeValues.push({
              type: 1, // 1项目 2单据
              resourceid: projectId, // 创建时项目id是0
              cascadefieldid: i.split('-')[1],
              categoryid: item,
            });
          });
        }
      }

      const createCustomFields = []; // 自定义字段
      for (let i in values) {
        if (i.includes('custom')) {
          const obj = (editData &&
            editData.createCustomFileds.find(it => it.customFieldId === Number(i.substring(7))));
          createCustomFields.push({
            customFieldId: i.substring(7),
            id: obj.id,
            value: values[i],
            templateId: values.templateId,
            projectId: editData.id,
          });
        }
      }

      // 可以直接从values拿到的字段不需处理
      const sameWords = ['preReviewer', 'reReviewer', 'title', 'ownerId', 'templateId', 'description', 'priority', 'budget', 'departmentId', 'subProductId', 'reason', 'reasonType'];
      const sameObj = {};
      sameWords.map(it => {
        sameObj[it] = values[it];
      });

      const params = {
        ...sameObj,
        startTime: values.timeRange && values.timeRange[0] && moment(values.timeRange[0]).format('YYYY-MM-DD'),
        endTime: values.timeRange && values.timeRange[1] && moment(values.timeRange[1]).format('YYYY-MM-DD'),
        oldPlannings: editData && editData.planning,
        oldMilestoneTimeline: editData && editData.milestoneTimeline,
        oldObjectives: editData && editData.objective,
        newObjectives: values.objectives,
        createCustomFields,
        id: editData.id,
        productIds: editData.product && editData.product.map(it => it.id),
        diffObjectives: this.getDiffObjectives(values.objectives),
        managerIds: values.managerIds ? [values.managerIds] : [],
        cascadeValues,
      };
      // console.log('params', params);
      this.handleTigger(params);
    });
  }

  handleTigger = (params) => {
    const { workFlow, form: { getFieldsValue } } = this.props;
    const { editData } = this.state;
    // 变更的字段集合
    // 变更需要保存
    // 1.所有改后的other 2.改变的other对象 3.目标变更的对象
    let submitParams = {};
    const newParams = {
      ...params,
      diffOther: this.getUnEqualArr(editData, params),
      diffCascadeField: this.getCascadeDiff(editData),
    };

    // 如果没有任何变更不允许提交提示
    if (!newParams.diffObjectives.length && !newParams.diffOther.length) {
      return message.warn('当前没有任何变更！');
    }

    let arr = [];

    if (workFlow.length) {
      workFlow.forEach(it => {
        if (it.updateStatus === 2) {
          arr.push({
            workflowId: it.workflowNodeId,
            workflowNodeName: it.workflowNodeName,
            userIdList: it.userList.map(it => it.id),
            usergroupIdList: it.usergroupList.map(it => it.id),
          });
        } else {
          arr.push({
            workflowId: it.workflowNodeId,
            workflowNodeName: it.workflowNodeName,
            userIdList: getFieldsValue()[`user-${it.workflowNodeId}`],
            usergroupIdList: getFieldsValue()[`userGroup-${it.workflowNodeId}`],
          });
        }
      });

      // 限制每个审批节点至少有一个人员
      let flagArr = [];
      arr.forEach(it => {
        const con = it.userIdList.concat(it.usergroupIdList);
        if (con && !con.length) {
          flagArr.push(it);
        }
      });

      if (flagArr.length) {
        return message.warn(`${flagArr.map(it => it.workflowNodeName).join(',')}人员不能为空！`);
      }
      submitParams = {
        projectSaveRequestDTO: { ...newParams },
        workflowApplyUserDtoList: arr,
      };
    } else {
      submitParams = {
        projectSaveRequestDTO: { ...newParams },
        workflowApplyUserDtoList: [],
      };
    }

    this.handleSave(submitParams);
  }

  handleSave = (submitParams) => {
    const { form: { getFieldValue } } = this.props;
    const { editData } = this.state;

    const params = {
      projectSaveRequestDTO: {
        ...submitParams.projectSaveRequestDTO,
        reason: getFieldValue('reason'),
      },
      workflowApplyUserDtoList: submitParams.workflowApplyUserDtoList,
    };

    this.setState({ changeLoading: true });
    submitChangeFlowEP(params).then((res) => {
      if (res.code !== 200) {
        this.setState({ changeLoading: false });
        return message.error(`发起变更失败, ${res.msg}`);
      }
      message.success('发起变更成功');
      history.push(`/project/project_change_approval?id=${editData.id}`);
      this.setState({ changeLoading: false });
    }).catch((err) => {
      this.setState({ changeLoading: false });
      return message.error('发起变更异常', err || err.msg);
    });
  }

  render() {
    const { projectId, type } = this.props.location.query;
    const { editData, loading, changeLoading } = this.state;

    return (<Spin spinning={loading}>
      <div className='bgCard' style={{ padding: '2px 16px' }}>
        <div className='bbTitle'><span className='name'>发起项目变更【{type === "todo" ? '进行中' : '已验收'}】</span></div>
        <div className={`f-oa ${styles.formArea}`}>
          <Row className='u-pd20'>
            <EditInfoChange
              form={this.props.form}
              {...this.props}
              editData={editData}
            />

            <Divider />
            <ChangeReasonForm
              form={this.props.form}
            />

            <ChangeProjectFlow
              form={this.props.form}
              data={editData}
            />

            <FormItem style={{ textAlign: "right" }}>
              <Button
                className="u-mgr10"
                type="primary"
                onClick={() => this.handleUpdate()}
                loading={changeLoading}
              >
                发起变更
              </Button>
              <Button onClick={() => history.push(`/project/detail?id=${projectId}`)}>取消</Button>
            </FormItem>
          </Row>
        </div>
      </div>
    </Spin>);
  }
}

const mapStateToProps = (state) => {
  return {
    workFlow: state.project.changeWorkFlow,
    cascadeList: state.projectCascade.cascadeList, // 级联列表
    categoryObj: state.projectCascade.categoryObj,
  };
};
export default connect(mapStateToProps)(Form.create()(index));

