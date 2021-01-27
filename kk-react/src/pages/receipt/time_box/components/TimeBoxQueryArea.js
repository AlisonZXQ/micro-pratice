import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { statusMap } from '@shared/WorkbenchConfig';

const { Search } = Input;

function TimeBoxQueryArea({ updateFilter, issueList, enableSubProductList, currentLocalFilter }) {

  let responseUserList = [];

  issueList.forEach(item => {
    if (item.responseUser && !responseUserList.some(it => it.id === item.responseUser.id)) {
      responseUserList.push(item.responseUser);
    }
  });

  return (
    <span className="m-query">
      <span className='queryHover'>
        <span className="f-vam grayColor">子产品：</span>
        <FilterSelect
          onChange={(value) => updateFilter('subProductIdList', value)}
          dataSource={enableSubProductList.map(item => ({
            label: item.subProductName, value: item.id,
          }))}
          defaultValue={currentLocalFilter.subProductIdList || []}
        />
      </span>

      <span className='queryHover'>
        <span className="f-vam grayColor">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('responseUidList', value)}
          dataSource={responseUserList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={currentLocalFilter.responseUidList || []}
        />
      </span>

      <span className='queryHover'>
        <span className="f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('stateList', value)}
          dataSource={Object.keys(statusMap).map(item => ({
            label: statusMap[item], value: Number(item),
          }))}
          defaultValue={currentLocalFilter.stateList || []}
        />
      </span>

      <span className="u-mgl20">
        <Search
          placeholder="请输入名称进行搜索"
          onChange={e => updateFilter('name', e.target.value)}
          enterButton
          style={{ width: 200, position: 'relative', top: '-2px' }}
          defaultValue={currentLocalFilter.name || ''}
        />
      </span>
    </span>);
}

export default TimeBoxQueryArea;
