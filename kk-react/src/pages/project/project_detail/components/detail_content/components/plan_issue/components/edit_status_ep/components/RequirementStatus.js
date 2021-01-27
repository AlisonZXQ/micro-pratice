import React, { useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Radio, Input, Modal, message } from 'antd';
import { connect } from 'dva';
import DefineDot from '@components/DefineDot';
import { getFormLayout } from '@utils/helper';
import { setRequirementState } from '@services/requirement';
import EditSelectStatus from '@components/EditSelectStatus';
import { requirementNameArr, ISSUE_ROLE_VALUE_MAP, requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const formLayout = getFormLayout(6, 16);

const EditStatusRequirement = (props) => {
  const { record, type, form: { getFieldDecorator, getFieldValue } } = props;
  const [visible, setVisible] = useState(false);
  const [currentState, setCurrentState] = useState({});
  const issueRole = record.issueRole;

  const handelUpdateState = (value) => {
    const obj = requirementNameArr.find(it => it.key === value) || {};
    setVisible(true);
    setCurrentState(obj);
  };

  const handleOk = () => {
    const issueKey = record.issueKey;
    const id = issueKey.split('-')[1];

    let params = {};
    if (currentState.key !== 10) {
      params = [{
        id: id,
        state: currentState.key,
        reviewResult: "",
        rejectDesc: "",
      }];
    } else {
      const arr = getFieldValue('reviewresult') === 1 ? ['reviewresult'] : ['reviewresult', 'rejectdesc'];
      props.form.validateFields(arr, (err, values) => {
        if (err) return;
        params = [{
          id: id,
          state: currentState.key,
          reviewResult: values.reviewresult,
          rejectDesc: values.rejectdesc ? values.rejectdesc : '',
        }];
      });
    }

    setRequirementState(params).then(res => {
      if (res.code !== 200) { return message.error(res.msg) }
      message.success('更新成功！');
      setVisible(false);
      props.dispatch({ type: 'project/getProjectPlanning', payload: { id: record.projectId } });
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  return (<span onClick={(e) => e.stopPropagation()}>
    {
      issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
      <EditSelectStatus
        value={record.statusid}
        type={type}
        handleUpdate={(value) => handelUpdateState(value)}
      />
    }

    {
      issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
      <span>
        <DefineDot
          text={record.statusid}
          statusMap={requirementNameMap}
          statusColor={requirementColorDotMap}
        />
      </span>
    }

    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk()}
    >
      {
        currentState.key === 10 &&
        <span>
          <FormItem label="评审结果" {...formLayout}>
            {
              getFieldDecorator('reviewresult', {
                initialValue: 1,
                rules: [{ required: true, message: '此项必填！' }]
              })(
                <RadioGroup>
                  <Radio key={1} value={1}>通过</Radio>
                  <Radio key={2} value={2}>不通过</Radio>
                </RadioGroup>
              )
            }
          </FormItem>

          {
            getFieldValue('reviewresult') === 2 &&
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
      }

      {
        currentState.key !== 10 &&
        <span>
          您确认设置当前需求的状态为【{currentState.name}】吗？
        </span>
      }
    </Modal>
  </span>);
};

export default connect()(Form.create()(EditStatusRequirement));
