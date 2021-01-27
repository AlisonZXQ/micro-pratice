import React, { useState, useEffect } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { DatePicker } from 'antd';
import moment from 'moment';
import styles from './index.less';

const StyleDatePicker = (props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { form: { getFieldDecorator, getFieldValue }, defaultValue, required } = props;

  useEffect(() => {
    const currentValue = getFieldValue('date');
    transDate(currentValue);
  }, []);

  const transDate = (currentValue) => {
    let value = undefined;
    if (currentValue) {
      const flowValue = moment(currentValue).valueOf();
      value = moment(flowValue).format('YYYY-MM-DD');
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
            {value ? value : '请选择'}
          </span>
          <span className={`${styles.icon}`}>
            <CaretDownOutlined />
          </span>
          {value && !required &&
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
          initialValue: defaultValue || undefined,
        })(
          <DatePicker
            {...props}
            open={open}
            onOpenChange={(status) => setOpen(status)}
            onChange={(value) => handleChange(value)}
            style={!value ? { width: '60px' } : { width: '106px' }}
          />
        )}
      </span>

    </span>
  );
};

export default Form.create()(StyleDatePicker);
