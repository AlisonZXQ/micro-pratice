import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import { history } from 'umi';
import BusinessHOC from '@components/BusinessHOC';
import styles from './index.less';

class CurrentUser extends Component {

  //删除cookie
  delCookie = (name) => {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = '';
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
  }

  // 登出删除cookie
  handleOut = () => {
    const { isBusiness } = this.props;
    if (isBusiness) {
      document.location.href = `http://${window.location.hostname}:${window.location.port}/logout`;
    } else {
      document.location.href = `/logout`;
    }
  }

  render() {
    const { currentUser } = this.props;
    const realname = currentUser && currentUser.user && currentUser.user.realname;
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <a onClick={() => history.push(`/user_info/basic_info`)}>个人账号</a>
        </Menu.Item>
        {/* <Menu.Item key="1">
          <a href={`https://${window.location.host}/manage.html#/mytag/`}>我的标签</a>
        </Menu.Item> */}
        {/* {
          currentUser && currentUser.isProductManage && !flag &&
          <Menu.Item key="2">
            <a href={`https://${window.location.host}/manage.html#/productanalytics/`}>数据分析</a>
          </Menu.Item>
        } */}
        <Menu.Item key="3">
          <a onClick={() => history.push(`/apply`)}>申请接入</a>
        </Menu.Item>
        {
          currentUser && currentUser.isPlatFormAdmin &&
          <Menu.Item key="4">
            <a onClick={() => history.push(`/system_manage/admin/`)}>系统管理</a>
          </Menu.Item>
        }
        <Menu.Item key="5">
          <a onClick={() => this.handleOut()}>退出登录</a>
        </Menu.Item>
      </Menu>
    );
    return [
      <div className="f-pr">
        <div className={styles.name}>{realname && realname.slice(realname.length - 1)}</div>
        <Dropdown
          overlay={menu}
          overlayClassName={styles.dropMenu}
        >
          <span className={`ant-dropdown-link u-mgl60 f-fs1 ${styles.dropDownName}`} href="#">
            <span className={`f-fs2 f-toe f-ib`} style={{ maxWidth: '60px', lineHeight: '15px', position: 'relative', top: '2px' }}>
              {realname}
            </span>
            <CaretDownOutlined className={styles.downIcon} />
          </span>
        </Dropdown>
      </div>
    ];
  }
}

export default BusinessHOC()(CurrentUser);

