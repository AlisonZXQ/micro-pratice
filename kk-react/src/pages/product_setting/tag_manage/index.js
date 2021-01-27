import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Table, Divider, message, Input, Modal, Card } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getFormLayout } from '@utils/helper';
import { deleteTag, getTagList, addTag, updateTag } from '@services/product_setting';
import { deleteModal } from '@shared/CommonFun';
import styles from './index.less';

const Search = Input.Search;
const FormItem = Form.Item;
const formLayout = getFormLayout(4, 18);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: '',
      record: {},
      data: [],
      visible: false,
      dialogType: '',
      total: 0,
      pagination: {
        size: 10,
        current: 1,
      }
    };
    this.columns = [{
      title: '标签名称',
      dataIndex: 'name',
      render: (text, record) => {
        return <span>{record.tag.name}</span>;
      }
    }, {
      title: '关联单据',
      dataIndex: 'count',
      render: (text, record) => {
        const tag = record.tag;
        const count = tag.advisecount + tag.bugcount + tag.objectivecount + tag.requirementcount + tag.taskcount;
        return <span>{count}</span>;
      }
    }, {
      title: '创建人',
      dataIndex: 'create',
      render: (text, record) => {
        return <span>{record.user.realname}</span>;
      }
    }, {
      title: '创建时间',
      dataIndex: 'addtime',
      render: (text, record) => {
        const time = record.tag.addtime;
        return <span>{time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>;
      }
    }, {
      title: '操作',
      dataIndex: 'caozuo',
      render: (text, record) => {
        return <span>
          <a
            onClick={() => this.handleEdit(record)}>
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => this.handleOpenDelete(record)}
            className="delColor">
            删除
          </a>
        </span>;
      }
    }];
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    const { productid } = this.props.location.query;
    const { pagination: { current, size } } = this.state;
    const params = {
      productid: productid,
      value: this.state.value,
      offset: (current - 1) * 10,
      limit: size,
    };
    getTagList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取列表失败, ${res.msg}`);
      }
      this.setState({ data: res.result.data });
      this.setState({ total: res.result.totalCount });
      this.setState({ loading: false });
    }).catch((err) => {
      return message.error('获取列表异常', err || err.msg);
    });
  }

  handleOpenDelete = (record) => {
    this.setState({ record }, () => this.handleDelete());
  }

  handleOpenCreate = () => {
    this.setState({ dialogType: 'create' }, () => this.setState({ visible: true }));
    this.setState({ record: {} });
  }

  handleDelete = () => {
    const { record } = this.state;
    const params = {
      id: record.tag.id,
    };
    deleteModal({
      title: '提示',
      content: '您确认要删除此通知标签吗?',
      okCallback: () => {
        deleteTag(params).then((res) => {
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

  handleEdit = (record) => {
    this.setState({ record: record });
    this.setState({ dialogType: 'edit' }, () => this.setState({ visible: true }));
  }

  handleOk = () => {
    const { dialogType, record } = this.state;
    const { productid } = this.props.location.query;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (dialogType === 'create') {
        const params = {
          productid: productid,
          ...values,
        };
        addTag(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`添加失败, ${res.msg}`);
          }
          message.success('添加成功！');
          this.setState({ visible: false });
          this.getData();
        }).catch((err) => {
          return message.error('添加异常', err || err.msg);
        });
      } else if (dialogType === 'edit') {
        const params = {
          id: record.tag.id,
          ...values,
        };
        updateTag(params).then((res) => {
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

  handlePageChange = (num) => {
    const { pagination } = this.state;
    const newObj = {
      ...pagination,
      current: num
    };
    this.setState({ pagination: newObj }, () => this.getData());
  }

  render() {
    const { lastProduct, form: { getFieldDecorator } } = this.props;
    const { data, dialogType, pagination: { size, current }, loading, record, total } = this.state;
    return (<span>
      <div className={`settingTitle ${styles.settingTitle}`}>
        {lastProduct.name}-标签管理
      </div>
      <div style={{ padding: '0px 20px' }}>
        <div className="bbTitle f-jcsb-aic">
          <span className="name">标签管理</span>
          <span>
            <Search
              allowClear
              onSearch={(value) => this.setState({ value: value }, () => this.getData())}
              style={{ width: '220px' }}
              placeholder="搜索名称"
            />
            <Button
              type='primary'
              onClick={() => this.handleOpenCreate()}
              className='u-mgl10'>
              创建标签
            </Button>
          </span>
        </div>
      </div>
      <Card className="cardBottomNone">
        <Table
          loading={loading}
          columns={this.columns}
          dataSource={data}
          pagination={{
            total: total,
            pageSize: size,
            current: current,
            onChange: this.handlePageChange,
            defaultCurrent: 1,
          }}
        />
      </Card>
      <Modal
        title={`${dialogType === 'create' ? '创建标签' : '编辑标签'}`}
        visible={this.state.visible}
        onOk={() => this.handleOk()}
        destroyOnClose
        onCancel={() => this.setState({ visible: false })}
        maskClosable={false}
      >
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标签名称！' }],
            initialValue: record.tag && record.tag.name,
          })(
            <Input placeholder="标签名称" />,
          )}
        </FormItem>
      </Modal>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
