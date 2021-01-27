import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import FilterSelect from '@components/FilterSelect';
import SubProductFilterSelect from '@pages/receipt/components/subproduct_filter_select';
import PersonFilterSelect from '@components/PersonFilterSelect';
import { levelMap, epicType } from '@shared/ObjectiveConfig';
import { aimNameArr } from '@shared/CommonConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';

function transArray(array) {
  let newArray = [];
  array && array.map((item) => {
    newArray.push(Number(item));
  });
  return newArray;
}

const QueryArea = (props) => {
  const { updateFilter, type, productid, subProductList, subProductId, isNotList } = props;
  const [productList, setProductList] = useState([]);
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  let objectiveListQuery = {};
  try {
    objectiveListQuery = JSON.parse(localStorage.getItem('objectiveListQuery')) || {};
  }catch {
    console.log('异常')
  }

  useEffect(() => {

  }, [productid]);

  return (
    <span className="m-query u-mgl20">

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">子产品：</span>
        {isNotList ? <FilterSelect
          onChange={(value) => updateFilter('subProductId', value)}
          dataSource={enableSubProductList && enableSubProductList.map(item => ({
            label: item.subProductName, value: item.id, isEnable: item.isEnable
          }))}
          defaultValue={subProductId}
        /> : <SubProductFilterSelect
          onChange={(value) => updateFilter('subProductId', value)}
          dataSource={subProductList && subProductList.map(item => ({
            label: item.subProductName, value: item.id, isEnable: item.isEnable
          }))}
          defaultValue={objectiveListQuery.subProductId}
        />
        }
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={aimNameArr && aimNameArr.map((item) => ({
            label: item.name, value: item.key,
          }))}
          defaultValue={transArray(objectiveListQuery.state)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <PersonFilterSelect
          type={`${type}-responseuid`}
          onChange={(value) => updateFilter('responseuid', value)}
          defaultValue={transArray(objectiveListQuery.responseuid)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">目标类型：</span>
        <FilterSelect
          onChange={(value) => updateFilter('type', value)}
          dataSource={epicType && epicType.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={transArray(objectiveListQuery.type)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">优先级：</span>
        <FilterSelect
          onChange={(value) => updateFilter('level', value)}
          dataSource={levelMap && levelMap.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={transArray(objectiveListQuery.level)}
        />
      </span>
    </span>
  );
};

export default QueryArea;
