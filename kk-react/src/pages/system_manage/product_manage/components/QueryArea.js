import React from 'react';
import { Cascader } from 'antd';
import FilterSelect from '@components/FilterSelect';


const QueryArea = ({ updateFilter, entList, departmentList, departmentId }) => {

  return (
    <span>
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">所属企业：</span>
        <FilterSelect
          onChange={(value) => updateFilter('entid', value)}
          dataSource={entList && entList.map((item) => ({
            label: item.name, value: item.id,
          }))}
        />
      </span>

      <span className="f-ib f-vam grayColor u-mgl10">所属部门：</span>
      <Cascader
        fieldNames={{ label: 'deptName', value: 'deptId', children: 'children' }}
        expandTrigger="hover"
        options={departmentList}
        onChange={(value) => updateFilter('departmentId', value)}
        changeOnSelect
        showSearch
        style={{ width: '300px' }}
        value={departmentId}
      />
    </span>
  );
};

export default QueryArea;
