import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Button, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { editMileStone, mileStoneRelate, saveMileStone } from '@services/project';
import SubmitFormMilestone from './components/SubmitFormMilestone';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      mileStone: {},
      mileContentsTemp: [], // mapStateToFileds
    };
  }
  componentDidMount() {
  }

  getAllContents = (plannings) => {
    const list = [];
    plannings && plannings.forEach(it => {
      list.push({
        id: it.id,
        milestoneName: it.milestoneName,
        parentKey: it.issue.parentKey,
        issueKey: it.issue.issueKey,
        projectkey: it.issue.projectkey,
        issuetype: it.issue.issuetype,
        summary: it.issue.summary,
        icon: it.issue.icon,
        status: it.issue.status,
        assignee: it.issue.assignee,
        reporter: it.issue.reporter,
        verifier: it.issue.verifier,
        jiraUrl: it.issue.jiraUrl
      });
    });
    this.props.dispatch({ type: 'createProject/saveAllContents', payload: list });
  }

  getMileStoneIssues = (params) => {
    mileStoneRelate(params).then((res) => {
      if (res.code !== 200) return message.error(`获取里程碑关联单据失败, ${res.msg}`);
      if (res.result) {
        // 现在的方式是已关联的就被过滤，所以要采取这种方式将所有的单据整合起来给saveAllContents
        const concatData = [...res.result.issues].concat([...res.result.relatedIssues]) || [];
        const newDataSource = [];

        concatData.forEach(it => {
          if (!newDataSource.some(item => item.issueKey === it.issueKey)) {
            newDataSource.push(it);
          }
        });
        this.setState({ mileContentsTemp: res.result.relatedIssues }); // 为了渲染

        this.props.dispatch({ type: 'createProject/saveAllContents', payload: newDataSource });
        this.props.dispatch({ type: 'createProject/savePartContents', payload: res.result.relatedIssues });
      }
    }).catch((err) => {
      return message.error('获取里程碑关联单据异常', err || err.msg);
    });
  }

  handleModal = () => {
    // 穿梭框数据预处理
    this.setState({ visible: true });
    const { id, callback, projectId, projectBasic, createData } = this.props;
    if (callback) { // 处理里程碑popover关闭
      callback();
    }
    // 里程碑的id和projectId都存在是已有项目编辑
    if (id && projectId) {
      editMileStone(id).then((res) => {
        if (res.code !== 200) return message.error(`获取时间线失败, ${res.msg}`);
        if (res.result) {
          this.setState({ mileStone: res.result || {} });
        }
      }).catch(err => {
        return message.error('获取时间线异常', err || err.message);
      });

      const params = {
        projectId,
        milestoneId: id,
      };
      this.getMileStoneIssues(params);
    }
    // 只存在projectId是已有项目添加里程碑
    if (!id && projectId && projectBasic) {
      const params = {
        projectId,
      };
      this.getMileStoneIssues(params);
    }

    // 只存在createData是创建项目时编辑里程碑，只存在uuid
    // 创建项目时编辑里程碑
    if (createData) {
      this.props.dispatch({ type: 'createProject/savePartContents', payload: createData.issues });
      this.setState({ mileStone: createData, mileContentsTemp: createData.issues });
    }
  }

  handleOk = () => {
    const { id, projectId } = this.props;

    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (projectId) { // 添加里程碑时只有projectId
        let params = {
          ...values,
          projectId,
          // issueKeys: values.issues.map(it => it.issueKey),
          dueDate: moment(values.dueDate).format('YYYY-MM-DD'),
        };
        if (id) { // 编辑时里程碑id和projectId都存在
          params = {
            ...params,
            id,
          };
        }
        saveMileStone(params).then((res) => {
          if (res.code !== 200) return message.error(`保存/更新时间线失败, ${res.msg}`);
          message.success('保存/更新时间线成功！');
          this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: projectId } });
        }).catch(err => {
          return message.error('保存时间线异常', err || err.message);
        });
      } else { // 创建项目时添加里程碑or更新 目前这个场景不存在了
        const { mileStone } = this.state;
        // const params = {
        //   uuid: (mileStone && mileStone.uuid) ? mileStone.uuid : uuid(),
        //   ...values,
        //   dueDate: moment(values.dueDate).format('YYYY-MM-DD'),
        // };
        // this.props.updateProjectMileStones(params);
        message.success('添加/更新时间线成功！');
      }
      this.props.dispatch({ type: 'createProject/savePartContents', payload: [] });
      this.setState({ visible: false });
    });
  }

  getTitle = (type) => {
    switch (type) {
      case '链接编辑':
      case '图标编辑':
        return '编辑里程碑';
      case '去添加':
      case '添加里程碑':
        return '创建里程碑';
      case '创建时间节点':
        return '创建时间节点';
      case '链接编辑时间线':
      case '编辑':
        return '编辑时间线';
      default: return '';
    }
  }

  getButtonStyle = (type) => {
    const { disabled } = this.props;
    switch (type) {
      case '链接编辑':
      case '链接编辑时间线':
        return (<a onClick={() => this.handleModal()} disabled={disabled} className="u-mgr10">编辑</a>);
      case '编辑':
        return (
          <Button onClick={() => this.handleModal()} disabled={disabled}>{type}</Button>);
      case '去添加':
        return (<a onClick={() => this.handleModal()} className="u-mgr10">{type}</a>);
      case '添加里程碑':
      case '创建时间节点':
        return (<Button type="default" onClick={() => this.handleModal()} disabled={disabled}>{type}</Button>);
      case '图标编辑':
        return (<a onClick={() => this.handleModal()}>编辑</a>);
      default: return '';
    }
  }

  handleCancel = () => {
    this.setState({ visible: false });
    this.props.dispatch({ type: 'createProject/savePartContents', payload: [] });
  }

  render() {
    const { visible, mileStone, mileContentsTemp } = this.state;
    const { type } = this.props;
    return (<span>
      <Modal
        closable={false}
        maskClosable={false}
        title={this.getTitle(type)}
        width={600}
        visible={visible}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <SubmitFormMilestone
          {...this.props}
          mileStone={mileStone}
          mileContentsTemp={mileContentsTemp}
        />
      </Modal>
      {
        this.getButtonStyle(type)
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    mileContents: state.createProject.mileContents,
    projectBasic: state.project.projectBasic,
    timeRange: state.createProject.timeRange,
    hasUsedName: state.createProject.hasUsedName,
    hasSelectContents: state.createProject.hasSelectContents,
  };
};

export default connect(mapStateToProps)(Form.create()(index));

