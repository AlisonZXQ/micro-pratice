import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import FilterSelect from '@components/FilterSelect';
import SubProductFilterSelect from '@pages/receipt/components/subproduct_filter_select';
import PersonFilterSelect from '@components/PersonFilterSelect';
import { getModuleList } from '@services/receipt';
import { levelMap, onlinebugMap } from '@shared/BugConfig';
import { bugTaskNameArr } from '@shared/CommonConfig';
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
  const [moduleList, setModuleList] = useState([]);
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  let bugListQuery = {};
  try {
    bugListQuery = JSON.parse(localStorage.getItem('bugListQuery')) || {};
  }catch {
    console.log('异常')
  }

  useEffect(() => {

    const params = {
      productId: productid
    };
    getModuleList(params).then((res) => { //获取建议模块数据
      if (res.code !== 200) { return message.error(res.msg) }
      setModuleList(res.result);
    }).catch((err) => {
      return message.error(err || err.message);
    });

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
          defaultValue={bugListQuery.subProductId}
        />
        }
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={bugTaskNameArr && bugTaskNameArr.map((item) => ({
            label: item.name, value: item.key,
          }))}
          defaultValue={transArray(bugListQuery.state)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <PersonFilterSelect
          type={`${type}-responseuid`}
          onChange={(value) => updateFilter('responseuid', value)}
          defaultValue={transArray(bugListQuery.responseuid)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">严重程度：</span>
        <FilterSelect
          onChange={(value) => updateFilter('level', value)}
          dataSource={levelMap && levelMap.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={transArray(bugListQuery.level)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">模块：</span>
        <FilterSelect
          onChange={(value) => updateFilter('moduleid', value)}
          dataSource={moduleList && moduleList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={transArray(bugListQuery.moduleid)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">线上缺陷：</span>
        <FilterSelect
          onChange={(value) => updateFilter('onlinebug', value)}
          dataSource={onlinebugMap && onlinebugMap.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={transArray(bugListQuery.onlinebug)}
        />
      </span>

    </span>
  );
};

export default QueryArea;
