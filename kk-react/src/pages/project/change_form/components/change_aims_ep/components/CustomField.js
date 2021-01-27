import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message } from 'antd';
import { connect } from 'dva';
import { getFormLayout, equalsObj } from '@utils/helper';
import { queryTemplateSelectEP } from '@services/project';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);
const Option = Select.Option;
const { TextArea } = Input;

class CustomField extends Component {
  state = {
    data: [],
    allOptionsObj: {},
  }

  componentDidMount() {
    const { customFileds } = this.props;
    if (customFileds) { 
      this.getAllSelectOptions(customFileds);
      this.getFilterItems(customFileds);
    }
  }

  componentWillReceiveProps(nextProps) {

    if (!equalsObj(this.props.customFileds, nextProps.customFileds)) {
      this.getAllSelectOptions(nextProps.customFileds);
      this.getFilterItems(nextProps.customFileds);
    }
  }

  // 去掉不展示的字段，排序
  getFilterItems = (customData) => {
    let data = [];
    customData.filter(it => it.state === 1) // 过滤掉隐藏的字段
      .map(it => { // 对于sortvalue不存在的特殊处理
        if (!it.sortvalue) {
          it.sortvalue = 0;
        }
        return it;
      })
      .forEach(it => {
        if (data.every(item => item.sortvalue < it.sortvalue)) {
          data.unshift(it);
        } else if (data.every(item => item.sortvalue >= it.sortvalue)) {
          data.push(it);
        } else {
          const index = data.findIndex(item => item.sortvalue < it.sortvalue);
          data.splice(index, 0, it);
        }
      });
    this.setState({ data });
  }

  getAllSelectOptions = (customFileds) => {
    const { allOptionsObj } = this.state;
    customFileds && customFileds.map(it => {
      if (it.type === 2) {
        queryTemplateSelectEP({ customfieldid: it.id }).then((res) => {
          if (res.code !== 200) return message.error(res.message);
          if (res.result) {
            // 也可以使用Object.assign()
            const newObj = allOptionsObj;
            newObj[it.id] = res.result;
            
            this.props.dispatch({ type: 'aimEP/saveCustomSelect', payload: newObj });
            this.setState({ allOptionsObj: newObj });
          }
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    });
  }

  getInitialValue = (it) => {
    if (it.type === 2) {
      return it.customfieldvalueid ? it.customfieldvalueid : undefined;
    } else {
      return it.customvalue ? it.customvalue : undefined;
    }
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { data, allOptionsObj } = this.state;

    return (
      <Form>
        {
          data && !!data.length && data.map(it => {
            return (
              <FormItem label={it.name} {...formLayout}>
                {getFieldDecorator(`custom-${it.id}`, {
                  initialValue: this.getInitialValue(it),
                  rules: it.required === 1 && [{ required: true, message: '此项不能为空' }]
                })(
                  it.type === 1 ? it.inputui === 1 ?
                    <Input placeholder="请输入名称" maxLength={200} /> :
                    <TextArea placeholder="请输入名称" maxLength={200} /> :
                    <Select>
                      {
                        allOptionsObj[it.id] && allOptionsObj[it.id].map(it => (
                          <Option key={it.id} value={it.id}>{it.customlabel}</Option>
                        ))
                      }
                    </Select>
                )}
              </FormItem>
            );
          })
        }
      </Form>);
  }
}

export default connect()(CustomField);

