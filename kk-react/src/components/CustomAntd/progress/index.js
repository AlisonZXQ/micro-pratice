import React from 'react';
import { Progress } from 'antd';
import styles from './index.less';

export default function Index(props) {

  const percent = props.percent;

  const getStatus = () => {
    if (Number(percent) < 100) {
      return 'active';
    } else if (Number(percent) === 100) {
      return 'normal';
    } else if (Number(percent) === 0) {
      return '';
    }
  };

  return (<span className={styles.container}>
    <Progress
      size="small"
      {...props}
      status={getStatus()}
      strokeColor={
        props.percent > 100
          ?
          {
            '0%': '#146FD2', // @color-blue-7
            '100%': '#2D99FF', // @color-blue-6
          }
          :
          {}}
    />
  </span>);
}
