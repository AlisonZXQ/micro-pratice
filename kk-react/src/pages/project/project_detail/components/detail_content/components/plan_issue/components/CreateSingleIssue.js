import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Modal, Radio, message, Popconfirm } from 'antd';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import CreateRequirement from '@components/CreateIssues/create_requirement'; // 创建需求
import CreateTask from '@components/CreateIssues/create_task'; // 创建任务
import CreateBug from '@components/CreateIssues/create_bug'; // 创建缺陷
import { issue_type_name_map } from '@shared/ReceiptConfig';
import { createIssueAloneWBS } from '@services/project';
import { getFormLayout, getIssueCustom, estimateCost, getMentionUsers } from '@utils/helper';
import { handleShowPersonConfirm } from '@shared/CommonFun';

const RadioGroup = Radio.Group;
const formLayout = getFormLayout(4, 20);
const FormItem = Form.Item;

class CreateSingleIssue extends Component {
  state = {
    visible: false,
    loading: false,
  }

  onChange = (e) => {
    this.setState({ value: e.target.value });
  }

  handleOk = (issueRole2ProjectMember) => {
    const { id } = this.props;
    const { customSelect } = this.props;
    // type story, task, subtask
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const custom_field_values = getIssueCustom(values, customSelect);
      if (values.estimate_cost && estimateCost(values.estimate_cost)) {
        return message.warn('预估工作量不合法！');
      }

      const params = {
        parentid: 0,
        projectId: Number(id),
        issuetype: issue_type_name_map[values.issueType],
        ...values,
        noticeEmailList: getMentionUsers(values.description).map(it => it.email) || [],
        tagnames: values.tagnames ? values.tagnames.join(',') : '',
        moduleid: values.moduleid ? values.moduleid : 0,
        bugtype: values.bugtype ? values.bugtype : 0,
        custom_field_values,
        expect_releasetime: values.expect_releasetime && moment(values.expect_releasetime).valueOf(),
        issueRole2ProjectMember
      };

      this.setState({ loading: true });
      createIssueAloneWBS(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`新建失败，${res.msg}`);
        message.success('新建成功！');
        this.setState({ visible: false });
        this.props.dispatch({ type: 'project/getProjectPlanning', payload: { id: id } });
        this.props.dispatch({ type: 'project/getProjectMember', payload: { id: id } });
        this.getPlanningData();
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`新建异常, ${err || err.message}`);
      });
    });
  }

  // 获取更新后的已选择规划内容
  getPlanningData = () => {
    const { id } = this.props;
    const { productList } = this.props;
    const params = {
      projectId: id,
      products: productList.map(it => it.id),
    };
    this.props.dispatch({ type: 'project/getPlanningData', payload: params });
  }

  getTitle = () => {
    const { form: { getFieldValue } } = this.props;
    if (getFieldValue('issueType')) {
      if (getFieldValue('issueType') === 'story') {
        return '创建需求';
      } else if (getFieldValue('issueType') === 'task') {
        return '创建任务';
      } else {
        return '创建缺陷';
      }
    } else {
      return '创建需求';
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue,
      getFieldsValue, resetFields }, disabled, projectMember } = this.props;
    const { visible, loading } = this.state;

    return (<span>
      <Button onClick={() => this.setState({ visible: true })} disabled={disabled}>创建工作项</Button>
      <Modal
        visible={visible}
        title={this.getTitle()}
        onCancel={() => this.setState({ visible: false })}
        okButtonProps={{ loading }}
        maskClosable={false}
        width={1000}
        destroyOnClose
        bodyStyle={{ paddingTop: '0px' }}
        className="modal-createissue-height"
        footer={<span>
          <Button className="u-mgr10" onClick={() => this.setState({ visible: false })}>取消</Button>
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
              <Button type="primary" onClick={() => this.handleOk(false)}>确定</Button>
          }

        </span>}
      >
        <FormItem label="单据类型" {...formLayout}>
          {
            getFieldDecorator('issueType', {
              initialValue: 'story',
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <RadioGroup onChange={() => resetFields()}>
                <Radio value={'story'}>需求</Radio>
                <Radio value={'task'}>任务</Radio>
                <Radio value={'bug'}>缺陷</Radio>
              </RadioGroup>
            )
          }
        </FormItem>
        {
          getFieldValue('issueType') === 'story' && <CreateRequirement form={this.props.form} {...this.props} />
        }

        {
          getFieldValue('issueType') === 'task' && <CreateTask form={this.props.form} {...this.props} />
        }

        {
          getFieldValue('issueType') === 'bug' && <CreateBug form={this.props.form} {...this.props} />
        }

      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productList: state.product.productList,
    customSelect: state.aimEP.customSelect,
    projectMember: state.project.projectMember
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(CreateSingleIssue)));
