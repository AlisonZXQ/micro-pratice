import React from 'react';
import { Row, Col } from 'antd';
import MyIcon from '@components/MyIcon';
import CommonDiffText from '../../diff_display/CommonDiffText';
import styles from '../index.less';

const HeaderText = ({ data, title }) => {

  const isEmptyData = (text) => {
    return text ? text : '-';
  };

  const projectDetail = data.projectDetail || {};
  const changeData = {};
  data.diffOther && data.diffOther.forEach(it => {
    changeData[it.field] = it.newvalue;
    if (it.newvalue) {
      if (it.field === 'departmentId') {
        const data = it.oldvalue ? JSON.parse(it.oldvalue) : [];
        const text = data.map(it => it.deptName).join('-');
        changeData[`${it.field}-oldvalue`] = text ? text : '-';
      } else {
        changeData[`${it.field}-oldvalue`] = it.oldvalue ? it.oldvalue : '-';
      }
    } else {
      changeData[`${it.field}-oldvalue`] = 'ZXQ-nochange';
    }

  });

  const getBackGroundColor = (field) => {
    if (changeData[field]) {
      return {
        borderBottom: '2px #FFAE00 solid',
      };
    } else {
      return null;
    }
  };

  const getOldValue = (field) => {
    return changeData[`${field}-oldvalue`] || 'ZXQ-nochange';
  };

  return (<span>
    <Row className={`${styles.changeHeader} u-mgt10 u-mgb10`}>
      <MyIcon type="icon-danhaoicon" className={styles.icon} />{title}
    </Row>

    <Col offset={1} span={23}>
      <Row className="u-mgb10 u-mgt10">
        <Col span={12}>
          <span className="u-title">项目名称：</span>
          <CommonDiffText
            newvalue={<span style={getBackGroundColor('title')} className="u-subtitle">{isEmptyData(projectDetail.title)}</span>}
            oldvalue={getOldValue('title')}
          />
        </Col>

        <Col span={12}>
          <span className="u-title">创建时间：</span>
          <span style={getBackGroundColor('createTime')} className="u-subtitle">{isEmptyData(projectDetail.createTime)}</span>
        </Col>
      </Row>

      <Row className="u-mgb10">
        <Col span={12}>
          <span className="u-title">项目周期：</span>

          <span className="u-subtitle">{(projectDetail.startTime && projectDetail.endTime) ?
            <span>
              <CommonDiffText
                newvalue={<span style={getBackGroundColor('startTime')}>{projectDetail.startTime}</span>}
                oldvalue={getOldValue('startTime')}
              />
              ~
              <CommonDiffText
                newvalue={<span style={getBackGroundColor('endTime')}>{projectDetail.endTime}</span>}
                oldvalue={getOldValue('endTime')}
              />
            </span>
            : '-'}
          </span>
        </Col>

        <Col span={10}>
          <span className="u-title">项目描述：</span>
          <CommonDiffText
            newvalue={<span style={getBackGroundColor('description')} className="u-subtitle">
              <span style={{ whiteSpace: 'pre-wrap' }}>{isEmptyData(projectDetail.description)}</span>
            </span>}
            oldvalue={getOldValue('description')}
          />
        </Col>
      </Row>

      <Row className="u-mgb10">

        <Col span={12}>
          <span className="u-title">归属部门：</span>
          <CommonDiffText
            newvalue={<span style={getBackGroundColor('departmentId')} className="u-subtitle">{isEmptyData(projectDetail.department)}</span>}
            oldvalue={getOldValue('departmentId')}
          />
        </Col>

        <Col span={12}>
          <span className="u-title">人力预算：</span>
          <CommonDiffText
            newvalue={<span style={getBackGroundColor('budget')} className="u-subtitle">{isEmptyData(projectDetail.budget)}人天</span>}
            oldvalue={getOldValue('budget')}
          />
        </Col>

      </Row>
    </Col>
  </span>);
};

export default HeaderText;
