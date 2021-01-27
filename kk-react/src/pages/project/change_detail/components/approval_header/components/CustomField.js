import React from 'react';
import { Row, Col } from 'antd';
import CommonDiffText from '../../diff_display/CommonDiffText';

const CustomField = ({ createCustomFileds, customOld }) => {

  const isEmptyData = (text) => {
    return text ? text : '-';
  };

  const getBackGroundColorCustomField = (newObj) => {
    if (!customOld.length) return null;
    const oldObj = customOld.find(item => newObj.customFieldId === item.customFieldId) || {};
    if (!newObj.value) newObj.value = '';
    if (!oldObj.value) oldObj.value = '';
    if (newObj.value.toString() !== oldObj.value.toString()) {
      return {
        borderBottom: '2px #FFAE00 solid',
      };
    } else {
      return null;
    }
  };

  const getOldValue = (newObj) => {
    if (!customOld.length) return 'ZXQ-nochange';
    const oldObj = customOld.find(item => newObj.customFieldId === item.customFieldId) || {};

    if (!newObj.value) newObj.value = '';
    if (!oldObj.value) oldObj.value = '';
    if (newObj.value.toString() !== oldObj.value.toString()) {
      return oldObj.label || oldObj.value;
    } else {
      return 'ZXQ-nochange';
    }
  };

  return (<Row>
    {
      createCustomFileds && createCustomFileds.map((it, index) => (
        <Col span={12} className="u-mgb10">
          <span className="u-title">{it.customField && it.customField.name}：</span>
          <CommonDiffText
            newvalue={<span style={getBackGroundColorCustomField(it)} className="u-subtitle">
              {isEmptyData(it.label || it.value)}
            </span>}
            oldvalue={getOldValue(it)}
          />
        </Col>
      ))
    }
  </Row>);
};

export default CustomField;
