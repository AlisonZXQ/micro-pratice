import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Table, Checkbox, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import EditTitle from '@components/EditTitle';
import BackToPreview from '@components/BackToPreview';
import { updateUserGroup, addGroupPermission, deleteGroupPermission } from '@services/product_setting';
import { ISSUE_ROLE_KEY_MAP, ISSUE_ROLE_VALUE_MAP, ISSUE_ROLE_TYPE_NAME_MAP, ISSUE_ROLE_TYPE_MAP } from '@shared/CommonConfig';
import { USERGROUP_TYPE_MAP } from '@shared/ProductSettingConfig';
import styles from '../index.less';

class GroupDetail extends Component {
  state = {
    visible: false,
  }

  columns = [{
    title: '一级菜单',
    dataIndex: 'mainMenu'
  }, {
    title: '二级菜单',
    dataIndex: 'subMenu'
  }, {
    title: '操作权限',
    dataIndex: 'permission',
    width: 300,
    render: (text, record) => {
      return (<div>
        {
          record.isProductAdminGroup &&
          <span>
            <Checkbox checked={record.read.hasPermission} disabled>查看</Checkbox>
            <Checkbox checked={record.edit.hasPermission} disabled>编辑</Checkbox>
            <Checkbox checked={record.manage.hasPermission} disabled>管理</Checkbox>
          </span>
        }

        {!record.isProductAdminGroup && record.isObjective &&
          <span>
            <Popconfirm
              title="确定要更改权限吗?"
              onConfirm={() => this.handleConfirm(record.read.permissionKey, record.read.hasPermission)}
              okText="确定"
              cancelText="取消"
            >
              <Checkbox checked={record.read.hasPermission}>查看</Checkbox>
            </Popconfirm>
            <Checkbox checked={record.edit.hasPermission} disabled>编辑</Checkbox>
            <Checkbox checked={record.manage.hasPermission} disabled>管理</Checkbox>
          </span>
        }

        {!record.isProductAdminGroup && !record.isObjective &&
          <span>
            <Popconfirm
              title="确定要更改权限吗?"
              onConfirm={() => this.handleConfirm(record.read.permissionKey, record.read.hasPermission)}
              okText="确定"
              cancelText="取消"
            >
              <Checkbox checked={record.read.hasPermission}>查看</Checkbox>
            </Popconfirm>
            <Popconfirm
              title="确定要更改权限吗?"
              onConfirm={() => this.handleConfirm(record.edit.permissionKey, record.edit.hasPermission)}
              okText="确定"
              cancelText="取消"
            >
              <Checkbox checked={record.edit.hasPermission}>编辑</Checkbox>
            </Popconfirm>
            <Popconfirm
              title="确定要更改权限吗?"
              onConfirm={() => this.handleConfirm(record.manage.permissionKey, record.manage.hasPermission)}
              okText="确定"
              cancelText="取消"
            >
              <Checkbox checked={record.manage.hasPermission}>管理</Checkbox>
            </Popconfirm>
          </span>
        }
      </div>);
    }
  }]

  componentDidMount() {
    this.getGroupDetail();
  }

  getGroupDetail = () => {
    const { groupid } = this.props.location.query;
    this.props.dispatch({ type: 'productSetting/getUserGroupDetail', payload: { groupid } });
  }

  handleConfirm = (permissionKey, hasPermission) => {
    const { groupid } = this.props.location.query;
    const params = {
      usergroupId: groupid,
      permissionKey: permissionKey
    };
    if (hasPermission) {
      deleteGroupPermission(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('权限更改成功！');
        this.getGroupDetail();
      }).catch(err => {
        return message.error(err || err.message);
      });
    } else {
      addGroupPermission(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('权限更改成功！');
        this.getGroupDetail();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  handleSaveTitle = (title) => {
    const { groupid } = this.props.location.query;
    const params = {
      id: groupid,
      name: title,
    };
    updateUserGroup(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新用户组名成功！');
      this.getGroupDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getData = () => {
    const { groupDetail } = this.props;
    const permissionKeyList = groupDetail.permissionKeyList || [];
    let data = [];
    data.push(this.getDataByIssueType(1, permissionKeyList, ISSUE_ROLE_TYPE_MAP.OBJECTIVE, groupDetail, true));
    data.push(this.getDataByIssueType(2, permissionKeyList, ISSUE_ROLE_TYPE_MAP.ADVISE, groupDetail, false));
    data.push(this.getDataByIssueType(3, permissionKeyList, ISSUE_ROLE_TYPE_MAP.REQUIREMENT, groupDetail, false));
    data.push(this.getDataByIssueType(4, permissionKeyList, ISSUE_ROLE_TYPE_MAP.TASK, groupDetail, false));
    data.push(this.getDataByIssueType(5, permissionKeyList, ISSUE_ROLE_TYPE_MAP.BUG, groupDetail, false));
    data.push(this.getDataByIssueType(6, permissionKeyList, ISSUE_ROLE_TYPE_MAP.TICKET, groupDetail, false));
    return data;
  }

  getDataByIssueType = (id, permissionKeyList, prefix, groupDetail, isObjective) => {
    //单据权限键
    const readPermissionKey = prefix + '_' + ISSUE_ROLE_KEY_MAP.READ;
    const editPermissionKey = prefix + '_' + ISSUE_ROLE_KEY_MAP.EDIT;
    const managePermissionKey = prefix + '_' + ISSUE_ROLE_KEY_MAP.MANAGE;

    //单据权限值
    const hasReadPermission = !!permissionKeyList.includes(readPermissionKey);
    const hasEditPermission = !!permissionKeyList.includes(editPermissionKey);
    const hasManagePermission = !!permissionKeyList.includes(managePermissionKey);

    //权限信息块
    const readInfo = this.buildPermissionInfo(readPermissionKey, hasReadPermission);
    const editInfo = this.buildPermissionInfo(editPermissionKey, hasEditPermission);
    const manageInfo = this.buildPermissionInfo(managePermissionKey, hasManagePermission);

    return {
      id: id,
      mainMenu: '产品管理',
      subMenu: ISSUE_ROLE_TYPE_NAME_MAP[prefix],
      read: readInfo,
      edit: editInfo,
      manage: manageInfo,
      isObjective: isObjective,
      isProductAdminGroup: groupDetail && groupDetail.name
        && groupDetail.name === '产品管理员' && groupDetail.type === USERGROUP_TYPE_MAP.SYSTEM
    };
  }

  buildPermissionInfo = (permissionKey, hasPermission) => {
    return {
      permissionKey: permissionKey,
      hasPermission: hasPermission
    };
  }

  render() {
    const { productid } = this.props.location.query;
    const { groupDetail } = this.props;
    const type = groupDetail.type; // 1系统不能修改 2自定义可以修改

    return (<div className={styles.container}>
      <div>
        <BackToPreview title="返回用户组与权限" link={`/product_setting/user_group/?productid=${productid}`} />
      </div>

      <div className="bbTitle">
        <span className="name">权限配置</span>
      </div>

      <Card>
        <div className="u-mgb5 f-jcsb">
          {
            type === USERGROUP_TYPE_MAP.SYSTEM ?
              <span style={{ fontFamily: 'PingFangSC-Medium' }} className="f-fs4 u-mgr10">{groupDetail.name}</span>
              :
              <EditTitle
                title={groupDetail.name}
                issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
                handleSave={this.handleSaveTitle}
              />
          }
        </div>

        <Table
          columns={this.columns}
          dataSource={this.getData()}
          pagination={false}
        />
      </Card>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    groupDetail: state.productSetting.groupDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(GroupDetail));
