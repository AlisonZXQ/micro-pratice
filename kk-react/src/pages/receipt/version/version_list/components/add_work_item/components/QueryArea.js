import React from 'react';
import FilterSelect from '@components/FilterSelect';
import SearchNameId from '@pages/receipt/components/search_name_id';
import { issueMapArr, versionIssueTypeArr } from '@shared/ReceiptConfig';

const QueryArea = ({updateFilter, subProductAll, allProductUser}) => {
  return <span className="m-query f-fs2 f-aic">
    <span className='queryHover'>
      <span className="f-ib f-vam">子产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('subProductIdList', value)}
        dataSource={subProductAll && subProductAll.map(item => ({
          label: item.subProductName, value: item.id,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">类型：</span>
      <FilterSelect
        onChange={(value) => updateFilter('typeList', value)}
        dataSource={versionIssueTypeArr.map(it => ({
          label: it.label, value: it.value,
        }))}
        maxWidth={50}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">状态：</span>
      <FilterSelect
        onChange={(value) => updateFilter('stateList', value)}
        dataSource={issueMapArr.map(it => ({
          label: it.label, value: it.value,
        }))}
        maxWidth={50}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">负责人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('responseUidList', value)}
        dataSource={allProductUser && allProductUser.map(item => ({
          label: `${item.name} ${item.email}`, value: item.id,
        }))}
      />
    </span>

    <span style={{ position: 'absolute', right: '0px' }}>
      <SearchNameId
        updateFilter={updateFilter}
        // defaultValue={defaultQuery.id || defaultQuery.name}
        type='' />
    </span>
  </span>;
};

export default QueryArea;
