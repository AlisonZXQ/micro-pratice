import React, { Component } from 'react';
import { Checkbox, Button, message, Modal, Table, Popover } from 'antd';
import { withRouter } from 'react-router-dom';
import DefineDot from '@components/DefineDot';
import { versionNameMap, versionColorDotMap } from '@shared/CommonConfig';
import { getVersionFromJira, addVersionJira } from '@services/product_setting';

class JiraVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jiraVersion: [],
      visible: false,
      checkList: [],
      aloneVersion: [], // 未选择的jira版本
    };

    this.columns = [{
      title: this.getTitle,
      dataIndex: 'lie',
      render: (text, record) => {
        const { checkList } = this.state;
        const flag = record.epExist;

        return (<div>
          {
            flag ?
              <Popover content={record.name}>
                <div className='f-ib f-toe' style={{ maxWidth: '400px' }}>
                  {record.name}
                  <span className="delColor">(已存在)</span>
                </div>
              </Popover>
              :
              <Checkbox
                key={record.id}
                value={record.id}
                onChange={this.handleChange}
                checked={checkList.some(it => it === record.id)}
              >
                <Popover content={record.name}>
                  <span className='f-ib f-toe' style={{ maxWidth: '420px', position: 'relative', top: '5px' }}>
                    {record.name}
                  </span>
                </Popover>
              </Checkbox>
          }
        </div>);
      }
    }, {
      title: '状态',
      dataIndex: 'state',
      width: '150px',
      render: (text, record) => {
        return text ?
          '已归档'
          : '--';
      }
    }];
  }

  componentDidMount() {
  }

  getTitle = () => {
    const { checkList, aloneVersion } = this.state;
    const length = checkList.length;
    const alone = aloneVersion.length;

    return (<span>
      <Checkbox
        checked={alone === length && length > 0}
        indeterminate={alone > length && length > 0}
        onChange={this.handleChangeAll}
      >
        名称
      </Checkbox>
    </span>);
  }

  handleChangeAll = (e) => {
    const { aloneVersion } = this.state;
    if (e.target.checked) {
      this.setState({
        checkList: aloneVersion,
      });
    } else {
      this.setState({
        checkList: [],
      });
    }
  }

  handleChange = (e) => {
    const { checkList } = this.state;
    let arr = [...checkList];
    if (e.target.checked) {
      arr.push(e.target.value);
    } else {
      arr = arr.filter(it => it !== e.target.value);
    }
    this.setState({ checkList: arr });
  }

  getJiraVersion = () => {
    this.setState({ aloneVersion: [], checkList: [] });
    const { subProductId } = this.props.location.query;
    const { versionList } = this.props;

    getVersionFromJira({ subProductId: Number(subProductId) }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const arr = [];
      res.result.forEach(it => {
        if (!versionList.some(item => item.version && item.version.jiraid === it.id)) {
          arr.push(it.id);
        }
      });
      this.setState({
        aloneVersion: arr,
        jiraVersion: res.result
      });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { subProductId } = this.props.location.query;
    const { checkList, jiraVersion } = this.state;
    const arr = [];

    const getName = (id) => {
      const obj = jiraVersion.find(item => item.id === id) || {};
      return obj.name;
    };
    const getDescription = (id) => {
      const obj = jiraVersion.find(item => item.id === id) || {};
      return obj.description;
    };

    checkList.forEach(it => {
      arr.push({
        jiraid: it,
        name: getName(it),
        description: getDescription(it)
      });
    });

    const params = {
      subProductId,
      data: arr,
    };

    this.addVersionJira(params);

  }

  addVersionJira = (params) => {
    addVersionJira(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加版本成功！');
      this.setState({ visible: false });
      this.props.getVersionList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { jiraVersion, visible } = this.state;

    return (<span>
      <Button className="u-mgr10" type="primary" onClick={() => { this.setState({ visible: true }); this.getJiraVersion() }}>从JIRA中同步</Button>
      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={700}
        onOk={() => this.handleOk()}
        okText="创建版本"
        destroyOnClose
        maskClosable={false}
        title='从JIRA中同步'
      >
        <Table
          rowKey={record => record.id}
          columns={this.columns}
          dataSource={jiraVersion}
          pagination={false}
          scroll={{ y: 350 }}
          onRow={() => {
            return {
              style: { height: '20px' }
            };
          }}
        />

      </Modal>
    </span>);
  }

}

export default withRouter(JiraVersion);
