import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Input, Button, Table, Divider, Tooltip, Modal, Card } from 'antd';
import FilterSelect from '@components/FilterSelect';
import EditSelect from '@components/EditSelect';
import { warnModal } from '@shared/CommonFun';
import TextOverFlow from '@components/TextOverFlow';
import UserForm from './components/UserForm';
import ProductList from './components/ProductList';
import { getEntlist, getEntProduct, getUserList, deleteUser, addUser, updateUser } from '@services/system_manage';
import styles from './index.less';

const Search = Input.Search;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '',
      visible: false,
      loading: false,
      data: [],
      total: 0,
      entData: [],
      currentEntid: '',
      productData: [],
      pagination: {
        size: 10,
        current: 1,
      },
      filterObj: {
        entidList: [],
        productIdList: [],
        userName: [],
      },
      record: {},
      productid: null,
    };
    this.columns = [
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
      },
      {
        title: '所属企业',
        dataIndex: 'entName',
      },
      {
        title: '所属产品',
        dataIndex: 'productVOList',
        render: (text, record) => {
          const arr = text || [];
          if (arr.length) {
            if (arr.length === 1) {
              return arr[0].name;
            } else {
              return (<Tooltip title={<span>
                {
                  arr.map(it => <div>
                    {it.name}
                  </div>)
                }
              </span>}>
                <div className={styles.relateStyle}>{arr.length}</div>
              </Tooltip>);
            }
          } else {
            return '/';
          }
        }
      },
      {
        title: '部门',
        dataIndex: 'department',
        render: (text, record) => {
          return text ? <TextOverFlow content={text} maxWidth={'12vw'} /> : '--';
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        render: (text, record) => {
          return (<div>
            <a onClick={() => this.setState({ visible: true, type: 'edit', record: record })}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => { this.setProduct(record.id, record) }}>产品设置</a>
            <Divider type="vertical" />
            <a className='delColor'
              onClick={() => { this.setState({ record }, () => this.handleRemove()) }}>
              删除
            </a>
          </div>);
        }
      },
    ];
  }

  componentDidMount() {
    this.getEntlist();
    this.getList();
  }

  getEntlist = () => {
    getEntlist().then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ entData: res.result });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
  }

  updateFilter = (key, value) => {
    if (key === 'entidList') {
      this.getProductList(value);
      this.setState({ currentEntid: value });
    }
    const { filterObj } = this.state;
    const NewFilterObj = {
      ...filterObj,
      [key]: value,
    };
    const newPagination = {
      ...this.state.pagination,
      current: 1,
    };
    this.setState({
      filterObj: NewFilterObj,
      pagination: newPagination,
    }, () => this.getList());
  }

  getList = () => {
    this.setState({ loading: true });
    const { pagination, filterObj } = this.state;
    const params = {
      ...filterObj,
      entidList: filterObj.entidList ? filterObj.entidList : '',
      limit: pagination.size,
      offset: (pagination.current - 1) * 10,
    };
    getUserList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ loading: false });
        this.setState({ total: res.result.total });
        this.setState({ data: res.result.list });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
  }

  getProductList = (id) => {
    if (id) {
      const params = {
        entid: id,
      };
      getEntProduct(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.setState({ productData: res.result });
      }).catch((err) => {
        return message.error(`${err || err.msg}获取产品异常`);
      });
    } else {
      this.setState({ productData: [] });
    }
  };

  handlePageChange = (current, size) => {
    const newData = {
      ...this.state.pagination,
      current: current,
      size: size,
    };
    this.setState({ pagination: newData }, () => this.getList());
  }

  setProduct = (id, record) => {
    if (id === null) {
      this.getList();
    }
    this.setState({ record });
    this.setState({ productid: id });
  }

  handleRemove = () => {
    const { record } = this.state;
    const params = {
      id: record.id
    };
    warnModal({
      title: '确认移除',
      content: '移除后该成员将无法进入产品，ta已完成的工作量会被保留。',
      okCallback: () => {
        deleteUser(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除用户成功！');
          this.getList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });

  }

  handleOk = () => {
    const { type } = this.state;
    this.props.form.validateFields(['name', 'email', 'entid'], (err, values) => {
      if (err) return;
      const product = this.props.form.getFieldValue('productIdList');
      if (product.length === 0) {
        return message.warning('所属产品必填！');
      }
      const params = {
        ...values,
        productIdList: product,
      };
      if (type === 'create') {
        addUser(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('添加用户成功！');
          this.setState({ visible: false });
          this.getList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      } else {
        const editParams = {
          ...params,
          id: this.state.record.id,
        };
        updateUser(editParams).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新用户成功！');
          this.setState({ visible: false });
          this.getList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  render() {
    const { entData, productData, data, loading, total, productid,
      pagination: { size, current }, visible, type } = this.state;
    return (<div style={{ padding: '0px 15px' }}>

      {productid === null && <div className='bbTitle f-jcsb-aic'>
        <span className='name'>用户列表</span>
      </div>}
      {productid === null ? <Card className="cardBottomNone">
        <div className={`${styles.queryArea} f-jcsb-aic u-mgb10`}>
          <span className='f-aic'>
            <span className='queryHover'>
              <span className="grayColor">所属企业：</span>
              <EditSelect
                value={this.state.currentEntid}
                dataSource={entData}
                handleSaveSelect={(value) => this.updateFilter('entidList', value)}
              />
            </span>

            <span className='queryHover'>
              <span className="grayColor">所属产品：</span>
              <span className={styles.queryLabel}>
                <FilterSelect
                  onChange={(value) => this.updateFilter('productIdList', value)}
                  dataSource={productData.map((item) => ({
                    label: item.name, value: item.id,
                  }))}
                />
              </span>

            </span>
          </span>
          <span>
            <Search
              allowClear
              className="u-mgl20"
              onSearch={value => this.updateFilter('username', value)}
              style={{ width: '220px' }}
              placeholder="搜索姓名"
            />
            <Button
              className='u-mgl10'
              onClick={() => this.setState({ visible: true, type: 'create' })}
              type="primary">
              创建用户</Button>
          </span>
        </div>
        <Table
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
        <Modal
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleOk()}
          title={type === 'create' ? '创建用户' : '编辑用户'}
          width={700}
          bodyStyle={{ maxHeight: '450px', overflow: 'auto' }}
          destroyOnClose
          maskClosable={false}
        >
          <UserForm
            form={this.props.form}
            type={type}
            entData={entData}
            editData={this.state.record} />
        </Modal>
      </Card> :
        <ProductList
          record={this.state.record}
          setProduct={this.setProduct}
          productid={productid} />}
    </div>);
  }
}

export default (Form.create()(Index));
