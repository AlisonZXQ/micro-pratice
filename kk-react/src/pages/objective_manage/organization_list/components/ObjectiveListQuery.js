import React from 'react';
import FilterSelect from '@components/FilterSelect';
import OrderTime from '@components/OrderTime';
import { levelMapArr } from '@shared/ObjectiveConfig';
import { orderFieldData, orderData } from '@shared/ObjectiveManage';
import FilterCycle from '@components/FilterCycle';
import FilterTree from '@components/FilterTree';
import { getDeptLayerTreeData } from '@utils/helper';
import PersonFilterWithSearch from '@components/PersonFilterWithSearch';

function ObjectiveListQuery(props) {
  const { updateFilter, deptFullLink } = props;
  let localFilterObj = {};
  try {
    localFilterObj = localStorage.getItem('objective_manage_list') ? JSON.parse(localStorage.getItem('objective_manage_list')) : {};
  } catch {
  }
  const range = localFilterObj.range || {};
  const currentDept = deptFullLink && deptFullLink[deptFullLink.length - 1] && deptFullLink[deptFullLink.length - 1].deptId;

  return (<div className="f-jcsb-aic">
    <span>
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">所属部门：</span>
        <FilterTree
          onChange={(value) => updateFilter('deptIdList', value)}
          defaultValue={localFilterObj.deptIdList || [currentDept]}
          treeData={getDeptLayerTreeData(deptFullLink)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <PersonFilterWithSearch
          onChange={(value) => updateFilter('responseUidList', value)}
          defaultValue={localFilterObj.responseUidList || []}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">优先级：</span>
        <FilterSelect
          onChange={(value) => updateFilter('levelList', value)}
          dataSource={levelMapArr.map((item) => ({
            label: item.label, value: item.value
          }))}
          defaultValue={localFilterObj.levelList || []}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">周期：</span>
        <FilterCycle
          onChange={(value) => updateFilter('range', value)}
          defaultValue={range.localStorage}
        />
      </span>
    </span>

    <span>
      <OrderTime
        changeOrderField={(value) => updateFilter('orderBy', value)}
        changeOrder={(value) => updateFilter('order', value)}
        orderFieldData={orderFieldData}
        orderData={orderData}
        defaultOrderField={localFilterObj.orderBy || 1}
        defaultOrder={localFilterObj.order || 2}
        from="my_workbench"
      />
    </span>
  </div >);
}

export default ObjectiveListQuery;
