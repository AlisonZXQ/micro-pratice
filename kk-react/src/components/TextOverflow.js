import React from 'react';
import { Popover } from 'antd';

const TextOverFlow = ({ maxWidth, content, children, style, className }) => {
  return (<div className="f-ib f-vat">
    <Popover content={content || '溢出内容'} overlayClassName="f-wwb">
      <span
        style={{ maxWidth, ...style }}
        className={`f-db f-toe ${className}`}
      >
        {content || children }
      </span>
    </Popover>
  </div>);
};

export default TextOverFlow;
