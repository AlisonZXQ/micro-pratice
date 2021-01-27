import React from 'react';
import { Tag, Row, Col, Spin } from 'antd';
import { connect } from 'dva';
import { CHANGE_ITEM_TYPE } from '@shared/ProjectConfig';
import styles from '../index.less';

function ChangeTable(props) {
  const { changeDetail, loading } = props;

  const getContent = (item) => {
    const type = item.type;
    const action = item.action;
    // 目标只有移除和删除不需要展示具体的内容
    const hiddenChangeDetail = type === CHANGE_ITEM_TYPE.OBJECTIVE && (action === '移除' || action === '删除');
    const showTag = type === CHANGE_ITEM_TYPE.OBJECTIVE;

    return <Row
      className={styles.itemRowStyle}>
      <Col span={6}>
        {
          showTag && <Tag color="blue">{action}</Tag>
        }
        <span className={styles.obj}>{item.title || '--'}</span>
      </Col>
      {
        !hiddenChangeDetail &&
        <Col span={18}>
          {
            item.projectChangeDetailVOList.map((it, index) =>
              <Row className={styles.detailStyle}>
                <Col span={8}>{it.filedName || '--'}</Col>
                <Col span={8}>
                  <div dangerouslySetInnerHTML={{ __html: it.oldValue || '--' }} /></Col>
                <Col span={8}>
                  <div dangerouslySetInnerHTML={{ __html: it.newValue || '--' }} /></Col>
              </Row>)
          }
        </Col>
      }

    </Row>;
  };

  return (<div className={styles.changeTable}>
    <Spin spinning={loading}>
      <Row className={styles.title}>
        <Col span={6}>对象</Col>
        <Col span={6}>字段</Col>
        <Col span={6}>原值</Col>
        <Col span={6}>修改值</Col>
      </Row>
      {
        changeDetail.map(item => getContent(item))
      }
    </Spin>
  </div>);
}

const mapStateToProps = (state) => {
  const changeDetailLoading = state.loading.effects[`project/getChangeDetail`] || false;
  const changeDetailByIdLoading = state.loading.effects[`project/getChangeDetailById`] || false;

  return {
    loading: changeDetailLoading || changeDetailByIdLoading,
  };
};

export default connect(mapStateToProps)(ChangeTable);
