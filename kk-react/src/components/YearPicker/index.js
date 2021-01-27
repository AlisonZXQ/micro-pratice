import React, { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

function Index(props) {
  const { allowClear, style, className, defaultValue } = props;
  const [idOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(moment());

  useEffect(() => {
    setTime(defaultValue);
  }, []);

  return (<span>
    <DatePicker
      style={style}
      className={className}
      value={time}
      open={idOpen}
      mode="year"
      placeholder="请选择年份"
      format="YYYY"
      allowClear={allowClear}
      onOpenChange={(status) => {
        setIsOpen(status);
      }}
      onPanelChange={(value) => {
        setIsOpen(false);
        setTime(value);
        props.onChange(value);
      }}
      onChange={(value) => {
        if (!value) {
          props.onChange(value);
        }
        setTime(null);
      }}
    />
  </span>);
}

export default Index;
