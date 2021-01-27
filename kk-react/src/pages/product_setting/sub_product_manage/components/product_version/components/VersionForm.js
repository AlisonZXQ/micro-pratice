import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import { getFormLayout } from '@utils/helper';
import MyIcon from '@components/MyIcon';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);

const { Option } = Select;

class VersionForm extends Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }

  render() {
    const { form: { getFieldDecorator }, type, versionObj } = this.props;
    const data = type === 'edit' ? versionObj : {};
    const { subProductId, subProductName } = this.props.location.query;

    return (
      <span>
        <FormItem label="子产品" {...formLayout}>
          {
            getFieldDecorator('subProductId', {
              initialValue: subProductId || 0,
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <Select disabled className="f-fw">
                <Option value={subProductId || 0}>{subProductName || ''}</Option>
              </Select>
            )
          }
        </FormItem>

        <FormItem label="版本名称" {...formLayout}>
          {
            getFieldDecorator('name', {
              initialValue: data.version && data.version.name,
              rules: [
                { required: true, message: '此项不能为空' },
                { pattern: /^[^\s]*$/, message: '格式不正确'}
              ]
            })(
              <Input placeholder="请输入版本名称" className="f-fw" maxLength={50} />
            )
          }
        </FormItem>

        <FormItem label="计划发布日期" {...formLayout}>
          {
            getFieldDecorator('endtime', {
              initialValue: data.version && data.version.endtime ? moment(data.version.endtime) : undefined,
              rules: [{ required: true, message: '此项不能为空' }]
            })(
              <DatePicker suffixIcon={<MyIcon type='icon-riqi' />} className="f-fw" />
            )
          }
        </FormItem>

        <FormItem label="描述" {...formLayout} className='u-mgb0'>
          {getFieldDecorator('description', {
            initialValue: data.version && data.version.description,
          })(
            <Input placeholder="请输入版本描述，不超过200字" className="f-fw" maxLength={200} />
          )}
        </FormItem>
      </span>
    );
  }
}

export default VersionForm;
