import React, { Component } from 'react';
import { message } from 'antd';
import EditIssue from '@pages/receipt/components/edit_issue';
import { connTypeIdMap } from '@shared/CommonConfig';
import { connect } from 'dva';
import { nameMap, updateFun, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';

class index extends Component {

  getInitialValue = (data) => {
    const { valueList, type, valueMap } = this.props;
    if (valueList && valueList.length) {
      const arr = valueList.filter(item => item.productCustomField && item.productCustomField.id === data.id) || [];

      const nameArr = [];
      arr.forEach(it => {
        const relation = it[nameMap[type]] || {};
        const customfieldvalueid = relation.customfieldvalueid;
        const obj = valueMap[customfieldvalueid] || {};
        nameArr.push(obj.customlabel);
      });
      return nameArr.join(',');
    }
  }

  getCurrentId = (data) => {
    const { valueList, type } = this.props;
    if (valueList && valueList.length) {
      const arr = valueList.filter(item => item.productCustomField && item.productCustomField.id === data.id) || [];
      const idArr = [];
      arr.forEach(it => {
        const relation = it[nameMap[type]] || {};
        const customfieldvalueid = relation.customfieldvalueid || 0;
        customfieldvalueid &&
          idArr.push(customfieldvalueid);
      });

      return idArr;
    }
  }

  getCustomValue = (id, value) => {
    if (value) {
      const { customSelect } = this.props;
      const arr = customSelect ? customSelect[id] : [];
      const obj = arr.find(it => it.id === value);
      return obj ? obj.customvalue : '';
    }
  }

  handleSave = (value, data) => {
    const { type, issue } = this.props;

    const params = {
      value: value ? value.join(',') : '',
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
    const { data, customSelect, detail } = this.props;
    const arr = customSelect[data.id] || [];

    return (<span>
      {
        data.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}` ?
          <EditIssue
            issueRole={detail.issueRole}
            value={this.getInitialValue(data)}
            currentId={this.getCurrentId(data)}
            dataSource={arr}
            type="checkbox"
            handleUpdate={(value) => this.handleSave(value, data)}
            data={data}
          />
          :
          <EditIssue
            issueRole={detail.issueRole}
            value={this.getInitialValue(data)}
            currentId={this.getCurrentId(data)}
            dataSource={arr}
            type="multiSelect"
            handleUpdate={(value) => this.handleSave(value, data)}
            data={data}
          />
      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
  };
};

export default connect(mapStateToProps)(index);
