import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Spin } from 'antd';
import { getStartTime, getEndTime } from '@utils/helper';
import { CYCLE_TYPE_TIME } from '@shared/CommonConfig';
import TreeRender from './components/TreeRender';
import ObjectiveMapQuery from './components/ObjectiveMapQuery';
import styles from './index.less';

function OrganizationMap(props) {
  const { dispatch, objectiveMap, objectiveMapLoading, currentUser } = props;
  const [filterObj, setFilterObj] = useState({});
  const deptFullLink = currentUser.deptFullLink || [];
  const user = useMemo(() => {
    return currentUser.user || {};
  }, [currentUser])
  let localFilterObj = {};
  try {
    localFilterObj = localStorage.getItem('objective_manage_list') ? JSON.parse(localStorage.getItem('objective_manage_list')) : {};
  } catch {
  }

  useEffect(() => {
    setFilterObj(localFilterObj);
  }, [])

  const getObjectiveMapFun = useCallback((conveyFilter) => {
    const filter = conveyFilter || filterObj;
    const range = filter.range || {};
    const dateRange = range.dateRange || [];
    const currentYear = new Date().getFullYear();
    const startTime = currentYear + '-' + CYCLE_TYPE_TIME['allyear'][0];
    const endTime = currentYear + '-' + CYCLE_TYPE_TIME['allyear'][1];
    const responseUidList = filter.responseUidList || [];

    const params = {
      ...filter,
      deptIdList: filter.deptIdList || [user.deptId],
      dueTimeStart: dateRange[0] || getStartTime(startTime),
      dueTimeEnd: dateRange[1] || getEndTime(endTime),
      responseUidList: responseUidList.map(it => it.id),
    };
    dispatch({ type: 'objectiveManage/getObjectiveMap', payload: params });
  }, []);

  useEffect(() => {
    if (user.id) {
      getObjectiveMapFun(localFilterObj);
    }
  }, [user.id]);

  const updateFilter = (key, value) => {
    const newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    localStorage.setItem('objective_manage_map', JSON.stringify(newFilterObj));
    getObjectiveMapFun(newFilterObj);
    setFilterObj(newFilterObj);
  };

  return (<div>
    <div className={styles.query}>
      <ObjectiveMapQuery
        updateFilter={updateFilter}
        deptFullLink={deptFullLink}
      />
    </div>
    <Spin spinning={objectiveMapLoading}>
      <TreeRender
        data={objectiveMap}
        dispatch={dispatch}
      />
    </Spin>

  </div>);
}

export default OrganizationMap;
