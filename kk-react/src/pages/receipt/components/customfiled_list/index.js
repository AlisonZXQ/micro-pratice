import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Tooltip, Cascader, Radio, Checkbox, InputNumber, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getFormLayout, deepCopy, equalsObj, objKeysToLower } from '@utils/helper';
import BusinessHOC from '@components/BusinessHOC';
import TinyMCE from '@components/TinyMCE';
import { handleSearchUser } from '@shared/CommonFun';
import { CUSTOME_TYPE_MAP, ISSUE_CUSTOM_USE, CUSTOM_SELECTTYPE_MAP, CUSTOME_REQUIRED } from '@shared/ReceiptConfig';
import CloudCC from '../CloudCC';
import styles from './index.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

const formLayout = getFormLayout(3, 12);
const projectAimLayout = getFormLayout(5, 18);

export const nameMap = {
  'requirement': 'requirementCustomFieldRelation',
  'bug': 'bugCustomFieldRelation',
  'advise': 'adviseCustomFieldRelation',
  'task': 'taskCustomFieldRelation',
  'objective': 'objectiveCustomFieldRelation',
  'ticket': 'ticketCustomFieldRelation'
};

const Option = Select.Option;

class CustomField extends Component {
  state = {
    data: [],
    allOptionsObj: {},
    userList: [],
  }

  componentDidMount() {
    const { customFileds } = this.props;
    if (customFileds) {
      this.getFilterItems(customFileds);
      this.getAllSelectOptions(customFileds);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.customFileds, nextProps.customFileds)) {
      this.getFilterItems(nextProps.customFileds);
      this.getAllSelectOptions(nextProps.customFileds);
    }
  }

  // 去掉不展示的字段，排序
  getFilterItems = (customData) => {
    let data = [];
    customData.filter(it => it.state === ISSUE_CUSTOM_USE.OPEN) // 过滤掉隐藏的字段
      .map(it => { // 对于sortvalue不存在的特殊处理
        if (!it.sortvalue) {
          it.sortvalue = 0;
        }
        return it;
      })
      .forEach(it => {
        let index = -1;
        index = data.findIndex(item => item.sortvalue < it.sortvalue);
        if (index === -1) {
          data.push(it);
        } else {
          data.splice(index, 0, it);
        }
      });
    this.setState({ data });
  }

  getAllSelectOptions = (customFileds) => {
    const { allOptionsObj } = this.state;

    customFileds && customFileds.forEach(it => {
      if (it.type === CUSTOME_TYPE_MAP.SELECT || it.type === CUSTOME_TYPE_MAP.MULTISELECT || it.type === CUSTOME_TYPE_MAP.CASCADER) {
        const newObj = allOptionsObj;
        newObj[it.id] = it.productCustomFieldValueVOList || [];
        this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: newObj });
        this.setState({ allOptionsObj: newObj });
      }
    });
  }

  getCreateInitialValue = (it) => {
    const { allOptionsObj } = this.state;
    const newList = allOptionsObj[it.id] || [];
    const defaultValue = it.defaultValue;
    const type = it.type;

    const multiValue = defaultValue && type === CUSTOME_TYPE_MAP.MULTISELECT ? JSON.parse(defaultValue) : [];
    const multiIds = multiValue.map(it => it.id);
    let ids = [];
    multiIds.forEach(item => {
      if (newList.some(i => i.id === item)) {
        ids.push(item);
      }
    });

    const cascaderValue = defaultValue && type === CUSTOME_TYPE_MAP.CASCADER ? JSON.parse(defaultValue) : [];
    const cascaderIds = cascaderValue.map(it => it.id);
    cascaderIds.forEach(item => {
      if (newList.some(i => i.id === item)) {
        ids.push(item);
      }
    });

    const userValue = defaultValue && type === CUSTOME_TYPE_MAP.USERSELECT ? JSON.parse(defaultValue) : {};

    const selectValue = defaultValue && type === CUSTOME_TYPE_MAP.SELECT ? JSON.parse(defaultValue) : {};
    const selectObj = newList.find(i => i.id === selectValue.id) || {};

    switch (type) {
      case CUSTOME_TYPE_MAP.INPUT:
      case CUSTOME_TYPE_MAP.TEXTAREA:
        return defaultValue;
      case CUSTOME_TYPE_MAP.DATEPICKER:
        return defaultValue ? moment(defaultValue) : '';
      case CUSTOME_TYPE_MAP.DECIMAL:
      case CUSTOME_TYPE_MAP.INTERGER:
        return defaultValue && Number(defaultValue);
      case CUSTOME_TYPE_MAP.SELECT:
        return selectObj.id;
      case CUSTOME_TYPE_MAP.MULTISELECT:
        return ids;
      case CUSTOME_TYPE_MAP.CASCADER:
        return ids;
      case CUSTOME_TYPE_MAP.USERSELECT:
        return userValue.email;
      default:
        return null;
    }
  }

  getEditInitialValue = (it) => {
    const { valueList, type, valueMap } = this.props;
    const { allOptionsObj } = this.state;

    if (valueList && valueList.length) {
      // 多选和级联都是可能存在多个匹配的值
      const arr = valueList.filter(item => item.productCustomField && item.productCustomField.id === it.id) || [];

      const firstObjRelation = objKeysToLower(arr[0] && arr[0][nameMap[type]]);

      if ([CUSTOME_TYPE_MAP.INPUT, CUSTOME_TYPE_MAP.TEXTAREA, CUSTOME_TYPE_MAP.USERSELECT, CUSTOME_TYPE_MAP.INTERGER, CUSTOME_TYPE_MAP.DECIMAL].some(i => i === it.type)) {// 单文本/多文本
        return firstObjRelation.customvalue ? firstObjRelation.customvalue : undefined;
      } else if (it.type === CUSTOME_TYPE_MAP.DATEPICKER) {
        return firstObjRelation && firstObjRelation.customvalue ? moment(firstObjRelation.customvalue) : undefined;
      } else if (it.type === CUSTOME_TYPE_MAP.SELECT) { //单选
        const newList = allOptionsObj[it.id] || [];
        const obj = newList.find(i => i.id === firstObjRelation.customfieldvalueid) || {};
        return obj.id ? Number(obj.id) : undefined;
      } else if (it.type === CUSTOME_TYPE_MAP.MULTISELECT) { // 多选
        const multiIds = arr.map(it => it[nameMap[type]] &&
          (it[nameMap[type]].customfieldvalueid || it[nameMap[type]].customFieldValueId));
        const newList = allOptionsObj[it.id] || [];
        let ids = [];
        multiIds.forEach(item => {
          if (newList.some(i => i.id === item)) {
            ids.push(item);
          }
        });
        return ids;
      } else if (it.type === CUSTOME_TYPE_MAP.CASCADER) { // 级联
        let cascaderIds = [];
        if (arr.length === 1) {
          cascaderIds = [firstObjRelation.customfieldvalueid];
        } else if (arr.length === 2) {
          const firstObjRelation = arr[0][nameMap[type]] || {};
          const secondObjRelation = arr[1][nameMap[type]] || {};
          const firstMap = valueMap[Number(firstObjRelation.customfieldvalueid)] || {};
          const secondMap = valueMap[Number(secondObjRelation.customfieldvalueid)] || {};

          if (firstMap.parentid && firstMap.id && secondMap.id) {
            cascaderIds = [secondMap.id, firstMap.id];
          } else if (secondMap.parentid && firstMap.id && secondMap.id) {
            cascaderIds = [firstMap.id, secondMap.id];
          }
        }

        const newList = allOptionsObj[it.id] || [];
        let ids = [];
        cascaderIds.forEach(item => {
          if (newList.some(i => i.id === item)) {
            ids.push(item);
          }
        });

        return ids;
      }
    }
  }

  setDefaultValue = (result, selectMap) => {
    const { form: { setFieldsValue } } = this.props;

    this.setState({ allOptionsObj: selectMap }, () => {
      result.forEach(it => {
        setFieldsValue({ [`custom-${it.customfieldid}-${CUSTOME_TYPE_MAP.SELECT}`]: it.id });
      });
    });
  }

  setMultiDefaultValue = (it, id, selectMap) => {
    const { form: { setFieldsValue, getFieldValue } } = this.props;
    let ids = getFieldValue(`custom-${it.id}-${it.type}`) || [];
    ids.push(id);

    this.setState({ allOptionsObj: selectMap }, () => {
      setFieldsValue({ [`custom-${it.id}-${it.type}`]: ids });
    });
  }

  getUserList = (d) => {
    const defaultValue = d.defaultValue;
    const data = defaultValue ? JSON.parse(defaultValue) : {};
    const { userList } = this.state;
    const newUserList = deepCopy(userList, []);
    const flag = userList.some(it => it.id === data.id);
    if (!flag && Object.keys(data).length) {
      newUserList.push(data);
    }
    newUserList.forEach(it => {
      it.value = it.email;
      it.name = it.realname;
      it.label = `${it.realname} ${it.email}`;
    });
    return newUserList;
  }

  getContent = (it) => {
    const { isBusiness } = this.props;
    const { allOptionsObj } = this.state;

    if (it.type === CUSTOME_TYPE_MAP.INPUT) {
      return <Input placeholder="请输入" maxLength={500} />;

    } else if (it.type === CUSTOME_TYPE_MAP.TEXTAREA) {
      return <TinyMCE height={200} placeholder="请输入" />;
    } else if (it.type === CUSTOME_TYPE_MAP.SELECT) {
      if (it.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}`) {
        return <Radio.Group>
          {
            allOptionsObj[it.id] && allOptionsObj[it.id].map(item => (
              <Radio key={item.id} value={item.id}>
                {item.customlabel}
              </Radio>
            ))
          }
        </Radio.Group>;
      } else {
        return <Select
          showSearch
          optionFilterProp="children"
          dropdownRender={(menu) => (
            <div>
              {this.getCloudccQueryToolbar(it, isBusiness, this.setDefaultValue)}
              {menu}
            </div>
          )}
        >
          {
            allOptionsObj[it.id] && allOptionsObj[it.id].map(item => (
              <Option key={item.id} value={item.id}>
                {item.customlabel}
              </Option>
            ))
          }
        </Select>;
      }

    } else if (it.type === CUSTOME_TYPE_MAP.MULTISELECT) {
      if (it.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}`) {
        return <CheckboxGroup>
          {
            allOptionsObj[it.id] && allOptionsObj[it.id].map(item => (
              <Checkbox key={item.id} value={item.id}>
                {item.customlabel}
              </Checkbox>
            ))
          }
        </CheckboxGroup>;
      } else {
        return <Select
          showSearch
          optionFilterProp="children"
          mode="multiple"
          showArrow
          placeholder='请选择'
          dropdownRender={(menu) => (
            <div>
              {this.getCloudccQueryToolbar(it, isBusiness, this.setMultiDefaultValue)}
              {menu}
            </div>
          )}
        >
          {
            allOptionsObj[it.id] && allOptionsObj[it.id].map(item => (
              <Option key={item.id} value={item.id}>
                {item.customlabel}
              </Option>
            ))
          }
        </Select>;
      }
    } else if (it.type === CUSTOME_TYPE_MAP.CASCADER) {
      return <Cascader
        showSearch
        expandTrigger='hover'
        changeOnSelect={it.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}` ? false : true}
        options={this.getCascederData(allOptionsObj[it.id] || [])}
        popupClassName={this.getCascederClassName(allOptionsObj[it.id] || [])}
        placeholder="请选择" />;
    } else if (it.type === CUSTOME_TYPE_MAP.USERSELECT) {
      // 6: '单选成员选择'
      return (<Select
        showSearch
        className="f-fw"
        onSearch={(value) => handleSearchUser(value, (result) => {
          this.setState({ userList: result });
        })}>
        {this.getUserList(it).map(it =>
          <Option key={it.value} value={it.value}>
            {it.label}
          </Option>)}
      </Select>);
    } else if (it.type === CUSTOME_TYPE_MAP.DATEPICKER) {
      // 日期
      return (<DatePicker
        placeholder="点击选择日期"
      />);
    } else if (it.type === CUSTOME_TYPE_MAP.INTERGER) {
      return <InputNumber
        precision={0}
        min={0}
      />;
    } else if (it.type === CUSTOME_TYPE_MAP.DECIMAL) {
      return <InputNumber
        step={0.1}
      />;
    }
  }

  getCloudccQueryToolbar = (it, isBusiness, handleSaveFn) => {
    // data自定义字段集合
    const { data } = this.state;
    return it.cloudcc_field && it.cloudcc_key && !isBusiness ?
      <div
        style={{ padding: '4px 8px', cursor: 'pointer' }}
        onMouseDown={e => e.preventDefault()}
      >
        没找到想要的?
        <CloudCC data={it} customFields={data} handleSave={(result, selectMap) => handleSaveFn(result, selectMap)} />
      </div> : '';
  }

  getCascederData = (data) => {
    let fatherData = data.filter(it => it.parentid === 0);
    fatherData.forEach((item) => {
      item.label = item.customlabel;
      item.value = item.id;
      let children = [];
      data.forEach((it) => {
        if (item.id === it.parentid) {
          children.push({
            label: it.customlabel,
            value: it.id,
          });
        }
      });
      item.children = children;
    });
    return fatherData;
  }

  getCascederClassName = (data) => {
    let onlyFatherItems = true;
    const findChildItem = data.find((it) => it.parentid !== 0);
    if (findChildItem) {
      onlyFatherItems = false;
    }
    return onlyFatherItems ? styles.noChildCascader : '';
  }

  getLabel = (it) => {
    const danwei = it.productCustomFieldValueVOList && it.productCustomFieldValueVOList[0] && it.productCustomFieldValueVOList[0].customlabel;
    switch (it.type) {
      case 9:
      case 10:
        return (<span className="u-subtitle f-fs1">{danwei}</span>);
      default:
        return null;
    }
  }

  render() {
    const { form: { getFieldDecorator }, projectAim, create } = this.props;
    const { data } = this.state;
    const deaultFormLayout = projectAim ? projectAimLayout : formLayout;

    const getLabel = (text) => {
      return (
        <Tooltip title={text}>
          <span>{text.length > 6 ? `${text.slice(0, 6)}...` : text}</span>
        </Tooltip>
      );
    };

    return (
      <Form>
        {
          data && !!data.length && data.map(it => (
            <FormItem label={getLabel(it.name)} {...deaultFormLayout}>
              {getFieldDecorator(`custom-${it.id}-${it.type}`, {
                initialValue: create ? this.getCreateInitialValue(it) : this.getEditInitialValue(it),
                rules: it.required === CUSTOME_REQUIRED.REQUIRED && [{ required: true, message: '此项不能为空' }]
              })(
                this.getContent(it)
              )}
              {
                this.getLabel(it)
              }
            </FormItem>
          ))
        }
      </Form>);
  }
}

const mapStateToProps = (state) => {
  return {
    customSelect: state.aimEP.customSelect,
  };
};

export default connect(mapStateToProps)(BusinessHOC()(CustomField));
