import React from 'react';
import { Badge } from 'antd';
import styles from './index.less';

const DefineDot = ({ text, statusMap, statusColor, displayText, closeReason }) => {
  return <span className='f-iaic'>
    <span className={styles.badge}>
      <Badge status={statusColor && statusColor[text]} />
    </span>
    <span>
      {statusMap ? `${statusMap[text]}${closeReason ? closeReason : ''}` : displayText}
    </span>
  </span>;
};

export default DefineDot;
