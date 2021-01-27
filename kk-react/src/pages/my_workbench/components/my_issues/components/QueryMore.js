import React, { useState } from 'react';
import { Dropdown } from 'antd';
import MyIcon from '@components/MyIcon';
import styles from '../index.less';


const QueryMore = () => {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const menu = () => {
    return <div className={styles.optMenu}>
      <span
        onClick={() => setActive(!active)}
        className={`${styles.menu} ${active ? styles.activeMenu : ''}`}>
        显示已完成
        <MyIcon className={styles.icon} type='icon-xuanzhong1' />
      </span>
    </div>;
  };

  return (<span>
    <Dropdown
      trigger={['click']}
      overlay={menu()}
      visible={visible}
      onVisibleChange={(visible) => setVisible(visible)}
    >
      <span className={styles.opIcon}>
        <MyIcon className={styles.icon} type='icon-gengduomoren' />
        <MyIcon className={styles.hoverIcon} type='icon-gengduohoverlan' />
      </span>
    </Dropdown>

  </span>

  );
};

export default QueryMore;
