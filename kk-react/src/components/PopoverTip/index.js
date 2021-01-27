import React from 'react';
import { Popover } from 'antd';
import styles from './index.less';

export default function Index(props) {
  const { trigger, content, placement } = props;

  return (<span className={styles.container}>
    <Popover
      content={content || ''}
      placement={placement || "bottomLeft"}
      overlayClassName={styles.container}
      overlayStyle={{ zIndex: 2000 }}
      trigger='hover'
    >
      {trigger}
    </Popover>
  </span>);
}
