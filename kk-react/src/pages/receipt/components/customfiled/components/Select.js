import React, { Component } from 'react';
import { message } from 'antd';
import EditIssue from '@pages/receipt/components/edit_issue';
import { connTypeIdMap } from '@shared/CommonConfig';
import { nameMap, updateFun, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';

class index extends Component {

  getInitialValue = (data) => {
    const { valueList, type, valueMap } = this.props;
    if (valueList && valueList.length) {
      const obj = valueList.find(item => item.productCustomField && item.productCustomField.id === data.id) || {};
      const relation = obj[nameMap[type]] || {};
      const mapId = relation.customfieldvalueid || 0;
      const mapObj = valueMap[mapId] || {};
      return mapObj.customlabel;
    }
  }

  getCurrentId = (data) => {
    const { valueList, type } = this.props;

    if (valueList && valueList.length) {
      const obj = valueList.find(item => item.productCustomField && item.productCustomField.id === data.id) || {};
      const relation = obj[nameMap[type]] || {};

      return relation.customfieldvalueid ? relation.customfieldvalueid : undefined;
    }
  }

  getCustomValue = (id, value, selectMap) => {
    if (value) {
      const { allOptionsObj } = this.props;
      const objMap = selectMap || allOptionsObj;
      const arr = objMap ? objMap[id] : [];
      const obj = arr.find(it => it.id === value);
      return obj && obj.customvalue;
    }
  }

  handleSave = (value, data, selectMap) => {
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

  getCloudccId = ()=>{
    const { data } = this.props;
    const customlabel = this.getInitialValue(data);
    if(data && data.productCustomFieldValueVOList){
      const findCustomFieldValueVO = data.productCustomFieldValueVOList.find(it => it.customlabel === customlabel);
      if(findCustomFieldValueVO){
        return findCustomFieldValueVO.cloudccid;
      }
    }
    return '';
  }

  render() {
    const { data, allOptionsObj, detail } = this.props;
    const arr = allOptionsObj[data.id] || [];
    const cloudccId = this.getCloudccId();

    return (<span>
      {
        data.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}` ?
          <EditIssue
            issueRole={detail.issueRole}
            value={this.getInitialValue(data)}
            currentId={this.getCurrentId(data)}
            dataSource={arr}
            type="radio"
            cloudccId={cloudccId}
            handleUpdate={(value) => this.handleSave(value, data)}
            data={data}
          />
          :
          <EditIssue
            issueRole={detail.issueRole}
            value={this.getInitialValue(data)}
            currentId={this.getCurrentId(data)}
            dataSource={arr}
            type="select"
            cloudccId={cloudccId}
            handleUpdate={(value) => this.handleSave(value, data)}
            data={data}
          />
      }
    </span>);
  }
}

export default index;
