import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, Modal, message } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import { getMemberList, saveMember, updateMember, deleteMember, getMemberRoleList } from '@services/project';
import { PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import { deleteModal } from '@shared/CommonFun';
import AddMembers from '../components/AddMembers';
import EditMember from '../components/EditMember';

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '',
      members: [],
      data: [],
      pagination: { current: 1 },
      record: {},
      memberRoleList: [],
    };
    this.columns = [{
      title: '',
      dataIndex: 'icon',
      width: 30,
      render: (text, record) => {
        return <span>
          {
            (record.isOwner && !record.isManager) &&
            <MyIcon type='icon-owner' />
          }
          {
            (!record.isOwner && record.isManager) &&
            <MyIcon type='icon-administrationr' />
          }
          {
            (record.isOwner && record.isManager) &&
            <span>
              <MyIcon type='icon-owner' />
              <MyIcon type='icon-administration' />
            </span>
          }
        </span>;
      }
    }, {
      title: '姓名',
      dataIndex: 'name',
      render: (text, record) => {
        return record.userVO.name;
      }
    }, {
      title: '邮箱',
      dataIndex: 'email',
      render: (text, record) => {
        return record.userVO.email;
      }
    }, {
      title: '角色',
      dataIndex: 'projectMemberRoleRelationVOList',
      render: (text, record) => {
        return (<span>
          {record.isOwner && !record.isManager && '项目负责人'}
          {!record.isOwner && record.isManager && '项目经理'}
          {record.isOwner && record.isManager && '项目负责人，项目经理'}
          {record.userVO.projectMemberRoleRelationVOList.map(item =>
            item.roleName).join('，')}
        </span>);
        // return role[text];
      }
    }, {
      title: '操作',
      dataIndex: 'caozuo',
      width: 100,
      render: (text, record) => {
        const { roleGroup } = this.props;
        return (roleGroup === PROEJCT_PERMISSION.MANAGE && <span>
          <a className="u-mgr10" disabled={
            record.role === PROEJCT_PERMISSION.MANAGE || record.role === PROEJCT_PERMISSION.EDIT
          }
          onClick={() => this.handleModal({ type: 'edit', record })}>编辑</a>
          <a className='delColor' disabled={
            record.role === PROEJCT_PERMISSION.MANAGE || record.role === PROEJCT_PERMISSION.EDIT
          } onClick={() => this.handleModalDlt({ type: 'delete', record })}>删除</a>
        </span>);
      }
    }];
  }

  componentDidMount() {
    this.props.getThis(this);

    const { id } = this.props.location.query;
    sessionStorage.setItem('currentPid', id);

    this.getMemberList();
    this.getMemberRoleList();
  }

  openCreate = () => {
    this.setState({ visible: true, type: 'add' });
  }

  getMemberRoleList = () => {
    const { productid } = this.props.location.query;
    const params = {
      productId: productid,
    };
    getMemberRoleList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ memberRoleList: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getMemberList = () => {
    const { id } = this.props.location.query;
    const { pagination: { current } } = this.state;
    const params = {
      pageNo: current,
      pageSize: 10,
      projectId: id,
    };
    getMemberList(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        const pagination = {
          ...this.state.pagination,
          total: res.result.total,
          current,
        };
        this.setState({
          data: res.result.list,
          pagination,
        });

      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handlePageChange = (pageNum) => {
    const { pagination } = this.state;
    const newObj = {
      ...pagination,
      current: pageNum
    };
    this.setState({ pagination: newObj }, () => this.getMemberList());
  }

  handleModal = (data) => {
    this.setState({
      type: data.type,
      record: data.record,
      visible: true,
      value: data.record.role,
    });
  }

  handleModalDlt = (data) => {
    const { data: list, pagination } = this.state;

    this.setState({
      record: data.record,
      value: data.record.role,
    });
    deleteModal({
      title: '删除用户',
      content: '删除后项目内容将对该用户不可见，你确定要继续吗？',
      okCallback: () => {
        deleteMember(data.record.memberid).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除成员成功！');
          if (list && list.length === 1) {
            const newObj = {
              ...pagination,
              current: 1
            };
            this.setState({ pagination: newObj }, () => this.getMemberList());
          } else {
            this.getMemberList();
          }
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  updateMembers = (members) => {
    this.setState({ members });
  }


  handleOk = () => {
    const { type } = this.state;
    const { id } = this.props.location.query;
    if (type === 'edit') {
      this.props.form.validateFields((err, values) => {
        const params = {
          id: values.memberid,
          roleids: values.projectMemberRoleRelationVOList,
        };
        updateMember(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新成员成功！');
          this.getMemberList();
          this.setState({ visible: false });
        }).catch((err) => {
          return message.error(err || err.message);
        });
      });
    }
    if (type === 'add') {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (err) return;
        const { members } = this.state;
        for (let i in values) {
          for (var j = 0; j < members.length; j++) {
            if (members[j].id === Number(i)) {
              members[j].roleids = values[i];
            }
          }
        }
        let productUserRoles = [];
        members.map((item) => {
          productUserRoles.push({
            userEmail: item.email,
            roleids: item.roleids
          });
        });
        if (productUserRoles.length === 0) {
          return message.warning('请填写数据！');
        }
        const params = {
          projectId: id,
          // userEmails: members && members.map(it => it.email),
          role: PROEJCT_PERMISSION.READ,
          productUserRoles,
        };
        saveMember(params).then((res) => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('添加成员成功！');
          this.getMemberList();
          this.setState({ visible: false });
        }).catch((err) => {
          return message.error(err || err.message);
        });
      });

    }
  }

  render() {
    const { visible, type, pagination: { total, current }, data, record, memberRoleList } = this.state;

    return (<div>


      <Table
        className='tableMargin'
        columns={this.columns}
        dataSource={data}
        pagination={{
          pageSize: 10,
          current: current,
          onChange: this.handlePageChange,
          defaultCurrent: 1,
          total: total
        }}
      />
      <Modal
        width={600}
        maskClosable={false}
        visible={visible}
        title={type === 'add' ? '添加用户' : type === 'edit' ? '编辑用户' : '删除用户'}
        onOk={() => this.handleOk()}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
      >
        {
          type === 'add' && <AddMembers
            updateMembers={this.updateMembers}
            updateRole={this.updateRole}
            {...this.props}
            rolelist={memberRoleList}
          />
        }
        {
          type === 'edit' && <div>
            <EditMember form={this.props.form} data={record} rolelist={memberRoleList} />
          </div>
        }
        {
          type === 'delete' && <div>
            删除后项目内容将对该用户不可见，你确定要继续吗？
          </div>
        }
      </Modal></div>);
  }

}
const mapStateToProps = (state) => {
  return {
  };
};

export default connect(mapStateToProps)(Form.create()(User));
