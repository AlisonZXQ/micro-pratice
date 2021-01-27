import React, { useState, useEffect } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import styles from './index.less';

function PanelCollapse(props) {
  const { title, children, defaultCollapse } = props;
  const [isActive, setActive] = useState(true);

  useEffect(() => {
    setActive(defaultCollapse ? false : true);
  }, [defaultCollapse]);

  return (
    <div className={styles.container}>
      <div onClick={() => setActive(!isActive)}>
        <span className={styles.title}>{title}</span>
        <CaretRightOutlined
          rotate={isActive ? 90 : 0}
          className={styles.icon}
          style={{ position: 'relative', left: title.length > 2 ? 10 + (title.length - 2) * 4 : 10 }} />
      </div>
      {
        isActive &&
        <div className="f-fh" style={{ margin: '10px' }} >
          {children}
        </div>
      }
    </div>
  );
}

export default PanelCollapse;
