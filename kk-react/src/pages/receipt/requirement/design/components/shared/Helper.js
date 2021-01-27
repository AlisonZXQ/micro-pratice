import React from 'react';
import styles from '../../index.less';

function getTitle(name, required, content, marginLeft) {

  return (<span className="f-ib" style={{ marginBottom: '14px'}}>
    <span>{name}</span>
    {
      required && <span className={`${styles.iconRed}`}>*</span>
    }
    {
      content && <span className={marginLeft ? `u-mgl${marginLeft}` : "u-mgl20"}>{content}</span>
    }
  </span>);
}

export {
  getTitle
};