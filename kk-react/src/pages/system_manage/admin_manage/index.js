import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, Select, message, Card } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import { addAdmin, getAdminList, dltAdmin } from '@services/system_manage';
import debounce from 'lodash/debounce';
import { deleteModal } from '@shared/CommonFun';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const Option = Select.Option;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      userList: [],
      visible: false,
      item: {},
    };
    this.columns = [
      {
        title: '昵称',
        dataIndex: 'nick',
        render: (text, record) => {
          return <span>{(record && record.user && record.user.nick) || '--'}</span>;
        }
      },
      {
        title: '真实姓名',
        dataIndex: 'realname',
        render: (text, record) => {
          return <span>{(record && record.user && record.user.realname) || '--'}</span>;
        }
      },
      {
        title: '邮箱',
        dataIndex: 'realname',
        render: (text, record) => {
          return <span>{(record && record.user && record.user.email) || '--'}</span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        render: (text, record) => {
          return (<div>
            <a
              onClick={() => { this.setState({ item: record }, () => this.handleDelete()) }}
              className='delColor'>删除</a>
          </div>);
        }
      },
    ];
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    getAdminList().then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ loading: false });
        this.setState({ data: res.result });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
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
          this.setState({ userList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        ...values,
      };
      addAdmin(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`添加失败, ${res.msg}`);
        }
        message.success('添加成功！');
        this.setState({ visible: false });
        this.getData();
      }).catch((err) => {
        return message.error('添加异常', err || err.msg);
      });
    });
  }

  handleDelete = () => {
    const { item } = this.state;
    const params = {
      uid: item.admin.uid,
    };
    deleteModal({
      title: '提示',
      content: `您确认删除管理员【${item && item.user && item.user.nick}】吗?`,
      okCallback: () => {
        dltAdmin(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功！');
          this.getData();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });

  }

  render() {
    const { data, loading, userList } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    return (<div style={{ padding: '0px 20px 20px 20px' }}>
      <div className='bbTitle f-jcsb-aic'>
        <span className='name'>管理员管理</span>
        <Button
          type="primary"
          onClick={() => { this.setState({ visible: true }) }}>
          添加管理员
        </Button>
      </div>
      <Card className="cardBottomNone">
        <Table
          dataSource={data}
          columns={this.columns}
          loading={loading}
        />
      </Card>

      <Modal
        title="添加管理员"
        visible={this.state.visible}
        onOk={() => this.handleOk()}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
        maskClosable={false}
      >
        <FormItem label="邮箱" {...formLayout}>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: '此项必填，请检查!' }],
            initialValue: '',
          })(
            <Select
              allowClear
              showSearch
              showArrow={false}
              placeholder="请输入人名"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value)}
              className="f-fw"
            >
              {
                userList && userList.map(it => (
                  <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
      </Modal>
    </div>);
  }
}

export default (Form.create()(Index));
