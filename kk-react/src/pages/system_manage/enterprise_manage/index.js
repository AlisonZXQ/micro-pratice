import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Modal, message, Input, Card, Divider } from 'antd';
import { getFormLayout } from '@utils/helper';
import { getEntCount, addEnterprise, editEnterprise, getEnterpriseList } from '@services/system_manage';
import DefineDot from '@components/DefineDot';
import { deleteModal } from '@shared/CommonFun';
import { entStatusColor, entStatusversionMap, entStatusNameMap } from '@shared/SystemManageConfig';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const formLayout = getFormLayout(6, 16);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      visible: false,
      item: {},
      modalType: '',
      stateType: '',
      params: {
        size: 10,
        current: 1,
      },
      total: 0,
    };
    this.columns = [
      {
        title: '企业名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          return <span>{text}</span>;
        }
      },
      {
        title: '管理员邮箱',
        dataIndex: 'adminemail',
        key: 'adminemail',
        render: (text, record) => {
          return <span>{text || '--'}</span>;
        }
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render: (text, record) => {
          if (text) {
            return <div class="f-toe" style={{ maxWidth: '400px' }}>{text || '--'}</div>;
          } else {
            return <div>--</div>;
          }
        }
      },
      {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        render: (text, record) => {
          return <span>
            <DefineDot statusColor={entStatusColor} displayText={entStatusversionMap[text]} text={text} />
          </span>;
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        render: (text, record) => {
          return (<div>
            <a onClick={() => this.handleEdit(record)}>编辑</a>
            <Divider type="vertical" />
            {record.state === entStatusNameMap.run ? <a
              onClick={() => this.stop(record)}
              className='delColor'>停用</a> :
              <a
                onClick={() => this.open(record)}
              >启用</a>}
          </div>);
        }
      },
    ];
  }

  componentDidMount() {
    this.getTotalCount();
    this.getData();
  }

  stop = (record) => {
    this.setState({
      item: record,
      stateType: 'stop'
    }, () => this.handleStop());
  }

  open = (record) => {
    this.setState({
      item: record,
      stateType: 'open',
    }, () => this.handleStop());
  }

  getTotalCount = () => {
    getEntCount().then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({
        total: res.result,
      });
    }).catch((err) => {
      return message.error(`${err || err.msg}获取总数异常`);
    });
  }

  getData = () => {
    this.setState({ loading: true });
    const { params } = this.state;
    params.offset = (params.current - 1) * 10;
    params.limit = params.size;
    getEnterpriseList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({
          loading: false,
          data: res.result,
        });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取列表异常`);
    });
  }

  handleEdit = (record) => {
    this.setState({ item: record });
    this.setState({ visible: true, modalType: 'edit' });
  }

  handleAdd = () => {
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
        addEnterprise(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`添加失败, ${res.msg}`);
          }
          message.success('添加成功！');
          this.setState({ visible: false });
          this.getData();
          this.getTotalCount();
        }).catch((err) => {
          return message.error('添加异常', err || err.msg);
        });
      } else {
        const params = {
          id: this.state.item.id,
          ...values,
        };
        editEnterprise(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`修改失败, ${res.msg}`);
          }
          message.success('修改成功！');
          this.setState({ visible: false });
          this.getData();
        }).catch((err) => {
          return message.error('修改异常', err || err.msg);
        });
      }
    });
  }

  handleStop = () => {
    const { item, stateType } = this.state;
    const params = {
      id: item.id,
      state: stateType === 'stop' ? entStatusNameMap.stop : entStatusNameMap.run,
    };
    deleteModal({
      title: '提示',
      content: stateType === 'stop' ? `您确认停用企业【${item && item.name}】吗?` :
        `您确认启用企业【${item && item.name}】吗?`,
      okCallback: () => {
        editEnterprise(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`${res.msg}`);
          }
          if (stateType === 'stop') {
            message.success('已停用！');
          } else {
            message.success('已启用！');
          }
          this.getData();
        }).catch((err) => {
          return message.error(err || err.msg);
        });
      }
    });
  }

  handlePageChange = (current, size) => {
    const newData = {
      ...this.state.params,
      current: current,
      size: size,
    };
    this.setState({ params: newData }, () => { this.getData() });
  }

  render() {
    const { data, loading, item, total, modalType,
      params: { current, size } } = this.state;
    const { form: { getFieldDecorator } } = this.props;
    return (<div style={{ padding: '0px 20px 20px 20px' }}>

      <div className='bbTitle f-jcsb-aic'>
        <span className='name'>企业管理</span>
        <Button
          type="primary"
          onClick={() => this.handleAdd()}>
          添加企业
        </Button>
      </div>
      <Card className="cardBottomNone">
        <Table
          // className='bgWhiteModel'
          dataSource={data}
          columns={this.columns}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            onShowSizeChange: this.handlePageChange,
            pageSize: size,
            current: current,
            onChange: this.handlePageChange,
            defaultCurrent: 1,
            total: total,
            showTotal: (total) => `总条数： ${total}，当前页：${current}`
          }}
        />
      </Card>

      <Modal
        title={modalType === 'add' ? '添加企业' : '编辑企业'}
        visible={this.state.visible}
        onOk={() => this.handleOk()}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
        maskClosable={false}
      >
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '此项必填，请检查!' }],
            initialValue: item && item.name,
          })(
            <Input placeholder="请输入企业名称" />
          )}
        </FormItem>
        <FormItem label="管理员邮箱" {...formLayout}>
          {getFieldDecorator('adminemail', {
            rules: [{ type: 'email', message: '请输入正确格式!' },
              { required: true, message: '此项必填，请检查!' }],
            initialValue: item && item.adminemail,
          })(
            <Input placeholder="请输入管理员邮箱" />
          )}
        </FormItem>
        <FormItem label="描述" {...formLayout}>
          {getFieldDecorator('description', {
            rules: [{ required: false }],
            initialValue: (item && item.description) || '',
          })(
            <TextArea placeholder="请输入企业描述" />
          )}
        </FormItem>
      </Modal>
    </div>);
  }
}

export default (Form.create()(Index));
