import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { EXCLUDE_CANCLE_CLOSE, levelMap } from '@shared/AdviseConfig';
import { adviseNameMap } from '@shared/CommonConfig';
import { MY_FEEDBACK, MY_FEEDBACK_MAP } from '@shared/WorkbenchConfig';

const Search = Input.Search;

const QueryArea = ({ updateFilter, allProductList }) => {
  const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
  const adviseFilter = storageFilter.advise || {};
  const ids = [];
  const filterIds = adviseFilter.productid || [];
  filterIds.forEach(it => {
    if (allProductList && allProductList.some(i => i.id === it)) {
      ids.push(it);
    }
  });

  return (
    <span className="m-query u-mgl20">
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">类型：</span>
        <FilterSelect
          onChange={(value) => updateFilter('type', value)}
          dataSource={MY_FEEDBACK_MAP.map((item) => ({
            label: item.value, value: item.key,
          }))}
          defaultValue={adviseFilter.type || MY_FEEDBACK}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={Object.keys(adviseNameMap).map((item) => ({
            label: adviseNameMap[Number(item)], value: Number(item),
          }))}
          defaultValue={adviseFilter.state || EXCLUDE_CANCLE_CLOSE}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">优先级：</span>
        <FilterSelect
          onChange={(value) => updateFilter('level', value)}
          dataSource={levelMap.map((item) => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={adviseFilter.level}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">关联产品：</span>
        <FilterSelect
          onChange={(value) => updateFilter('productid', value)}
          dataSource={allProductList && allProductList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={ids}
        />
      </span>

      <span className="f-ib f-vam u-mgl20 grayColor">标题：</span>
      <span style={{display: 'inline-block', width: '150px'}}>
        <Search allowClear placeholder="输入标题搜索"
          defaultValue={adviseFilter.name || ''}
          onSearch={(value) => updateFilter('name', value)}
        />
      </span>
    </span>
  );
};

export default QueryArea;
