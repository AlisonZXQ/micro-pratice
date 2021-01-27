import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, Select, message, Input, Card, Divider } from 'antd';
import { getFormLayout } from '@utils/helper';
import { addDepartment, getDepartmentList, dltDepartment, getEntlist, editDepartment } from '@services/system_manage';
import BusinessHOC from '@components/BusinessHOC';
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
      entList: [],
      visible: false,
      item: {},
      modalType: '',
      params: {
        entid: '',
        deptName: '',
        size: 10,
        current: 1,
      },
      total: 0,
    };
    this.columns = [
      {
        title: 'id',
        dataIndex: 'id',
        render: (text, record) => {
          return <span>{record.department.id}</span>;
        }
      },
      {
        title: '所属企业',
        dataIndex: 'name',
        render: (text, record) => {
          return <span>{record.enterprise.name}</span>;
        }
      },
      {
        title: '一级部门',
        dataIndex: 'deptName',
        render: (text, record) => {
          return <span>{record.department.deptName}</span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        render: (text, record) => {
          const { isBusiness } = this.props;
          const flag = !isBusiness;

          return (<div>
            <a onClick={() => this.handleEdit(record)} disabled={flag}>编辑</a>
            <Divider type="vertical" />
            <a
              onClick={() => { this.setState({ item: record }, () => this.handleDelete()) }}
              className='delColor'
              disabled={flag}
            >删除</a>
          </div>);
        }
      },
    ];
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    const { params } = this.state;
    params.offset = (params.current - 1) * 10;
    params.limit = params.size;
    getDepartmentList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({
          loading: false,
          data: res.result.list,
          total: res.result.count,
        });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取列表异常`);
    });
  }

  getEntlist = () => {
    getEntlist().then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ entList: res.result });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取企业异常`);
    });
  }

  handleEdit = (record) => {
    this.getEntlist();
    this.setState({ item: record });
    this.setState({ visible: true, modalType: 'edit' });
  }

  handleAdd = () => {
    this.getEntlist();
    this.setState({
      visible: true,
      modalType: 'add',
      item: {},
    });
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (this.state.modalType === 'add') {
        const params = {
          ...values,
        };
        addDepartment(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`添加失败, ${res.msg}`);
          }
          message.success('添加成功！');
          this.setState({ visible: false });
          this.getData();
        }).catch((err) => {
          return message.error('添加异常', err || err.msg);
        });
      } else {
        const params = {
          id: this.state.item.department.id,
          ...values,
        };
        editDepartment(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`更新失败, ${res.msg}`);
          }
          message.success('更新成功！');
          this.setState({ visible: false });
          this.getData();
        }).catch((err) => {
          return message.error('更新异常', err || err.msg);
        });
      }
    });
  }

  handleDelete = () => {
    const { item } = this.state;
    const params = {
      id: item.department.id,
    };
    deleteModal({
      title: '提示',
      content: `您确认删除部门【${item && item.department && item.department.deptName}】吗?`,
      okCallback: () => {
        dltDepartment(params).then((res) => {
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

  handlePageChange = (current) => {
    const newParams = {
      ...this.state.params,
      current,
    };
    this.setState({ params: newParams }, () => this.getData());
  }

  render() {
    const { data, loading, entList, item, total, modalType,
      params: { current, size } } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    return (<div style={{ padding: '0px 20px 20px 20px' }}>
      <div className='bbTitle f-jcsb-aic'>
        <span className='name'>部门管理</span>
        <Button
          type="primary"
          onClick={() => this.handleAdd()}>
          添加部门
        </Button>
      </div>
      <Card className="cardBottomNone">
        <Table
          // className='bgWhiteModel'
          dataSource={data}
          columns={this.columns}
          loading={loading}
          pagination={{
            pageSize: size,
            current: current,
            onChange: this.handlePageChange,
            defaultCurrent: 1,
            total: total,
            showTotal: (total) => `总条数: ${total}`
          }}
        />
      </Card>

      <Modal
        title={modalType === 'add' ? '添加部门' : '编辑部门'}
        visible={this.state.visible}
        onOk={() => this.handleOk()}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
        maskClosable={false}
      >
        <FormItem label="所属企业" {...formLayout}>
          {getFieldDecorator('entid', {
            rules: [{ required: true, message: '此项必填，请检查!' }],
            initialValue: item && item.enterprise && item.enterprise.id,
          })(
            <Select
              allowClear
              placeholder="请选择企业"
              className="f-fw"
            >
              {
                entList && entList.map(it => (
                  <Option key={it.id} value={it.id}>{it.name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('deptName', {
            rules: [{ required: true, message: '此项必填，请检查!' }],
            initialValue: item && item.department && item.department.deptName,
          })(
            <Input placeholder="请填写需求添加的部门名称" />
          )}
        </FormItem>
      </Modal>
    </div>);
  }
}

export default BusinessHOC()(Form.create()(Index));
