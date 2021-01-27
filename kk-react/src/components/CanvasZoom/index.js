import React from 'react';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

function CanvasZoom({ handleBig, handleSmall, zoom }) {

  return (<span>
    <span className="u-mgr10" onClick={() => handleBig()}>
      <MyIcon type="icon-fangdashitu1" className={styles.plus} />
    </span>
    <span className="u-mgr10" onClick={() => handleSmall()}>
      <MyIcon type="icon-suoxiaoshitu1" className={styles.minus} />
    </span>
    <span className={styles.text}>{Math.round(zoom * 100)}%</span>
  </span>);
}

export default CanvasZoom;
