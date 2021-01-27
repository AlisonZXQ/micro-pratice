import React, { useState, useEffect } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Dropdown, DatePicker } from 'antd';
import moment from 'moment';
import { CYCLE_RIGHT_ARR, CYCLE_TYPE_TIME } from '@shared/CommonConfig';
import { getStartTime, getEndTime } from '@utils/helper';
import styles from './index.less';

const { RangePicker } = DatePicker;

const FilterCycle = (props) => {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(true);
  const [leftActive, setLeftActive] = useState({});
  const [rightActive, setRightActive] = useState({});
  const [currentActive, setCurrentActive] = useState([]);
  const [leftData, setLeftData] = useState([]);

  const { getFieldDecorator, setFieldsValue } = props.form;
  const { defaultValue, onChange } = props;

  useEffect(() => {
    getInitData();
  }, []);

  const getInitData = () => {
    let yearArr = [];
    const currentYear = new Date().getFullYear();

    if (defaultValue) {
      setCurrentActive(defaultValue);
    } else {
      setCurrentActive([
        { value: currentYear, label: `${currentYear}年` },
        { value: 'allyear', label: `年度` }
      ]);
    }

    for (var i = 2019; i <= currentYear; i++) { //2019年为ep成立时间
      yearArr.push({
        value: i,
        label: `${i}年`
      });
    }
    yearArr.unshift({
      value: 'custom', label: '自定义时间'
    });
    setLeftData(yearArr);
  };

  //自定义时间筛选
  const handleChangePicker = (value) => {
    const timeString = value[0].format('YYYY-MM-DD') + '~' + value[1].format('YYYY-MM-DD');
    setRightActive({ value: 'custom', label: timeString });
    setCurrentActive([leftActive, { value: 'custom', label: timeString }]);
    setOpen(false);
    setVisible(false);
    handleUpdateFilter(value, 'picker', [leftActive, { value: 'custom', label: timeString }]);
  };

  const handleClickLeft = (it) => {
    if (it.value === 'custom') {
      setOpen(true);
      setLeftActive(it);
    } else {
      setLeftActive(it);
      setRightActive({ value: 'allyear', label: `年度` });
      const arr = [it, { value: 'allyear', label: `年度` }];
      setCurrentActive(arr);
      handleUpdateFilter(arr, 'right', arr);
    }
  };

  // 按年份筛选
  const handleClickRight = (it) => {
    setRightActive(it);
    setCurrentActive([leftActive, it]);
    handleUpdateFilter([leftActive, it], 'right', [leftActive, it]);
  };

  const handleUpdateFilter = (data, type, local) => {
    if (type === 'picker') {
      const newData = [getStartTime(data[0]), getEndTime(data[1])];
      const obj = {
        dateRange: newData,
        localStorage: local,
      };
      onChange(obj);
    } else if (type === 'right') {
      let newData = [];
      const rightValue = data[0].value;
      const rightType = data[1].value;

      const startTime = rightValue + '-' + CYCLE_TYPE_TIME[rightType][0];
      const endTime = rightValue + '-' + CYCLE_TYPE_TIME[rightType][1];

      newData = [getStartTime(startTime), getEndTime(endTime)];
      const obj = {
        dateRange: newData,
        localStorage: local,
      };
      onChange(obj);
      console.log(obj)
    }
  };

  const menu = () => {
    return <div className={styles.menu}>
      <span className={styles.left}>
        {
          leftData && leftData.map(it => (
            <div
              onClick={() => handleClickLeft(it)}
              className={`${styles.item} ${leftActive && leftActive.value === it.value ? styles.activeItem : ''}`}>
              {it.label}
            </div>
          ))
        }
      </span>
      <span className={styles.right}>
        {
          leftActive && leftActive.value !== 'custom' && CYCLE_RIGHT_ARR.map(it => (
            <div
              onClick={() => handleClickRight(it)}
              className={`${styles.item} ${rightActive && rightActive.value === it.value ? styles.activeItem : ''}`}>
              {it.label}
            </div>
          ))
        }
        {
          leftActive && leftActive.value === 'custom' && <div className={styles.pickerItem}>
            {getFieldDecorator('date', {
              initialValue: undefined,
            })(
              <RangePicker
                onChange={(value) => handleChangePicker(value)}
                open={open} />
            )}

          </div>
        }
      </span>
    </div>;
  };

  const setDefault = () => {
    setLeftActive(currentActive[0]);
    setRightActive(currentActive[1]);
    if (currentActive[0].value === 'custom') {
      setOpen(true);
      const arr = [];
      const timeArr = currentActive[1].label.split('~');
      timeArr.map(it => {
        arr.push(moment(it));
      });
      setTimeout(() => {
        setFieldsValue({ date: arr });
      }, 100);
    }
  };

  return (
    <Dropdown
      overlay={menu()}
      trigger={['click']}
      visible={visible}
      onVisibleChange={(visible) => {
        setVisible(visible);
        if (visible === false) {
          setOpen(false);
        }
      }}
    >
      <span className='f-csp' onClick={() => setDefault()}>
        <span className='f-ib f-vam'>
          {currentActive && currentActive[0] && currentActive[0].value !== 'custom' &&
            <span>{currentActive && currentActive[0] && currentActive[0].value}</span>
          }
          <span>{currentActive && currentActive[1] && currentActive[1].label}</span>
        </span>
        <span className={`f-ib f-vam ${styles.icon}`}>
          <CaretDownOutlined />
        </span>
      </span>
    </Dropdown>
  );
};

export default Form.create()(FilterCycle);
