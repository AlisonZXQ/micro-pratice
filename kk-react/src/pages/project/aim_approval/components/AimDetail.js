import React, { Component } from 'react';
import moment from 'moment';
import { Card, Row, Col, Tag } from 'antd';
import styles from '../index.less';

class AimDetail extends Component {

  isEmpty = (text) => {
    return text ? text : '-';
  }

  render() {
    const { detailQuery: query, diffDay } = this.props;
    const detailQuery = query || {};
    const auditDate = detailQuery.auditDate || moment().format('YYYY-MM-DD');

    return ([
      <div className="bbTitle">
        <span className="name">目标详情</span>
      </div>,
      <Card className={styles.aimDetail}>
        <Row>
          <Col span={24} className="u-mgb10">
            <span className="u-title">目标验收标准：</span>
            <span className="u-subtitle" dangerouslySetInnerHTML={{ __html: this.isEmpty(detailQuery.description)}} />
          </Col>

          <Col span={24} className="u-mgb10">
            <span className="u-title">目标完成情况：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.completeDescription)}</span>
          </Col>

          <Col span={24} className="u-mgb10">
            <span className="u-title">验收评价：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.achievementEvaluation)}</span>
          </Col>

          <Col span={24} className="u-mgb10">
            <span className="u-title">其他验收意见：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.initiateSuggestion)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">到期日：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.dueDate)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">实际完成日期：</span>
            <span className="u-subtitle">
              {auditDate}
              {
                diffDay > 0 ? <Tag color="red" className="u-mgl5">逾期{diffDay}天</Tag> : null
              }
            </span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">子产品：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.subProductVO && detailQuery.subProductVO.subProductName)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">优先级：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.priority)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">验收人：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.verfier)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">负责人：</span>
            <span className="u-subtitle">{this.isEmpty(detailQuery.assignee)}</span>
          </Col>

          <Col span={12} className="u-mgb10">
            <span className="u-title">实际投入人力：</span>
            <span className="u-subtitle">{detailQuery.actualManPower ? Number(detailQuery.actualManPower).toFixed(2) : '-'}人天</span>
          </Col>

        </Row>
      </Card>
    ]);
  }
}

export default AimDetail;
