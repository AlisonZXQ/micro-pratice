import React, { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import { getContainer } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { versionNameMap } from '@shared/CommonConfig';
import FilterSelect from './FilterSelect';

const { RangePicker } = DatePicker;

const QueryArea = ({ updateFilter, versionConditionList, subProductAll }) => {

  const [begintime, setStartTime] = useState(undefined);
  const [endtime, setEndTime] = useState(undefined);
  const [releasetime, setReleaseTime] = useState(undefined);

  const obj = {};
  versionConditionList && versionConditionList.forEach(it => {
    obj[it.filterkey] = it.filtervalue;
  });

  const beginTime = (obj.version_begintime && !obj.version_begintime.includes('NaN')) ? obj.version_begintime.split(',').map(it => Number(it)) : undefined;
  const endTime = (obj.version_endtime && !obj.version_endtime.includes('NaN')) ? obj.version_endtime.split(',').map(it => Number(it)) : undefined;
  const releaseTime = (obj.version_releasetime && !obj.version_releasetime.includes('NaN')) ? obj.version_releasetime.split(',').map(it => Number(it)) : undefined;

  useEffect(() => {
    setStartTime(beginTime ? [moment(beginTime[0]), moment(beginTime[1])] : undefined);
    setEndTime(endTime ? [moment(endTime[0]), moment(endTime[1])] : undefined);
    setReleaseTime(releaseTime ? [moment(releaseTime[0]), moment(releaseTime[1])] : undefined);
    // eslint-disable-next-line
  }, [versionConditionList]);

  return (
    <div className="m-query bgWhiteModel" style={{ height: '56px' }}>

      <span className="f-ib f-vam">子产品：</span>
      <FilterSelect
        onChange={(value) => updateFilter('subProductIdList', value)}
        dataSource={subProductAll.map((item) => ({
          label: item.subProductName, value: item.id,
        }))}
        defaultValue={obj['version_subProductIdList'] && obj['version_subProductIdList'].split(',').map(it => Number(it))}
        getPopupContainer={getContainer}
      />

      <span className="f-ib u-mgb10 u-mgl10">
        <span className="f-ib f-vam">状态：</span>
        <FilterSelect
          onChange={(value) => updateFilter('state', value)}
          dataSource={Object.keys(versionNameMap).map((item) => ({
            label: versionNameMap[item], value: Number(item),
          }))}
          defaultValue={obj['version_state'] && obj['version_state'].split(',').map(it => Number(it))}
          getPopupContainer={getContainer}
        />
      </span>

      <span className="f-ib u-mgb10 u-mgl10">
        <span className="f-ib f-vam">开始日期：</span>
        <RangePicker
          allowClear
          style={{ width: '220px' }}
          value={begintime}
          onChange={(value) => { updateFilter('startTime', value); setStartTime(value) }}
          getPopupContainer={getContainer}
          suffixIcon={<MyIcon type='icon-riqi' />}
        />
      </span>

      <span className="f-ib u-mgb10 u-mgl10">
        <span className="f-ib f-vam">计划发布日期：</span>
        <RangePicker
          allowClear
          style={{ width: '220px' }}
          value={endtime}
          onChange={(value) => { updateFilter('endTime', value); setEndTime(value) }}
          getPopupContainer={getContainer}
          suffixIcon={<MyIcon type='icon-riqi' />}
        />
      </span>

      <span className="f-ib u-mgb10 u-mgl10">
        <span className="f-ib f-vam">实际发布日期：</span>
        <RangePicker
          allowClear
          style={{ width: '220px' }}
          value={releasetime}
          onChange={(value) => { updateFilter('releaseTime', value); setReleaseTime(value) }}
          getPopupContainer={getContainer}
          suffixIcon={<MyIcon type='icon-riqi' />}
        />
      </span>

      {/* <Search
        allowClear
        className="u-mgl10"
        onChange={e => updateFilter('title', e.target.value)}
        style={{ width: '100px' }}
        placeholder="搜索项目"
      /> */}
    </div>
  );
};

export default QueryArea;
