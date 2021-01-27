import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Button, Modal, Row, Col, Input, Select, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { updateStatusEpToJira, deleteStatusEpToJira, updateSingleStatusEpToJira } from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import { nameMap, issueTypeArr } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(9, 15);

class EpToJira extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };

    this.columns = [{
      title: 'EP状态',
      dataIndex: 'kkstatus',
    }, {
      title: 'EP状态名称',
      dataIndex: 'kkname',
      render: (text, record) => {
        const { activeKey } = this.props;
        const id = record.kkstatus;
        return nameMap[activeKey][id] ? nameMap[activeKey][id] : '-';
      }
    }, {
      title: 'Jira状态',
      dataIndex: 'jirastatusid',
      width: 400,
      render: (text, record) => {
        const { jiraStatus, activeKey } = this.props;
        const JiraStatusObj = jiraStatus.find(it => Number(it.id) === activeKey) || {};
        const jiraSatusArr = JiraStatusObj.statuses || [];

        return (!this.state[`${record.id}`] ?
          <div className={styles.status} onClick={() => { this.setState({ [`${record.id}`]: true }); this.getJiraStatus() }}>
            {record.jirastatusname}({text})
          </div>
          :
          <Select
            style={{ width: 150 }}
            placeholder="请选择"
            defaultValue={Number(text)}
            onSelect={(value, data) => this.handleChangeStatus(record, value, data)}
          >
            {
              jiraSatusArr.map(item => <Option key={Number(item.id)} value={Number(item.id)} name={item.name}>
                {item.name}
              </Option>)
            }
          </Select>
        );
      }
    }];
  }

  componentDidMount() {
    const { activeKey } = this.props;
    this.getEpToJira(activeKey);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeKey !== nextProps.activeKey) {
      this.getEpToJira(nextProps.activeKey);
    }
  }

  handleChangeStatus = (record, value, data) => {
    const params = {
      id: record.id,
      jirastatusid: value,
      jirastatusname: data.props.name,
    };
    updateSingleStatusEpToJira(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('状态更新成功!');
      this.getEpToJira();
      this.setState({ [`${record.id}`]: false });

    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getEpToJira = (activeKey) => {
    const { subProductId } = this.props.location.query;
    const params = {
      subProductId: subProductId,
      issuetype: activeKey || this.props.activeKey,
    };
    this.props.dispatch({ type: 'productSetting/getEpToJira', payload: params });
  }

  getJiraStatus = () => {
    const { subProductId } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getAllJiraStatus', payload: { subProductId } });
  }

  getModalContent = () => {
    const { jiraStatus, form: { getFieldDecorator }, activeKey } = this.props;
    const epStatusObj = nameMap[activeKey];
    const epStatusArr = Object.keys(epStatusObj);

    const JiraStatusObj = jiraStatus.find(it => Number(it.id) === activeKey) || {};
    const jiraSatusArr = JiraStatusObj.statuses || [];

    return (epStatusArr.map(it => <Row className="u-mgb10">
      <Col span={3}>EP状态：</Col>
      <Col span={4}><Input value={it} disabled /></Col>
      <Col span={4}>EP状态名称：</Col>
      <Col span={4}><Input value={epStatusObj[it]} disabled /></Col>
      <Col span={9}>
        <FormItem label="JIRA状态值：" {...formLayout}>
          {
            getFieldDecorator(`${epStatusObj[it]}-${it}`, {
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <Select style={{ width: 150 }} placeholder="请选择">
                {
                  jiraSatusArr.map(it => <Option key={it.id} value={it.id}>
                    {it.name}
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
    const epStatusObj = nameMap[activeKey];
    const epStatusArr = Object.keys(epStatusObj);

    const JiraStatusObj = jiraStatus.find(it => Number(it.id) === activeKey) || {};
    const jiraSatusArr = JiraStatusObj.statuses || [];

    this.props.form.validateFields((err, values) => {
      if (err) return;

      const arr = [];
      epStatusArr.forEach(it => {
        const id = values[`${epStatusObj[it]}-${it}`];
        arr.push({
          subProductId,
          issuetype: activeKey,
          jirastatusid: id,
          jirastatusname: jiraSatusArr.find(item => item.id === id).name,
          kkstatus: it
        });
      });
      arr.forEach((it, index) => {
        this.updateStatusEpToJira(it, index, arr);
      });
    });
  }

  updateStatusEpToJira = (params, index, arr) => {
    updateStatusEpToJira(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (index === arr.length - 1) {
        message.success('更新状态成功！');
        this.setState({ visible: false });
        this.getEpToJira();
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
        deleteStatusEpToJira(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('清空映射状态成功！');
          that.getEpToJira();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  render() {
    const { epToJira } = this.props;
    const { visible } = this.state;

    return (<span>
      <div className="u-mgt10 f-tar u-mgb10">
        {
          epToJira.length ?
            <Button type="primary" onClick={() => this.handleDelete()} className="u-mgr20">清空</Button>
            :
            <Button type="primary" onClick={() => { this.getJiraStatus(); this.setState({ visible: true }) }} className="u-mgr20">从JIRA直接同步</Button>
        }
      </div>

      <Table
        columns={this.columns}
        dataSource={epToJira}
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
    epToJira: state.productSetting.epToJira,
    jiraStatus: state.productSetting.jiraStatus,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(EpToJira)));
