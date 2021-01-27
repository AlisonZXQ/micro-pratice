import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message, Cascader, Tooltip } from 'antd';
import { getFormLayout, deepCopy } from '@utils/helper';
import { queryTemplateItems, queryTemplateSelect } from '@services/project';
import { PROJECT_CUSTOM_USE, PROJECT_CUSTOM_USECASE, PROJECT_CUSTOM_TYPE, PROJECT_CUSTOM_TEXT_TYPE } from '@shared/ProductSettingConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const closeFormLayout = getFormLayout(5, 17); // 结项的自定义字段

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
  }

  componentDidMount() {
    const { templateId } = this.props;

    if (templateId) {
      this.getItems(this.props);
    } else {
      this.setState({ data: [] });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.templateId !== nextProps.templateId) {
      if (nextProps.templateId) {
        this.getItems(nextProps);
      } else {
        this.setState({ data: [] });
      }
    }
  }

  getItems = (props) => {
    const { templateId, type } = props;

    // 根据模版id去获取对应的字段
    queryTemplateItems(templateId, type).then((res) => {
      if (res.code !== 200) message.error(res.message);
      if (res.result) {
        this.getFilterItems(res.result);
      }
    }).catch((err) => {
      message.error(err || err.message);
    });
  }

  // 去掉不展示的字段，排序
  getFilterItems = (customData) => {
    let data = [];
    customData.filter(it => it.projectTemplateCustomField && it.projectTemplateCustomField.state === PROJECT_CUSTOM_USE.OPEN) // 过滤掉隐藏的字段
      .map(it => { // 对于sortvalue不存在的特殊处理
        if (!it.projectTemplateCustomField.sortvalue) {
          it.projectTemplateCustomField.sortvalue = 0;
        }
        return it;
      })
      .forEach(it => {
        let index = -1;
        index = data.findIndex(item => item && it.projectTemplateCustomField &&
          (item.sortvalue < it.projectTemplateCustomField.sortvalue));
        if (it.projectTemplateCustomField.sortvalue === 0) {
          data.push(it.projectTemplateCustomField); // 为0的都放在最后
        } else if (index === -1) { // 值最小放在最后
          data.push(it.projectTemplateCustomField);
        } else { // 其他情况找到第一个比其小的插入
          data.splice(index, 0, it.projectTemplateCustomField);
        }
      });
    this.setState({ data });
  }

  // 焦点聚集时获取下拉框的option值
  onFocus = (id) => {
    queryTemplateSelect(id).then((res) => {
      if (res.code !== 200) message.error(res.message);
      if (res.result) {
        this.setState({ [`select-${id}`]: res.result });
      }
    }).catch((err) => {
      message.error(err || err.message);
    });
  }

  getCascadeField = (it) => {
    const { form: { getFieldDecorator }, cascadeList, categoryObj } = this.props;
    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === it.id)) || {};
    const cascadeField = obj.cascadeField || {};

    return (Object.keys(obj).length ?
      <FormItem label={getLabel(cascadeField.fieldname)} {...formLayout}>
        {
          getFieldDecorator(`cascadeField-${cascadeField.id}`, {
            rules: [{ required: cascadeField.required === PROJECT_CUSTOM_USE.OPEN, message: '此项必填！' }],
          })(
            <Cascader
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              expandTrigger="hover"
              options={categoryObj[cascadeField.id] || []}
              onChange={this.onChangeDepart}
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

  handleSelect = (value, it) => {
    const { cascadeList } = this.props;
    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === it.id)) || {};
    if (Object.keys(obj).length) {
      const cascadeFieldId = obj.cascadeField.id;
      const params = {
        cascadefieldid: cascadeFieldId,
        customfieldvalueid: value,
      };
      this.props.dispatch({ type: 'projectCascade/getCategoryList', payload: params });
    }
  }

  handleChange = (id, it) => {
    const { form: { setFieldsValue }, cascadeList, categoryObj } = this.props;
    const obj = (cascadeList && cascadeList.find(item => item.projectTemplateCustomField.id === it.id)) || {};
    const cascadeField = obj.cascadeField || {};
    if (Object.keys(cascadeField).length) {
      setFieldsValue({ [`cascadeField-${cascadeField.id}`]: undefined });
      let newObj = deepCopy(categoryObj, {});
      newObj[cascadeField.id] = [];
      this.props.dispatch({ type: 'projectCascade/saveCategoryObj', payload: newObj });
    }
  }

  render() {
    const { form: { getFieldDecorator }, type } = this.props;
    const { data } = this.state;

    const layout = type === PROJECT_CUSTOM_USECASE.FINISH ? closeFormLayout : formLayout;
    return (
      <Form>
        {
          data && !!data.length && data.map(it => (<span>
            <FormItem label={getLabel(it.name)} {...layout}>
              {getFieldDecorator(`custom-${it.id}`, {
                rules: it.required === PROJECT_CUSTOM_USE.OPEN && [{ required: true, message: '此项不能为空' }]
              })(
                it.type === PROJECT_CUSTOM_TYPE.TEXT ? it.inputui === PROJECT_CUSTOM_TEXT_TYPE.INPUT ?
                  <Input placeholder="请输入" maxLength={500} /> :
                  <TextArea placeholder="请输入" maxLength={500} /> :
                  // 编辑那边不能用focus因为值还原不了
                  <Select
                    onFocus={() => this.onFocus(it.id)}
                    onSelect={(id) => this.handleSelect(id, it)}
                    allowClear
                    onChange={(id) => this.handleChange(id, it)}
                  >
                    {
                      this.state[`select-${it.id}`] && this.state[`select-${it.id}`].map(it => (
                        <Option key={it.id} value={it.id}>{it.customlabel}</Option>
                      ))
                    }
                  </Select>
              )}
            </FormItem>

            {
              this.getCascadeField(it)
            }
          </span>))
        }
      </Form>);
  }
}

export default CustomField;

