import React from 'react';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

const index = () => {
  return (
    <div className={styles.root}>
      <div className="m-error-404 f-cb">
        <div className="m-pic f-fl">
          <MyIcon type="icon-404" className={styles.icon} />
        </div>
        <div className="m-tip f-fl">
          <h1>404</h1>
          <h2>您访问的页面不存在</h2>
        </div>
      </div>
    </div>
  );
};

export default index;
