import React from 'react';
import styles from './index.less';

export default (props: any) => {
  return (
    <div>
      大家都来看看吧 很搞笑的哈哈哈哈哈哈
      <div className={styles.contaier}>
        {props.children}
      </div>
    </div>
  );
}
