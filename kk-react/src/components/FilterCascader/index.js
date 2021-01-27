import React from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Cascader } from 'antd';
import styles from './index.less';

function FilterCascader(props) {
  const { options, fieldNames, updateFilter, defaultData } = props;

  return (
    <Cascader
      options={options}
      onChange={(value, data) => updateFilter(data)}
      fieldNames={fieldNames}
      expandTrigger="hover"
      changeOnSelect
    >
      <a href="#" style={{ position: 'relative', top: '2px' }}>
        <span className={styles.title}>{defaultData || '全部'}</span>
        <span className={`f-ib f-vam ${styles.icon}`}>
          <CaretDownOutlined />
        </span>

        {
          defaultData && defaultData.length ?
            <span
              className={`f-ib f-vam ${styles.icon} u-icon-close`}
              onClick={() => updateFilter([])}
            >
              <CloseCircleFilled className={styles.closeIcon} title="清空筛选" />
            </span>
            :
            null
        }

      </a>
    </Cascader>
  );

}

export default FilterCascader;
