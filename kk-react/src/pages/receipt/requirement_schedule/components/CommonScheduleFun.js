import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Popover } from 'antd';
import moment from 'moment';
import EpIcon from '@components/EpIcon';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import { drawerDelayFun, calculateDwm } from '@utils/helper';
import { requirementColorDotMap, requirementNameMap } from '@shared/CommonConfig';
import { LEVER_ICON, ITEM_USE, REQUIREMENT_LEVEL_SETTING } from '@shared/ReceiptConfig';
import styles from '../index.less';

const draweDispatch = 'receipt/saveDrawerIssueId';

const isEmpty = (text) => {
  return text ? text : '-';
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: '10px 8px',
  width: '100%',
  background: isDragging ? '#E6F5FF' : 'white', // @color-blue-1 @color-white-1
  ...draggableStyle
});

const columns = [{
  title: '标题',
  dataIndex: 'zhuti',
  width: '45%',
  render: (record) => {
    const requirement = record.requirement || {};
    return <Popover content={requirement.name}>
      <span
        className="f-ib f-toe"
        style={{ maxWidth: "95%" }}
      >
        {requirement.name}
      </span>
    </Popover>;
  }
}, {
  title: '状态',
  dataIndex: 'zhuangtai',
  width: '20%',
  render: (record) => {
    const requirement = record.requirement || {};
    const state = requirement.state;
    return <DefineDot
      text={state}
      statusColor={requirementColorDotMap}
      statusMap={requirementNameMap}
    />;
  }
}, {
  title: '计划上线时间',
  dataIndex: 'shangxian',
  width: '20%',
  render: (record) => {
    const requirement = record.requirement || {};
    const time = requirement.expect_releasetime;
    return time ? moment(time).format('YYYY-MM-DD') : '--';
  }
}, {
  title: '汇总工作量',
  dataIndex: 'gongzuoliang',
  width: '20%',
  render: (record) => {
    const dwManpower = record.dwManpower || {};
    const estimate = dwManpower.estimate ? calculateDwm(dwManpower.estimate) : 0;
    return `${estimate}人天`;
  }
}, {
  title: '负责人',
  dataIndex: 'fuzeren',
  width: '15%',
  render: (record) => {
    const responseUser = record.responseUser || {};
    return isEmpty(responseUser.realname);
  }
}];

const getDraggableContent = (item, index, dispatch, type, ruleType) => {
  const filterColumns = type === 'pool' ?
    columns.filter(it => it.dataIndex !== 'gongzuoliang') :
    columns.filter(it => it.dataIndex !== 'shangxian');
  const auto = ruleType && ruleType === REQUIREMENT_LEVEL_SETTING.AUTO;

  return (<Draggable
    key={`Feature-${item.requirement && item.requirement.id}`}
    draggableId={`Feature-${item.requirement && item.requirement.id}`}
    index={index}
    isDragDisabled={auto}
  >
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`${styles.itemBorderBottom} f-aic`}
        style={getItemStyle(
          snapshot.isDragging,
          provided.draggableProps.style
        )}
        onClick={(e) => {
          e.stopPropagation();
          drawerDelayFun(() => {
            dispatch({ type: draweDispatch, payload: `Feature-${item.requirement && item.requirement.id}` });
          }, 200);
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <MyIcon type="icon-tuodong1" className={auto ? styles.hiddenDragIcon : styles.dragIcon} />
        </div>
        <EpIcon type="需求" className={styles.issueIcon} />
        <MyIcon type={LEVER_ICON[item.requirement.level]} className={styles.levelIcon} />
        {filterColumns.map(col =>
          <div className="f-ib"
            style={{ width: col.dataIndex === 'zhuti' ? `calc(${col.width} - 52px)` : col.width }}
          >
            {col.render(item || {})}
          </div>)}
      </div>
    )}
  </Draggable>);
};

const getTitle = (type) => {
  const filterColumns = type === 'pool' ?
    columns.filter(it => it.dataIndex !== 'gongzuoliang') :
    columns.filter(it => it.dataIndex !== 'shangxian');

  return filterColumns.map(item =>
    <div className="f-ib"
      style={{ width: item.width, paddingLeft: item.dataIndex === 'zhuti' ? `18px` : '0px' }}>
      {item.title}
    </div>);
};

const getPlanRules = () => {
  return (<span>
    <div><span className="f-fwb">1.当前版本吞吐量</span>=该版本内所有需求的个数之和；</div>
    <div><span className="f-fwb">2.历史统计版本吞吐量</span>=近三个月，实际已发布所有版本的需求吞吐量的中位数；</div>
    <div><span className="f-fwb">3.当前版本排入需求工作量</span>=该版本内所有需求的工作量加总；</div>
    <div><span className="f-fwb">4.历史统计版本容量</span>=近三个月，实际已发布所有版本的版本容量的中位数；</div>
  </span>);
};

// 保存优先级设定规则
const saveRequirementSettingConfig = (values) => {
  let obj = {};
  for (let item in values) {
    const splitArr = item.split('-') || [];
    const key = splitArr[0];
    obj[key] = obj[key] || {};
    if (item.includes('state')) {
      obj[key].state = values[item] ? ITEM_USE.ENABLE : ITEM_USE.UNABLE;
    } else {
      obj[key].attribute = obj[key].attribute || [];
      obj[key].attribute.push({
        key: splitArr[1],
        value: values[item] || 0,
      });
    }
  }
  return obj;
};

// 获取优先级设定默认值
const getRequirementSettingConfig = (defaultObj) => {
  const keysArr = ['level', 'refObjectiveLevel', 'refAdviseCount', 'expectReleaseTime'];
  let valueObj = {};
  for (let item in defaultObj) {
    if (keysArr.includes(item)) {
      let itemValue = defaultObj[item] || {};
      valueObj[`${item}-state`] = itemValue.state === ITEM_USE.ENABLE ? true : false;

      itemValue.attribute = itemValue.attribute || [];
      itemValue.attribute.forEach(it => {
        valueObj[`${item}-${it.key}`] = it.value;
      });
    }
  }
  return valueObj;
};

const settingData = [{
  name: '优先级',
  id: 'level',
  description: '',
  options: [{
    name: '',
    type: 'switch',
    id: 'state',
    unit: ''
  }, {
    name: 'P0',
    type: 'inputNumber',
    id: 'p0',
    unit: '分'
  }, {
    name: 'P1',
    type: 'inputNumber',
    id: 'p1',
    unit: '分'
  }, {
    name: 'P2',
    type: 'inputNumber',
    id: 'p2',
    unit: '分'
  }]
}, {
  name: '关联的目标优先级',
  id: 'refObjectiveLevel',
  description: '',
  options: [{
    name: '',
    type: 'switch',
    id: 'state',
    unit: ''
  }, {
    name: 'P0',
    type: 'inputNumber',
    id: 'p0',
    unit: '分'
  }, {
    name: 'P1',
    type: 'inputNumber',
    id: 'p1',
    unit: '分'
  }, {
    name: 'P2',
    type: 'inputNumber',
    id: 'p2',
    unit: '分'
  }]
}, {
  name: '关联的建议数量',
  id: 'refAdviseCount',
  description: '',
  options: [{
    name: '',
    type: 'switch',
    id: 'state',
    unit: ''
  }, {
    name: '等差值',
    type: 'inputNumber',
    id: 'unit',
    unit: ''
  }]
}, {
  name: '计划上线时间',
  id: 'expectReleaseTime',
  description: `计划上线时间与当天的差值，设定接近的天数区间a以及每日分值递增等比值m
  计算函数：a>x>-a: y=|mx|`,
  options: [{
    name: '',
    type: 'switch',
    id: 'state',
    unit: ''
  }, {
    name: '时间区间',
    type: 'inputNumber',
    id: 'timeArea',
    unit: ''
  }, {
    name: '等比值',
    type: 'inputNumber',
    id: 'unit',
    unit: ''
  }]
}];

// 规则是否发生改变
const getChangeOrNot = (newObj, oldObj) => {
  let flag = false;
  for(let i in newObj) {
    if (newObj[i] !== oldObj[i]) {
      flag = true;
    }
  }
  return flag;
};

export {
  getDraggableContent,
  getTitle,
  getPlanRules,
  getRequirementSettingConfig,
  saveRequirementSettingConfig,
  settingData,
  getChangeOrNot
};
