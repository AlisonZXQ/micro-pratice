import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Divider, Row, Col, Input } from 'antd';
import { getFormLayout } from '@utils/helper';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayoutLong = getFormLayout(4, 16);
const { TextArea } = Input;

class BeginAccept extends Component {
  state = {

  }

  isEmpty = (text) => {
    return text ? text : '-';
  }

  render() {
    const { form: { getFieldDecorator }, aimQuery: query } = this.props;
    const aimQuery = query || {};

    return (<span className={`${styles.beginAccept} u-form`}>
      <Row gutter={16}>
        <Col span={18} className="f-fwb">{this.isEmpty(aimQuery.summary)}
        </Col>
        <Col span={6}>
          <div className="u-subtitle">验收人</div>
          <div>{this.isEmpty(aimQuery.verfier)}</div>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">验收标准：</span></Col>
        <Col span={20} className="u-mgb10">
          <span dangerouslySetInnerHTML={{ __html: this.isEmpty(aimQuery.description) }} />
        </Col>
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">优先级：</span></Col>
        <Col span={8} className="u-mgb10">{aimQuery.priority}</Col>
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">到期日：</span></Col>
        <Col span={8} className="u-mgb10">{this.isEmpty(aimQuery.dueDate)}</Col>
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">子产品：</span></Col>
        <Col span={8} className="u-mgb10">{this.isEmpty(aimQuery.subProductVO && aimQuery.subProductVO.subProductName)}</Col>
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">负责人：</span></Col>
        <Col span={8} className="u-mgb10">{this.isEmpty(aimQuery.assignee)}</Col>
        {/* <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">需求完成情况：</span></Col> */}
        {/* <Col span={20} className="u-mgb10">
          共{this.isEmpty(aimQuery.objectiveIssueCompleteStateVO && aimQuery.objectiveIssueCompleteStateVO.totalCount)}需求。
          关闭{this.isEmpty(aimQuery.objectiveIssueCompleteStateVO && aimQuery.objectiveIssueCompleteStateVO.closeCount)}个，
          测试通过{this.isEmpty(aimQuery.objectiveIssueCompleteStateVO && aimQuery.objectiveIssueCompleteStateVO.testPassCount)}个，
          已解决{this.isEmpty(aimQuery.objectiveIssueCompleteStateVO && aimQuery.objectiveIssueCompleteStateVO.resolvedCount)}个，
          开始{this.isEmpty(aimQuery.objectiveIssueCompleteStateVO && aimQuery.objectiveIssueCompleteStateVO.startCount)}个
        </Col> */}
        <Col span={4} className="u-mgb10"><span className="f-fr u-subtitle">实际投入人力：</span></Col>
        <Col span={20} className="u-mgb10">{aimQuery.actualManPower ? Number(aimQuery.actualManPower).toFixed(2) : '-'}人天</Col>

        <FormItem label="目标完成情况" {...formLayoutLong}>
          {
            getFieldDecorator('completeDescription', {
              rules: [{ required: true, message: '此项必填' }]
            })(
              <TextArea maxLength={500}/>
            )
          }
        </FormItem>
      </Row>
    </span>);
  }
}

export default BeginAccept;
