import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message, Select } from 'antd';
import { queryUser } from '@services/project';

const Option = Select.Option;
const FormItem = Form.Item;

class AddMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      value: '',
      userList: [],
      searchList: [],
      optionList: [],
    };
    this.columns = [{
      title: '姓名',
      dataIndex: 'realname',
      width: 150,
    }, {
      title: '角色',
      dataIndex: 'email',
      render: (text, record) => {
        const { form: { getFieldDecorator }, rolelist } = this.props;
        return (
          <FormItem style={{ marginBottom: '0px' }}>
            {getFieldDecorator(`${record.id}`, {
              rules: [
                { required: true, message: `此项不能为空` },
              ],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请选择成员角色"
                onChange={() => { this.tagChange(text, record) }}
              >
                {
                  rolelist.map(it => <Option key={it.id} value={it.id}>{it.roleName}</Option>)
                }
              </Select>
            )}
          </FormItem>
        );
      }
    }, {
      title: '操作',
      dataIndex: '',
      width: 80,
      render: (text, record) => {
        return (
          <a onClick={() => this.handleDelete(record)}>删除</a>
        );
      }
    }];
  }

  componentDidMount() {
  }

  tagChange(text, record) {

  }

  handleChange(value) {
    let newSearchList = [...this.state.searchList];
    let newUserList = [...this.state.userList];
    newSearchList.map((item, index) => {
      if (item.id === value) {
        if (newUserList.some(item => item.id === value)) {
          message.warn('成员已被选择！');
        } else {
          newUserList.push(item);
        }
      }
    });
    this.props.updateMembers(newUserList);
    this.setState({ userList: newUserList });
  }

  handleDelete = (record) => {
    const { userList } = this.state;
    let newUserList = [...userList];
    newUserList = newUserList.filter(item => item.id !== record.id);
    this.props.updateMembers(newUserList);
    this.setState({ userList: newUserList });
  }

  handleSearch = (value) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ searchList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  render() {
    const { userList, searchList } = this.state;
    return (<div className="u-form">
      <Select
        showSearch
        allowClear
        style={{ width: '100%', marginBottom: '15px', }}
        placeholder="搜索用户"
        filterOption={false}
        onSearch={(value) => this.handleSearch(value)}
      >
        {
          searchList && searchList.map(it => (
            <Option onClick={() => { this.handleChange(it.id) }} key={it.id} value={it.id}>{it.realname} {it.email}</Option>
          ))
        }
      </Select>

      <Table
        columns={this.columns}
        dataSource={userList}
        scroll={{ y: 240 }}
        pagination={false}
      />
    </div>);
  }
}

export default AddMembers;
