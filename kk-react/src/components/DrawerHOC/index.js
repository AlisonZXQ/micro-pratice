import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import styles from './index.less';

export default function DrawerHOC() {
  return (DiffComponent) => {
    function Index(props) {
      const { drawerIssueId } = props;
      const [visible, setVisible] = useState(false);

      useEffect(() => {
        if (drawerIssueId) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }, [drawerIssueId]);

      // 阻止外层事件的触发关闭
      return (<div onClick={(e) => { e.stopPropagation() }}>
        <Drawer
          className={styles.drawer}
          placement="right"
          closable={false}
          visible={visible}
          maskClosable={false}
          mask={false}
          keyboard={false}
          width={665}
          bodyStyle={{ padding: '0px' }}
        >
          <div className={styles.collapse} onClick={() => props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: '' })}>
            <MyIcon
              type='icon-zhankaijiantou'
              className={styles.icon}
            />
          </div>
          <DiffComponent {...props} />
        </Drawer>
      </div>);
    }

    const mapStateToProps = (state) => {
      return {
        drawerIssueId: state.receipt.drawerIssueId,
      };
    };

    return connect(mapStateToProps)(Index);
  };

}
