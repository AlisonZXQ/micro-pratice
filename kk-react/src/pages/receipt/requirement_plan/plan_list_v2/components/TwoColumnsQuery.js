import React from 'react';
import { Input } from 'antd';
import { connect } from 'dva';
import FilterSelect from '@components/FilterSelect';
import moment from 'moment';
import { requirementNameMap } from '@shared/RequirementConfig';
import StyleYearPicker from '@components/CustomAntd/StyleYearPicker';

const { Search } = Input;

function TwoColumnsQuery({ updateFilter, subProductAll }) {

  return (<span className='u-mgl10'>
    <span className='queryHover'>
      <span className="f-ib f-vam grayColor">子产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('subProductIdList', value)}
        dataSource={subProductAll.map(item => ({
          label: item.subProductName, value: item.id,
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam grayColor">状态：</span>
      <FilterSelect
        onChange={(value) => updateFilter('stateList', value)}
        dataSource={Object.keys(requirementNameMap).map(item => ({
          label: requirementNameMap[Number(item)], value: Number(item),
        }))}
      />
    </span>

    <span className='queryHover'>
      <span className="f-ib f-vam grayColor">计划上线时间：</span>
      <StyleYearPicker
        defaultValue={null}
        onChange={(value) => { updateFilter('year', value ? moment(value).format('YYYY') : '') }}
      />
    </span>


    <span className="u-mgl20">
      <Search
        placeholder="搜索需求"
        onSearch={value => updateFilter('name', value)}
        style={{ width: 200, position: 'relative' }}
      />
    </span>
  </span>);
}


const mapStateToProps = (state) => {
  return {
    subProductAll: state.product.enableSubProductList
  };
};

export default connect(mapStateToProps)(TwoColumnsQuery);
