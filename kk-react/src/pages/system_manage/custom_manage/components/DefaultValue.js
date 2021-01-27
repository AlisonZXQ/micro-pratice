import React, { Component } from 'react';
import { message, Cascader } from 'antd';
import { setTreeData } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { getCustomFieldSet, setCustomDefault } from '@services/system_manage';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import EditSelect from '@components/EditSelect';
import EditSelectUser from '@components/EditSelectUser';
import { CUSTOM_SELECTTYPE_MAP, CUSTOME_TYPE_MAP } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { handleSearchUser, getUserList } from '@shared/CommonFun';

class index extends Component {

  state = {
    valueList: [],
    userList: [],
  }

  componentDidMount() {
    const { data } = this.props;
    const type = data.type;
    const id = data.id;
    if (type === CUSTOME_TYPE_MAP.SELECT || type === CUSTOME_TYPE_MAP.MULTISELECT || type === CUSTOME_TYPE_MAP.CASCADER) {
      this.getDefaultData(id);
    }
  }

  getDefaultData = (id) => {
    const { data } = this.props;
    const type = data.type;

    const setPromise = Promise.resolve(getCustomFieldSet(id));
    setPromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      let valueList = res.result.platformCustomFieldValueVOList || [];
      if (type === CUSTOME_TYPE_MAP.CASCADER) {
        valueList = setTreeData(valueList);
      }
      this.setState({
        valueList,
      });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getInitialValue = () => {
    const { data } = this.props;
    const type = data.type;
    const defaultValue = data.defaultValue;
    const multiValue = defaultValue && type === CUSTOME_TYPE_MAP.MULTISELECT ? JSON.parse(defaultValue) : [];
    const cascaderValue = defaultValue && type === CUSTOME_TYPE_MAP.CASCADER ? JSON.parse(defaultValue) : [];
    const userValue = defaultValue && type === CUSTOME_TYPE_MAP.USERSELECT ? JSON.parse(defaultValue) : {};
    const selectValue = defaultValue && type === CUSTOME_TYPE_MAP.SELECT ? JSON.parse(defaultValue) : {};

    switch (type) {
      case CUSTOME_TYPE_MAP.INPUT:
      case CUSTOME_TYPE_MAP.TEXTAREA:
        return (defaultValue);
      case CUSTOME_TYPE_MAP.DATEPICKER:
      case CUSTOME_TYPE_MAP.DECIMAL:
      case CUSTOME_TYPE_MAP.INTERGER:
        return (Number(defaultValue));
      case CUSTOME_TYPE_MAP.SELECT:
        return (selectValue.id);
      case CUSTOME_TYPE_MAP.MULTISELECT:
        return (multiValue.map(it => it.id));
      case CUSTOME_TYPE_MAP.CASCADER:
        return cascaderValue && cascaderValue.length ? cascaderValue.map(it => it.customlabel).join(',') : '请选择';
      case CUSTOME_TYPE_MAP.USERSELECT:
        return userValue;
      default:
        return null;
    }
  }

  getDisplayText = () => {
    const { data } = this.props;
    const type = data.type;
    const defaultValue = data.defaultValue;
    const multiValue = defaultValue && type === CUSTOME_TYPE_MAP.MULTISELECT ? JSON.parse(defaultValue) : [];
    const selectValue = defaultValue && type === CUSTOME_TYPE_MAP.SELECT ? JSON.parse(defaultValue) : {};

    // 多选
    if (type === CUSTOME_TYPE_MAP.MULTISELECT) {
      return multiValue.map(it => it.customlabel).join(',');
    } else if (type === CUSTOME_TYPE_MAP.SELECT) {
      return selectValue.customlabel;
    }
  }

  getSelectData = (value) => {
    const { valueList } = this.state;
    return valueList.find(it => it.id === Number(value)) || {};
  }

  getMultiData = (value) => {
    const { valueList } = this.state;
    const arr = [];
    valueList.forEach(it => {
      if (value.some(i => i === it.id)) {
        arr.push(it);
      }
    });
    return arr;
  }

  getContent = () => {
    const { data } = this.props;
    const { valueList, userList } = this.state;
    const type = data.type;
    // 单选or多选 1是平铺 2是下拉
    // 级联 1是到最后 2是父节点可选
    const attributeValue = Number(data.attributeValue);

    switch (type) {
      case CUSTOME_TYPE_MAP.INPUT:
      case CUSTOME_TYPE_MAP.TEXTAREA:
        return (<EditIssue
          issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
          maxLength={500}
          value={this.getInitialValue()}
          type={type === CUSTOME_TYPE_MAP.INPUT ? 'input' : 'textArea'}
          handleUpdate={(value) => this.handleSave(value)}
        />);
      case CUSTOME_TYPE_MAP.DATEPICKER:
        return (<DatePickerIssue
          value={this.getInitialValue()}
          handleSave={(value) => {
            this.handleSave(value);
          }}
          required
        />);
      case CUSTOME_TYPE_MAP.INTERGER:
      case CUSTOME_TYPE_MAP.DECIMAL:
        return (<EditIssue
          issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
          value={this.getInitialValue()}
          type={type === CUSTOME_TYPE_MAP.INTERGER ? 'integer' : 'decimal'}
          handleUpdate={(value) => this.handleSave(value)}
        />);
      case CUSTOME_TYPE_MAP.SELECT:
        return (attributeValue === CUSTOM_SELECTTYPE_MAP.TILE ?
          <EditIssue
            issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
            value={this.getDisplayText()}
            currentId={this.getInitialValue()}
            dataSource={valueList}
            type="radio"
            handleUpdate={(value) => {
              const data = this.getSelectData(value) || {};
              this.handleSave(JSON.stringify(data));
            }}
          />
          :
          <EditSelect
            value={this.getInitialValue()}
            dataSource={valueList.map(it => ({ id: it.id, name: it.customlabel }))}
            handleSaveSelect={(value) => {
              const data = this.getSelectData(value) || {};
              this.handleSave(JSON.stringify(data));
            }}
            required
          />);
      case CUSTOME_TYPE_MAP.MULTISELECT:
        return (attributeValue === CUSTOM_SELECTTYPE_MAP.TILE ?
          <EditIssue
            issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
            value={this.getDisplayText()}
            currentId={this.getInitialValue()}
            dataSource={valueList}
            type="checkbox"
            handleUpdate={(value) => {
              const data = this.getMultiData(value) || [];
              this.handleSave(JSON.stringify(data));
            }}
          />
          :
          <EditIssue
            issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
            value={this.getDisplayText()}
            currentId={this.getInitialValue()}
            dataSource={valueList}
            type="multiSelect"
            handleUpdate={(value) => {
              const data = this.getMultiData(value) || [];
              this.handleSave(JSON.stringify(data));
            }}
          />);
      case CUSTOME_TYPE_MAP.CASCADER:
        return (<Cascader
          allowClear
          expandTrigger="hover"
          fieldNames={{ label: 'customlabel', value: 'id', children: 'children' }}
          options={valueList}
          onChange={(value, data) => this.handleChangeCascader(value, data)}
          changeOnSelect={attributeValue === CUSTOM_SELECTTYPE_MAP.SELECT}
        >
          <span>
            <span className="u-subtitle f-csp">
              {this.getInitialValue()}
            &nbsp;
            </span>
            <MyIcon type='icon-xia' style={{ fontSize: '9px', marginLeft: '4px' }} />
          </span>
        </Cascader>);
      case CUSTOME_TYPE_MAP.USERSELECT:
        return (<EditSelectUser
          value={this.getInitialValue().email}
          dataSource={getUserList(this.getInitialValue(), this.state.userList)}
          handleSearch={(value) => handleSearchUser(value, (result) => {
            this.setState({ userSearch: result });
          })}
          handleSaveSelect={(value) => {
            let data = userList.find(it => it.email === value) || {};
            data = JSON.stringify(data);
            this.handleSave(data);
          }}
          system
          required
        />);
      default:
        return null;
    }
  }

  handleChangeCascader = (value, record) => {
    const val = record ? JSON.stringify(record) : '';
    this.handleSave(val);
  }

  handleSave = (value) => {
    const { data } = this.props;
    const params = {
      value,
      customfieldid: data.id,
    };
    setCustomDefault(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('设置默认值成功！');
      this.props.getCustomManageList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {

    return (<span>
      {this.getContent()}
    </span>);
  }
}

export default index;
