import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Input, Button, Modal, message, Tooltip, Popover } from 'antd';
import { connect } from 'dva';
import { addProduct, updateProduct, getProductDetail } from '@services/system_manage';
import { getProjectDepartMents } from '@services/project';
import QueryArea from './components/QueryArea';
import ProductForm from './components/ProductForm';
import styles from './index.less';

const Search = Input.Search;
const isEmpty = (text) => {
  return text ? text : '-';
};

class index extends Component {
  state = {
    visible: false,
    type: '', // create创建 edit编辑
    data: {},
    current: 1,
    filterObj: {},
    departmentList: [],
    record: {},
    saveLoading: false,
  }

  columns = [{
    title: 'id',
    dataIndex: 'id'
  }, {
    title: '名称',
    dataIndex: 'name'
  }, {
    title: '所属企业',
    dataIndex: 'entName'
  }, {
    title: '所属部门',
    dataIndex: 'department',
    render: (text, record) => {
      const department = text.map(it => it.deptName).join('-');
      return <Popover content={department}>
        <div className='f-toe' style={{width: '100px'}}>{isEmpty(department)}</div>
      </Popover>;
    }
  }, {
    title: '负责人',
    dataIndex: 'responseUser',
    render: (text) => {
      return text ? <Popover content={<span>{text && text.name} {text && text.email}</span>}>
        <div className='f-toe' style={{width: '100px'}}>
          {text && text.name} {text && text.email}
        </div>
      </Popover> : '-';
    }
  }, {
    title: '子产品',
    dataIndex: 'subProductNameList',
    render: (text, record) => {
      const { productname } = this.props.location.query;

      if (record.subProductCount) {
        if (record.subProductCount > 1) {
          return (<Tooltip title={<span>
            {
              record.subProductNameList.map(it => <div>
                {productname}-{it}
              </div>)
            }
          </span>}>
            <div className={styles.relateStyle}>{record.subProductCount}</div>
          </Tooltip>);
        } else {
          return record.subProductNameList.join(',');
        }
      } else {
        return '-';
      }
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: 100,
    render: (text, record) => {
      return <span>
        <a onClick={() => this.handleEdit(record)}>编辑</a>
      </span>;
    }
  }]

  componentDidMount() {
    this.getProductList();
    this.props.dispatch({ type: 'systemManage/getEntlist' });
  }

  getProjectDepartMents = (entid) => {
    getProjectDepartMents({ entid }).then((res) => {
      if (res.code !== 200) return message.error(`获取部门列表失败，${res.msg}`);
      this.setState({ departmentList: res.result });
    }).catch((err) => {
      return message.error(`获取部门列表失败，${err || err.msg}`);
    });
  }

  getProductList = () => {
    const { current, filterObj } = this.state;
    const params = {
      ...filterObj,
      offset: (current - 1) * 10,
      limit: 10,
    };
    this.props.dispatch({ type: 'systemManage/getProductListObj', payload: params });
  }

  handleEdit = (record) => {
    this.setState({ visible: true, type: 'edit' });
    const id = record.id;
    getProductDetail(id).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    const { data, type } = this.state;

    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (type === 'create') {
        const params = {
          ...values,
        };
        this.setState({ saveLoading: true });
        addProduct(params).then((res) => {
          this.setState({ saveLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success('创建产品成功！');
          this.setState({ visible: false });
          this.getProductList();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      } else {
        const params = {
          ...data,
          ...values
        };

        this.setState({ saveLoading: true });
        updateProduct(params).then((res) => {
          this.setState({ saveLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新产品成功！');
          this.setState({ visible: false });
          this.getProductList();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handlePageChange = (num) => {
    this.setState({ current: num }, () => {
      this.getProductList();
    });
  }

  updateFilter = (key, value) => {
    this.setState({ current: 1 });
    const { filterObj } = this.state;
    if (key === 'entid') {
      this.getProjectDepartMents(value);
    }
    const params = {
      ...filterObj,
      [key]: value
    };
    this.setState({ filterObj: params }, () => {
      this.getProductList();
    });
  }

  render() {
    const { productListObj, entList } = this.props;
    const { visible, type, current, data,
      filterObj: { departmentId }, departmentList, saveLoading
    } = this.state;

    return (<div className={styles.container}>
      <div className="bbTitle">
        <span className="name">产品管理</span>
      </div>

      <Card className="cardBottomNone">
        <div className="u-mgb10 f-pr">
          <QueryArea
            updateFilter={this.updateFilter}
            departmentList={departmentList}
            departmentId={departmentId}
            entList={entList}
          />
          <span className="f-fr u-mb10" style={{ position: 'absolute', top: '-5px', right: '0px' }}>
            <Search
              allowClear
              onSearch={value => this.updateFilter('name', value)}
              style={{ width: '220px' }}
              placeholder="搜索名称"
            />
            <Button type="primary" className="u-mgl10" onClick={() => this.setState({ visible: true, type: 'create' })}>创建产品</Button>
          </span>
        </div>

        <Table
          columns={this.columns}
          dataSource={productListObj.data}
          pagination={{
            pageSize: 10,
            current: current,
            onChange: this.handlePageChange,
            defaultCurrent: 1,
            total: productListObj.total
          }}
        />

        <Modal
          visible={visible}
          onCancel={() => this.setState({ visible: false, data: {} })}
          title={type === 'create' ? '创建产品' : '更新产品'}
          onOk={() => this.handleOk()}
          destroyOnClose
          okButtonProps={{ loading: saveLoading }}
          maskClosable={false}
        >
          <ProductForm
            {...this.props}
            data={data}
            departmentList={departmentList}
            entid={data.entid}
            type={type}
          />
        </Modal>
      </Card>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    productListObj: state.systemManage.productListObj,
    entList: state.systemManage.entList,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
