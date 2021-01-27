import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import { getContainer } from '@utils/helper';
import { riskLevelMap, weekReportStateArr } from '@shared/ProjectConfig';

const Search = Input.Search;

const QueryArea = ({ updateFilter, weekReportCreator }) => (

  <span className="u-mgb10 m-query" id="container">
    <span className='queryHover'>
      <span className="f-ib f-vam">周报状态：</span>
      <FilterSelect
        onChange={(value) => updateFilter('state', value)}
        dataSource={weekReportStateArr.map((item) => ({
          label: item.label, value: item.value,
        }))}
        getPopupContainer={getContainer}
      />
    </span>

    {/* <span className="f-ib f-vam u-mgl20">风险等级：</span>
    <FilterSelect
      onChange={(value) => updateFilter('level', value)}
      dataSource={riskLevelMap.map((item) => ({
        label: item.label, value: item.value,
      }))}
      getPopupContainer={getContainer}
    /> */}

    <span className='queryHover'>
      <span className="f-ib f-vam">创建人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('createuid', value)}
        dataSource={weekReportCreator.map(item => ({
          label: item.realname, value: item.id,
        }))}
        getPopupContainer={getContainer}
      />
    </span>


    <span className="f-ib f-vam u-mgl20">名称：</span>
    <Search
      allowClear
      onSearch={value => updateFilter('name', value)}
      style={{ width: '186px' }}
      placeholder="搜索报告名称"
    />
  </span>
);

export default QueryArea;
