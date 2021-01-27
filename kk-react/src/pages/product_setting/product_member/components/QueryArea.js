import React from 'react';
import FilterSelect from '@components/FilterSelect';


const QueryArea = ({ updateFilter, productRole, userGroup }) => {

  return (
    <span>
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">岗位：</span>
        <FilterSelect
          onChange={(value) => updateFilter('roleName', value)}
          dataSource={productRole.map((item) => ({
            label: item.roleName, value: item.roleName,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">用户组：</span>
        <FilterSelect
          onChange={(value) => updateFilter('usergroupName', value)}
          dataSource={userGroup.map((item) => ({
            label: item.name, value: item.name,
          }))}
        />
      </span>

    </span>
  );
};

export default QueryArea;
