import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { typeMap, statusMap, EXCLUDE_CLOSE_CANCEL } from '@shared/WorkbenchConfig';

const Search = Input.Search;

const QueryArea = ({ updateFilter, productList, isrr }) => {
  const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
  const issueFilter = storageFilter.issue || {};

  return (
    <span className="m-query u-mgl20">
      {!isrr &&
        <span className="queryHover">
          <span className="f-ib f-vam grayColor">类型：</span>
          <FilterSelect
            onChange={(value) => updateFilter('type', value)}
            dataSource={Object.keys(typeMap).map((item) => ({
              label: typeMap[Number(item)], value: Number(item),
            }))}
            defaultValue={issueFilter.type && issueFilter.type.filter(i => i !== 1)}
          />
        </span>
      }


      <span className="queryHover">
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={Object.keys(statusMap).map((item) => ({
            label: statusMap[Number(item)], value: Number(item),
          }))}
          defaultValue={issueFilter.state || EXCLUDE_CLOSE_CANCEL}
        />
      </span>

      <span className="queryHover">
        <span className="f-ib f-vam grayColor">关联产品：</span>
        <FilterSelect
          onChange={(value) => updateFilter('productid', value)}
          dataSource={productList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={issueFilter.productid}
        />
      </span>

      <span className="f-ib f-vam u-mgl20 grayColor">标题：</span>
      <span style={{display: 'inline-block', width: '150px'}}>
        <Search allowClear placeholder="输入标题搜索"
          defaultValue={issueFilter.name || ''}
          onSearch={(value) => updateFilter('name', value)}
        />
      </span>
    </span>
  );
};

export default QueryArea;
