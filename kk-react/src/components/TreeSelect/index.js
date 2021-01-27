import React, { useState } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { TreeSelect, Dropdown } from 'antd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { deepCopy } from '@utils/helper';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from './index.less';

function Index(props) {
  const { productList, updateFilter, defaultData, style } = props;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState([]);

  useDeepCompareEffect(() => {
    setValue(defaultData);
  }, [defaultData]);

  const onChange = (value, data) => {
    setValue(value);
    updateFilter(value);
  };

  const getTreeData = () => {
    const newTreeData = deepCopy(productList, []);
    newTreeData.forEach(item => {
      item.title = item.name;
      item.key = `${item.productId}`;
      item.value = `${item.productId}`;
      item.subProductVOList = item.subProductVOList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];
      item.subProductVOList.forEach(it => {
        it.title = it.subProductName;
        it.key = `${item.productId}-${it.id}`;
        it.value = `${item.productId}-${it.id}`;
      });
      item.children = item.subProductVOList;
    });

    return newTreeData;
  };

  const tProps = {
    treeData: getTreeData(),
    value: value,
    onChange: (value, data) => onChange(value, data),
    treeCheckable: true,
    filterTreeNode: (inputValue, treeNode) => {
      if (treeNode.props.title.includes(inputValue)) {
        return true;
      }
      return false;
    },
    open: visible,
    allowClear: true,
    dropdownClassName: styles.container,
    getPopupContainer: () => document.getElementById('treeSelect'),
    searchPlaceholder: "请选择产品/子产品",
    style: style
  };

  const onVisibleChange = (visible) => {
    setVisible(visible);
  };

  const clearSelect = (e) => {
    e.stopPropagation();
    setValue([]);
    updateFilter([]);
  };

  const getSelectArrName = () => {
    const nameArr = [];
    value.forEach(item => {
      const idArr = item.split('-').map(it => Number(it));
      const productObj = productList.find(it => it.id === idArr[0]) || {};
      const subProductVOList = productObj.subProductVOList || [];
      const subProductObj = subProductVOList.find(it => it.id === idArr[1]) || {};
      if (subProductObj.subProductName) {
        nameArr.push(subProductObj.subProductName);
      }
    });
    return nameArr;
  };

  const menu = () => {
    return (<div>
      <div className={styles['m-menu']}>
        <TreeSelect {...tProps} />
      </div>
    </div>);
  };

  return (
    <span className={styles.container} id="treeSelect">
      <Dropdown
        id="treeSelect"
        overlay={menu()}
        trigger={['click']}
        visible={visible}
        onVisibleChange={onVisibleChange}
        getPopupContainer={triggerNode => triggerNode.parentNode}
      >
        <span className="f-csp">
          <span>
            <span
              className={`${styles.name} f-toe f-vam`}>
              {getSelectArrName().length ? getSelectArrName().join(',') : '全部'}
            </span>
            <span className={`f-ib f-vam ${styles.icon}`}>
              <CaretDownOutlined />
            </span>
            {!!value.length &&
              <span className={`f-ib f-vam ${styles.icon} u-icon-close`} onClick={clearSelect}>
                <CloseCircleFilled className={styles.closeIcon} title="清空筛选" />
              </span>
            }
          </span>
        </span>
      </Dropdown>
    </span>
  );
}

export default Index;
