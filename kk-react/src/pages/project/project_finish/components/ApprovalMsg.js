import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Tooltip } from 'antd';
import { getFormLayout } from '@utils/helper';
import { reportType } from '@shared/ProjectConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 14);

class ApprovalMsg extends Component {
  state = {

  };

  isEmpty = (text) => {
    return text ? text : '-';
  }

  render() {
    const { data } = this.props;
    const closureCustomFileds = (data && data.closureCustomFileds) || [];
    const projectClosureInforVO = data.projectClosureInforVO || {};
    const arr = projectClosureInforVO.reportStatus && !!projectClosureInforVO.reportStatus.length && projectClosureInforVO.reportStatus.split(',').map(it => Number(it));

    const getLabel = (text) => {
      return (
        <Tooltip title={text}>
          <span>{text.length > 8 ? `${text.slice(0, 8)}...` : text}</span>
        </Tooltip>
      );
    };

    return (<span className={styles.finish}>
      <Row>
        <Col span={12}>
          <FormItem label={"项目结果"} {...formLayout}>
            {this.isEmpty(projectClosureInforVO.closureResult)}
          </FormItem>
        </Col>

        <Col span={12}>
          <FormItem label={"合规性检查"} {...formLayout}>
            {arr && arr.length ? <span>
              {arr.map(it => <span className="u-mgr10">{reportType[it]}</span>)}
            </span> : '-'}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem label={"结项说明"} {...formLayout}>
            {this.isEmpty(projectClosureInforVO.closureDescription)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        {
          closureCustomFileds.map(it => (
            <Col span={12}>
              <FormItem label={getLabel(it.customField && it.customField.name)} {...formLayout}>
                {this.isEmpty(it.label)}
              </FormItem>
            </Col>
          ))
        }
      </Row>
    </span>);
  }
}

export default ApprovalMsg;
