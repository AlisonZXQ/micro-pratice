import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import TwoColumns from './components/TwoColumns';
import OneColumns from './components/OneColumns';

function Index(props) {
  const { getPlanOrDateList } = props;
  const [columns, setColumns] = useState('twoColumns');
  const localColumns = localStorage.getItem('requirement_plan_collapse');

  useEffect(() => {
    setColumns(localColumns || 'twoColumns');
  }, [localColumns]);

  return <div>
    <div style={{ display: columns === 'twoColumns' ? 'block' : 'none' }}>
      <TwoColumns
        setColumns={setColumns}
        getPlanList={getPlanOrDateList}
        {...props}
      />
    </div>

    <div style={{ display: columns === 'oneColumns' ? 'block' : 'none' }}>
      <OneColumns
        setColumns={setColumns}
        getPlanList={getPlanOrDateList}
        {...props}
      />
    </div>
  </div>;
}

const mapStateToProps = (state) => {
  return {
    planList: state.requirementPlan.planList,
    planListLoading: state.loading.effects[`requirementPlan/getRequirementPlanList`],
    unlinkedLoading: state.loading.effects[`requirementPlan/getUnLinkedList`],
    unLinkedObj: state.requirementPlan.unLinkedObj,
    jumpId: state.requirementPlan.jumpId,
  };
};

export default connect(mapStateToProps)(Index);
