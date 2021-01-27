import React, { useState, useEffect } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { DatePicker } from 'antd';
import moment from 'moment';
import styles from '../StyleDatePicker/index.less';

const StyleYearPicker = (props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  useEffect(() => {
    const currentValue = getFieldValue('date');
    transDate(currentValue);
  }, []);

  const transDate = (currentValue) => {
    let value = undefined;
    if(currentValue) {
      const flowValue = moment(currentValue).valueOf();
      value = moment(flowValue).format('YYYY');
    }
    setValue(value);
  };

  const handleShow = () => {
    setOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    props.onChange('');
    setValue('');
  };

  const handleChange = (value) => {
    setOpen(false);
    setFieldsValue({date: value});
    transDate(value);
    props.onChange(value);
  };

  return (
    <span>
      {!open &&
        <span
          onClick={() => handleShow()}
          className={`${styles.stylePicker} f-iaic `}>
          <span className={`${styles.select} f-toe`}>
            { value ? value : '请选择' }
          </span>
          <span className={`${styles.icon}`}>
            <CaretDownOutlined />
          </span>
          {value &&
            <span
              onClick={(e) => handleClear(e)}
              className={`${styles.icon}`}>
              <CloseCircleFilled title="清空筛选" />
            </span>
          }

        </span>
      }

      <span className={`${open ? styles.picker : styles.hiddenPicker}`}>
        {getFieldDecorator('date', {
          initialValue: props.defaultValue || undefined,
        })(
          <DatePicker
            {...props}
            open={open}
            placeholder='请选择年份'
            mode="year"
            format="YYYY"
            onOpenChange={(status) => setOpen(status)}
            onPanelChange={(value) => handleChange(value)}
            style={!value ? {width: '60px'} : {width: '106px'}}
          />
        )}
      </span>

    </span>
  );
};

export default Form.create()(StyleYearPicker);
