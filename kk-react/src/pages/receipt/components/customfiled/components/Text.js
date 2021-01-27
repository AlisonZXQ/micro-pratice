import React, { Component } from 'react';
import { message } from 'antd';
import EditIssue from '@pages/receipt/components/edit_issue';
import { connTypeIdMap } from '@shared/CommonConfig';
import { nameMap, updateFun, CUSTOME_TYPE_MAP } from '@shared/ReceiptConfig';

class index extends Component {

  getInitialValue = (it) => {
    const { valueList, type } = this.props;
    if (valueList && valueList.length) {
      const obj = valueList.find(item => item.productCustomField && item.productCustomField.id === it.id) || {};
      const relation = obj[nameMap[type]] || {};
      if (it.type === CUSTOME_TYPE_MAP.INTERGER || it.type === CUSTOME_TYPE_MAP.DECIMAL) {
        return relation.customvalue ? Number(relation.customvalue) : undefined;
      } else {
        return relation.customvalue ? relation.customvalue : undefined;
      }
    }
  }

  handleSave = (value, data) => {
    if (value === this.getInitialValue(data)) {
      return ;
    }
    const { type, issue } = this.props;

    const params = {
      value: value ? value.toString() : '',
      customfieldId: data.id,
      issueId: Number(this.props.location.query[connTypeIdMap[type]]) || issue.id,
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

  getType = (data) => {
    // 2单选（selectui 1平铺， selectui 2下拉）
    // 3多行
    // 4多选（selectui 1平铺， selectui 2下拉）
    // 5级联（parent_selectable 1必须到子节点，2非必须）
    // 9和10是数值
    // 6成员选择
    // 8日期选择
    const type = data.type;
    switch(type) {
      case CUSTOME_TYPE_MAP.INPUT: return 'input';
      case CUSTOME_TYPE_MAP.TEXTAREA: return 'textArea';
      case CUSTOME_TYPE_MAP.INTERGER: return 'integer';
      case CUSTOME_TYPE_MAP.DECIMAL: return 'decimal';
      default: return '';
    }
  }

  render() {
    const { data, detail } = this.props;

    return (<span>
      <EditIssue
        issueRole={detail.issueRole}
        maxLength={500}
        value={this.getInitialValue(data)}
        type={this.getType(data)}
        handleUpdate={(value) => this.handleSave(value, data)}
        data={data}
      />
    </span>);
  }
}

export default index;
