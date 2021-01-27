import React, { useState, useEffect } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Input, Tree } from 'antd';
import styles from './index.less';

const textInput = React.createRef();

const valueMap = {};

function loops(list, parent) {
  return (list || []).map(({ children, key, title }) => {
    const node = (valueMap[key] = {
      parent,
      key,
      title
    });
    node.children = loops(children, node);
    return node;
  });
}

function getPath(value) {
  const path = [];
  let current = valueMap[value];
  while (current) {
    path.unshift({
      title: current.title,
      key: current.key
    });
    current = current.parent;
  }
  return path;
}

const FilterTree = (props) => {
  const { defaultValue, onChange, treeData } = props;

  useEffect(() => {
    loops(treeData);
  }, [treeData]);

  useEffect(() => {
    const arr = getPath(defaultValue);
    setTitles(arr);
  }, [defaultValue]);

  const [visible, setVisible] = useState(false);
  const [titles, setTitles] = useState([]);

  const handleSelectKey = (value) => {
    onChange(value);
    setVisible(false);
  };

  const menu = () => {
    return <div className={styles.menu}>
      <Input
        ref={textInput}
        placeholder='搜索内容'
      />
      <Tree
        treeData={treeData}
        defaultSelectedKeys={defaultValue}
        defaultExpandAll
        onSelect={(value, data) => { if(data.selected) { handleSelectKey(value) } }}
        selectedKeys={defaultValue}
      />
    </div>;
  };

  const focusTextInput = () => {
    setTimeout(() => {
      textInput.current.focus();
    }, 0);
  };

  return (
    <Dropdown
      overlay={menu()}
      trigger={['click']}
      visible={visible}
      onClick={() => focusTextInput()}
      onVisibleChange={(visible) => {
        setVisible(visible);
      }}
    >
      <span className='f-csp'>
        <span className='f-ib f-vam'>
          {titles.map((it, index) => (
            <span>
              {it.title}
              {titles.length !== index + 1 && <span>/</span>}
            </span>
          ))}
        </span>
        <span className={`f-ib f-vam dropDownIcon u-mgl5`}>
          <CaretDownOutlined />
        </span>
      </span>
    </Dropdown>
  );
};

export default FilterTree;
