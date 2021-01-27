import React from 'react';
import { Modal, message } from 'antd';
import { debounce } from 'lodash';
import { queryUser } from '@services/project';
import { getModuleListById } from '@services/product_setting';
import { deepCopy } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { JIRA_SYNC_USE, SYNC_COPY } from '@shared/ProductSettingConfig';
import { getVersionList } from '@services/requirement';

/**
 * @description 通用的函数方法
 */

// 查询全平台的用户
const handleSearchUser = debounce((value, callback) => {
  const params = {
    value,
    limit: 20,
    offset: 0,
  };
  if (value && value.trim().length) {
    queryUser(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        callback(res.result);
      }
    }).catch((err) => {
      return message.error(`${err || err.msg}获取人员异常`);
    });
  }
}, 800);

/**
 * @description - 查询版本
 * @param {Number} value - 查询名称
 * @param {Number} subProductId - 子产品id
 * @param {Array} state - 版本状态
 */

const handleSearchVersion = (value, subProductId, state, callback) => {
  if (subProductId) {
    const params = {
      subProductId,
      name: value,
      state: state,
      offset: 0,
      limit: 100,
    };
    getVersionList(params).then((res) => {
      if (res.code !== 200) return message.error('查询版本列表失败', res.message);
      if (res.result) {
        callback(res.result);
      }
    }).catch((err) => {
      return message.error('查询用户列表异常', err || err.message);
    });
  }
};

/**
 * @description - 涉及到编辑用户下拉列表
 * @param {*} data
 * @param {*} userList
 */
const getUserList = (data, userList) => {
  const newUserList = deepCopy(userList, []);
  const flag = userList.some(it => it.id === data.id);
  if (!flag) {
    newUserList.push(data);
  }
  newUserList.forEach(it => {
    const newName = (it && it.realname) || (it && it.name) || '';
    it.value = it.email;
    it.name = newName.replace('yixin.', '');
    it.label = `${newName.replace('yixin.', '')} ${it.email}`;
  });
  return newUserList;
};

/**
 * @description - 自定义展开收缩icon
 * @param {*} props
 * @param {*} style
 */
const customExpandIcon = (props, style) => {
  const list = (props.record && props.record.children) || [];
  if (list.length > 0) {
    if (props.expanded) {
      return (<a
        style={{ color: 'inherit' }}
        onClick={e => { props.onExpand(props.record, e) }}
      >
        <MyIcon type="icon-kuozhananniu" className="f-fs3 u-mgr10" style={style ? style : { position: 'relative', top: '2px' }} />
      </a>);
    } else {
      return (
        <a
          style={{ color: 'inherit' }}
          onClick={e => { props.onExpand(props.record, e) }}
        >
          <MyIcon type="icon-shousuoanniu" className="f-fs3 u-mgr10" style={style ? style : { position: 'relative', top: '2px' }} />
        </a>);
    }
  } else {
    return (<span style={{ marginRight: 26 }}></span>);
  }
};

/**
 * @description - 获取模块信息
 * @param {*} subProductId
 * @param {*} callback
 */
const getModuleList = (subProductId, callback) => {
  const newParams = {
    subProductId,
  };
  getModuleListById(newParams).then((res) => {
    if (res.code !== 200) return message.error('获取模块信息失败', res.message);
    if (res.result) {
      callback(res.result);
    }
  }).catch((err) => {
    return message.error('获取模块信息异常', err || err.message);
  });
};

/**
 * @description - 删除弹窗
 * @param {*} param0
 */
const deleteModal = ({ title, content, okCallback, className }) => {
  Modal.confirm({
    title: title,
    content: content || '',
    className,
    okText: '确定',
    cancelText: '取消',
    icon: <MyIcon style={{ fontSize: '24px' }} type="icon-tishigantanhao" />,
    onOk() {
      okCallback();
    },
  });
};

/**
 * @description - 提示弹窗
 * @param {*} param0
 */
const warnModal = ({ title, content, okCallback, className }) => {
  Modal.confirm({
    title: title,
    content: content || '',
    className,
    okText: '确定',
    cancelText: '取消',
    icon: <MyIcon style={{ fontSize: '24px' }} type="icon-tishigantanhaohuang" />,
    onOk() {
      okCallback();
    },
  });
};

/**
 * @description - 目标/需求/任务/缺陷是否显示关联jira单据的弹窗
 */
const showRelateIssueFun = (child, subProductId, type) => {
  const subProductList = child && child.state && child.state.subProductList ? child.state.subProductList : [];
  const subProductObj = subProductList.find(it => it.id === subProductId) || {};
  const subProductCopyVO = subProductObj.subProductConfig4JiraBo || {};

  return subProductObj.jiraSync === JIRA_SYNC_USE.OPEN &&
    subProductCopyVO.jiraReceiptSync === SYNC_COPY.OPEN &&
    subProductCopyVO[`jira${type}Sync`] === SYNC_COPY.OPEN;
};

/**
 * @description - 选中父节点的时候勾选子节点，取消选中父节点级联取消子节点
 */
const cascaderOpt = (data, selected, selectData) => {
  let newSelectData = [...selectData];
  const childData = [];
  const getChildKeys = (children) => {
    children && children.forEach(it => {
      if (!childData.some(i => i.issueKey === it.issueKey)) {
        childData.push(it);
        if (it.children) {
          getChildKeys(it.children || []);
        }
      }
    });
  };
  getChildKeys(data.children || []);
  // 取消选中
  if (!selected) {
    newSelectData = newSelectData.filter(it => it.issueKey !== data.issueKey);
    childData.forEach(it => {
      newSelectData = newSelectData.filter(i => i.issueKey !== it.issueKey);
    });
    // 选中
  } else {
    newSelectData.push(data);
    childData.forEach(it => {
      if (!newSelectData.some(i => i.issueKey === it.issueKey)) {
        newSelectData.push(it);
      }
    });
  }
  return newSelectData;
};

/**
 * @param {Object} values - 当前form表单
 * @param {Object} projectMember - 当前项目成员
 */
const handleShowPersonConfirm = (values, projectMember) => {
  let flag = false;
  const requireemail = values.requireemail;
  const responseemail = values.responseemail;
  const submitemail = values.submitemail;
  const members = projectMember.members || [];
  const membersEmail = members.map(it => it.userVO && it.userVO.email) || [];
  if (requireemail && !membersEmail.includes(requireemail)) {
    flag = true;
  }
  if (responseemail && !membersEmail.includes(responseemail)) {
    flag = true;
  }
  if (submitemail && !membersEmail.includes(submitemail)) {
    flag = true;
  }
  return flag;
};

export {
  handleSearchUser,
  getUserList,
  customExpandIcon,
  getModuleList,
  deleteModal,
  warnModal,
  showRelateIssueFun,
  handleSearchVersion,
  cascaderOpt,
  handleShowPersonConfirm,
};
