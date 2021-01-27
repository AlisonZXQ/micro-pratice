import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';

const { Search } = Input;

function QueryAreaSchedule(props) {
  const { updateFilter, subProductAll, requirementPoolList, currentLocalFilter } = props;
  const responseArr = [];
  requirementPoolList.forEach(item => {
    if (!responseArr.some(it => item.responseUser && it.id === item.responseUser.id)) {
      responseArr.push(item.responseUser);
    }
  });

  return (
    <span className="m-query">
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">子产品：</span>
        <FilterSelect
          onChange={(value) => updateFilter('subProductIdList', value)}
          dataSource={subProductAll.map(item => ({
            label: item.subProductName, value: item.id,
          }))}
          defaultValue={currentLocalFilter.subProductIdList || []}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('responseUidList', value)}
          dataSource={responseArr.map(item => ({
            label: item.realname, value: item.id,
          }))}
        />
      </span>

      <span className="u-mgl20">
        <Search
          placeholder="搜索需求或版本"
          onSearch={value => updateFilter('name', value)}
          enterButton
          style={{ width: 200 }}
        />
      </span>
    </span>
  );
}

export default QueryAreaSchedule;
