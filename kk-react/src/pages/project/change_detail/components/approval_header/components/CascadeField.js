import React from 'react';
import { Row, Col } from 'antd';
import CommonDiffText from '../../diff_display/CommonDiffText';

const CascadeField = ({ data }) => {

  const getNewName = (data) => {
    const newValue = data.newValue || [];
    const newValueObj = data.newValueObj || {};

    return <span>
      {newValue[0] && newValueObj[newValue[0]].name}
      {newValue[1] &&
        <span>
          /{newValueObj[newValue[1]].name}
        </span>
      }
    </span>;
  };

  const getOldName = (data) => {
    const oldValue = data.oldValue || [];
    const oldValueObj = data.oldValueObj || {};

    return <span>
      {oldValue[0] && oldValueObj[oldValue[0]].name}
      {oldValue[1] &&
        <span>
          /{oldValueObj[oldValue[1]].name}
        </span>
      }
    </span>;
  };

  const getCascadeField = (it) => {
    const data = it.data ? JSON.parse(it.data) : {};
    if (it.action === 'update') {
      return <Col span={12} className="u-mgb10">
        <span className="u-title">{data.cascadeField && data.cascadeField.fieldname}：</span>
        <CommonDiffText
          newvalue={<span style={{ borderBottom: '2px #FFAE00 solid' }} className="u-subtitle">{getNewName(data)}</span>}
          oldvalue={getOldName(data)}
        />
      </Col>;
    } else if (it.action === 'add') {
      return <Col span={12} className="u-mgb10">
        <span className="u-title">{data.cascadeField && data.cascadeField.fieldname}：</span>
        <CommonDiffText
          newvalue={<span style={{ borderBottom: '2px #FFAE00 solid' }} className="u-subtitle">{getNewName(data)}</span>}
          oldvalue={'-'}
        />
      </Col>;
    } else if (it.action === 'noChange') {
      return <Col span={12} className="u-mgb10">
        <span className="u-title">{data.cascadeField && data.cascadeField.fieldname}：</span>
        <span className="u-subtitle">{getNewName(data)}</span>
      </Col>;
    } else if (it.action === 'delete') {
      return <Col span={12} className="u-mgb10">
        <span className="u-title">{data.cascadeField && data.cascadeField.fieldname}：</span>
        <CommonDiffText
          newvalue={<span style={{ borderBottom: '2px #FFAE00 solid', textDecoration: 'line-through' }} className="u-subtitle">{getOldName(data)}</span>}
          oldvalue={getOldName(data)}
        />
      </Col>;
    }
  };

  return (<span>
    <Row>
      {
        data.map(it => getCascadeField(it))
      }
    </Row>
  </span>);
};

export default CascadeField;
