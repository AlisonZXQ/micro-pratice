import React, { Component } from 'react';
import { Checkbox, Button, message, Modal, Table, Popover } from 'antd';
import { withRouter } from 'react-router-dom';
import { getModuleFromJira, addModuleEP } from '@services/product_setting';

class JiraModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jiraModule: [],
      visible: false,
      checkList: [],
      aloneModule: [], // 未选择的jira模块
    };

    this.columns = [{
      title: this.getTitle,
      dataIndex: 'lie',
      render: (text, record) => {
        const { moduleList } = this.props;
        const { checkList } = this.state;
        const flag = moduleList && moduleList.some(item => item.productModule && item.productModule.jiraid === record.id);

        return (<div>
          {
            flag ?
              <Popover content={record.name}>
                <div className='f-ib f-toe' style={{ maxWidth: '500px' }}>
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
                  <span className='f-ib f-toe' style={{ maxWidth: '500px', position: 'relative', top: '5px' }}>
                    {record.name}
                  </span>
                </Popover>
              </Checkbox>
          }
        </div>);
      }
    }];
  }

  componentDidMount() {
  }

  getTitle = () => {
    const { checkList, aloneModule } = this.state;
    const length = checkList.length;
    const alone = aloneModule.length;

    return (<span>
      <Checkbox
        checked={alone === length && length > 0}
        indeterminate={alone > length && length > 0}
        onChange={this.handleChangeAll}
      >
        全选
      </Checkbox>
    </span>);
  }

  handleChangeAll = (e) => {
    const { aloneModule } = this.state;
    if (e.target.checked) {
      this.setState({
        checkList: aloneModule,
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

  getJiraModule = () => {
    this.setState({ aloneModule: [], checkList: [] });
    const { subProductId } = this.props.location.query;
    const { moduleList } = this.props;

    getModuleFromJira({ subProductId: Number(subProductId) }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const arr = [];
      res.result.forEach(it => {
        if (!moduleList.some(item => item.productModule && item.productModule.jiraid === it.id)) {
          arr.push(it.id);
        }
      });
      this.setState({
        aloneModule: arr,
        jiraModule: res.result
      });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { subProductId } = this.props.location.query;
    const { checkList, jiraModule } = this.state;
    const arr = [];

    const getName = (id) => {
      const obj = jiraModule.find(item => item.id === id) || {};
      return obj.name;
    };

    checkList.forEach(it => {
      arr.push({
        subProductId,
        jiraid: it,
        responseemail: '',
        name: getName(it),
      });
    });

    arr.forEach((it, index) => this.addModuleEP(it, index, arr));

  }

  addModuleEP = (params, index, arr) => {
    addModuleEP(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (arr.length - 1 === index) {
        message.success('添加模块成功！');
        this.setState({ visible: false });
        this.props.getModuleList();
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { jiraModule, visible } = this.state;

    return (<span>
      <Button className="u-mgr10" type="primary" onClick={() => { this.setState({ visible: true }); this.getJiraModule() }}>从JIRA中同步</Button>
      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        width={700}
        onOk={() => this.handleOk()}
        okText="创建模块"
        destroyOnClose
        maskClosable={false}
      >
        <Table
          rowKey={record => record.id}
          columns={this.columns}
          dataSource={jiraModule}
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

export default withRouter(JiraModule);
