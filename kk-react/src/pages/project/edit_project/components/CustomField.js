import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message, Cascader, Tooltip } from 'antd';
import { getFormLayout, equalsObj, deepCopy } from '@utils/helper';
import { queryTemplateSelect } from '@services/project';
import { PROJECT_CUSTOM_TYPE, PROJECT_CUSTOM_USE, PROJECT_CUSTOM_REQUIRED, PROJECT_CUSTOM_TEXT_TYPE } from '@shared/ProductSettingConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const Option = Select.Option;
const { TextArea } = Input;

const getLabel = (text) => {
  return (
    <Tooltip title={text}>
      <span>{text.length > 6 ? `${text.slice(0, 5)}...` : text}</span>
    </Tooltip>
  );
};

class CustomField extends Component {
  state = {
    data: [],
    allOptionsObj: {},
  }

  componentDidMount() {
    const { customFileds, cascadeList } = this.props;
    this.getAllSelectOptions(customFileds);
    if (customFileds && customFileds.length) { // 编辑的时候
      this.getFilterItems(customFileds);
    }

    if (cascadeList && cascadeList.length) { // 编辑的时候
      this.getDefaultCategory(cascadeList);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.cascadeList, nextProps.cascadeList)) {
      this.getDefaultCategory(nextProps.cascadeList);
    }
  }

  getDefaultCategory = (cascadeList) => {
    const { customFileds } = this.props;
    customFileds.forEach(it => {
      if (it.customField.type === PROJECT_CUSTOM_TYPE.SELECT && it.value) {
        this.handleSelect(Number(it.value), it, cascadeList);
      }
    });
  }

  // 去掉不展示的字段，排序
  getFilterItems = (customData) => {
    let data = [];
    customData.filter(it => it.customField.state === PROJECT_CUSTOM_USE.OPEN) // 过滤掉隐藏的字段
      .map(it => { // 对于sortvalue不存在的特殊处理
        if (!it.customField.sortvalue) {
          it.customField.sortvalue = 0;
        }
        return it;
      })
      .forEach(it => {
        let index = -1;
        index = data.findIndex(item => item && item.customField && it.customField &&
          (item.customField.sortvalue < it.customField.sortvalue));
        if (index === -1) { // 找不到比该值小的放在最后面
          data.push(it);
        } else { // 其他情况找到第一个比其小的插入
          data.splice(index, 0, it);
        }
      });
    this.setState({ data });
  }

  getAllSelectOptions = (customFileds) => {
    const { allOptionsObj } = this.state;
    customFileds && customFileds.map(it => {
      if (it.customField.type === PROJECT_CUSTOM_TYPE.SELECT) {
        queryTemplateSelect(it.customFieldId).then((res) => {
          if (res.code !== 200) return message.error(res.message);
          if (res.result) {
            // 也可以使用Object.assign()
            const newObj = allOptionsObj;
            newObj[it.customFieldId] = res.result;
            this.setState({ allOptionsObj: newObj });
          }
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getInitialValue = (it) => {
    if (it.customField.type === PROJECT_CUSTOM_TYPE.SELECT) {
      return it.value ? Number(it.value) : undefined;
    } else {
      return it.value ? it.value : undefined;
    }
  }

  handleSelect = (value, data, casList) => {
    // casList为了还原已选择的下拉框的级联值
    const cascadeList = casList || this.props.cascadeList;

    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === data.customFieldId)) || {};
    if (Object.keys(obj).length) {
      const cascadeFieldId = obj.cascadeField.id;
      const params = {
        cascadefieldid: cascadeFieldId,
        customfieldvalueid: value,
      };
      this.props.dispatch({ type: 'projectCascade/getCategoryList', payload: params });
    }
  }

  getCascadeFieldDefaultValue = (id) => {
    const { editData, categoryObj } = this.props;
    const cascadeValueInfoList = editData.cascadeValueInfoList || [];
    const arr = cascadeValueInfoList.filter(it => it.cascadeField.id === id) || [];
    const category = categoryObj[id];
    let value = undefined;

    if (arr.length === 0) {
      value = undefined;
    } else if (arr.length === 1) {
      const defaultValue = arr[0].cascadeCategory.id;
      value = [defaultValue];
    } else if (arr.length === 2) {
      arr.forEach((it, index) => {
        if (category && category.some(item => item.id === it.cascadeCategory.id)) {
          if (index === 0) {
            value = [arr[0].cascadeCategory.id, arr[1].cascadeCategory.id];
          } else {
            value = [arr[1].cascadeCategory.id, arr[0].cascadeCategory.id];
          }
        }
      });
    }
    return value;
  }

  getCascadeField = (it) => {
    const { form: { getFieldDecorator }, cascadeList, categoryObj } = this.props;
    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === it.customField.id)) || {};
    const cascadeField = obj.cascadeField || {};
    // 这里的options有时候不能还原是因为什么？
    const options = categoryObj[cascadeField.id];

    const getLabel = (text) => {
      return (
        <Tooltip title={text}>
          <span>{text.length > 6 ? text.slice(0, 6) : text}</span>
        </Tooltip>
      );
    };

    return (Object.keys(obj).length ?
      <FormItem label={getLabel(cascadeField.fieldname)} {...formLayout}>
        {
          getFieldDecorator(`cascadeField-${cascadeField.id}`, {
            initialValue: this.getCascadeFieldDefaultValue(cascadeField.id),
            rules: [{ required: cascadeField.required === PROJECT_CUSTOM_REQUIRED.REQUIRED, message: '此项必填！' }],
          })(
            <Cascader
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              expandTrigger="hover"
              options={options}
              changeOnSelect
              style={{ width: '100%' }}
              showSearch
              placeholder="请先选择自定义字段值"
            />
          )
        }
      </FormItem>
      : null
    );
  }

  handleChange = (id, it) => {
    const { form: { setFieldsValue }, cascadeList, categoryObj } = this.props;
    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === it.customFieldId)) || {};
    const cascadeField = obj.cascadeField || {};
    if (Object.keys(cascadeField).length) {
      setFieldsValue({ [`cascadeField-${cascadeField.id}`]: undefined });
      let newObj = deepCopy(categoryObj, {});
      newObj[cascadeField.id] = [];
      this.props.dispatch({ type: 'projectCascade/saveCategoryObj', payload: newObj });
    }
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { data, allOptionsObj } = this.state;

    return (
      <Form>
        {
          data && !!data.length && data.map(it => {
            return (<span>
              <FormItem label={getLabel(it.customField.name)} {...formLayout}>
                {getFieldDecorator(`custom-${it.customFieldId}`, {
                  initialValue: this.getInitialValue(it),
                  rules: it.customField.required === PROJECT_CUSTOM_REQUIRED.REQUIRED && [{ required: true, message: '此项不能为空' }]
                })(
                  it.customField.type === PROJECT_CUSTOM_TYPE.TEXT ? it.customField.inputui === PROJECT_CUSTOM_TEXT_TYPE.INPUT ?
                    <Input placeholder="请输入名称" maxLength={200} /> :
                    <TextArea placeholder="请输入名称" maxLength={200} /> :
                    // 如果默认下拉有值，需要判断是否需要初始化调用级联列表
                    <Select
                      onSelect={(id) => this.handleSelect(id, it)}
                      allowClear
                      onChange={(id) => this.handleChange(id, it)}
                    >
                      {
                        allOptionsObj[it.customFieldId] && allOptionsObj[it.customFieldId].map(it => (
                          <Option key={it.id} value={it.id}>{it.customlabel}</Option>
                        ))
                      }
                    </Select>
                )}
              </FormItem>

              {
                this.getCascadeField(it)
              }
            </span>);
          })
        }
      </Form>);
  }
}

export default CustomField;

