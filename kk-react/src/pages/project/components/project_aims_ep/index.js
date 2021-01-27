import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message, Button, Popconfirm } from 'antd';
import { connect } from 'dva';
import { dateToTime, getIssueCustom, getMentionUsers } from '@utils/helper';
import { getObjectiveDetailEP, updateObjectiveEP, addProjectObjective, aimCreateFromProject } from '@services/project';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import { OBJECTIVE_STATUS_MAP } from '@shared/ObjectiveConfig';
import { handleShowPersonConfirm } from '@shared/CommonFun';
import ExistAims from './components/ExistAims';
import NewAims from './components/NewAims';

/**
 * @desc 项目详情页创建目标，关联目标
 * @param isNotChange - 当前是否是变更目标阶段，项目的状态非DOING
 */
class index extends Component {
  state = {
    visible: false,
    aimData: {},
    loading: false,
    confirmVisible: false,
  }

  componentDidMount() {
  }

  getCustomfieldvalueid = (id, value) => {
    const { customSelect } = this.props;
    const arr = customSelect[id];
    const obj = arr.find(it => it.id === value) || {};
    return obj.customvalue;
  }

  /**
   *
   * @param {*} flag - 是否将单据相关人员添加到项目中
   */
  handleOk = (updateProjectAims, issueRole2ProjectMember) => {
    const { projectId, isNotChange } = this.props;
    const { type } = this.state;

    this.props.form.validateFieldsAndScroll((err, values) => {

      if (err) return;
      let params = {};
      if (type === 'exist' && !!values.exist) {
        // 这里需要保存全集的数据
        params = {
          objectiveId: values.exist && values.exist.id && values.exist.id,
          projectId: projectId,
          issueRole2ProjectMember,
        };
        addProjectObjective(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('添加已有目标成功！');
          this.props.handleObjectiveCallback();
          if (isNotChange) {
            this.props.dispatch({ type: 'project/getProjectMember', payload: { id: projectId } });
          }
        }).catch(err => {
          return message.error(err || err.message);
        });
        this.setState({ visible: false });
      }

      if (type === 'new') {
        // 1.调取jira必填字段 2.创建jira目标 3.创建EP目标
        this.setState({ loading: true });
        this.handleCreateAim({
          ...values,
          issueRole2ProjectMember,
        });
      }

      // 暂时没有了，变更改版后
      if (type === 'update') {
        this.handleUpdateAim(values);
      }
    });
  }

  // 创建ep目标
  handleCreateAim = (values) => {
    const { currentUser, customSelect, projectId, isNotChange } = this.props;
    const userEmail = currentUser && currentUser.user && currentUser.user.email;

    const custom_field_values = getIssueCustom(values, customSelect); // 自定义字段

    const descriptionMentions = getMentionUsers(values.description).map(it => it.email) || [];
    const remarkMentions = getMentionUsers(values.remark).map(it => it.email) || [];

    const params = {
      ...values,
      noticeEmailList: descriptionMentions.concat(remarkMentions),
      expect_releasetime: values.expect_releasetime && dateToTime(values.expect_releasetime),
      submitemail: userEmail,
      custom_field_values,
      issuetype: ISSUE_TYPE_JIRA_MAP.OBJECTIVE,
      moduleid: 0,
      tagnames: '',
      projectId
    };

    aimCreateFromProject(params).then((res) => {
      if (res.code !== 200) {
        this.setState({ loading: false });
        return message.error(`创建目标失败，${res.msg}`);
      }
      message.success('创建目标成功！');
      if (isNotChange) {
        this.props.dispatch({ type: 'project/getProjectMember', payload: { id: projectId } });
      }
      this.props.handleObjectiveCallback();
      this.setState({ visible: false, loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  // 更新目标
  handleUpdateAim = (values) => {
    const { customSelect, currentUser } = this.props;
    const { aimData } = this.state;
    const userEmail = currentUser && currentUser.user && currentUser.user.email;
    const valueList = aimData.objectiveCustomFieldRelationInfoList;
    const custom_field_values = getIssueCustom(values, customSelect, valueList); // 自定义字段

    const descriptionMentions = getMentionUsers(values.description).map(it => it.email) || [];
    const remarkMentions = getMentionUsers(values.remark).map(it => it.email) || [];

    const params = {
      ...values,
      expect_releasetime: values.expect_releasetime && dateToTime(values.expect_releasetime),
      submitemail: userEmail,
      noticeEmailList: descriptionMentions.concat(remarkMentions),
      id: aimData && aimData.objective && aimData.objective.id,
      custom_field_values: JSON.stringify(custom_field_values),
    };

    this.setState({ loading: true });
    updateObjectiveEP(params).then((res) => {
      if (res.code !== 200) {
        this.setState({ loading: false });
        return message.error(`更新目标失败，${res.msg}`);
      }
      message.success('更新目标成功！');
      if (res.result) {
        const obj = {
          objectiveId: res.result.objective.id,
          summary: res.result.objective.name,
          jiraUrl: '',
        };
        this.props.updateProjectAims(obj);
      }
      this.setState({ visible: false, loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  // 调用接口获取目标信息
  handleUpdateMsg = () => {
    const { issueKey, changeData } = this.props;
    const objectiveStatus = changeData && changeData.objectiveStatus;

    // 编辑项目已经取消的目标的不可编辑
    if (objectiveStatus && objectiveStatus === OBJECTIVE_STATUS_MAP.CANCLE) {
      return message.warn(`取消状态下的目标不可编辑！`);
    }

    this.setState({ type: 'update', visible: true });
    if (issueKey) {
      getObjectiveDetailEP({ id: issueKey }).then((res) => {
        if (res.code !== 200) return message.error(`获取目标信息失败，${res.msg}`);
        if (res.result) {
          this.setState({ aimData: res.result || {} });
        }
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  render() {
    const { isNotChange, type, currentUser } = this.props;
    const { visible, aimData, loading, type: currentSelectType } = this.state;

    const { form, form: { getFieldsValue }, updateProjectAims, projectMember } = this.props;
    const exist = getFieldsValue().exist || {};
    const userEmail = currentUser && currentUser.user && currentUser.user.email;
    let values =
      currentSelectType === 'exist' ?
        {
          requireemail: exist.verifierUser && exist.verifierUser.email,
          responseemail: exist.assigneeUser && exist.assigneeUser.email,
          submitemail: exist.reportUser && exist.reportUser.email,
        }
        :
        {
          ...getFieldsValue(),
          submitemail: userEmail,
        };
    return (<span>
      <Modal
        title={type === 'new' ?
          '创建项目目标'
          :
          type === 'exist' ? '添加已有目标' : '更新项目目标'
        }
        visible={visible}
        maskClosable={false}
        width={800}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
        footer={<span>
          <Button onClick={() => this.setState({ visible: false })} className="u-mgr10">取消</Button>
          {
            isNotChange && handleShowPersonConfirm(values, projectMember) && currentSelectType !== 'update' ?
              <Popconfirm
                title="是否将单据相关人员加入到项目中?"
                onConfirm={() => this.handleOk(updateProjectAims, true)}
                onCancel={() => this.handleOk(updateProjectAims, false)}
                okText="是"
                cancelText="否"
              >
                <Button type="primary" loading={loading}>确定</Button>
              </Popconfirm>
              :
              <Button type="primary" onClick={() => this.handleOk(updateProjectAims, false)} loading={loading}>确定</Button>
          }
        </span>}
        okButtonProps={{ loading }}
        className={type === 'new' ? "modal-createissue-height" : ''}
      >
        {
          type === 'exist' ?
            <ExistAims form={form} {...this.props} /> :
            <NewAims form={form} {...this.props} aimData={aimData} />
        }
      </Modal>
      <span>
        {
          type === 'new' &&
          <span onClick={() => this.setState({ type: 'new', visible: true })} className="u-mgr10 menuItem">创建目标</span>
        }
        {
          type === 'exist' &&
          <span onClick={() => this.setState({ type: 'exist', visible: true })} className="menuItem">添加目标</span>
        }
      </span>
    </span>);
  }
}
const mapStateToProps = (state) => {
  return {
    productList: state.createProject.productList, // 都需要与关联产品绑定
    productByUser: state.product.productList,
    currentUser: state.user.currentUser,
    customSelect: state.aimEP.customSelect,
    projectMember: state.project.projectMember,
  };
};

export default connect(mapStateToProps)(Form.create()(index));

