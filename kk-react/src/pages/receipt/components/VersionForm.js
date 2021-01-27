import React, { useState } from 'react';
import moment from 'moment';
import { getFormLayout } from '@utils/helper';
import { addVersion, queryVersionTitle, updateVersion } from '@services/version';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, message, DatePicker, Select } from 'antd';
import MyIcon from '@components/MyIcon';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);
const Option = Select.Option;
/**
 * @description - 创建/编辑版本弹窗
 * @param {*} props
 * @param {boolean} - create/edit
 * @param {Object} - edit情况下的version对象
 */
const VersionForm = (props) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { form: { getFieldDecorator, getFieldValue },
    subProductAll, trigger, create, edit, version } = props;
  const editData = edit ? version : {};

  const handleOk = () => {
    const fieldsArr = create ? ['subProductId', 'versionName', 'versionRange'] : ['versionName', 'versionRange'];
    props.form.validateFields(fieldsArr, (err, values) => {
      if (err) return;
      setLoading(true);
      if (create) {
        // versionRange由版本周期改成计划发布日期
        const params = {
          subProductId: values.subProductId,
          name: values.versionName.trim(),
          endtime: values.versionRange && new Date(values.versionRange).getTime(),
          description: getFieldValue('description'),
        };
        addVersion(params).then((res) => {
          setLoading(false);
          if (res.code !== 200) return message.error(res.msg);
          message.success('新建版本成功！');
          if (res.result && props.okCallback) {
            props.okCallback(res.result.id);
          }
          setVisible(false);
        }).catch((err) => {
          setLoading(false);
          return message.error(err || err.message);
        });
      } else if (edit) {
        const params = {
          id: version.versionId,
          name: values.versionName.trim(),
          description: getFieldValue('description'),
          endtime: values.versionRange && new Date(values.versionRange).getTime(),
        };
        updateVersion(params).then((res) => {
          setLoading(false);
          if (res.code !== 200) return message.error(res.msg);
          message.success('编辑版本成功！');
          if (props.okCallback) {
            props.okCallback();
          }
          setVisible(false);
        }).catch((err) => {
          setLoading(false);
          return message.error(err || err.message);
        });
      }
    });
  };

  const validFunction = (rule, value, callback) => {
    if (getFieldValue('subProductId')) {
      const params = {
        subProductId: getFieldValue('subProductId'),
        name: value,
      };

      queryVersionTitle(params).then((res) => {
        if (res.code !== 200) {
          callback('当前版本名已存在，请更换名称!');
        } else {
          callback();
        }
      }).catch((err) => {
        return message.error(`查询异常, ${err || err.message}`);
      });
    } else {
      callback();
    }
  };

  return (<span>
    <Modal
      title={create ? "新建版本" : '编辑版本'}
      visible={visible}
      onOk={() => handleOk()}
      onCancel={() => setVisible(false)}
      okButtonProps={{ loading: loading }}
      destroyOnClose
      maskClosable={false}
    >
      {
        create &&
        <FormItem label="子产品" {...formLayout}>
          {getFieldDecorator('subProductId', {
            rules: [
              { required: true, message: `此项不能为空` },
            ],
          })(
            <Select
              className="f-fw"
              placeholder="请选择子产品"
              showSearch
              optionFilterProp="children"
            >
              {
                subProductAll && subProductAll.map(it => <Option key={it.id} value={it.id}>
                  {it.subProductName}
                </Option>)
              }
            </Select>
          )}
        </FormItem>
      }

      <FormItem label="版本" {...formLayout}>
        {getFieldDecorator('versionName', {
          initialValue: editData.versionName,
          rules: [
            { required: true, message: `此项不能为空` },
            { validator: validFunction }
          ],
        })(
          <Input placeholder="请输入版本名称，不超过50字" className="f-fw" maxLength={50} />
        )}
      </FormItem>

      <FormItem label="计划发布日期" {...formLayout}>
        {getFieldDecorator('versionRange', {
          initialValue: editData.versionEndTime ? moment(editData.versionEndTime) : undefined,
          rules: [
            { required: true, message: `此项不能为空` },
          ],
        })(
          <DatePicker className="f-fw" suffixIcon={<MyIcon type='icon-riqi' />} />
        )}
      </FormItem>
      <FormItem label="描述" {...formLayout} className='u-mgb0'>
        {getFieldDecorator('description', {
          initialValue: editData.versionDescription,
        })(
          <Input placeholder="请输入版本描述，不超过200字" className="f-fw" maxLength={200} />
        )}
      </FormItem>
    </Modal>

    <span onClick={() => setVisible(true)}>
      {trigger}
    </span>
  </span>
  );
};

export default Form.create()(VersionForm);
