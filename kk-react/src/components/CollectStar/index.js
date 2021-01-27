import React from 'react';
import MyIcon from '@components/MyIcon';
import { Popover } from 'antd';
import styles from './index.less';

function CollectStar(props) {
  const { collect, callback, style, className } = props;

  return (<span>
    <Popover
      placement="bottom"
      content={collect ? '取消收藏' : '收藏'}
      trigger="hover"
    >
      <span onClick={(e) => { e && e.stopPropagation(); callback() }}>
        <MyIcon
          type="icon-Star1"
          className={`${className} ${collect ? styles.selectIcon : styles.cancelIcon}`}
          style={style}
        />
      </span>
    </Popover>
  </span>);
}

export default CollectStar;
