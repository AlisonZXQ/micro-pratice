import React, { Component } from 'react';
import { Modal, Input, Button, Row, Col, Radio, message, Pagination, Spin } from 'antd';
import { getJiraList } from '@services/requirement';
import { getSubProductDetail } from '@services/product';
import TextOverFlow from '@components/TextOverFlow';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import styles from './index.less';

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      value: 0,
      jiraList: [],
      keyName: '',
      jirakey: '',
      total: 0,
      current: 1,
      querykey: '',
      querytheme: '',
      subProductId: '',
    };
  }

  componentDidMount() {
    const beforeId = this.props.form.getFieldValue('subProductId');
    if (beforeId) {
      this.setState({ subProductId: beforeId });
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextId = nextProps.form.getFieldValue('subProductId');
    if (this.state.subProductId !== nextId) {
      this.setState({ keyName: '', subProductId: nextId });
    }
  }

  handleCancel = () => {
    this.setState({ keyName: '' });
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ jirakey: '' });
    this.setState({ visible: false });
    this.setState({ value: 0 });
  }

  handleOk = () => {
    this.setState({ visible: false });
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
    this.setState({ keyName: e.target.value });
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ jirakey: e.target.value });
  };

  onChangePage = (pageNumber) => {
    const params = {
      jql: `project=${this.state.jirakey} and issuetype = ${this.props.issuetype} ORDER BY priority DESC, updated DESC`,
      startAt: (pageNumber - 1) * 10,
      maxResults: 10,
      fields: 'summary',
    };
    this.getJiraList(params);
    this.setState({ current: pageNumber });
  }

  openJiraList = () => {
    const subProductId = this.props.form.getFieldValue('subProductId');
    if (subProductId) {
      this.setState({ visible: true });
      getSubProductDetail(subProductId).then((res) => {
        if (res.code !== 200) return message.error('查询子产品失败', res.message);
        if (res.result) {
          this.setState({ jirakey: res.result.jiraKey });
          const params = {
            jql: `project=${res.result.jiraKey} and issuetype = ${this.props.issuetype} ORDER BY priority DESC, updated DESC`,
            startAt: 0,
            maxResults: 10,
            fields: 'summary',
          };
          this.getJiraList(params);
        }
      }).catch((err) => {
        return message.error('查询子产品异常', err || err.message);
      });
    } else {
      message.warning('请先选择子产品');
    }
  }

  getJiraList = (params) => {
    this.setState({ loading: true });
    getJiraList(params).then((res) => {
      if (res.code !== 200) {
        this.setState({ total: 0 });
        this.setState({ jiraList: [] });
        this.setState({ loading: false });
      }
      if (res.result) {
        this.setState({ total: res.result.total });
        this.setState({ jiraList: res.result.issues });
        this.setState({ loading: false });
      }
    }).catch((err) => {
      return message.error('查询JIRA列表异常', err || err.message);
    });
  }

  querySearch = () => {
    const key = this.state.querykey;
    const theme = this.state.querytheme;
    let newjql = '';
    if (key && !theme) {
      newjql = `project=${this.state.jirakey} and issuetype = ${this.props.issuetype} and issuekey = ${key} ORDER BY priority DESC, updated DESC`;
    } else if (theme && !key) {
      newjql = `project=${this.state.jirakey} and issuetype = ${this.props.issuetype} and summary ~${theme} ORDER BY priority DESC, updated DESC`;
    } else if (key && theme) {
      newjql = `project=${this.state.jirakey} and issuetype = ${this.props.issuetype} and issuekey = ${key} and summary ~${theme} ORDER BY priority DESC, updated DESC`;
    } else {
      return;
    }
    const params = {
      jql: newjql,
      startAt: 0,
      maxResults: 10,
      fields: 'summary',
    };
    this.getJiraList(params);
    this.setState({ current: 1 });
  }

  getTitle = () => {
    const { issuetype } = this.props;
    switch (issuetype) {
      case ISSUE_TYPE_JIRA_MAP.REQUIREMENT:
        return '选择JIRA上已有的需求单';
      case ISSUE_TYPE_JIRA_MAP.OBJECTIVE:
        return '选择JIRA上已有的目标单';
      case ISSUE_TYPE_JIRA_MAP.TASK:
      case ISSUE_TYPE_JIRA_MAP.SUBTASK:
        return '选择JIRA上已有的任务/子任务单';
      default: return '选择JIRA上已有的缺陷单';
    }
  }

  render() {
    const { issuetype } = this.props;
    const { loading, keyName, visible, value, jiraList, total, current } = this.state;

    return (<span>
      {keyName &&
        <span className={styles.tag}>{keyName}</span>
      }
      <a onClick={() => this.openJiraList()}>
        {issuetype === ISSUE_TYPE_JIRA_MAP.REQUIREMENT && <span>从已有JIRA需求单中选择</span>}
        {issuetype === ISSUE_TYPE_JIRA_MAP.OBJECTIVE && <span>从已有JIRA目标单中选择</span>}
        {issuetype === ISSUE_TYPE_JIRA_MAP.TASK && <span>从已有JIRA任务/子任务单中选择 </span>}
        {issuetype === ISSUE_TYPE_JIRA_MAP.SUBTASK && <span>从已有JIRA任务/子任务单中选择 </span>}
        {issuetype === ISSUE_TYPE_JIRA_MAP.BUG && <span>从已有JIRA缺陷单中选择 </span>}
      </a>
      <span>丨</span>
      <a onClick={() => this.handleCancel()}>清空选择</a>
      <Modal
        title={this.getTitle()}
        okText="选择"
        cancelText="取消"
        width={1000}
        visible={visible}
        onOk={() => { this.handleOk() }}
        onCancel={() => { this.handleCancel() }}
        destroyOnClose
        maskClosable={false}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder='JIRA键名（精确匹配）' onChange={(e) => this.setState({ querykey: e.target.value })} />
          </Col>
          <Col span={8}>
            <Input placeholder='标题（模糊匹配）' onChange={(e) => this.setState({ querytheme: e.target.value })} />
          </Col>
          <Col span={8}>
            <Button type="primary" onClick={() => this.querySearch()}>过滤</Button>
            <Button className='u-mgl10' onClick={() => this.openJiraList()}>查看全部</Button>
          </Col>
        </Row>
        <Spin spinning={loading}>
          <div className='u-mgt10' style={{ height: '300px' }}>
            <Radio.Group onChange={this.onChange} value={value}>
              {jiraList && jiraList.map(item =>
                <Radio style={radioStyle} value={item.key}>
                  <TextOverFlow content={item.fields.summary} maxWidth={800} />
                </Radio>
              )}
            </Radio.Group>
          </div>
          <div className='u-mgt10'>
            <Pagination
              current={current}
              showQuickJumper
              total={total}
              onChange={this.onChangePage} />
          </div>
        </Spin>
      </Modal>
    </span>);
  }
}

export default Index;
