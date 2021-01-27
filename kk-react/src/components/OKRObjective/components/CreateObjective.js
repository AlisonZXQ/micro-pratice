import React from 'react';
import CreateObjectiveForm from '@components/CreateIssues/create_objective';

function CreateObjective({ form, productId, ...rest }) {

  return (<div>
    <CreateObjectiveForm
      showProduct
      form={form}
      productid={productId}
      {...rest}
    />
  </div>);
}

export default CreateObjective;
