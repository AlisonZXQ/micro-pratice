import React, { Component } from 'react';
import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Card,
  Table,
  Input,
  Button,
  Checkbox,
  Tooltip,
  Modal,
  Empty,
  message,
  Select,
} from 'antd';
import { getFormLayout } from '@utils/helper';
import { connect } from 'dva';
import { history } from 'umi';
import debounce from 'lodash/debounce';
import {
  getPermissionUserList, getPermissionUserGroupList,
  addUser, addUserGroup, changeAuth, deleteAuth, getUserGroupSearchEnt
} from '@services/report';
import NoPermission from '@components/403';
import { deleteModal, handleSearchUser } from '@shared/CommonFun';
import { REOPRT_PERMISSION, REPORT_TABS } from '@shared/ReportConfig';
import Header from '../components/Header';
import styles from './index.less';

const formLayout = getFormLayout(5, 19);
const Search = Input.Search;
const FormItem = Form.Item;
const Option = Select.Option;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '',
      userList: [],
      userGroupList: [],
      user: '',
      userGroup: '',
      userGroupSearch: [],
      userSearch: [],
      userLoading: false,
      userGroupLoading: false,
      productId: '',
      addLoading: false,
    };
    this.handleSearchGroup = debounce(this.handleSearchGroup, 800);
  }

  columns = [{
    title: '姓名',
    dataIndex: 'realname',
    render: (text, record) => {
      return record.user && record.user.realname;
    }
  }, {
    title: '邮箱',
    dataIndex: 'email',
    render: (text, record) => {
      return record.user && record.user.email;
    }
  }, {
    title: '用户组',
    dataIndex: 'group',
    render: (text, record) => {
      return ((record.rbacUserGroup && record.rbacUserGroup.name) ? record.rbacUserGroup.name : '-');
    }
  }, {
    title: <span>
      <span className="u-mgr5">授权</span>
      <Tooltip title={[<div>查看：实时数据、已生成的报告</div>,
        <div>管理：编辑报表、生成报告、自动报告配置、删除报告</div>]}>
        <InfoCircleTwoTone />
      </Tooltip>
    </span>,
    dataIndex: 'access',
    render: (text, record) => {
      const { userProductFlag } = this.props;
      return ([
        <Checkbox checked disabled>查看</Checkbox>,
        <Checkbox
          checked={record.reportPermission && record.reportPermission.auth === 2}
          onChange={(e) => this.handleChangeAuth(e, record.reportPermission && record.reportPermission.id, 'user')}
          disabled={!userProductFlag.isProductAdmin}
        >管理</Checkbox>
      ]);
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      const { userProductFlag } = this.props;
      return (<a
        className={styles.delColor}
        onClick={() => this.handleDeleteAuth(record.reportPermission && record.reportPermission.id, 'user')}
        disabled={!userProductFlag.isProductAdmin}
      >删除</a>);
    }
  }]

  columns1 = [{
    title: '用户组',
    dataIndex: 'group',
    render: (text, record) => {
      return record.rbacUserGroup && record.product && `${record.rbacUserGroup.name}-${record.product.name}`;
    }
  }, {
    title: '归属子产品',
    dataIndex: 'product',
    render: (text, record) => {
      return text ? text.name : '-';
    }
  }, {
    title: <span>
      <span className="u-mgr5">授权</span>
      <Tooltip title={[<div>查看：实时数据、已生成的报告</div>,
        <div>管理：编辑报表、生成报告、自动报告配置、删除报告</div>]}>
        <InfoCircleTwoTone />
      </Tooltip>
    </span>,
    dataIndex: 'access',
    render: (text, record) => {
      return ([
        <Checkbox checked disabled>查看</Checkbox>,
        <Checkbox
          defaultChecked={record.reportPermission && record.reportPermission.auth === REOPRT_PERMISSION.MANAGE}
          onChange={(e) => this.handleChangeAuth(e, record.reportPermission && record.reportPermission.id, 'userGroup')}
        >
          管理
        </Checkbox>
      ]);
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      return (<a className={styles.groupDelColor} onClick={() => this.handleDeleteAuth(record.reportPermission && record.reportPermission.id, 'userGroup')}>删除</a>);
    }
  }]

  componentDidMount() {
    const { lastProduct } = this.props;
    if (lastProduct && lastProduct.id) {
      const id = lastProduct.id;
      this.setState({ productId: id }, () => {
        this.getPermissionUserList();
        this.getPermissionUserGroupList();
        this.getProductFlag();
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeId = this.props.lastProduct && this.props.lastProduct.id;
    const nextId = nextProps.lastProduct && nextProps.lastProduct.id;

    if (beforeId !== nextId) {
      history.push(`/report/access?productid=${nextId}`);
      this.setState({ productId: Number(nextId) }, () => {
        this.getPermissionUserList();
        this.getPermissionUserGroupList();
        this.getProductFlag();
      });
    }
  }

  getProductFlag = () => {
    const { productId } = this.state;
    this.props.dispatch({ type: 'product/getProductFlag', payload: { productId: productId } });
  }

  handleChangeAuth = (e, id, type) => {
    const params = {
      id,
      auth: e.target.checked ? REOPRT_PERMISSION.MANAGE : REOPRT_PERMISSION.READ,
    };
    this.setState({ userLoading: true });
    changeAuth(params).then((res) => {
      this.setState({ userLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      message.success('权限更改成功！');
      if (type === 'user') {
        this.getPermissionUserList();
      } else {
        this.getPermissionUserGroupList();
      }
    }).catch((err) => {
      this.setState({ userLoading: false });
      return message.error(err || err.message);
    });
  }

  handleDeleteAuth = (id, type) => {
    const that = this;
    deleteModal({
      title: '确认清除该用户/用户组的权限吗？',
      okCallback: () => {
        deleteAuth({ id }).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('清除该用户/用户组的权限成功！');
          if (type === 'user') {
            that.getPermissionUserList();
          } else {
            that.getPermissionUserGroupList();
          }
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getPermissionUserList = () => {
    const { productId } = this.state;
    this.setState({ userLoading: true });

    getPermissionUserList({ productid: productId }).then((res) => {
      this.setState({ userLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ userList: res.result || [] });
    }).catch((err) => {
      this.setState({ userLoading: false });
      return message.error(err || err.message);
    });
  }

  getPermissionUserGroupList = () => {
    const { productId } = this.state;
    this.setState({ userGroupLoading: true });

    getPermissionUserGroupList({ productid: productId }).then((res) => {
      this.setState({ userGroupLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ userGroupList: res.result || [] });
    }).catch((err) => {
      this.setState({ userGroupLoading: false });
      return message.error(err || err.message);
    });
  }

  updateFilter = (key, value) => {
    this.setState({ [key]: value });
  }

  processData = (type) => {
    const { userList, userGroupList, user, userGroup } = this.state;
    if (type === 'user') {
      return userList.filter(it => (it.user && it.user.realname.includes(user)) || (it.user && it.user.email.includes(user)));
    }
    if (type === 'userGroup') {
      return userGroupList.filter(it => (it.rbacUserGroup && it.rbacUserGroup.name.includes(userGroup)));
    }
  }

  handleSearchGroup = (value) => {
    const { productid } = this.props.location.query;
    const params = {
      productid: productid,
      name: value,
      offset: 0,
      limit: 200,
    };
    if (value.length) {
      getUserGroupSearchEnt(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ userGroupSearch: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取用户组异常`);
      });
    }
  }

  handleAdd = () => {
    const { productid } = this.props.location.query;

    const { type } = this.state;
    if (type === 'user') {
      this.props.form.validateFields(['email'], (err, values) => {
        if (err) return;
        const params = {
          productid: productid,
          email: values.email,
        };
        this.setState({ addLoading: true });
        addUser(params).then((res) => {
          this.setState({ addLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success(`添加用户成功！`);
          this.setState({ visible: false });
          this.getPermissionUserList();
        }).catch((err) => {
          this.setState({ addLoading: false });
          return message.error(err || err.message);
        });
      });
    }

    if (type === 'group') {
      this.props.form.validateFields(['usergroupid'], (err, values) => {
        if (err) return;
        const params = {
          productid: productid,
          usergroupid: values.usergroupid,
        };
        this.setState({ addLoading: true });
        addUserGroup(params).then((res) => {
          this.setState({ addLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success(`添加用户组成功！`);
          this.setState({ visible: false });
          this.getPermissionUserGroupList();
        }).catch((err) => {
          this.setState({ addLoading: false });
          return message.error(err || err.message);
        });
      });
    }
  }

  callbackProduct = (value) => {
    this.setState({ productId: Number(value) }, () => {
      this.getPermissionUserList();
      this.getPermissionUserGroupList();
      this.getProductFlag();
    });
  }

  render() {
    const { form: { getFieldDecorator }, userProductFlag } = this.props;
    const { productid } = this.props.location.query;
    const { visible, type, userGroupSearch, userSearch, userLoading, addLoading, userGroupLoading } = this.state;

    return (
      <Card className={`${styles.reportCard} bgCard`}>
        <Header activeKey={`${REPORT_TABS.ACCESS_MANAGE}`} />
        <div style={{ padding: '0px 20px 20px 20px' }}>
          {
            productid ? userProductFlag.isProductAdmin ?
              <span>
                <div className='bbTitle f-jcsb-aic'>
                  <span className='name'>用户列表</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => this.setState({ visible: true, type: 'user' })}
                    disabled={!userProductFlag.isProductAdmin}
                  >添加用户</Button>
                </div>
                <div className='bgWhiteModel' style={{ padding: '20px' }}>
                  <span>搜索用户：</span>
                  <Search
                    allowClear
                    onSearch={value => this.updateFilter('user', value)}
                    style={{ width: '220px' }}
                    placeholder="请输入用户名"
                  />
                </div>
                <div
                  className='bgWhiteModel u-mgt8'
                  style={{ paddingBottom: '0px' }}
                >
                  <Table
                    className='tableMargin'
                    rowKey={record => record.id}
                    columns={this.columns}
                    dataSource={this.processData('user')}
                    loading={userLoading}
                  />
                </div>

                <div className='bbTitle f-jcsb-aic'>
                  <span className='name'>用户组列表</span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => this.setState({ visible: true, type: 'group' })}
                    disabled={!userProductFlag.isProductAdmin}
                  >添加用户组</Button>
                </div>
                <div className='bgWhiteModel' style={{ padding: '20px' }}>
                  <span>搜索用户：</span>
                  <Search
                    allowClear
                    onSearch={value => this.updateFilter('userGroup', value)}
                    style={{ width: '220px' }}
                    placeholder="请输入用户组名"
                  />
                </div>
                <div
                  className='bgWhiteModel u-mgt8'
                  style={{ paddingBottom: '0px' }}
                >
                  <Table
                    className='tableMargin'
                    rowKey={record => record.id}
                    columns={this.columns1}
                    dataSource={this.processData('userGroup')}
                    loading={userGroupLoading}
                  />
                </div>

                <Modal
                  title={type === 'user' ? '添加用户' : '添加用户组'}
                  visible={visible}
                  onCancel={() => this.setState({ visible: false })}
                  onOk={() => this.handleAdd()}
                  confirmLoading={addLoading}
                  maskClosable={false}
                >
                  {
                    type === 'user' && <FormItem label="姓名或邮箱" {...formLayout}>
                      {
                        getFieldDecorator('email', {
                          rules: [{ required: true, message: '此项必填！' }]
                        })(
                          <Select
                            mode="multiple"
                            allowClear
                            showSearch
                            showArrow={false}
                            placeholder="请输入人名或邮箱"
                            filterOption={false}
                            style={{ width: '100%' }}
                            onSearch={(value) => handleSearchUser(value, (result) => {
                              this.setState({ userSearch: result });
                            })}
                          >
                            {
                              userSearch && userSearch.map(it => (
                                <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
                              ))
                            }
                          </Select>)
                      }
                    </FormItem>
                  }
                  {
                    type === 'group' && <FormItem label="用户组名称" {...formLayout}>
                      {
                        getFieldDecorator('usergroupid', {
                          rules: [{ required: true, message: '此项必填！' }]
                        })(
                          <Select
                            allowClear
                            showSearch
                            showArrow={false}
                            placeholder="请输入用户组名"
                            filterOption={false}
                            style={{ width: '100%' }}
                            onSearch={(value) => this.handleSearchGroup(value)}
                          >
                            {
                              userGroupSearch && userGroupSearch.map(it => (
                                <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id}>{it.rbacUserGroup.name}-{it.product.name}</Option>
                              ))
                            }
                          </Select>
                        )
                      }
                    </FormItem>
                  }
                </Modal>
              </span> : <NoPermission />
              :
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '60vh', marginTop: '150px' }} />
          }
        </div>

      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userProductFlag: state.product.userProductFlag,
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
