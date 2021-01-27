import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Input, Button, Modal, Divider, Tooltip, message, notification } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import { addProductUser, updateProductUser, getUserDetail, deleteProductUser } from '@services/product_setting';
import { PRODUCT_USER_ROLE } from '@shared/ProductSettingConfig';
import { warnModal } from '@shared/CommonFun';
import QueryArea from './components/QueryArea';
import MemberForm from './components/MemberForm';
import styles from './index.less';

const Search = Input.Search;

class index extends Component {
  state = {
    visible: false,
    record: {}, // 删除的数据
    data: {}, //编辑的数据
    current: 1,
    filterObj: {},
    loading: false,
  }

  columns = [{
    title: '',
    dataIndex: 'icon',
    width: 50,
    render: (text, record) => {
      return (<span>
        {
          record.userType === PRODUCT_USER_ROLE.OWNER &&
          <MyIcon type='icon-owner' />
        }
      </span>);
    }
  }, {
    title: '名称',
    dataIndex: 'name',
    render: (text, record) => {
      return <span>
        {record.userVO && record.userVO.name}
      </span>;
    }
  }, {
    title: '邮箱',
    dataIndex: 'email',
    render: (text, record) => {
      return record.userVO && record.userVO.email;
    }
  }, {
    title: '岗位',
    dataIndex: 'roleNameList',
    render: (text, record) => {
      const arr = text || [];
      if (arr.length) {
        if (arr.length === 1) {
          return <TextOverFlow content={arr[0]} maxWidth={'300px'} />;
        } else {
          return (<Tooltip title={<span>
            {
              arr.map(it => <div>
                {it}
              </div>)
            }
          </span>}>
            <div className={styles.numberStyle}>{arr.length}</div>
          </Tooltip>);
        }
      } else {
        return '/';
      }
    }
  }, {
    title: '部门',
    dataIndex: 'department',
    render: (text, record) => {
      return record.userVO && record.userVO.department ? <TextOverFlow content={record.userVO.department} maxWidth={'15vw'} /> : '--';
    }
  }, {
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
              arr.map(item => <div>
                {item}
              </div>)
            }
          </span>}>
            <div className={styles.numberStyle}>{arr.length}</div>
          </Tooltip>);
        }
      } else {
        return '/';
      }
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    width: 150,
    render: (text, record) => {
      return <span>
        <a onClick={() => this.handleEdit(record.id)}>编辑</a>
        <Divider type="vertical" />
        <a
          onClick={() => { this.setState({ record }, () => this.handleRemove()) }}
          className="delColor"
          disabled={record.userType === PRODUCT_USER_ROLE.OWNER}
        >移除</a>
      </span>;
    }
  }]

  componentDidMount() {
    const pid = this.props;
    if (pid) {
      this.getProductRole(pid);
      this.getUserGroup(pid);
      this.getUserList(pid);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.productid !== this.props.productid) {
      const pid = nextProps;
      this.getProductRole(pid);
      this.getUserGroup(pid);
      this.getUserList(pid);
    }
  }

  getProductRole = (pid) => {
    const { productid } = (this.props.location && this.props.location.query) || pid;
    this.props.dispatch({ type: 'productSetting/getProductRole', payload: { productId: productid } });
  }

  getUserGroup = (pid) => {
    const { productid } = (this.props.location && this.props.location.query) || pid;
    this.props.dispatch({ type: 'productSetting/getUserGroupByProductId', payload: { productId: productid } });
  }

  getUserList = (pid) => {
    const { productid } = (this.props.location && this.props.location.query) || pid || this.props;
    const { filterObj, current } = this.state;
    const params = {
      productId: productid,
      ...filterObj,
      offset: (current - 1) * 10,
      limit: 10,
    };
    this.props.dispatch({ type: 'productSetting/getUserObjByPage', payload: params });
  }

  handleEdit = (id) => {
    this.setState({ visible: true, type: 'edit' });
    getUserDetail(id).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    const newFilterObj = { ...filterObj };
    newFilterObj[key] = value;

    this.setState({ filterObj: newFilterObj }, () => {
      this.getUserList();
    });
  }

  openNotification = (data) => {
    const args = {
      message: '未成功的用户如下：',
      description:
        <span>
          {
            data.map(it => <div>{it}</div>)
          }
        </span>,
      duration: 4, // 延迟4s
    };
    notification.open(args);
  };

  handleOk = () => {
    const { productid } = (this.props.location && this.props.location.query) || this.props;
    const { type, data } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) return;

      if (type === 'create') {
        const params = {
          productId: productid,
          ...values,
        };
        this.setState({ loading: true });
        addProductUser(params).then(res => {
          this.setState({ loading: false });
          if (res.code !== 200) return message.error(res.msg);
          if (res.result[0]) {
            message.warning(res.result[0]);
          } else {
            message.success(`创建用户成功！`);
          }


          if (res.result.length) {
            this.openNotification(res.result);
          }
          this.setState({ visible: false });
          this.getUserList();

        }).catch(err => {
          this.setState({ loading: false });
          return message.error(err || err.message);
        });
      } else {
        const params = {
          ...data,
          ...values,
        };
        this.setState({ loading: true });
        updateProductUser(params).then(res => {
          this.setState({ loading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新用户成功！');
          this.setState({ visible: false });
          this.getUserList();
        }).catch(err => {
          this.setState({ loading: false });
          return message.error(err || err.message);
        });
      }
    });
  }

  handleRemove = () => {
    const { record } = this.state;
    warnModal({
      title: '确认移除吗？',
      content: '移除后该成员将无法进入产品，ta已完成的工作量会被保留。',
      okCallback: () => {
        deleteProductUser(record.id).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('移除用户成功！');
          this.getUserList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handlePageChange = (num) => {
    this.setState({ current: num }, () => this.getUserList());
  }

  render() {
    const { productRole, userGroup, userObj, lastProduct } = this.props;
    const { visible, data, current, type, loading } = this.state;

    return ([
      <div className='settingTitle'>
        {lastProduct.name}-成员管理
      </div>,
      <div className={styles.container}>

        <div className="bbTitle">
          <span className="name">成员管理</span>
        </div>

        <Card className="cardBottomNone">
          <div className="u-mgb10 f-pr">
            <QueryArea
              productRole={productRole}
              userGroup={userGroup}
              updateFilter={this.updateFilter}
            />
            <span className="f-fr u-mb10" style={{ position: 'absolute', top: '-5px', right: '0px' }}>
              <Search
                allowClear
                onSearch={value => this.updateFilter('name', value)}
                style={{ width: '220px' }}
                placeholder="输入姓名搜索成员"
              />
              <Button type="primary" className="u-mgl10" onClick={() => this.setState({ visible: true, type: 'create' })}>添加成员</Button>
            </span>
          </div>

          <Table
            columns={this.columns}
            dataSource={userObj.list}
            pagination={{
              pageSize: 10,
              current: current,
              onChange: this.handlePageChange,
              defaultCurrent: 1,
              total: userObj.total,
            }}
          />

          <Modal
            visible={visible}
            onCancel={() => this.setState({ visible: false })}
            onOk={() => this.handleOk()}
            title={type === 'create' ? '添加成员' : '编辑成员'}
            width={700}
            bodyStyle={{ maxHeight: '450px', overflow: 'auto' }}
            destroyOnClose
            okButtonProps={{ loading }}
            maskClosable={false}
          >
            <MemberForm {...this.props} data={data} type={type} />
          </Modal>
        </Card>
      </div>]);
  }
}

const mapStateToProps = (state) => {
  return {
    productRole: state.productSetting.productRole,
    userGroup: state.productSetting.userGroup,
    userObj: state.productSetting.userObj,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
