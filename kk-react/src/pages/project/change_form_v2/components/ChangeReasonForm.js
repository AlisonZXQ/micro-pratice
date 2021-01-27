import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select } from 'antd';
import { getFormLayout } from '@utils/helper';
import { changeTypeMap, CHANGE_REASON_TYPE } from '@shared/ProjectConfig';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const formLayout = getFormLayout(2, 16);
const Option = Select.Option;

class index extends Component {

  render() {

    const { form: { getFieldDecorator, getFieldValue } } = this.props;

    return (<span>
      <FormItem label="变更类型" {...formLayout}>
        {getFieldDecorator('reasonType', {
          rules: [{ required: true, message: '此项必填！' }],
        })(
          <Select className="f-fw">
            {
              Object.keys(changeTypeMap).map(it => <Option key={Number(it)} value={Number(it)}>{changeTypeMap[Number(it)]}</Option>)
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="变更原因" {...formLayout}>
        {getFieldDecorator('reason', {
          rules: [{ required: getFieldValue('reasonType') === CHANGE_REASON_TYPE.OTHER, message: '此项必填！' }],
        })(
          <TextArea placeholder="请输入变更原因，最多300字" maxLength={300} />
        )}
      </FormItem>

    </span>);
  }
}

export default index;
