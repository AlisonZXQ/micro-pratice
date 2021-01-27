import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Button, Modal, Row, Col, Input, Select, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { updateStatusJiraToEp, deleteStatusJiraToEp, updateSingleStatusJiraToEp } from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { nameMap, issueTypeArr } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(9, 15);

class JiraToEp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };

    this.columns = [{
      title: 'jira状态ID',
      dataIndex: 'jirastatusid',
    }, {
      title: 'jira状态名称',
      dataIndex: 'jirastatusname',
    }, {
      title: 'EP状态',
      dataIndex: 'kkstatus',
      width: 400,
      render: (text, record) => {
        const { activeKey } = this.props;
        const epStatusObj = nameMap[activeKey];

        return (
          !this.state[`${record.id}`] ?
            <div className={styles.status} onClick={() => { this.setState({ [`${record.id}`]: true }); this.getJiraStatus() }}>
              {epStatusObj[Number(text)]}
            </div>
            :
            <Select
              style={{ width: 300 }}
              placeholder="请选择"
              defaultValue={Number(text)}
              onSelect={(value) => this.handleChangeStatus(record, value)}
            >
              {
                Object.keys(epStatusObj).map(item => <Option key={Number(item)} value={Number(item)}>
                  {epStatusObj[Number(item)]}
                </Option>)
              }
            </Select>
        );
      }
    }];
  }

  componentDidMount() {
    const { activeKey } = this.props;
    this.getJiraToEp(activeKey);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeKey !== nextProps.activeKey) {
      this.getJiraToEp(nextProps.activeKey);
    }
  }

  handleChangeStatus = (record, value) => {
    const params = {
      id: record.id,
      kkstatus: value,
    };
    updateSingleStatusJiraToEp(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('状态更新成功!');
      this.getJiraToEp();
      this.setState({ [`${record.id}`]: false });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getJiraToEp = (activeKey) => {
    const { subProductId } = this.props.location.query;
    const params = {
      subProductId,
      issuetype: activeKey || this.props.activeKey,
    };
    this.props.dispatch({ type: 'productSetting/getJiraToEp', payload: params });
  }

  getJiraStatus = () => {
    const { subProductId } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getAllJiraStatus', payload: { subProductId } });
  }

  getModalContent = () => {
    const { jiraStatus, form: { getFieldDecorator }, activeKey } = this.props;
    const statusObj = jiraStatus.find(it => Number(it.id) === activeKey) || {};
    const satusArr = statusObj.statuses || [];
    const epStatusObj = nameMap[activeKey];

    return (satusArr.map(it => <Row className="u-mgb10">
      <Col span={3}>jira状态ID：</Col>
      <Col span={4}><Input value={it.id} disabled /></Col>
      <Col span={4}>jira状态名称：</Col>
      <Col span={4}><Input value={it.name} disabled /></Col>
      <Col span={9}>
        <FormItem label="EP状态值：" {...formLayout}>
          {
            getFieldDecorator(`${it.name}-${it.id}`, {
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <Select style={{ width: 150 }} placeholder="请选择">
                {
                  Object.keys(epStatusObj).map(item => <Option key={item} value={item}>
                    {epStatusObj[Number(item)]}
                  </Option>)
                }
              </Select>
            )
          }
        </FormItem>
      </Col>
    </Row>));
  }

  handleOk = () => {
    const { subProductId } = this.props.location.query;
    const { jiraStatus, activeKey } = this.props;
    const statusObj = jiraStatus.find(it => Number(it.id) === activeKey) || {};
    const satusArr = statusObj.statuses || [];

    this.props.form.validateFields((err, values) => {
      if (err) return;

      const arr = [];
      satusArr.forEach(it => {
        arr.push({
          subProductId,
          issuetype: activeKey,
          jirastatusid: it.id,
          jirastatusname: it.name,
          kkstatus: values[`${it.name}-${it.id}`]
        });
      });
      arr.forEach((it, index) => {
        this.updateStatusJiraToEp(it, index, arr);
      });

    });
  }

  updateStatusJiraToEp = (params, index, arr) => {
    updateStatusJiraToEp(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (index === arr.length - 1) {
        message.success('更新状态成功！');
        this.setState({ visible: false });
        this.getJiraToEp();
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    const { subProductId } = this.props.location.query;
    const { activeKey } = this.props;
    const obj = issueTypeArr.find(it => Number(it.key) === activeKey);
    const params = {
      subProductId,
      issuetype: activeKey,
    };
    const that = this;
    deleteModal({
      title: `您确认要清空当前【${obj.name}】JIRA -> EP 的状态映射配置吗?`,
      okCallback: () => {
        deleteStatusJiraToEp(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('清空映射状态成功！');
          that.getJiraToEp();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  render() {
    const { jiraToEp } = this.props;
    const { visible } = this.state;

    return (<span>
      <div className="u-mgt10 f-tar u-mgb10">
        {
          jiraToEp.length ?
            <Button type="primary" onClick={() => this.handleDelete()} className="u-mgr20">清空</Button>
            :
            <Button type="primary" onClick={() => { this.getJiraStatus(); this.setState({ visible: true }) }} className="u-mgr20">从JIRA直接同步</Button>
        }
      </div>

      <Table
        columns={this.columns}
        dataSource={jiraToEp}
        className="u-mg20"
        pagination={false}
      />

      <Modal
        title="映射表配置"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={800}
        onOk={() => this.handleOk()}
        destroyOnClose
        maskClosable={false}
      >
        {
          this.getModalContent()
        }
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    jiraToEp: state.productSetting.jiraToEp,
    jiraStatus: state.productSetting.jiraStatus,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(JiraToEp)));
