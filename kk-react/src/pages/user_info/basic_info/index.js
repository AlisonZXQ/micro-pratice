import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Tag, Card } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';

const formLayout = getFormLayout(2, 16);
const FormItem = Form.Item;

const isEmpty = (text) => {
  return text ? text : '-';
};

class index extends Component {

  render() {
    const { currentUser } = this.props;
    const user = currentUser.user || {};
    const roles = currentUser.roles || [];
    const usergroups = currentUser.usergroups || [];

    return (<div className="u-pd20">
      <div className="bbTitle">
        <span className="name">个人账号</span>
      </div>

      <Card>
        <FormItem label="昵称" {...formLayout}>
          <Input value={isEmpty(user.nick)} disabled />
        </FormItem>

        <FormItem label="姓名" {...formLayout}>
          <Input value={isEmpty(user.realname)} disabled />
        </FormItem>

        <FormItem label="邮件" {...formLayout}>
          <Input value={isEmpty(user.email)} disabled />
        </FormItem>

        <FormItem label="手机号" {...formLayout}>
          <Input value={isEmpty(user.mobile)} disabled />
        </FormItem>

        <FormItem label="创建日期" {...formLayout}>
          <Input value={user.addtime ? moment(user.addtime).format('YYYY-MM-DD') : '-'} disabled />
        </FormItem>

        <FormItem label="最后更新" {...formLayout}>
          <Input value={user.updatetime ? moment(user.updatetime).format('YYYY-MM-DD') : '-'} disabled />
        </FormItem>

        <FormItem label="最后登录" {...formLayout}>
          <Input value={user.lastlogintime ? moment(user.lastlogintime).format('YYYY-MM-DD') : '-'} disabled />
        </FormItem>

        {/* <FormItem label="角色" {...formLayout}>
          {
            roles.map(it => <Tag className="u-mgr10">
              {it.rabcRole && it.rabcRole.name}-{it.rabcRole && it.rabcRole.issystem === 1 ? '系统级' : ''}
            </Tag>)
          }
        </FormItem> */}

        <FormItem label="用户组" {...formLayout}>
          {
            usergroups.map(it => <Tag className="u-mgr10">
              {it.rbacUserGroup && it.rbacUserGroup.name}-{it.product && it.product.name}
            </Tag>)
          }
        </FormItem>

        <FormItem label="部门" {...formLayout}>
          {
            currentUser.department || '--'
          }
        </FormItem>
      </Card>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(index);

