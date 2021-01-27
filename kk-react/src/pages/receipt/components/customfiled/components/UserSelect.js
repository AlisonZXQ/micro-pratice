import React, { Component } from 'react';
import { message } from 'antd';
import { connTypeIdMap } from '@shared/CommonConfig';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import { deepCopy } from '@utils/helper';
import { nameMap, updateFun, CUSTOME_REQUIRED } from '@shared/ReceiptConfig';
import { handleSearchUser } from '@shared/CommonFun';

class index extends Component {
  state = {
    userList: [],
  }

  getInitialValue = (it) => {
    const { valueList, type } = this.props;
    if (valueList && valueList.length) {
      const obj = valueList.find(item => item.productCustomField && item.productCustomField.id === it.id) || {};
      const relation = obj[nameMap[type]] || {};
      return relation.customvalue ? relation.customvalue : '';
    }
  }

  handleSave = (value, data) => {
    const { type, issue } = this.props;

    const params = {
      value: value ? value : '',
      customfieldId: data.id,
      issueId: this.props.location.query[connTypeIdMap[type]] || issue.id,
    };
    const promise = updateFun[type](params);
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.props.getRefreshDetail();
      message.success('更新成功！');
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getUserList = (email) => {
    const { userList } = this.state;
    const newUserList = deepCopy(userList, []);
    if (email) {
      const initValue = {
        email,
        realname: email,
      };
      const flag = userList.some(it => it.email === email);
      if (!flag) {
        newUserList.push(initValue);
      }
    }

    newUserList.forEach(it => {
      it.value = it.email;
      it.name = it.realname;
      it.label = `${it.realname} ${it.email}`;
    });
    return newUserList;
  }

  render() {
    const { data, detail } = this.props;

    return (<span>
      <EditSelectSearchDetail
        issueRole={detail.issueRole}
        value={this.getInitialValue(data)}
        dataSource={this.getUserList(this.getInitialValue(data))}
        handleSearch={(value) => handleSearchUser(value, (result) => {
          this.setState({ userList: result });
        })}
        handleSaveSelect={(value) => this.handleSave(value, data)}
        required={data.required === CUSTOME_REQUIRED.REQUIRED}
        noCreateVersion
      />
    </span>);
  }
}

export default index;
