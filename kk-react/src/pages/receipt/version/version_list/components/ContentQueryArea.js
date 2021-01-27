import React from 'react';
import { Input } from 'antd';
import FilterSelect from '@components/FilterSelect';
import PersonFilterSelect from '@components/PersonFilterSelect';

const Search = Input.Search;

const typeMapArr = [
  {key: 'requirement', value: '需求'},
  {key: 'task', value: '任务'},
  {key: 'bug', value: '缺陷'},
];

const VersionQueryArea = (props) => {
  const { updateContentObj } = props;

  return (
    <span className="m-query">
      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">类型：</span>
        <FilterSelect
          onChange={(value) => updateContentObj('type', value)}
          dataSource={typeMapArr && typeMapArr.map(item => ({
            label: item.value, value: item.key,
          }))}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">负责人：</span>
        <PersonFilterSelect
          type={`version`}
          onChange={(value) => updateContentObj('responseuid', value)}
        />
      </span>

      <span className='queryHover'>
        <span className="f-ib f-vam grayColor">验证人：</span>
        <PersonFilterSelect
          type={`version`}
          onChange={(value) => updateContentObj('requireuid', value)}
        />
      </span>

      <span className="f-ib f-vam u-mgl20 grayColor">
        <Search
          onSearch={(value) => updateContentObj('name', value)}
          style={{ width: '200px' }}
          placeholder='请输入名称进行搜索'/>
      </span>
    </span>
  );
};

export default VersionQueryArea;
