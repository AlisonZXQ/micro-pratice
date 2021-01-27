import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Button,
  Modal,
  Select,
  message,
  Table,
  Spin,
  Input,
  Row,
  notification,
  Empty,
} from 'antd';
import { connect } from 'dva';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import { queryUser, addRoleGroup, deleteRoleGroup } from '@services/project';
import { getUserGroupSearchEnt } from '@services/report';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import styles from './index.less';

const Option = Select.Option;
const Search = Input.Search;

const groupSetting = [{
  key: 'adminGroup',
  name: '项目管理员',
  title: '项目管理员列表',
  dataType: 'projectAdminUserList',
  stateIndex: 'admin',
}, {
  key: 'editGroup',
  name: '项目编辑',
  title: '项目编辑列表',
  dataType: 'projectEditUserList',
  stateIndex: 'edit',
}, {
  key: 'viewGroup',
  name: '项目查看',
  title: '项目查看列表',
  dataType: 'projectReadUseList',
  stateIndex: 'read',
}];

class index extends Component {
  state = {
    visible: false,
    userList: [],
    userGroupList: [],
    data: [], // 用户列表
    dataGroup: [], // 用户组列表
    type: '', // 是编辑组还是查看组
    addLoading: false,
    typeAdd: '', // 是添加用户还是用户组
  }

  columnsList = [{
    title: '成员',
    dataIndex: 'user',
    width: '40vw',
    render: (text, record) => {
      return `${record.userName}`;
    }
  }, {
    title: '用户邮箱',
    dataIndex: 'email',
    width: '40vw',
    render: (text, record) => {
      return record.userEmail;
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      return (record.roleGroup !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <a onClick={() => this.handleDelete(record)} className='delColor'>删除</a>);
    }
  }];
  columnsManagerList = [{
    title: '成员',
    dataIndex: 'user',
    width: '40vw',
    render: (text, record) => {
      return `${record.userName}`;
    }
  }, {
    title: '用户邮箱',
    dataIndex: 'email',
    width: '40vw',
    render: (text, record) => {
      return record.userEmail;
    }
  }];

  columns = [{
    title: '成员',
    dataIndex: 'user',
    render: (text, record) => {
      return `${record.realname} ${record.email}`;
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      return <a onClick={() => this.handleRemove(record.id)}>移除</a>;
    }
  }];

  columnsGroup = [{
    title: '用户组',
    dataIndex: 'group',
    render: (text, record) => {
      return `${record.rbacUserGroup.name}-${record.product.name}`;
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      return <a onClick={() => this.handleRemoveGroup(record.rbacUserGroup.id)}>移除</a>;
    }
  }];

  columnsGroupList = [{
    title: '成员',
    dataIndex: 'user',
    width: '80vw',
    render: (text, record) => {
      return `${record.usergoupname}-${record.productName}`;
    }
  }, {
    title: '操作',
    dataIndex: 'caozuo',
    render: (text, record) => {
      return (record.roleGroup !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <a onClick={() => this.handleDelete(record)} className="delColor">删除</a>);
    }
  }];

  componentDidMount() {
    const { id } = this.props.location.query;
    this.props.dispatch({ type: 'project/getRoleGroup', payload: { projectid: id } });
  }

  handleAdd = (type, typeAdd) => {
    this.setState({
      visible: true,
      type,
      typeAdd,
    });
  }

  handleDelete = (record) => {
    const { id } = this.props.location.query;
    const type = record.userid ? 0 : 1;
    const params = {
      projectId: Number(id),
      userId: type === 0 ? record.userid : record.usergroupid,
      roleGroup: record.roleGroup,
      type,
    };
    deleteRoleGroup(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除用户/用户组权限成功！');
      this.props.dispatch({ type: 'project/getRoleGroup', payload: { projectid: id } });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleRemove = (id) => {
    const { data } = this.state;
    let newData = [...data];
    this.setState({ data: newData.filter(it => it.id !== id) });
  }

  handleRemoveGroup = (id) => {
    const { dataGroup } = this.state;
    let newData = [...dataGroup];
    this.setState({ dataGroup: newData.filter(it => it.rbacUserGroup.id !== id) });
  }

  handleSearch = (value, type) => {
    const params = {
      value,
      limit: 200,
      offset: 0,
    };
    if (value.trim().length) {
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

  handleSearchGroup = (value) => {
    const { pid } = this.props.location.query;
    const params = {
      productid: pid,
      name: value,
      offset: 0,
      limit: 200,
    };
    if (value.length) {
      getUserGroupSearchEnt(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ userGroupList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取用户组异常`);
      });
    }
  }

  getExtra = (type) => {
    return (
      type !== 'adminGroup' &&
      [
        <Button type="primary" className="u-mgr10" onClick={(e) => { e.stopPropagation(); this.handleAdd(type, 'user') }}>添加用户</Button>,
        <Button type="primary" onClick={(e) => { e.stopPropagation(); this.handleAdd(type, 'userGroup') }}>添加用户组</Button>
      ]
    );
  }

  handleSelect = (value, d) => {
    if (d && value) {
      const { data } = this.state;
      if (data.some(it => it.id === value)) {
        return message.warn('用户已选择！');
      }
      const newData = [...data];
      newData.unshift(d.props.data);
      this.setState({ data: newData });
    }
  }

  handleSelectGroup = (value, d) => {
    if (d && value) {
      const { dataGroup } = this.state;
      if (dataGroup.some(it => it.rbacUserGroup.id === value)) {
        return message.warn('用户组已选择！');
      }
      const newData = [...dataGroup];
      newData.unshift(d.props.data);
      this.setState({ dataGroup: newData });
    }
  }

  handleOk = () => {
    const { data, type, typeAdd, dataGroup } = this.state;
    const { id } = this.props.location.query;

    const params = {
      projectId: Number(id),
      roleGroup: type,
      memberids: typeAdd === 'user' ? data.map(it => it.id) : dataGroup.map(it => it.rbacUserGroup.id),
      type: typeAdd === 'user' ? 0 : 1,
    };

    this.setState({ addLoading: true });
    addRoleGroup(params).then((res) => {
      this.setState({ addLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      message.success('添加成功！');
      this.setState({ visible: false, data: [], dataGroup: [] });
      if (res.result.fail) {
        this.showFailItems(res.result);
      }
      this.props.dispatch({ type: 'project/getRoleGroup', payload: { projectid: id } });
    }).catch((err) => {
      this.setState({ addLoading: false });
      return message.error(err || err.message);
    });
  }

  showFailItems = (data) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button type="primary" size="small" onClick={() => notification.close(key)}>
        知道了
      </Button>
    );

    const openNotification = () => {
      const args = {
        message: <span>添加成功{data.success}(人/组)，失败{data.fail}(人/组)，失败列表如下：</span>,
        description:
          <span>
            {
              data.failItems.map(it =>
                <div>
                  {it.username}{it.email ? `@${it.email}` : ''}（{it.reason}）
                </div>)
            }
          </span>,
        duration: 10,
        className: styles.notice,
        btn,
        key,
      };
      notification.open(args);
    };
    openNotification();
  }

  processData = (data, type) => {
    return this.state[type] ? (data && data.filter(it => it.userEmail.includes(this.state[type]) || it.userName.includes(this.state[type]))) : data;
  }

  processDataGroup = (data, type) => {
    return this.state[type] ? (data && data.filter(it => it.usergoupname.includes(this.state[type]))) : data;
  }

  render() {
    const { form: { getFieldDecorator }, roleGroup, loading, addLoading } = this.props;
    const { id } = this.props.location.query;
    const { visible, userList, data, typeAdd, userGroupList, dataGroup } = this.state;

    return (<div style={{ padding: '10px 16px' }}>
      <div>
        <Link to={`/project/detail?id=${id}`} className="u-subtitle u-mgt5">
          <span>
            <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
            返回项目
          </span>
        </Link>
      </div>
      <Spin spinning={loading}>
        {
          groupSetting.map((it, index) => (
            <div>
              <div className='f-jcsb-aic'>
                <div className='bbTitle' style={{ marginTop: '18px', marginBottom: '18px' }}><span className='name'>{it.title}</span></div>
                <div>
                  {this.getExtra(it.key)}
                </div>
              </div>
              <div className='bgWhiteModel'>
                <Row className="u-mgt10">
                  {it.key === 'adminGroup' ? <span>名称：</span> : <span>用户/用户组名称：</span>}
                  <Search
                    style={{ width: '260px' }}
                    key={`${it.key}-search`}
                    allowClear
                    onSearch={value => this.setState({ [it.stateIndex]: value })}
                    placeholder="输入名称或邮箱搜索"
                    className="f-fw"
                  />
                </Row>
                <span>
                  {roleGroup[it.dataType] && roleGroup[it.dataType].userlist.length ?
                    <Table
                      className='u-mgt20'
                      key={it.key}
                      rowKey={record => record.projectMemberRoleGroupId}
                      columns={index === 0 ? this.columnsManagerList : this.columnsList}
                      dataSource={this.processData(roleGroup[it.dataType] && roleGroup[it.dataType].userlist, it.stateIndex)}
                      pagination={roleGroup[it.dataType].userlist.length > 10 ? true : false}
                    /> :
                    <span className='u-mg20'>
                      {index === 0 ?
                        <Empty description={
                          <span>
                            暂无管理员数据
                          </span>
                        } /> :
                        <Empty description={
                          <span>
                            暂无用户数据
                          </span>
                        } />
                      }

                    </span>
                  }
                </span>

              </div>
              {
                it.key !== 'adminGroup' &&
                <div className='bgWhiteModel' style={{ marginTop: '12px' }}>
                  {roleGroup[it.dataType] && roleGroup[it.dataType].roleGroupUserGroupVOList.length ?
                    <Table
                      key={it.key}
                      rowKey={record => record.usergroupid}
                      columns={this.columnsGroupList}
                      dataSource={this.processDataGroup(roleGroup[it.dataType] && roleGroup[it.dataType].roleGroupUserGroupVOList, it.stateIndex)}
                      pagination={roleGroup[it.dataType].roleGroupUserGroupVOList.length > 10 ? true : false}
                    /> :
                    <span className='u-mg20'>
                      <Empty description={
                        <span>
                          暂无用户组数据
                        </span>
                      } />
                    </span>
                  }

                </div>
              }

            </div>
          ))
        }

        <Modal
          title={typeAdd === 'user' ? "添加用户" : '添加用户组'}
          visible={visible}
          onCancel={() => this.setState({ visible: false, data: [], dataGroup: [] })}
          onOk={() => this.handleOk()}
          destroyOnClose
          maskClosable={false}
          okButtonProps={{ loading: addLoading }}
        >
          {
            typeAdd === 'user' &&
            <span>
              {getFieldDecorator('user', {
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select
                  allowClear
                  showSearch
                  showArrow={false}
                  placeholder="搜索成员"
                  filterOption={false}
                  onSearch={(value) => this.handleSearch(value)}
                  onChange={(value, data) => this.handleSelect(value, data)}
                  style={{ width: '470px' }}
                  className="u-mgb10"
                >
                  {
                    userList && userList.map(it => (
                      <Option key={it.id} value={it.id} data={it}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              )}
              {data.length ?
                <Table
                  rowKey={record => record.id}
                  columns={this.columns}
                  dataSource={data}
                  pagination={false}
                /> :
                <Empty />
              }
            </span>
          }

          {
            typeAdd === 'userGroup' &&
            <span>
              {
                getFieldDecorator('userGroup', {
                  rules: [{ required: true, message: '此项必填！' }]
                })(
                  <Select
                    allowClear
                    showSearch
                    showArrow={false}
                    placeholder="请输入用户组名"
                    filterOption={false}
                    style={{ width: '470px' }}
                    className="u-mgb10"
                    onSearch={(value) => this.handleSearchGroup(value)}
                    onChange={(value, data) => this.handleSelectGroup(value, data)}
                  >
                    {
                      userGroupList && userGroupList.map(it => (
                        <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id} data={it}>{it.rbacUserGroup.name}-{it.product.name}</Option>
                      ))
                    }
                  </Select>
                )
              }
              {dataGroup.length ?
                <Table
                  rowKey={record => record.rbacUserGroup.id}
                  columns={this.columnsGroup}
                  dataSource={dataGroup}
                  pagination={false}
                /> :
                <Empty />
              }

            </span>
          }
        </Modal>
      </Spin>
    </div>);
  }

}

const mapStateToProps = (state) => {
  return {
    roleGroup: state.project.roleGroup,
    loading: state.loading.effects['project/getRoleGroup'],
  };
};

export default connect(mapStateToProps)(Form.create()(index));
