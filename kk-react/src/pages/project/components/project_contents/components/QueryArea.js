import React from 'react';
import FilterSelect from '@components/FilterSelect';

const QueryArea = ({ updateFilter, issueTypes, statuses }) => {

  return (
    <div className="f-cb m-query f-fs2">
      <span className='queryHover'>
        <span className="f-ib f-vam">类型：</span>
        <FilterSelect
          onChange={(value) => updateFilter('issueType', value)}
          dataSource={(issueTypes ? issueTypes : []).map((item) => ({
            label: item, value: item,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('status', value)}
          dataSource={(statuses ? statuses : []).map((item) => ({
            label: item, value: item,
          }))}
        />
      </span>

    </div>
  );
};

export default QueryArea;
