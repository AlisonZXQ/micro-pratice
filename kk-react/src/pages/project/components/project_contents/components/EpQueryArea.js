import React from 'react';
import FilterSelect from '@components/FilterSelect';
import PersonFilterSelect from '@components/PersonFilterSelect';
import SearchNameId from '@pages/receipt/components/search_name_id';

const QuearyArea = ({ updateFilter, issueTypes, statuses, productByUser, subProductList, productIdList, subProductIdList }) => {

  return (
    <div className="f-cb m-query f-fs2">
      <span className='f-ib' style={{ height: '4px' }}>
        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">产品：</span>
          <FilterSelect
            onChange={(value) => updateFilter('productIdList', value)}
            dataSource={productByUser.map(item => ({
              label: item.name, value: item.id,
            }))}
            defaultValue={productIdList}
            type='list'
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">子产品：</span>
          <FilterSelect
            onChange={(value) => updateFilter('subProductIdList', value)}
            dataSource={subProductList.map(item => ({
              label: item.subProductName, value: item.id,
            }))}
            defaultValue={subProductIdList}
            type='list'
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">类型：</span>
          <FilterSelect
            onChange={(value) => updateFilter('issueTypeList', value)}
            dataSource={(issueTypes ? issueTypes : []).map((item) => ({
              label: item, value: item,
            }))}
            type='list'
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">状态：</span>
          <FilterSelect
            onChange={(value) => updateFilter('statusList', value)}
            dataSource={(statuses ? statuses : []).map((item) => ({
              label: item, value: item,
            }))}
            type='list'
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">负责人：</span>
          <PersonFilterSelect
            type={`${''}-responseuid`}
            onChange={(value) => updateFilter('responseUidList', value)}
            defaultValue={[]}
          />
        </span>

      </span>

      <span className='f-fr'>
        <SearchNameId
          updateFilter={updateFilter}
          defaultValue={''}
        />
      </span>
    </div>
  );
};

export default QuearyArea;
