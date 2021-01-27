import React, { Component } from 'react';
import { message, Cascader } from 'antd';
import { connect } from 'dva';
import { setTreeData } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { equalsObj } from '@utils/helper';
import { getCustomDefault, setCustomDefault } from '@services/product_setting';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import EditSelect from '@components/EditSelect';
import EditSelectUser from '@components/EditSelectUser';

import { CUSTOME_TYPE_MAP, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { getUserList, handleSearchUser } from '@shared/CommonFun';
import styles from '../index.less';


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

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      const { data } = this.props;
      const type = data.type;
      const id = data.id;
      if (type === CUSTOME_TYPE_MAP.SELECT || type === CUSTOME_TYPE_MAP.MULTISELECT || type === CUSTOME_TYPE_MAP.CASCADER) {
        this.getDefaultData(id);
      }
    }
  }

  getDefaultData = (id) => {
    const { data } = this.props;
    const type = data.type;

    const setPromise = Promise.resolve(getCustomDefault(id));
    setPromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      let valueList = res.result.productCustomFieldValueVOList || [];
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
        return (defaultValue);
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
    const { customSelect, data } = this.props;
    const { valueList } = this.state;

    let arr = [];
    let result = [];
    if (customSelect[data.id]) {
      arr = customSelect[data.id];
    } else {
      arr = valueList;
    }
    arr.forEach(it => {
      if (value.some(i => i === it.id)) {
        result.push(it);
      }
    });
    return result;
  }

  setCustomSelect = (data, valueList) => {
    const { customSelect } = this.props;
    let obj = {};
    if (customSelect[data.id]) {
      obj[data.id] = customSelect[data.id];
    } else {
      obj[data.id] = valueList;
    }
    this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: obj });
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
      case CUSTOME_TYPE_MAP.datePicker:
        return (<DatePickerIssue
          value={this.getInitialValue()}
          handleSave={(value) => {
            this.handleSave(value);
          }}
          required={false}
        />);
      case CUSTOME_TYPE_MAP.INTERGER:
      case CUSTOME_TYPE_MAP.DECIMAL:
        return (<EditIssue
          issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
          value={this.getInitialValue()}
          data={data}
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
            required={false}
          />
          :
          <EditSelect
            value={this.getInitialValue()}
            dataSource={valueList.map(it => ({ id: it.id, name: it.customlabel }))}
            handleSaveSelect={(value) => {
              const data = this.getSelectData(value) || {};
              this.handleSave(JSON.stringify(data));
            }}
            required={false}
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
            required={false}
            data={data}
          />
          :
          <div onClick={() => this.setCustomSelect(data, valueList)}>
            <EditIssue
              issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
              value={this.getDisplayText()}
              currentId={this.getInitialValue()}
              dataSource={valueList}
              type="multiSelect"
              data={data}
              handleUpdate={(value) => {
                const data = this.getMultiData(value) || [];
                this.handleSave(JSON.stringify(data));
              }}
              required={false}
            />
          </div>);
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
            <span className={`u-subtitle f-csp ${data && data.defaultValue ? '' : styles.defaultInitValue}`} >
              {this.getInitialValue()}
            &nbsp;
            </span>
            <MyIcon type='icon-xia' style={{ fontSize: '8px', marginLeft: '4px' }} />
            {data && data.defaultValue &&
              <MyIcon
                type="icon-shanchuchengyuan"
                theme="filled"
                title="清空筛选"
                className="f-fs2 u-mgl5"
                onClick={(e) => this.handleChangeCascader('', '')}
              />
            }
          </span>
        </Cascader>);
      case CUSTOME_TYPE_MAP.USERSELECT:
        return (<EditSelectUser
          value={this.getInitialValue().email}
          dataSource={getUserList(this.getInitialValue(), this.state.userList)}
          handleSearch={(value) => handleSearchUser(value, (result) => {
            const { data } = this.props;
            const productid = data && data.productid;
            const userList = result;
            const newUserList = userList.filter((it) => it.lastProductid === productid);
            this.setState({ userList: newUserList });
          })}
          handleSaveSelect={(value) => {
            let data = userList.find(it => it.email === value) || {};
            data = JSON.stringify(data);
            this.handleSave(data);
          }}
          system
          required={false}
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
      this.props.getList();
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

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
  };
};

export default connect(mapStateToProps)(index);
