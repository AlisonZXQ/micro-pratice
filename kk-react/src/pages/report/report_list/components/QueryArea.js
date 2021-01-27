import React from 'react';
import { Input, DatePicker, } from 'antd';
import { getContainer } from '@utils/helper';
import MyIcon from '@components/MyIcon';

const Search = Input.Search;

const QueryArea = ({ updateFilter, ownerList, creatorList, productList }) => (

  <span className="u-mgb10 m-query">

    <span className="f-ib f-vam">开始日期：</span>
    <DatePicker
      style={{ width: '220px' }}
      onChange={(value) => { updateFilter('start', value) }}
      getPopupContainer={getContainer}
      suffixIcon={<MyIcon type='icon-riqi' />}
    />

    <span className="f-ib f-vam u-mgl10">结束日期：</span>
    <DatePicker
      style={{ width: '220px' }}
      onChange={(value) => { updateFilter('end', value) }}
      getPopupContainer={getContainer}
      suffixIcon={<MyIcon type='icon-riqi' />}
    />

    <Search
      allowClear
      className="u-mgl20"
      onSearch={value => updateFilter('name', value)}
      style={{ width: '220px' }}
      placeholder="请输入报告名称"
    />
  </span>
);

export default QueryArea;
