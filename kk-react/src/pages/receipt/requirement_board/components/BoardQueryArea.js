import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';

const { Search } = Input;

function BoardHeader({ updateFilter, kanbanIssue, enableSubProductList }) {
  const responseList = [];

  kanbanIssue.forEach(item => {
    if (item.responseUser && !responseList.some(it => it.id === item.responseUser.id)) {
      responseList.push(item.responseUser);
    }
  });

  return (<span>
    <span className='queryHover'>
      <span className="f-ib f-vam grayColor">子产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('subProductIdList', value)}
        dataSource={enableSubProductList.map(item => ({
          label: item.subProductName, value: item.id,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam grayColor">负责人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('responseUidList', value)}
        dataSource={responseList.map(item => ({
          label: item.name, value: item.id,
        }))}
      />
    </span>

    <span className="u-mgl20">
      <Search
        placeholder="搜索需求"
        onChange={e => updateFilter('name', e.target.value)}
        enterButton
        style={{ width: 200, position: 'relative', top: '14px' }}
      />
    </span>
  </span>);
}

export default BoardHeader;
