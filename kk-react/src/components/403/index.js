import React from 'react';
import img from '@assets/403.png';
import styles from './index.less';

const index = () => {
  return (
    <div className={`content ${styles.root}`}>
      <div className="m-error-404 f-cb">
        <div className="m-pic f-fl">
          <img src={img} alt="403" />
        </div>
        <div className="m-tip f-fl">
          <h1 className={styles.title}>403</h1>
          <h2>您暂无权限访问该页面</h2>
        </div>
      </div>
    </div>
  );
};

export default index;
