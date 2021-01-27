import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Radio, Input } from 'antd';
import { getFormLayout } from '@utils/helper';
import { REVIEW_RESULE_MAP } from '@shared/RequirementConfig';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const formLayout = getFormLayout(6, 16);

function ReviewResultForm({ form: { getFieldDecorator, getFieldValue } }) {

  return (<span>
    <span>
      <FormItem label="评审结果" {...formLayout}>
        {
          getFieldDecorator('reviewresult', {
            initialValue: REVIEW_RESULE_MAP.PASS,
            rules: [{ required: true, message: '此项必填！' }]
          })(
            <RadioGroup>
              <Radio key={REVIEW_RESULE_MAP.PASS} value={REVIEW_RESULE_MAP.PASS}>通过</Radio>
              <Radio key={REVIEW_RESULE_MAP.FAIL} value={REVIEW_RESULE_MAP.FAIL}>不通过</Radio>
            </RadioGroup>
          )
        }
      </FormItem>

      {
        getFieldValue('reviewresult') === REVIEW_RESULE_MAP.FAIL &&
        <FormItem label="不通过的原因" {...formLayout}>
          {
            getFieldDecorator('rejectdesc', {
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <TextArea />
            )
          }
        </FormItem>
      }
    </span>
  </span>);
}

export default ReviewResultForm;
