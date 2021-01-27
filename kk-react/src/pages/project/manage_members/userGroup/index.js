import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, message, Select, Button, notification, Spin } from 'antd';
import { connect } from 'dva';
import { PROEJCT_PERMISSION, MANAGE_MEMBER } from '@shared/ProjectConfig';
import { getUserGroupSearchEnt } from '@services/report';
import { getUser } from '@services/approvalflow';
import { addRoleGroup, deleteRoleGroup } from '@services/project';
import { deleteModal } from '@shared/CommonFun';

const { Option } = Select;

class UserGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
      visible: false,
      userGroupList: [],
      dataGroup: [],
      groupList: [],
      expandedRowKeys: [], //控制展开行
      userGroupDetail: [], //展开行内的详情
    };

    this.columns = [
      {
        title: '用户组',
        dataIndex: 'usergoupname',
        key: 'usergoupname',
        render: (text, record) => {
          return <span>{text}-{record.productName}</span>;
        }
      },
      {
        title: '操作',
        width: 100,
        dataIndex: '',
        key: 'x',
        render: (text, record) => {
          const { sameRoleGroup } = this.props;
          return (sameRoleGroup === PROEJCT_PERMISSION.MANAGE && <span>
            <a className='delColor' onClick={() => this.handleDelete(record)}>删除</a>
          </span>);
        },
      },
    ];

    this.columnsGroup = [{
      title: '用户组',
      dataIndex: 'group',
      render: (text, record) => {
        return `${record.rbacUserGroup.name}-${record.product.name}`;
      }
    }, {
      title: '操作',
      dataIndex: 'caozuo',
      width: 100,
      render: (text, record) => {
        return <a onClick={() => this.handleRemoveGroup(record.rbacUserGroup.id)}>移除</a>;
      }
    }];
  }

  componentDidMount() {
    this.props.getThis(this);

    this.getList();
  }

  getList = () => {
    const { id } = this.props.location.query;
    this.props.dispatch({ type: 'project/getRoleGroup', payload: { projectid: id } });
  }

  handleRemoveGroup = (id) => {
    const { dataGroup } = this.state;
    let newData = [...dataGroup];
    this.setState({ dataGroup: newData.filter(it => it.rbacUserGroup.id !== id) });
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
          this.setState({ userGroupList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.message}获取用户组异常`);
      });
    }
  }

  handleSelectGroup = (value, d) => {
    if(d && value) {
      const { dataGroup } = this.state;
      if (dataGroup.some(it => it.rbacUserGroup.id === value)) {
        return message.warn('用户组已选择！');
      }
      const newData = [...dataGroup];
      newData.unshift(d.props.data);
      this.setState({ dataGroup: newData });
    }
  }

  handleDelete = (record) => {
    deleteModal({
      title: '删除用户组',
      content: '删除后项目内容将对该用户组不可见，你确定要继续吗？',
      okCallback: () => {
        const { id } = this.props.location.query;
        const type = record.userid ? MANAGE_MEMBER.USER : MANAGE_MEMBER.USERGROUP;
        const params = {
          projectId: Number(id),
          userId: type === MANAGE_MEMBER.USER ? record.userid : record.usergroupid,
          roleGroup: record.roleGroup,
          type,
        };
        deleteRoleGroup(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除用户组成功！');
          this.getList();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  openCreate = () => {
    this.setState({ visible: true });
  }

  handleAdd = () => {
    const { dataGroup } = this.state;
    const { id } = this.props.location.query;

    const params = {
      projectId: Number(id),
      roleGroup: PROEJCT_PERMISSION.EDIT, //编辑权限
      memberids: dataGroup.map(it => it.rbacUserGroup.id),
      type: MANAGE_MEMBER.USERGROUP, //用户组
    };

    addRoleGroup(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ visible: false, dataGroup: [] });
      if (res.result.fail) {
        this.showFailItems(res.result);
        message.warning('添加失败！');
      }else {
        message.success('添加成功！');
        this.getList();
      }
    }).catch((err) => {
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
        // className: styles.notice,
        btn,
        key,
      };
      notification.open(args);
    };
    openNotification();
  }

  handleExpand = (expanded, record) => {
    const { sameRoleGroup } = this.props;
    if(sameRoleGroup !== PROEJCT_PERMISSION.MANAGE) {
      return message.warning('您无管理员权限');
    }
    if(expanded) {
      this.setState({ detailLoading: true });
      const arr = [ record.usergroupid ];
      this.setState({ expandedRowKeys: arr });

      const params = {
        productId: record.productid,
        usergroupId: record.usergroupid,
      };
      getUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({
            userGroupDetail: res.result,
            detailLoading: false,
          });
        }
      }).catch((err) => {
        this.setState({ detailLoading: false });
        return message.error(`${err || err.message}获取用户组内成员异常`);
      });
    }else {
      this.setState({ expandedRowKeys: [] });
    }
  }

  getDetails = () => {
    const { userGroupDetail, detailLoading } = this.state;
    if(userGroupDetail && userGroupDetail.length) {
      return <Spin spinning={detailLoading}>
        <div style={{ whiteSpace: 'break-spaces' }}>
          {userGroupDetail.map((it) => {
            return `${it.user.realname}(${it.user.email})`;
          }).join('，')}
        </div>
      </Spin>;
    }else {
      return <Spin spinning={detailLoading}>
        <span>暂无用户</span>
      </Spin>;
    }
  }

  render() {
    const { visible, userGroupList, dataGroup, expandedRowKeys } = this.state;
    const { roleGroup, loading } = this.props;
    const groupList = roleGroup && roleGroup.projectEditUserList && roleGroup.projectEditUserList.roleGroupUserGroupVOList;

    return (<div>
      <Spin spinning={loading}>
        <Table
          className='tableMargin'
          columns={this.columns}
          expandedRowRender={this.getDetails}
          dataSource={groupList}
          rowKey={(record) => record.usergroupid}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded, record) => this.handleExpand(expanded, record)}
        />
        <Modal
          title="添加用户组"
          visible={visible}
          onOk={() => this.handleAdd()}
          onCancel={() => this.setState({ visible: false })}
          destroyOnClose
        >
          <span>
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
            <Table
              rowKey={record => record.rbacUserGroup.id}
              columns={this.columnsGroup}
              dataSource={dataGroup}
              pagination={false}
            />

          </span>
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

export default connect(mapStateToProps)(Form.create()(UserGroup));
