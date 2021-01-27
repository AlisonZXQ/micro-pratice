import React from 'react';
import { Row, Col } from 'antd';
import MyIcon from '@components/MyIcon';
import styles from '../index.less';

const HeaderText = ({ data, title }) => {

  const isEmptyData = (text) => {
    return text ? text : '-';
  };

  const projectDetail = data.projectDetail || {};
  return (<span>
    <Row className={`${styles.approvalHeader} u-mgt10 u-mgb10`}>
      <MyIcon type="icon-danhaoicon" className={styles.icon} />
      {title}
    </Row>

    <Col offset={1} span={23}>
      <Row className="u-mgb10 u-mgt10">
        <Col span={12}>
          <span className="u-title">项目名称：</span>
          <span className="u-subtitle">{isEmptyData(projectDetail.title)}</span>
        </Col>
        <Col span={12}>
          <span className="u-title">创建时间：</span>
          <span className="u-subtitle">{isEmptyData(projectDetail.createTime)}</span>
        </Col>
      </Row>

      <Row className="u-mgb10">
        <Col span={12}>
          <span className="u-title">项目周期：</span>
          <span className="u-subtitle">{(projectDetail.startTime && projectDetail.endTime) ?
            `${projectDetail.startTime} ~ ${projectDetail.endTime}` : '-'}</span>
        </Col>

        <Col span={12}>
          <span className="u-title">项目描述：</span>
          <span className="u-subtitle" style={{ whiteSpace: 'pre-wrap' }}>{isEmptyData(projectDetail.description)}</span>
        </Col>
      </Row>

      <Row className="u-mgb10">
        <Col span={12}>
          <span className="u-title">归属部门：</span>
          <span className="u-subtitle">{isEmptyData(projectDetail.department)}</span>
        </Col>

        <Col span={12}>
          <span className="u-title">人力预算：</span>
          <span className="u-subtitle">{isEmptyData(projectDetail.budget)}人天</span>
        </Col>
      </Row>
    </Col>
  </span>);
};

export default HeaderText;
