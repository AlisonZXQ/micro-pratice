import React from 'react';
import FilterSelect from '@components/FilterSelect';
import { issueMapArr } from '@shared/ReceiptConfig';

const QueryArea = ({ updateFilter, kanbanResponseUserList, kanbanRequireUserList }) => (

  <span className="u-mgb10 m-query f-fs1">
    <span className='queryHover'>
      <span className="f-ib f-vam">状态：</span>
      <FilterSelect
        onChange={(value) => updateFilter('state', value)}
        dataSource={issueMapArr.map(it => ({
          label: it.label, value: it.value,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">负责人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('responseuid', value)}
        dataSource={kanbanResponseUserList.map(it => ({
          label: `${it.realname} ${it.email}`, value: it.id,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam">验证人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('requireuid', value)}
        dataSource={kanbanRequireUserList.map(it => ({
          label: `${it.realname} ${it.email}`, value: it.id,
        }))}
      />
    </span>

  </span>
);

export default QueryArea;
