import React, { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { CaretDownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input, message } from 'antd';
import debounce from 'lodash/debounce';
import { connect } from 'dva';
import { deepCopy } from '@utils/helper';
import { getEntResponseUser } from '@services/objective_manage';
import styles from './index.less';

/**
 * @description - 用于人员搜索选择
 * @param {*} props
 */
function FilterSelect(props) {
  const { currentUser, onChange, defaultValue } = props;
  const [selectArr, setSelectArr] = useState([]);
  const [userList, setUserList] = useState([]);
  const [inputValue, setInputValue] = useState([]);
  const user = currentUser.user || {};
  const entid = user.entid;

  useDeepCompareEffect(() => {
    setSelectArr(defaultValue);
  }, [defaultValue]);

  const updateSelectArr = (item) => {
    let newOtherSelectArr = deepCopy(selectArr, []);
    if (item) {
      if (newOtherSelectArr.some(it => it.id === item.id)) { // 删除
        newOtherSelectArr = newOtherSelectArr.filter(it => it.id !== item.id);
      } else {
        newOtherSelectArr.push(item);
      }
      setSelectArr(newOtherSelectArr);
    }
    onChange(newOtherSelectArr);
  };

  const clearSelect = (e) => {
    e.stopPropagation();
    // 清除掉已保存的name，避免问题
    onChange([]);
  };

  const matchLabel = (value) => {
    const defaultData = selectArr.find((item) => item.id === value);
    const newName = (defaultData && defaultData.name) || '';
    return defaultData ? newName.replace('yixin.', '') : value;
  };

  const handleSearchUser = debounce((value) => {
    setInputValue(value);
    const params = {
      entId: entid,
      keyWord: value
    };
    if (value.trim().length) {
      getEntResponseUser(params).then((res) => {
        if (res.code !== 200) return message.error('查询用户列表失败', res.message);
        if (res.result) {
          setUserList(res.result || []);
        }
      }).catch((err) => {
        return message.error('查询用户列表异常', err || err.message);
      });
    }
  }, 800);

  const menu = () => {
    return (<Menu>
      <div style={{ padding: '6px 12px' }}>
        <Input
          onChange={e => handleSearchUser(e.target.value)}
          allowClear placeholder='搜索内容'
          autoFocus
        />
      </div>

      <div className={styles['m-menu']}>
        {
          !inputValue.length &&
          <span>
            <div style={{ marginBottom: '10px' }}>
              <a onClick={clearSelect}>清空选择</a>
            </div>

            <div className={styles.container}>
              {
                selectArr.length > 0 ?
                  selectArr.map((item) => (
                    <div key={item.id} className={`${styles['m-item']}`}>
                      <Checkbox
                        className='f-toe'
                        style={{ width: '180px' }}
                        checked={selectArr.some(it => it.id === item.id)}
                        onChange={() => updateSelectArr(item)}
                      >{item.name}-{item.email}
                      </Checkbox>
                    </div>
                  )) :
                  <div className={`${styles['m-item']} f-tac`}>暂无数据</div>
              }
            </div>
          </span>
        }

        {
          !!inputValue.length &&
          userList
            .map((item) => (
              <div key={item.value} className={`${styles['m-item']}`}>
                <Checkbox
                  className='f-toe'
                  style={{ width: '180px' }}
                  checked={selectArr.some(it => it.id === item.id)}
                  onChange={() => updateSelectArr(item)}
                >{`${item.name}-${item.email}`}
                </Checkbox>
              </div>))
        }
      </div>
    </Menu>);
  };

  return (
    <Dropdown
      overlay={menu()}
      trigger={['click']}
    >
      <span className="f-csp">
        <span
          className={`${styles.name} f-toe f-vam`}>
          {selectArr.map(item => matchLabel(item.id)).join(',') || '全部'}
        </span>
        <span className={`f-ib f-vam ${styles.icon} dropDownIcon`}>
          <CaretDownOutlined />
        </span>
      </span>
    </Dropdown>
  );
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(FilterSelect);
