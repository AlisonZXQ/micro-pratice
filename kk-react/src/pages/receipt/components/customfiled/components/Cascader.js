import React, { Component } from 'react';
import { message, Cascader, Divider } from 'antd';
import { deepCopy } from '@utils/helper';
import { connTypeIdMap, ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { nameMap, updateFun, deleteFun, CUSTOME_REQUIRED, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

class index extends Component {
  state = {
    edit: false,
    currentValue: [],
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.drawerIssueId !== prevProps.drawerIssueId) {
      this.setState({ edit: false });
    }
  }

  getInitialValue = (data) => {
    const { valueList, type, valueMap } = this.props;
    if (valueList && valueList.length) {
      const arr = valueList.filter(item => item.productCustomField && item.productCustomField.id === data.id) || [];

      const nameArr = [];
      arr.forEach(it => {
        const relation = it[nameMap[type]] || {};
        const customfieldvalueid = relation.customfieldvalueid;
        const obj = valueMap[customfieldvalueid] || {};
        if (Object.keys(obj).length) {
          if (obj.parentid) {
            nameArr.push(obj);
          } else {
            nameArr.unshift(obj);
          }
        }
      });
      return nameArr;
    }
    return [];
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
      const { allOptionsObj } = this.props;
      const arr = allOptionsObj ? allOptionsObj[id] : [];
      const obj = arr.find(it => it.id === value);
      return obj ? obj.customvalue : '';
    }
  }

  handleSave = async (value, data) => {
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
      this.setState({ edit: false });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  // 删除
  handleDelete = (id) => {
    const { type } = this.props;
    deleteFun[type]({ id });
  }

  // 新增or更新
  handleAdd = (params) => {
    const { type } = this.props;
    updateFun[type](params);
  }

  getOptions = (data) => {
    let arr = deepCopy(data, []);
    arr.forEach(it => {
      // 存在父亲节点
      if (it.parentid) {
        const parentId = it.parentid;
        const obj = arr.find(it => it.id === parentId) || {};
        if (Object.keys(obj).length) {
          obj.children = obj.children || [];
          obj.children.push(it);
        }
      } else {
        it.children = it.children || [];
      }
    });
    arr = arr.filter(it => it.children);
    return arr;
  }

  render() {
    const { data, allOptionsObj, detail } = this.props;
    const { newValue, edit } = this.state;
    const arr = allOptionsObj[data.id] || [];
    const required = data.required === CUSTOME_REQUIRED.REQUIRED;
    const issueRole = detail.issueRole;

    return (<span>
      {issueRole === ISSUE_ROLE_VALUE_MAP.READ &&
        <div
          className={'u-subtitle'}
          onClick={() => this.setState({ edit: true })}
          style={{ wordBreak: 'break-all' }}
        >{this.getInitialValue(data).map(i => i.customlabel).join('/') || <span className="u-placeholder">请选择</span>}
        </div>
      }

      {issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <span className="f-csp" id="select">
          {
            !edit &&
            [<div
              className={'editIssue u-subtitle'}
              onClick={() => this.setState({ edit: true })}
              style={{ wordBreak: 'break-all' }}
            >{this.getInitialValue(data).map(i => i.customlabel).join('/') || <span className="u-placeholder">请选择</span>}
            </div>]
          }
          {
            edit &&
            [<Cascader
              allowClear={!required}
              autoFocus="true"
              defaultValue={this.getInitialValue(data).map(i => i.id)}
              expandTrigger="hover"
              fieldNames={{ label: 'customlabel', value: 'id', children: 'children' }}
              options={this.getOptions(arr)}
              onChange={(value) => this.setState({ newValue: value })}
              changeOnSelect={data.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}`}
              popupClassName={styles.cascaderBox}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            />, <div>
              <a size="small" type="primary" onClick={() => this.handleSave(newValue, data)}>保存</a>
              <Divider type="vertical" />
              <a size="small" onClick={() => this.setState({ edit: false, newValue: this.getInitialValue(data).map(i => i.id) })}>取消</a>
            </div>]
          }
        </span>
      }

    </span>);
  }
}

export default index;
