import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from '../index.less';

class RichTextDisplay extends Component {
  state = {
    visible: false,
  }

  render() {
    const { data, title } = this.props;
    const { visible } = this.state;

    return (<div onClick={(e) => e.stopPropagation()}>
      <a onClick={(e) => { e.stopPropagation(); this.setState({ visible: true }) }}>查看</a>
      <Modal
        title={title}
        visible={visible}
        maskClosable={false}
        onCancel={() => this.setState({ visible: false })}
        width={740}
        footer={null}
      >
        <div
          className={styles.richTextDisplay}
          dangerouslySetInnerHTML={{ __html: data }}
        >
        </div>
      </Modal>
    </div>);
  }
}

export default RichTextDisplay;
