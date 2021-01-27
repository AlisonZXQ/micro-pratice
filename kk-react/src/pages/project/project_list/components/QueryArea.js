import React from 'react';
import { Input } from 'antd';
import moment from 'moment';
import FilterSelect from '@components/FilterSelect';
import TreeSelect from '@components/TreeSelect';
import StyleDatePicker from '@components/CustomAntd/StyleDatePicker';
import { projectStatusArr, PROJECT_STATUS_EXCLUDE_FINISH } from '@shared/ProjectConfig';

const Search = Input.Search;

const transDate = (type, value) => {
  if (type === 'start') {
    return value ? new Date(value).setHours(0, 0, 0, 0) : '';
  } else {
    return value ? new Date(value).setHours(23, 59, 59, 999) : '';
  }
};

const QueryArea = ({ updateFilter, ownerList, creatorList, productList, filterObj }) => {

  const projectListQuery = localStorage.getItem('projectListQuery') ?
    JSON.parse(localStorage.getItem('projectListQuery')) : {};

  const getProductDisplay = () => {
    return filterObj.productV3 || [];
  };

  return (
    <span className="m-query">

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">项目状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('status', value)}
          dataSource={projectStatusArr && projectStatusArr.map((item) => ({
            label: item.value, value: item.key,
          }))}
          defaultValue={projectListQuery.status ? projectListQuery.status : PROJECT_STATUS_EXCLUDE_FINISH}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('ownerId', value)}
          dataSource={ownerList && ownerList.map((item) => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={projectListQuery.ownerId}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">创建人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('creatorId', value)}
          dataSource={creatorList && creatorList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={projectListQuery.creatorId}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">关联产品：</span>
        <TreeSelect
          productList={productList}
          defaultData={getProductDisplay()}
          updateFilter={(data) => updateFilter('productV3', data)}
          style={{ width: "300px" }}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">开始时间：</span>
        <StyleDatePicker
          onChange={(value) => updateFilter('startTimestamp', transDate('start', value))}
          defaultValue={projectListQuery.startTimestamp ? moment(projectListQuery.startTimestamp) : undefined}/>
      </span>

      <span className='u-mgt15 queryHover'>
        <span className="f-ib f-vam grayColor">结束时间：</span>
        <StyleDatePicker
          onChange={(value) => updateFilter('endTimestamp', transDate('end', value))}
          defaultValue={projectListQuery.endTimestamp ? moment(projectListQuery.endTimestamp) : undefined}/>
      </span>

      <span className='f-ib u-mgt15 u-mgr20'>
        <span className="f-ib f-vam grayColor">名称：</span>
        <Search
          allowClear
          onSearch={value => updateFilter('title', value)}
          style={{ width: '150px' }}
          placeholder="请输入名称或代号"
          defaultValue={projectListQuery.title}
        />
      </span>
    </span>
  );
};

export default QueryArea;
