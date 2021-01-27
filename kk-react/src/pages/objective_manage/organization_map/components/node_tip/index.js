import React from 'react';
import styles from './index.less';

const NodeTips = ({ x, y, keyResult }) => {
  return (
    <div className={styles.nodeTips} style={{ top: `${y}px`, left: `${x}px`}}>
      {
        keyResult.map((it, index) => <div>
          KR{index + 1}：{it.name}
        </div>)
      }
    </div>
  );
};

export default NodeTips;
