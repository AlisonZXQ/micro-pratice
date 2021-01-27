import React, { useState } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, DatePicker, Checkbox, message } from 'antd';
import MyIcon from '@components/MyIcon';
import { getFormLayout } from '@utils/helper';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import { updateVersion } from '@services/version';

const formLayout = getFormLayout(6, 18);

/**
 * @description - 开启版本
 * @param {*} props
 * @versionSelectList {Array} - 版本下内容
 */
function OpenVersion(props) {
  const { trigger, form: { getFieldDecorator }, versionId, dueDate, hasContent } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoStart, setAutoStart] = useState(false);


  const handleOk = () => {
    props.form.validateFields(['versionDate'], (err, values) => {
      if (err) return;

      const params = {
        id: versionId,
        state: VERISON_STATUS_MAP.OPEN,
        endtime: values.versionDate && new Date(values.versionDate).getTime(),
        autoStart: autoStart
      };
      setLoading(true);
      updateVersion(params).then((res) => {
        setLoading(false);
        if (res.code !== 200) return message.error(res.msg);
        message.success('版本开启成功！');
        setLoading(false);
        setVisible(false);
        if (props.okCallback) {
          props.okCallback();
        }
      }).catch((err) => {
        setLoading(false);
        return message.error(err || err.message);
      });
    });

  };

  const handleOpen = () => {
    if (!hasContent) {
      return message.warn('当前版本为空，不能开启！');
    } else {
      setVisible(true);
    }
  };

  return (<span>
    <span onClick={() => { handleOpen() }}>
      {trigger}
    </span>
    <Modal
      visible={visible}
      title={'开启版本'}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk()}
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
    >
      <span>
        <span className="u-mgl10 u-mgb10 f-ib">版本开启后不可编辑，版本计划锁定，确定要开启吗？</span>
        <Form.Item label="计划发布日期" {...formLayout}>
          {getFieldDecorator('versionDate', {
            initialValue: dueDate ? moment(dueDate) : undefined,
            rules: [
              { required: true, message: `此项不能为空` },
            ],
          })(
            <DatePicker className="f-fw" style={{ width: '300px' }} suffixIcon={<MyIcon type='icon-riqi' />} />
          )}
        </Form.Item>
        <Checkbox
          key="autoStart"
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked)}
        >
          自动更新当前版本下所有内容的状态为解决中
        </Checkbox>
      </span>
    </Modal>
  </span>);
}

export default Form.create()(OpenVersion);
