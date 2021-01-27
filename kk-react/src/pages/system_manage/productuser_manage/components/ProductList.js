import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Table, Divider, Tooltip, Modal, Button } from 'antd';
import { connect } from 'dva';
import FilterSelect from '@components/FilterSelect';
import { deleteModal } from '@shared/CommonFun';
import { getUserDetail, updateProductUser } from '@services/product_setting';
import { getUserProductList, getRoleProductList, getUserRelaProduct, dltUserProduct } from '@services/system_manage';
import ProductForm from './ProductForm';
import styles from '../index.less';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      data: [],
      productData: [],
      roleData: [],
      filterObj: {
        productIdList: [],
        roleNameList: [],
      },
      record: {},
      detailData: {},
    };
    this.columns = [
      {
        title: '产品名称',
        dataIndex: 'name',
        render: (text, record) => {
          return <span>{(record.productVO && record.productVO.name) || '--'}</span>;
        }
      },
      {
        title: '岗位',
        dataIndex: 'roleNameList',
        render: (text, record) => {
          const arr = text || [];
          if (arr.length) {
            if (arr.length === 1) {
              return arr[0];
            } else {
              return (<Tooltip title={<span>
                {
                  arr.map(it => <div>
                    {it}
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
        title: '用户组',
        dataIndex: 'usergroupNameList',
        render: (text, record) => {
          const arr = text || [];
          if (arr.length) {
            if (arr.length === 1) {
              return arr[0];
            } else {
              return (<Tooltip title={<span>
                {
                  arr.map(it => <div>
                    {it}
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
        title: '操作',
        dataIndex: 'operator',
        render: (text, record) => {
          return (<div>
            <a onClick={() => this.handleEdit(record)}>编辑</a>
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
    this.getProductList();
    this.getRoleList();
    this.getList();
  }

  handleEdit = (record) => {
    this.setState({ visible: true });
    this.setState({ record });
    const id = record.productVO.id;
    getUserDetail(record.id).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ detailData: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
    this.props.dispatch({ type: 'productSetting/getProductRole', payload: { productId: id } });
    this.props.dispatch({ type: 'productSetting/getUserGroupByProductId', payload: { productId: id } });
  }

  getProductList = () => {
    const params = {
      id: this.props.productid,
    };
    getUserProductList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ productData: res.result });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
  }

  getRoleList = (id) => {
    const params = {
      uid: this.props.productid,
    };
    getRoleProductList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ roleData: res.result });
    }).catch((err) => {
      return message.error(`${err || err.msg}获取产品异常`);
    });
  };

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    const NewFilterObj = {
      ...filterObj,
      [key]: value,
    };
    this.setState({
      filterObj: NewFilterObj,
    }, () => this.getList());
  }

  getList = () => {
    this.setState({ loading: true });
    const params = {
      ...this.state.filterObj,
      id: this.props.productid,
    };
    getUserRelaProduct(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ loading: false });
        this.setState({ data: res.result });
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
  }

  handleRemove = () => {
    const { record } = this.state;
    const params = {
      id: record.id,
    };
    deleteModal({
      title: '确认删除吗？',
      okCallback: () => {
        dltUserProduct(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除产品成功！');
          this.getList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) =>{
      if (err) return ;
      const params = {
        id: this.state.record.id,
        ...values,
      };
      updateProductUser(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更新产品成功！');
        this.setState({ visible: false });
        this.getList();
        this.getRoleList();
      }).catch(err => {
        this.setState({ loading: false });
        return message.error(err || err.message);
      });
    });
  }

  getDiff = (data) => {
    let arr = [];
    data.forEach(it => {
      if (!arr.some(i => i.roleName === it.roleName)) {
        arr.push(it);
      }
    });
    return arr;
  }

  render() {
    const { productData, roleData, data, loading, visible } = this.state;
    const { record, productRole, userGroup, } = this.props;
    return (<span>
      <div className='bbTitle f-jcsb-aic'>
        <span className='name'>用户列表-{record.name}的产品配置</span>
        <span className='btn98'>
          <Button type='primary' onClick={() => this.props.setProduct(null)}>返回</Button>
        </span>
      </div>
      <div className='bgWhiteModel'>
        <div className={`${styles.queryArea} f-jcsb-aic u-mgb10`}>
          <span>
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

            <span className='queryHover'>
              <span className="grayColor">岗位：</span>
              <span className={styles.queryLabel}>
                <FilterSelect
                  onChange={(value) => this.updateFilter('roleNameList', value)}
                  dataSource={this.getDiff(roleData).map((item) => ({
                    label: item.roleName, value: item.roleName,
                  }))}
                />
              </span>

            </span>

          </span>
        </div>
        <Table
          dataSource={data}
          columns={this.columns}
          loading={loading}
          pagination={false}
        />
        <Modal
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleOk()}
          title={'编辑'}
          width={700}
          bodyStyle={{ maxHeight: '450px', overflow: 'auto' }}
          destroyOnClose
          maskClosable={false}
        >
          <ProductForm
            form={this.props.form}
            productRole={productRole}
            userGroup={userGroup}
            editData={this.state.detailData} />
        </Modal>
      </div>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productRole: state.productSetting.productRole,
    userGroup: state.productSetting.userGroup,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
