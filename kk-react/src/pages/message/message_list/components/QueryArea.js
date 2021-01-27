import React from 'react';
import { Radio, Button } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { noticeList, readState } from '@shared/MessageConfig';

const QueryArea = ({ allClick, updateFilter, size, productUserArr }) => (

  <span className="u-mgb10 m-query" style={{display: 'flex', alignItems: 'center'}}>
    <Radio.Group value={size} onChange={(value) => updateFilter('state', value.target.value)}>
      {
        readState && readState.map((it) => (
          <Radio.Button value={it.key}>
            {it.value}
          </Radio.Button>
        ))
      }
    </Radio.Group>

    <span className='queryHover u-mgl10'>
      <span className="f-ib f-vam">产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('productid', value)}
        dataSource={productUserArr && productUserArr.map((item) => ({
          label: item.name, value: item.id,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">通知类型：</span>
      <FilterSelect
        onChange={(value) => updateFilter('type', value)}
        dataSource={noticeList && noticeList.map((item) => ({
          label: item.value, value: item.key,
        }))}
      />
    </span>

    <span style={{marginLeft: 'auto'}}>
      <Button onClick={() => allClick('delete')} className='u-mgr10'>一键删除</Button>
      <Button onClick={() => allClick('read')}>全部设为已读</Button>
    </span>
  </span>
);

export default QueryArea;
