import React, { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { getContainer } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import FilterSelect from './FilterSelect';
import { projectStatusArr, priorityMap } from '@shared/ProjectConfig';

const { RangePicker } = DatePicker;

const QueryArea = ({ updateFilter, projectConditionList, projectOwnerList, subProductAll }) => {
  const [starttime, setStartTime] = useState(undefined);
  const [endtime, setEndTime] = useState(undefined);

  const obj = {};
  projectConditionList && projectConditionList.forEach(it => {
    obj[it.filterkey] = it.filtervalue;
  });

  const startTime = (obj.project_starttime && !obj.project_starttime.includes('NaN')) ? obj.project_starttime.split(',').map(it => it) : undefined;
  const endTime = (obj.project_endtime && !obj.project_endtime.includes('NaN')) ? obj.project_endtime.split(',').map(it => it) : undefined;

  useEffect(() => {
    setStartTime(startTime ? [moment(startTime[0]), moment(startTime[1])] : undefined);
    setEndTime(endTime ? [moment(endTime[0]), moment(endTime[1])] : undefined);
    // eslint-disable-next-line
  }, [projectConditionList]);

  return (
    <div className="m-query bgWhiteModel" id="container" style={{ height: '56px' }}>

      <span className="f-ib f-vam">子产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('subProductIdList', value)}
        dataSource={subProductAll.map((item) => ({
          label: item.subProductName, value: item.id,
        }))}
        defaultValue={obj['project_subProductIdList'] && obj['project_subProductIdList'].split(',').map(it => Number(it))}
        getPopupContainer={getContainer}
      />

      <span className="f-ib f-vam u-mgl10">状态：</span>
      <FilterSelect
        onChange={(value) => updateFilter('status', value)}
        dataSource={projectStatusArr.map((item) => ({
          label: item.value, value: item.key,
        }))}
        defaultValue={obj['project_status'] && obj['project_status'].split(',').map(it => Number(it))}
        getPopupContainer={getContainer}
      />

      <span className="f-ib f-vam u-mgl10">开始日期：</span>
      <RangePicker
        allowClear
        style={{ width: '220px' }}
        value={starttime}
        onChange={(value) => { updateFilter('startTime', value); setStartTime(value) }}
        getPopupContainer={getContainer}
        suffixIcon={<MyIcon type='icon-riqi' />}
      />

      <span className="f-ib f-vam u-mgl10">结束日期：</span>
      <RangePicker
        allowClear
        style={{ width: '220px' }}
        value={endtime}
        onChange={(value) => { updateFilter('endTime', value); setEndTime(value) }}
        getPopupContainer={getContainer}
        suffixIcon={<MyIcon type='icon-riqi' />}
      />

      <span className="f-ib f-vam u-mgl10">优先级：</span>
      <FilterSelect
        onChange={(value) => updateFilter('priority', value)}
        dataSource={Object.keys(priorityMap).map(item => ({
          label: priorityMap[item], value: Number(item),
        }))}
        defaultValue={obj['project_priority'] && obj['project_priority'].split(',').map(it => Number(it))}
        getPopupContainer={getContainer}
      />

      <span className="f-ib f-vam u-mgl10">负责人：</span>
      <FilterSelect
        onChange={(value) => updateFilter('owner', value)}
        dataSource={projectOwnerList.map(item => ({
          label: `${item.realname} ${item.email}`, value: item.id,
        }))}
        defaultValue={obj['project_owner'] && obj['project_owner'].split(',').map(it => Number(it))}
        getPopupContainer={getContainer}
      />

      {/* <Search
        allowClear
        className="u-mgl10"
        onChange={e => updateFilter('title', e.target.value)}
        style={{ width: '120px' }}
        defaultValue={obj['title'] ? obj['title'] : ''}
        placeholder="搜索项目"
      /> */}
    </div>
  );
};

export default QueryArea;
