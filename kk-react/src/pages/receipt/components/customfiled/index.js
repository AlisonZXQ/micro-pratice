import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Col, Tooltip } from 'antd';
import { connect } from 'dva';
import { getFormLayout, equalsObj } from '@utils/helper';
import { CUSTOME_TYPE_MAP, ISSUE_CUSTOM_USE, CUSTOME_SYSTEM, CUSTOME_REQUIRED } from '@shared/ReceiptConfig';
import Text from './components/Text';
import Select from './components/Select';
import MultiSelect from './components/MultiSelect';
import Cascader from './components/Cascader';
import DatePicker from './components/DatePicker';
import UserSelect from './components/UserSelect';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 12);
const formLayoutSystem = getFormLayout(6, 18);
const detailMap = {
  'advise': 'adviseDetail',
  'requirement': 'requirementDetail',
  'bug': 'bugDetail',
  'task': 'taskDetail',
  'objective': 'objectiveDetail',
  'ticket': 'ticketDetail',
};

class index extends Component {
  state = {
    data: [],
    allOptionsObj: {},
  }

  componentDidMount() {
    if (this.props.customFileds) {
      this.getFilterItems(this.props.customFileds);
      this.getAllSelectOptions(this.props.customFileds);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.customFileds, nextProps.customFileds)) {
      this.getFilterItems(nextProps.customFileds);
      this.getAllSelectOptions(nextProps.customFileds);
    }
  }

  // 更新完自定义字段后刷新
  getRefreshDetail = () => {
    // const { rid, oid, bid, tid, aid } = this.props.location.query;
    const { type } = this.props;
    let detail = this.props[detailMap[type]];
    const issue = detail[type] || {};

    if (type === 'requirement') {
      this.props.dispatch({ type: 'requirement/getReqirementDetail', payload: { id: issue.id } });
    } else if (type === 'objective') {
      this.props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: issue.id } });
    } else if (type === 'task') {
      this.props.dispatch({ type: 'task/getTaskDetail', payload: { id: issue.id } });
    } else if (type === 'bug') {
      this.props.dispatch({ type: 'bug/getBugDetail', payload: { id: issue.id } });
    } else if (type === 'advise') {
      this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: issue.id } });
    }else if(type === 'ticket') {
      this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: issue.id } });
    }
  }

  // 去掉不展示的字段，排序
  getFilterItems = (customData) => {
    let data = [];
    customData.filter(it => it.state === ISSUE_CUSTOM_USE.OPEN) // 过滤掉隐藏的字段
      .map(it => { // 对于sortvalue不存在的特殊处理
        if (!it.sortvalue) {
          it.sortvalue = 0;
        }
        return it;
      })
      .forEach(it => {
        let index = -1;
        index = data.findIndex(item => item.sortvalue < it.sortvalue);
        if (index === -1) {
          data.push(it);
        } else {
          data.splice(index, 0, it);
        }
      });
    this.setState({ data });
  }

  getAllSelectOptions = (customFileds) => {
    const { allOptionsObj } = this.state;

    customFileds && customFileds.forEach(it => {
      if (it.type === CUSTOME_TYPE_MAP.SELECT || it.type === CUSTOME_TYPE_MAP.MULTISELECT || it.type === CUSTOME_TYPE_MAP.CASCADER) {
        const newObj = allOptionsObj;
        newObj[it.id] = it.productCustomFieldValueVOList || [];
        this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: newObj });
        this.setState({ allOptionsObj: newObj });
      }
    });
  }

  getComponent = (it) => {
    const { type } = this.props;
    let detail = this.props[detailMap[type]];
    const issue = detail[type] || {};

    // 1type 单行
    // 2单选（selectui 1平铺， selectui 2下拉）
    // 3多行
    // 4多选（selectui 1平铺， selectui 2下拉）
    // 5级联（parent_selectable 1必须到子节点，2非必须）
    // 9和10是数值
    // 6成员选择
    // 8日期选择
    const { allOptionsObj } = this.state;
    switch (it.type) {
      case CUSTOME_TYPE_MAP.INPUT:
      case CUSTOME_TYPE_MAP.TEXTAREA:
      case CUSTOME_TYPE_MAP.INTERGER:
      case CUSTOME_TYPE_MAP.DECIMAL:
        return <Text {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} issue={issue} detail={detail} />;
      case CUSTOME_TYPE_MAP.DATEPICKER:
        return <DatePicker {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} issue={issue} detail={detail} />;
      case CUSTOME_TYPE_MAP.USERSELECT:
        return <UserSelect {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} issue={issue} detail={detail} />;
      case CUSTOME_TYPE_MAP.SELECT:
        return <Select {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} allOptionsObj={allOptionsObj} issue={issue} detail={detail} />;
      case CUSTOME_TYPE_MAP.MULTISELECT:
        return <MultiSelect {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} allOptionsObj={allOptionsObj} issue={issue} detail={detail} />;
      case CUSTOME_TYPE_MAP.CASCADER:
        return <Cascader {...this.props} data={it} getRefreshDetail={this.getRefreshDetail} allOptionsObj={allOptionsObj} issue={issue} detail={detail} />;
      default: return null;
    }
  }

  getLayout = (it) => {
    const { layout } = this.props;
    let layoutDisplay = layout;
    if (!layoutDisplay) {
      layoutDisplay = it.system === CUSTOME_SYSTEM.SYSTEM ? formLayoutSystem : formLayout;
    }
    return layoutDisplay;
  }

  render() {
    const { span } = this.props;
    const { data } = this.state;


    const getLabel = (text) => {
      return (
        <Tooltip title={text}>
          <span>{text.length > 6 ? `${text.slice(0, 6)}...` : text}</span>
        </Tooltip>
      );
    };

    return (
      <div>
        {
          data && !!data.length && data.map(it => (
            <Col span={span ? span : 24}>
              <FormItem
                label={<span>{it.required === CUSTOME_REQUIRED.REQUIRED && <span className="needIcon">*</span>}{getLabel(it.name)}</span>}
                {...this.getLayout(it)}
              >
                {
                  this.getComponent(it)
                }
              </FormItem>
            </Col>
          ))
        }
      </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
    adviseDetail: state.advise.adviseDetail,
    requirementDetail: state.requirement.requirementDetail,
    taskDetail: state.task.taskDetail,
    bugDetail: state.bug.bugDetail,
    objectiveDetail: state.objective.objectiveDetail,
    ticketDetail: state.ticket.ticketDetail,

    drawerIssueId: state.receipt.drawerIssueId
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
