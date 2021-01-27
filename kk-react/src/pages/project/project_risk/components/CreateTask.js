import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message, Button, Popconfirm } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { getIssueCustom, estimateCost } from '@utils/helper';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { createTaskUnderRisk } from '@services/risk';
import { updateIssueByType } from '@services/requirement';
import CreateTaskForm from '@components/CreateIssues/create_task'; // 创建任务
import { handleShowPersonConfirm } from '@shared/CommonFun';

class CreateTask extends Component {
  state = {
    visible: false,
    subProductList: [],
    loading: false,
  }

  componentDidMount() {

  }

  getProjectBasic = () => {
    const { projectId } = this.props;
    const { id } = this.props.location.query;
    const projectIdConvey = id || projectId;
    if (projectIdConvey) {
      this.props.dispatch({ type: 'project/getProjectBasic', payload: { id: projectIdConvey } });
    }
  }

  componentWillReceiveProps(nextProps) {
  }

  getSelectValue = (id, valueId) => {
    if (valueId) {
      const { customSelect } = this.props;
      const arr = customSelect ? customSelect[id] : [];
      const obj = arr.find(it => it.id === Number(valueId));

      return obj && obj.customvalue;
    }
  }

  getCustomfieldRelationId = (id) => {
    const { taskObj } = this.props;
    const taskCustomFieldRelationInfoList = taskObj.taskCustomFieldRelationInfoList || [];
    const relationList = taskCustomFieldRelationInfoList.map(it => it.taskCustomFieldRelation);

    const obj = relationList.find(it => it.customfieldid === id) || {};
    return obj.id;
  }

  handleOk = (issueRole2ProjectMember) => {
    const { projectId } = this.props;
    const { id } = this.props.location.query;
    const { edit, createType, parentData, parentId, customSelect } = this.props;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect);
      if (values.estimate_cost && estimateCost(values.estimate_cost)) {
        return message.warn('预估工作量不合法！');
      }

      let params = {
        parentid: createType === 'task' ? 0 : parentData.id,
        projectId: Number(id || projectId),
        riskId: createType === 'task' ? parentData.id : 0,
        issuetype: createType === 'task' ? ISSUE_TYPE_JIRA_MAP.TASK : ISSUE_TYPE_JIRA_MAP.SUBTASK,
        ...values,
        moduleid: values.moduleid ? values.moduleid : 0,
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
        issueRole2ProjectMember
      };

      if (edit) {
        params = {
          id: parentData.id,
          ...params,
          parentid: createType === 'task' ? 0 : parentId,
        };
        this.updateIssueByType(params);
      } else if (!edit && createType === 'childtask') {
        this.createTaskUnderRisk(params);
      } else if (!edit && createType === 'task') {
        this.createTaskUnderRisk(params);
      }
    });
  }

  getPlanningData = () => {
    const { from } = this.props;
    const { id } = this.props.location.query;

    if (from && from === 'projectDetail') {
      this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
    }
  }

  updateIssueByType = (params) => {
    this.setState({ loading: true });
    updateIssueByType(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(`更新失败，${res.msg}`);
      message.success('更新成功！');
      this.setState({ visible: false });
      this.props.getRiskList();
      this.getPlanningData(); // 只有项目详情下需要
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`更新异常, ${err || err.message}`);
    });
  }

  createTaskUnderRisk = (params) => {
    const { projectId } = this.props;
    const { id } = this.props.location.query;

    this.setState({ loading: true });
    createTaskUnderRisk(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
      message.success('新建成功！');
      this.setState({ visible: false });
      this.props.getRiskList();
      this.getPlanningData();
      this.props.dispatch({ type: 'project/getProjectMember', payload: { id: id || projectId } });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`新建异常, ${err || err.message}`);
    });
  }

  getTitle = () => {
    const { createType, edit } = this.props;
    if (createType === 'task' && !edit) {
      return '创建任务';
    } else if (createType === 'task' && edit) {
      return '编辑任务';
    } else if (createType === 'childtask' && !edit) {
      return '创建子任务';
    } else if (createType === 'childtask' && edit) {
      return '编辑子任务';
    }
  }

  handleClick = () => {
    const { edit, createType } = this.props;
    this.setState({ visible: true });
    // 编辑的情况获取任务/子任务详情
    this.getProjectBasic();

    if (edit) {
      this.getTaskDetailWithoutRole();
      this.getReqAttachment();
    } else if (!edit && createType === 'childtask') {
      this.getTaskDetailWithoutRole(); // 需要带入版本，子产品的信息
      this.props.dispatch({ type: 'design/saveReqAttachment', payload: [] });
    } else if (!edit && createType === 'task') {
      this.props.dispatch({ type: 'task/saveTaskDetail', payload: {} });
      this.props.dispatch({ type: 'design/saveReqAttachment', payload: [] });
    }
  }

  getTaskDetailWithoutRole = () => {
    const { parentData } = this.props;
    this.props.dispatch({ type: 'task/getTaskDetailWithoutRole', payload: { id: parentData.id } });
  }

  getReqAttachment = () => {
    const { parentData } = this.props;
    const attachmentParams = {
      conntype: 3,
      connid: parentData.id,
    };
    this.props.dispatch({ type: 'design/getReqAttachment', payload: attachmentParams });
  }

  render() {
    const { projectBasic, taskObj, edit, createType, form: { getFieldsValue }, projectMember } = this.props;
    const { visible, loading } = this.state;
    const productid = projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id;
    // 任务创建
    let subProductId = projectBasic.subProductVO && projectBasic.subProductVO.id;
    let taskDetail = {};
    if (edit) { // 编辑
      subProductId = taskObj.subproduct && taskObj.subproduct.id;
      taskDetail = taskObj;
    } else if (!edit && createType === 'childtask') { // 子任务创建需要默认带入任务信息
      subProductId = taskObj.subproduct && taskObj.subproduct.id;
      taskDetail.version = taskObj.version || {};
      taskDetail.product = taskObj.product || {};
      taskDetail.subproduct = taskObj.subproduct || {};
    }

    return (<span onClick={(e) => e.stopPropagation()}>
      <Modal
        title={this.getTitle()}
        visible={visible}
        width={1000}
        onCancel={(e) => { e.stopPropagation(); this.setState({ visible: false }) }}
        destroyOnClose
        okButtonProps={{ loading }}
        maskClosable={false}
        footer={<span className='btn98'>
          <Button onClick={() => this.setState({ visible: false })}>
            取消
          </Button>
          {
            handleShowPersonConfirm(getFieldsValue(), projectMember) ?
              <Popconfirm
                title="是否将单据相关人员加入到项目中?"
                onConfirm={() => this.handleOk(true)}
                onCancel={() => this.handleOk(false)}
                okText="是"
                cancelText="否"
              >
                <Button type="primary">确定</Button>
              </Popconfirm>
              :
              <Button type="primary" onClick={() => this.handleOk(false)} loading={loading}>确定</Button>
          }

        </span>}
      >
        <CreateTaskForm
          {...this.props}
          subProductId={subProductId}
          productid={productid}
          taskDetail={taskDetail}
        />
      </Modal>
      <a onClick={(e) => {
        e.stopPropagation();
        this.handleClick();
      }}>{this.getTitle()}</a>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    projectBasic: state.project.projectBasic,
    customSelect: state.aimEP.customSelect,
    taskObj: state.task.taskDetailWithoutRole,
    reqAttachment: state.design.reqAttachment,
    projectMember: state.project.projectMember
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(CreateTask)));
