import React, { useState, useCallback } from 'react';
import { message, Row, Col } from 'antd';
import { history } from 'umi';
import Modal from '@components/CustomAntd/modal';
import { WEEKREPORT_TEMPLATE_TYPE } from '@shared/ProjectConfig';
import MyIcon from '@components/MyIcon';
import EmptyTemplate from '@assets/EmptyTemplate.png';
import CommonTemplate from '@assets/CommonTemplate.png';
import styles from './index.less';

function Index(props) {
  const { trigger, projectId } = props;
  const [visible, setVisible] = useState(false);
  const [reportType, setType] = useState();

  const setDefaultReportType = useCallback(() => {
    const defaultValue = localStorage.getItem('weekReportTemplateType') || WEEKREPORT_TEMPLATE_TYPE.EMPTY ;
    setType(Number(defaultValue));
  }, []);

  const handleOk = () => {
    if (!reportType) return message.error('请先选择周报模版！');
    history.push(`/project/project_week_report/create?id=${projectId}&template=${reportType}`);
  };

  return <span>
    <span onClick={() => { setVisible(true); setDefaultReportType() }}>
      {trigger}
    </span>
    <Modal
      title="创建周报"
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk()}
    >
      <Row>
        <Col span={12}>
          <div
            className={reportType === WEEKREPORT_TEMPLATE_TYPE.EMPTY ? styles.select : styles.common}>
            <div
              className={styles.card}
              onClick={() => { setType(WEEKREPORT_TEMPLATE_TYPE.EMPTY); localStorage.setItem('weekReportTemplateType', WEEKREPORT_TEMPLATE_TYPE.EMPTY) }}
            >
              <MyIcon type="icon-xuanzhong" className={styles.check} />
              <div><img src={EmptyTemplate} alt="空白模版" /></div>
              <div className={styles.text}>空白模版</div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div
            className={reportType === WEEKREPORT_TEMPLATE_TYPE.COMMON ? styles.select : styles.common}>
            <div className={styles.card}
              onClick={() => { setType(WEEKREPORT_TEMPLATE_TYPE.COMMON); localStorage.setItem('weekReportTemplateType', WEEKREPORT_TEMPLATE_TYPE.COMMON) }}
            >
              <MyIcon type="icon-xuanzhong" className={styles.check} />
              <div><img src={CommonTemplate} alt="通用模版" /></div>
              <div className={styles.text}>通用模版</div>
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  </span >;
}

export default Index;
