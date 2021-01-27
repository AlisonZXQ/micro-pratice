import React from 'react';
import img from '@assets/error.png';
import styles from './index.less';

const index = (props) => {

  return (
    <div className={`content ${styles.root}`}>
      <div className="m-error-404 f-cb">
        <div className="m-pic f-fl">
          <img src={img} alt="error" />
        </div>
        <div className="m-tip f-fl">
          <h1 className={styles.title}>error</h1>
          <h2>抱歉，出错啦!(￣O￣)</h2>
        </div>
      </div>
    </div>
  );
};

export default index;
