import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Col, message, Row, Card, Checkbox } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import moment from 'moment';
import { saveProject } from '@services/project';
import { PROJECT_ROLE_TYPE } from '@shared/ProjectConfig';
import { CASCADE_TYPE } from '@shared/SystemManageConfig';
import SubmitFormCreate from './components/SubmitFormCreate';
import styles from './index.less';

class index extends Component {
  state = {
    template: [],
    loading: false,
    step: 'first',
  }

  componentDidMount() {
    const { form: { resetFields } } = this.props;
    // 刚进入创建页面需要清空规划内容和里程碑关联内容，时间范围等
    this.props.dispatch({ type: 'createProject/saveAllContents', payload: [] });
    this.props.dispatch({ type: 'createProject/savePartContents', payload: [] });
    this.props.dispatch({ type: 'createProject/saveProductList', payload: [] });
    this.props.dispatch({ type: 'createProject/saveTimeRange', payload: [] });
    this.props.dispatch({ type: 'createProject/saveHasSelectContents', payload: [] });
    resetFields();
  }

  handleSave = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      // 级联值
      const cascadeValues = [];
      for (let i in values) {
        if (i.includes('cascadeField') && values[i]) {
          values[i].map(item => {
            cascadeValues.push({
              type: CASCADE_TYPE.PROJECT, // 1项目 2单据
              resourceid: 0, // 创建时项目id是0
              cascadefieldid: i.split('-')[1],
              categoryid: item,
            });
          });
        }
      }

      const createCustomFields = []; // 自定义字段
      for (let i in values) {
        if (i.includes('custom')) {
          createCustomFields.push({
            customFieldId: i.substring(7),
            value: values[i],
            templateId: values.templateId,
          });
        }
      }
      const { projectContents, selectSubProduct } = this.props;
      const plannings = []; // 项目规划内容
      projectContents && projectContents.map(it => {
        plannings.push({
          issueKey: it.issueKey,
        });
      });

      const newObjectives = [];
      values.objectives && values.objectives.map(it => {
        newObjectives.push({ objectiveId: it.objectiveId });
      });

      const newMileStones = [];

      values.milestones && values.milestones.map(it => {
        newMileStones.push({
          ownerId: it.ownerId,
          name: it.name,
          issueKeys: it.issues && it.issues.map(it => it.issueKey),
          dueDate: it.dueDate,
          description: it.description,
          acceptorId: it.acceptorId,
        });
      });

      // 可以直接从values拿到的字段不需处理
      const sameWords = ['title', 'ownerId', 'productIds',
        'templateId', 'description', 'departmentId', 'budget', 'criteria', 'priority', 'subProductId', 'projectCode'];
      const sameObj = {};
      sameWords.map(it => {
        sameObj[it] = values[it];
      });
      const params = {
        ...sameObj,
        projectRoleType: values.projectRoleType ? PROJECT_ROLE_TYPE.PRODUCTUSER : PROJECT_ROLE_TYPE.NONE,
        startTime: values.timeRange && values.timeRange[0] && moment(values.timeRange[0]).format('YYYY-MM-DD'),
        endTime: values.timeRange && values.timeRange[1] && moment(values.timeRange[1]).format('YYYY-MM-DD'),
        plannings,
        objectives: newObjectives,
        createCustomFields,
        milestones: newMileStones,
        productIds: [values.productIds],
        managerIds: values.managerIds && [values.managerIds],
        datasource: selectSubProduct.datasource,
        cascadeValues
      };

      // 创建项目
      this.setState({ loading: true });
      saveProject(params).then((res) => {
        if (res.code !== 200) {
          this.setState({ loading: false });
          return message.error(`创建项目失败, ${res.msg}`);
        }
        message.success('创建项目成功！');
        if (res.result) {
          history.push(`/project/detail?id=${res.result}`);
          this.setState({ loading: false });
          this.props.dispatch({ type: 'createProject/saveAllContents', payload: [] });
          this.props.dispatch({ type: 'createProject/savePartContents', payload: [] });
        }
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error('创建项目异常', err || err.msg);
      });

    });
  }

  handleToSecondStep = () => {
    const fristStepRequired = ['title', 'productIds', 'subProductId', 'templateId'];
    this.props.form.validateFieldsAndScroll(fristStepRequired, (err, values) => {
      if (err) return;
      this.setState({ step: 'second' });
    });
  }

  getButtons = () => {
    const { form: { getFieldDecorator } } = this.props;
    const { step, loading } = this.state;

    if (step === 'second') {
      return [
        <Button
          className={`u-mgr10 u-mgt10 u-mgb10`}
          onClick={() => this.setState({ step: 'first' })}
        >
          上一步
        </Button>,
        <Button
          onClick={() => this.handleSave()}
          loading={loading}
          type="primary"
          className="u-mgr10"
        >
          确定
        </Button>,
        <Link to='/project/list'>
          <Button>取消</Button>
        </Link>
      ];
    } else {
      return [<span>
        {
          getFieldDecorator('projectRoleType', {
            initialValue: true,
            valuePropName: 'checked',
          })(
            <Checkbox>允许项目所属产品所有成员查看</Checkbox>
          )
        }
      </span>, <Button
        type="primary"
        className={`u-mgr10 u-mgt10 u-mgb10`}
        onClick={() => this.handleToSecondStep()}
        id="next"
      >
        下一步
      </Button>,
      <Link to='/project/list'><Button>取消</Button></Link>];
    }
  }

  render() {
    const { template, step } = this.state;
    return (
      <div className={styles.container}>
        <div className='bbTitle'><span className='name'>创建项目</span></div>
        <Card>
          <Row className="f-fw">

            <Col offset={5} span={12}>
              <SubmitFormCreate
                styles={styles}
                template={template}
                step={step}
                {...this.props}
              />

              <div className="f-tar btn98">
                {this.getButtons()}
              </div>
            </Col>
          </Row>
        </Card>
      </div>

    );
  }
}

const mapStateToProps = (state) => {
  return {
    projectContents: state.createProject.projectContents,
    productList: state.createProject.productList, // 选择的子产品
    productByUser: state.product.productList,
    cascadeList: state.projectCascade.cascadeList, // 级联列表
    categoryObj: state.projectCascade.categoryObj,
    selectSubProduct: state.createProject.selectSubProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(index));

