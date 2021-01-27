import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { getContainer } from '@utils/helper';
import { riskStateMap, riskLevelMap } from '@shared/ProjectConfig';

const Search = Input.Search;

const QueryArea = ({ updateFilter, responseUserList, createUserList }) => {

  return (
    <span className="m-query" id='container'>
      <span className='queryHover'>
        <span className="f-vam">风险状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={riskStateMap.map((item) => ({
            label: item.label, value: item.value,
          }))}
          getPopupContainer={getContainer}
        />
      </span>

      <span className='queryHover'>
        <span className="f-vam">风险等级：</span>
        <FilterSelect
          onChange={(value) => updateFilter('level', value)}
          dataSource={riskLevelMap.map((item) => ({
            label: item.label, value: item.value,
          }))}
          getPopupContainer={getContainer}
        />
      </span>

      <span className='queryHover'>
        <span className="f-vam">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('responseuid', value)}
          dataSource={responseUserList.map(item => ({
            label: item.realname, value: item.id,
          }))}
          getPopupContainer={getContainer}
        />
      </span>

      <span className='queryHover'>
        <span className="f-vam">创建人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('createuid', value)}
          dataSource={createUserList.map(item => ({
            label: item.realname, value: item.id,
          }))}
          getPopupContainer={getContainer}
        />
      </span>

      <span className="f-vam u-mgl20">名称：</span>
      <Search
        allowClear
        onSearch={value => updateFilter('name', value)}
        style={{ width: '190px', marginRight: '10px' }}
        placeholder="搜索风险名称"
      />
    </span>
  );
};

export default QueryArea;
