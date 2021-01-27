import React, { Component } from 'react';
import { Modal, Row, Col } from 'antd';
import styles from '../index.less';

class DescriptionModal extends Component {
  state = {
    visible: false,
  }

  render() {
    const { newvalue, oldvalue, name } = this.props;
    const { visible } = this.state;

    return (<span>
      <Modal
        title={name}
        visible={visible}
        width={1000}
        onCancel={() => this.setState({ visible: false })}
        footer={null}
        maskClosable={false}
      >
        <Row className={styles.modal}>
          <Col span={2} className="f-tar u-primary">变更前：</Col>
          <Col span={10}>
            <div
              dangerouslySetInnerHTML={{ __html: oldvalue === 'ZXQ-nochange' ? '-' : oldvalue }}
              className={styles.changeBeforeAfter}
            ></div>
          </Col>
          <Col span={2} className="f-tar u-primary">变更后：</Col>
          <Col span={10}>
            <div dangerouslySetInnerHTML={{ __html: newvalue }}
              className={styles.changeBeforeAfter}
            ></div>
          </Col>
        </Row>
      </Modal>
      <a onClick={() => this.setState({ visible: true })}>查看</a>
    </span>);
  }

}

export default DescriptionModal;
