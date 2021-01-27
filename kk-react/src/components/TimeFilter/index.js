import React, { useState } from 'react';
import Calendar from 'rc-calendar';
import placements from 'rc-calendar/lib/picker/placements';
import Trigger from 'rc-trigger';

const prefixCls = 'ant-calendar';

function TimeFilter(props) {
  const [visible, setVisible] = useState(false);
  const { children, trigger, placement, getPopupContainer, showToday,
    renderExtraFooter, popupStyle, defaultPickerValue, onChange } = props;

  return (<span>
    <Trigger
      prefixCls={`${prefixCls}-picker-container`}
      action={[trigger || 'click']}
      popupVisible={visible}
      onPopupVisibleChange={(visible) => setVisible(visible)}
      destroyPopupOnHide
      popupPlacement={placement || 'bottomLeft'}
      builtinPlacements={placements}
      getPopupContainer={getPopupContainer}
      popup={<Calendar
        className={popupStyle}
        prefixCls={prefixCls}
        showToday={showToday || false}
        renderFooter={renderExtraFooter}
        dateInputPlaceholder="请选择日期"
        onSelect={(value) => { onChange(value); setVisible(false) }}
        defaultValue={defaultPickerValue || undefined}
      />}
    >
      <span onClick={() => setVisible(true)}>{children}</span>
    </Trigger>
  </span>);
}

export default TimeFilter;
