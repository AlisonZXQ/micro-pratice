import React from 'react';
import { Dropdown } from 'antd';
import MyIcon from '@components/MyIcon';
import { COMMENT_STATE } from '@shared/WorkbenchConfig';
import styles from './index.less';

/**
 * @desc ...更多操作
 * @param {*} props
 */
function Index(props) {
  const { state } = props;

  return (<span onClick={e => e.stopPropagation()}>
    <Dropdown
      trigger={['click']}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <span className={styles.caozuo}>
        <span className={styles.name}>
          更多
          {state === COMMENT_STATE.UNREAD &&
            <span className={styles.dot}></span>
          }
        </span>
        <MyIcon type="icon-gengduozhankai" className={styles.icon} />
      </span>
    </Dropdown>
  </span>);

}

export default Index;
