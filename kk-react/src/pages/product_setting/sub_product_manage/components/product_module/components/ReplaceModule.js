import React, { Component } from 'react';
import { Radio, message, Modal, Table } from 'antd';
import { withRouter } from 'react-router-dom';
import { getModuleFromJira, updateModuleEP } from '@services/product_setting';

class ReplaceModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jiraModule: [],
      visible: false,
      value: '',
    };

    this.columns = [{
      title: '操作',
      dataIndex: 'opt',      
      width: '50px',
      render: (text, record) => {
        const { moduleList } = this.props;
        const { value } = this.state;
        const flag = moduleList && moduleList.some(item => item.productModule && item.productModule.jiraid === record.id);

        return (
          !flag ?
            <Radio
              key={record.id}
              value={record.id}
              onChange={(e) => this.setState({ value: e.target.value })}
              checked={value === record.id}
            ></Radio>
            :
            null
        );
      }
    }, {
      title: '模块名称',
      dataIndex: 'name',
      render: (text, record) => {
        const { moduleList } = this.props;
        const flag = moduleList && moduleList.some(item => item.productModule && item.productModule.jiraid === record.id);

        return (<div>
          {
            flag ?
              <div>{record.name}
                <span className="delColor">(已存在)</span>
              </div>
              :
              <span>{record.name}</span>
          }
        </div>);
      }
    }, {
      title: 'jiraid',
      dataIndex: 'id',
      width: '100px'
    }];
  }

  componentDidMount() {
  }

  getJiraModule = () => {
    const { subProductId } = this.props.location.query;
    getModuleFromJira({ subProductId }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ jiraModule: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { id } = this.props;
    const { value, jiraModule } = this.state;
    const obj = jiraModule.find(it => it.id === value) || {};

    if (!value) {
      return message.error('请先选择模块！');
    } else {
      const params = {
        id,
        jiraid: value,
        name: obj.name
      };
      updateModuleEP(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更新模块成功！');
        this.setState({ visible: false });
        this.props.getModuleList();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  render() {
    const { jiraModule, visible } = this.state;

    return (<span>
      <a onClick={() => { this.setState({ visible: true }); this.getJiraModule() }}>替换</a>
      <Modal
        title="替换为其他存在的jira模块"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={700}
        onOk={() => this.handleOk()}
        okText="替换"
        destroyOnClose
        maskClosable={false}
      >
        <Table
          rowKey={record => record.id}
          columns={this.columns}
          dataSource={jiraModule}
          pagination={false}
          scroll={{ y: 350 }}
        />

      </Modal>
    </span>);
  }

}

export default withRouter(ReplaceModule);
