import React, { Component } from 'react';
import { message } from 'antd';
import { connTypeIdMap } from '@shared/CommonConfig';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import { nameMap, updateFun } from '@shared/ReceiptConfig';

class index extends Component {

  getInitialValue = (it) => {
    const { valueList, type } = this.props;
    if (valueList && valueList.length) {
      const obj = valueList.find(item => item.productCustomField && item.productCustomField.id === it.id) || {};
      const relation = obj[nameMap[type]] || {};

      return relation.customvalue ? relation.customvalue : undefined;
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

  render() {
    const { data, detail } = this.props;

    return (<span>
      <DatePickerIssue
        issueRole={detail.issueRole}
        value={this.getInitialValue(data)}
        handleSave={(value) => {
          this.handleSave(value, data);
        }}
        data={data}
      />
    </span>);
  }
}

export default index;
