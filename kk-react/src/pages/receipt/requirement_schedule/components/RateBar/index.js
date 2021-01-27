import React from 'react';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

function RateBar(props) {
  const { width, left, right, icon } = props;
  const length = width - 2;
  const leftbar = Number(left);
  const rightbar = Number(right);

  const leftWidth = leftbar + rightbar ? (leftbar * length) / (leftbar + rightbar) : 0;
  const rightWidth = leftbar + rightbar ? (rightbar * length) / (leftbar + rightbar) : 0;

  const getContent = () => {
    if (leftbar !== 0 && rightbar !== 0) {
      return <div className={styles.background}>
        <span className={styles.left} style={{ width: leftWidth, marginRight: '2px' }}></span>
        <span className={styles.right} style={{ width: rightWidth }}></span>
      </div>;
    } else if (leftbar === 0 && rightbar !== 0) {
      return <div className={styles.background}>
        <span className={styles.right} style={{ width: width }}></span>
      </div>;
    } else if (leftbar !== 0 && rightbar === 0) {
      return <div className={styles.background}>
        <span className={styles.left} style={{ width: width }}></span>
      </div>;
    } else if (leftbar === 0 && rightbar === 0) {
      return <div style={{ width }} className={styles.greyBar}>
      </div>;
    }
    return <div style={{ width }} className={styles.greyBar}>
    </div>;
  };

  return (<span>
    <div className={styles.container}>
      <MyIcon type={icon} className={styles.icon} />
      {getContent()}
    </div>
  </span >);
}

export default RateBar;
