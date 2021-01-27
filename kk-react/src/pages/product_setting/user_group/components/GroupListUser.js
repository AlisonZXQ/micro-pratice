import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Card, Table, message, Input, Button } from 'antd';
import { connect } from 'dva';
import BackToPreview from '@components/BackToPreview';
import { getUser, addUserIntoGroup, deleteUserFromGroup } from '@services/approvalflow';
import { deleteModal } from '@shared/CommonFun';
import AddUserIntoGroupForm from './AddUserIntoGroupForm';

import styles from '../index.less';

const Search = Input.Search;

class GroupListUser extends Component {
  state = {
    visible: false,
    groupUserList: [],
    record: {}, // 当前准备删除的用户数据
    keyword: ''
  }

  columns = [{
    title: '名称',
    dataIndex: 'name',
    render: (text, record) => {
      return record.user && record.user.realname ? record.user.realname : '-';
    }
  }, {
    title: '邮箱',
    dataIndex: 'email',
    render: (text, record) => {
      return record.user && record.user.email ? record.user.email : '-';
    }
  }, {
    title: '操作',
    dataIndex: 'opt',
    render: (text, record) => {
      const userGroupDataId = record.rbacUserGroupData
        && record.rbacUserGroupData.id ? record.rbacUserGroupData.id : 0;
      if(!userGroupDataId) {
        return '-';
      }
      return <a onClick={() => {this.showDeleteModal(record)}} className="delColor">移除</a>;
    }
  }
  ];

  showDeleteModal= (record)=> {
    this.setState({ record }, () => this.handleDelete());
  }

  handleDelete = () => {
    const { record } = this.state;
    const id = record.rbacUserGroupData.id;
    const { productid } = this.props.location.query;
    deleteModal({
      title: '确认删除',
      content: '删除后相关成员将失去对应权限，不可恢复',
      okCallback: () => {
        deleteUserFromGroup({
          productid: productid,
          id: id
        }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('移除用户成功！');
          this.listAllGroupUsers();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  componentDidMount() {
    this.getGroupDetail();
    this.listAllGroupUsers();
  }

  getGroupDetail = () => {
    const { groupid } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getUserGroupDetail', payload: { groupid } });
  }

  listAllGroupUsers = () => {
    const { groupid, productid } = this.props.location.query;
    const { keyword } = this.state;
    const params= {
      productId: productid,
      usergroupId: groupid,
      keyword: keyword
    };
    getUser(params).then((res) => {
      if(res.code !== 200 ){
        return message.error(res.msg);
      }
      this.setState({
        groupUserList: res.result
      });
    }).catch((err)=>{
      return message.error(err || err.message);
    });
  }

  handleSearch = (value)=>{
    this.setState(
      { keyword: value },
      () => {
        this.listAllGroupUsers();
      }
    );

  }

  handleAddUserIntoGroup = ()=>{
    const { groupid, productid } = this.props.location.query;
    const { form, form: { getFieldValue } } = this.props;
    form.validateFields((err, values) => {
      const email = getFieldValue("email");
      const params = {
        productid: productid,
        usergroupid: groupid,
        email: email.trim()
      };
      addUserIntoGroup(params).then(res=>{
        if(res.code !== 200) return message.error(res.msg);
        message.success('添加用户成功');
        this.setState({
          visible: false
        });
        form.resetFields(['email']);
        this.listAllGroupUsers();
      }).catch(err=>{
        return message.error(err || err.message);
      });
    });
  }

  render() {
    const { productid } = this.props.location.query;
    const { groupDetail } = this.props;
    const { groupUserList, visible } = this.state;

    return (<div className={styles.container}>
      <div>
        <BackToPreview title="返回用户组与权限" link={`/product_setting/user_group/?productid=${productid}`} />
      </div>

      <div className="bbTitle">
        <span className="name">【{ groupDetail.name }】组成员管理</span>
      </div>

      <Card className="cardBottomNone">
        <div className="u-mgb5 f-tar">
          <span className="u-mgb10">
            <Search
              allowClear
              onSearch={(value) => this.handleSearch(value)}
              style={{ width: '220px' }}
              placeholder="搜索用户姓名/邮箱"
            />
            <Button type="primary" className="u-mgl10" onClick={() => this.setState({ visible: true })}>添加成员</Button>
          </span>
        </div>

        <Table
          columns={this.columns}
          dataSource={groupUserList}
          pagination={false}
        />
      </Card>

      <Modal
        visible={visible}
        title={'添加成员'}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.handleAddUserIntoGroup()}
        maskClosable={false}
      >
        <AddUserIntoGroupForm {...this.props} />
      </Modal>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    groupDetail: state.productSetting.groupDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(GroupListUser));
