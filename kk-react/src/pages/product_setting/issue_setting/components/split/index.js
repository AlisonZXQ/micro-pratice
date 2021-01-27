import React, { useState } from 'react';
import PlanDetailConfig from './PlanDetailConfig';
import DisplayAllPlans from './DisplayAllPlans';

function Index(props) {
  const { productid } = props;
  const [currentDisplay, setCurrentDisplay] = useState('list');
  const [currentPlan, setCurrentPlan] = useState({});

  return (<div>
    {
      currentDisplay === 'detail' &&
      <PlanDetailConfig
        productid={productid}
        currentPlan={currentPlan}
        setCurrentDisplay={setCurrentDisplay}
      />
    }

    {
      currentDisplay === 'list' &&
      <DisplayAllPlans
        productid={productid}
        setCurrentPlan={setCurrentPlan}
        setCurrentDisplay={setCurrentDisplay}
      />
    }

  </div>);
}


export default Index;
