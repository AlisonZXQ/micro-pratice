import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import FilterSelect from '@components/FilterSelect';
import SearchNameId from '@pages/receipt/components/search_name_id';
import QueryMore from '@components/QueryMore';
import { levelMapArr, rQueryMoreList } from '@shared/RequirementConfig';
import { getModuleList } from '@services/receipt';
import { getRequirementCustomList } from '@services/requirement';
import { requirementNameArr } from '@shared/CommonConfig';
import styles from '../index.less';

const QueryArea = ({updateFilter, subProductAll, allProductUser, productid, parentParams, type}) => {
  const [moduleList, setModuleList] = useState([]);
  const[queryMoreList, setQueryMoreList] = useState([]);

  useEffect(() => {

    const params = {
      productId: productid
    };
    getModuleList(params).then((res) => { //获取需求模块数据
      if (res.code !== 200) { return message.error(res.msg) }
      setModuleList(res.result);
    }).catch((err) => {
      return message.error(err || err.message);
    });

    getRequirementCustomList({productid: productid}).then((res) => { //需求自定义字段
      if (res.code !== 200) { return message.error(res.msg) }
      const queryMoreList = JSON.parse(JSON.stringify(rQueryMoreList));
      setList(res.result, queryMoreList);
    }).catch((err) => {
      return message.error(err || err.message);
    });

  }, [productid]);

  const setList = (data, list) => {
    let newQueryMoreList = list;

    data.map((it) => {
      newQueryMoreList.push({
        key: `customfield_${it.id}`,
        value: `${it.name}`,
        status: it.type
      });
    });
    setQueryMoreList(newQueryMoreList);
  };

  const changeQueryMore = () => {
  };

  return <span>
    <span className="m-query">
      <span className='queryHover'>
        <span className="f-ib f-vam">子产品：</span>
        <FilterSelect
          onChange={(value) => updateFilter('subProductId', value)}
          dataSource={subProductAll && subProductAll.map(item => ({
            label: item.subProductName, value: item.id,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={requirementNameArr && requirementNameArr.map((item) => ({
            label: item.name, value: item.key,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam">负责人：</span>
        <FilterSelect
          onChange={(value) => updateFilter('responseuid', value)}
          dataSource={allProductUser && allProductUser.map(item => ({
            label: `${item.name} ${item.email}`, value: item.id,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">优先级：</span>
        <FilterSelect
          onChange={(value) => updateFilter('level', value)}
          dataSource={levelMapArr && levelMapArr.map(item => ({
            label: item.label, value: item.value,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">模块：</span>
        <FilterSelect
          onChange={(value) => updateFilter('moduleid', value)}
          dataSource={moduleList && moduleList.map(item => ({
            label: item.name, value: item.id,
          }))}
        />
      </span>
    </span>
    {type === 'create' &&
    <span style={{ position: 'relative', top: '2px' }}>
      <QueryMore
        type={'requirement'}
        isNotList={true}
        updateFilter={updateFilter}
        dataSource={queryMoreList}
        changeQueryMore={changeQueryMore}
        productid={productid}
        parentParams={parentParams}
      />
    </span>
    }

    <span className={ styles.searchNameId }>
      <SearchNameId
        updateFilter={updateFilter}
        type='requirement' />
    </span>
  </span>;
};

export default QueryArea;
