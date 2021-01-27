import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Popover, Checkbox } from 'antd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { setTreeData, deepCopy, arrDeduplication, equalsObj, drawerDelayFun, calculateDwm } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import EpIcon from '@components/EpIcon';
import usePrevious from '@components/CustomHooks/usePrevious';
import { bugTaskNameMap, bugTaskColorDotMap, requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import styles from './index.less';

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: '10px 8px 10px 12px',
  background: isDragging ? '#E6F5FF' : '#ffffff', // @color-blue-1 @color-white-1
  ...draggableStyle
});

const draweDispatch = 'receipt/saveDrawerIssueId';

/**
 * @versionSelectList 后端返回的原数据结构，非层级
 * @data 前端组装后的数据结构，层级的
 */
function VersionAddList(props) {
  const { versionSelectList, dispatch, activeId, showCheckbox, setSelectData, selectData } = props;
  let issueList = deepCopy(versionSelectList, []);
  // let singleTask = {
  //   issueKey: 'stask',
  //   name: '独立任务',
  // };
  let singleBug = {
    issueKey: 'sbug',
    name: '缺陷',
  };
  let hasBug = false;
  // let hasTask = false;

  issueList.forEach(it => {
    if (it.issueKey.includes('Bug')) {
      it.parentIssueKey = 'sbug';
      hasBug = true;
    }
    // if (it.issueKey.includes('Task') && it.independentIssue) {
    //   it.parentIssueKey = 'stask';
    //   hasTask = true;
    // }
  });
  if (hasBug && !issueList.some(i => i.issueKey === 'sbug')) {
    issueList.push(singleBug);
  }
  // if (hasTask && !issueList.some(i => i.issueKey === 'stask')) {
  //   issueList.push(singleTask);
  // }

  const data = useMemo(() => {
    const newList = deepCopy(issueList, []);
    return setTreeData(newList, 'issueKey', 'parentIssueKey') || [];
  }, [issueList]);

  const defaultKeys = useMemo(() => {
    return data.map(it => it.issueKey) || [];
  }, [data]);

  const allKeys = issueList.map(it => it.issueKey) || [];
  const [displayKeys, setDisplayKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);

  const defaultKeysRef = usePrevious(defaultKeys);

  useEffect(() => {
    setExpandedKeys([]);
  }, [activeId]);

  useEffect(() => {
    if (!equalsObj(defaultKeysRef, defaultKeys)) {
      setDisplayKeys(defaultKeys);
    }
  }, [defaultKeys, defaultKeysRef]);

  // 点击展开icon逻辑处理
  const handleExpand = useCallback((item) => {
    let newDisplayKeys = [...displayKeys];
    let newExpandKeys = [...expandedKeys];

    issueList.forEach(it => {
      if (it.parentIssueKey && it.parentIssueKey === item.issueKey && !newDisplayKeys.includes(it.issueKey)) {
        newDisplayKeys.push(it.issueKey);
      }
    });
    newExpandKeys.push(item.issueKey);
    setDisplayKeys(newDisplayKeys);
    setExpandedKeys(arrDeduplication(newExpandKeys));
  }, [displayKeys, expandedKeys, issueList]);


  useDeepCompareEffect(() => {
    let newDisplayKeys = data.map(it => it.issueKey) || [];
    expandedKeys.forEach(item => {
      issueList.forEach(it => {
        if (it.parentIssueKey === item && !newDisplayKeys.includes(it.issueKey)) {
          newDisplayKeys.push(it.issueKey);
        }
      });
    });
    setDisplayKeys(arrDeduplication(newDisplayKeys));
  }, [issueList, displayKeys, expandedKeys]);

  const getOrderList = useCallback(() => {
    let arr = [];
    const orderListMap = (datasource) => {
      datasource.forEach(it => {
        arr.push(it);
        if (it.children && it.children.length) {
          orderListMap(it.children);
        }
      });
    };
    orderListMap(data);
    return arr;
  }, [data]);

  const disabledDrag = (i, index) => {
    return (
      <Draggable
        key={`${i.issueKey}`}
        draggableId={`${i.issueKey}`}
        index={index}
        isDragDisabled={true}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.itemBorderTop} f-aic`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            {getDisplayIcon(i)}
            <span className={`f-iaic ${styles.disableName}`} style={{ marginLeft: getDisplayIndent(i) }}>
              {i.name}
            </span>
          </div>
        )}
      </Draggable>);
  };

  const taskDrag = (i, index) => {
    return (
      <Draggable
        key={`task-${i.task.id}`}
        draggableId={`${i.task.id.toString()}-task-right-${i.versionPlan.id}`}
        index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.itemBorderTop} f-aic`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
            onClick={(e) => {
              e.stopPropagation();
              drawerDelayFun(() => {
                dispatch({ type: draweDispatch, payload: `${i.task && i.task.parentid ? 'Subtask' : 'Task'}-${i.task.id}` });
              }, 200);
            }}
          >
            {
              showCheckbox && <span onClick={e => e.stopPropagation()}>
                <Checkbox
                  className="u-mgr15"
                  onChange={(e) => { setSelectData(e.target.checked, i) }}
                  checked={selectData.some(it => it.issueKey === i.issueKey)}
                >
                </Checkbox>
              </span>
            }
            {getDisplayIcon(i)}
            <span className="f-iaic" style={{ width: '20px', marginLeft: getDisplayIndent(i) }}>
              <EpIcon type={i.task && i.task.parentid ? 'subTask' : 'task'} className='f-fs3' />
            </span>
            <Popover
              content={`${i.task.name}`}
            >
              <span
                style={{ width: `calc(30% - ${getDisplayIndent(i)}px)`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                className={`f-ib f-vam u-primary`}
              >
                {i.task.name}
              </span>
            </Popover>
            <span style={{ width: '15%', paddingLeft: '14px' }}>
              <DefineDot
                text={i.versionPlan.state}
                statusMap={bugTaskNameMap}
                statusColor={bugTaskColorDotMap}
              />
            </span>
            <span className="f-ib f-vam" style={{ width: '20%' }}>
              {i.dwManpower ? calculateDwm(i.dwManpower.estimate) : '0'}
            </span>
            <Popover content={(i.responseUser && i.responseUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '15%' }}>
                {(i.responseUser && i.responseUser.realname) || '--'}
              </span>
            </Popover>
            <Popover content={(i.requireUser && i.requireUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '20%' }}>
                {(i.requireUser && i.requireUser.realname) || '--'}
              </span>
            </Popover>
          </div>
        )}
      </Draggable>);
  };

  const bugDrag = (i, index) => {
    return (
      <Draggable
        key={`bug-${i.bug.id}`}
        draggableId={`${i.bug.id.toString()}-bug-right-${i.versionPlan.id}`}
        index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.itemBorderTop} f-aic`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
            onClick={(e) => {
              e.stopPropagation();
              drawerDelayFun(() => {
                dispatch({ type: draweDispatch, payload: `Bug-${i.bug.id}` });
              }, 200);
            }}
          >
            {
              showCheckbox && <span onClick={e => e.stopPropagation()}>
                <Checkbox
                  className="u-mgr15"
                  onChange={(e) => { setSelectData(e.target.checked, i) }}
                  checked={selectData.some(it => it.issueKey === i.issueKey)}
                >
                </Checkbox>
              </span>
            }
            {getDisplayIcon(i)}
            <span className="f-iaic" style={{ width: '20px', marginLeft: getDisplayIndent(i) }}>
              <EpIcon type='bug' className='f-fs3' />
            </span>
            <Popover
              content={`${i.bug.name}`}
            >
              <span
                style={{ width: `calc(30% - ${getDisplayIndent(i)}px)`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                className={`f-ib f-vam u-primary`}
              >
                {i.bug.name}
              </span>
            </Popover>
            <span style={{ width: '15%', paddingLeft: '14px' }}>
              <DefineDot
                text={i.versionPlan.state}
                statusMap={bugTaskNameMap}
                statusColor={bugTaskColorDotMap}
              />
            </span>
            <span className="f-ib f-vam" style={{ width: '20%' }}>
              {i.dwManpower ? calculateDwm(i.dwManpower.estimate) : '0'}
            </span>
            <Popover content={(i.responseUser && i.responseUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '15%' }}>
                {(i.responseUser && i.responseUser.realname) || '--'}
              </span>
            </Popover>
            <Popover content={(i.requireUser && i.requireUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '20%' }}>
                {(i.requireUser && i.requireUser.realname) || '--'}
              </span>
            </Popover>
          </div>
        )}
      </Draggable>);
  };

  const subRequirementDrag = (i, index) => {
    return (
      <Draggable
        key={`children-${i.requirement.id}`}
        draggableId={`${i.requirement.id.toString()}-children-right-${i.versionPlan.id}`}
        index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.itemBorderTop} f-aic`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
            onClick={(e) => {
              e.stopPropagation();
              drawerDelayFun(() => {
                dispatch({ type: draweDispatch, payload: `Feature-${i.requirement.id}` });
              }, 200);
            }}
          >
            {getDisplayIcon(i)}

            <span className="f-iaic" style={{ width: '20px', marginLeft: getDisplayIndent(i) }}>
              <EpIcon type='requirement' className='f-fs3' />
            </span>
            <Popover
              content={`${i.parentRequirement.name} / ${i.requirement.name}`}
            >
              <span
                style={{ width: `calc(30% - ${getDisplayIndent(i)}px)`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                className={`f-ib f-vam u-primary`}
              >
                {i.parentRequirement.name} / {i.requirement.name}
              </span>
            </Popover>
            <span style={{ width: '15%', paddingLeft: '14px' }}>
              <DefineDot
                text={i.versionPlan.state}
                statusMap={requirementNameMap}
                statusColor={requirementColorDotMap}
              />
            </span>
            <span className="f-ib f-vam" style={{ width: '20%' }}>
              {i.dwManpower ? calculateDwm(i.dwManpower.estimate) : '0'}
            </span>
            <Popover content={(i.responseUser && i.responseUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '15%' }}>
                {(i.responseUser && i.responseUser.realname) || '--'}
              </span>
            </Popover>
            <Popover content={(i.requireUser && i.requireUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '20%' }}>
                {(i.requireUser && i.requireUser.realname) || '--'}
              </span>
            </Popover>
          </div>
        )}
      </Draggable>);
  };

  const requirementDrag = (obj, index) => {
    const i = obj || {};
    return (
      <Draggable
        key={`parent-${i.requirement.id}`}
        draggableId={`${i.requirement.id.toString()}-parent-right-${i.versionPlan.id}`}
        index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.itemBorderTop} f-aic`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
            onClick={event => {
              event.stopPropagation();
              drawerDelayFun(() => {
                dispatch({ type: draweDispatch, payload: `Feature-${i.requirement.id}` });
              }, 200);
            }}
          >
            {
              showCheckbox && <span onClick={e => e.stopPropagation()}>
                <Checkbox
                  className="u-mgr15"
                  onChange={(e) => { setSelectData(e.target.checked, i) }}
                  checked={selectData.some(it => it.issueKey === i.issueKey)}
                >
                </Checkbox>
              </span>
            }
            {getDisplayIcon(i)}
            <span className="f-iaic" style={{ width: '20px', marginLeft: getDisplayIndent(i) }}>
              <EpIcon type='requirement' className='f-fs3' />
            </span>
            <Popover
              content={i.requirement.name}
            >
              <span
                style={{ width: `calc(30% - ${getDisplayIndent(i)}px)`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                className={`f-ib f-vam u-primary`}
              >
                {i.requirement.name}
              </span>
            </Popover>
            <span style={{ width: '15%', paddingLeft: '14px' }}>
              <DefineDot
                text={i.versionPlan.state}
                statusMap={requirementNameMap}
                statusColor={requirementColorDotMap}
              />
            </span>
            <span className="f-ib f-vam" style={{ width: '20%' }}>
              {i.dwManpower ? calculateDwm(i.dwManpower.estimate) : '0'}
            </span>
            <span className="f-ib f-vam" style={{ width: '15%' }}>
              <TextOverFlow maxWidth={60} content={(i.responseUser && i.responseUser.realname) || '--'} />
            </span>
            <Popover content={(i.requireUser && i.requireUser.realname) || '--'}>
              <span className="f-ib f-vam f-wwb" style={{ width: '20%' }}>
                {(i.requireUser && i.requireUser.realname) || '--'}
              </span>
            </Popover>
          </div>
        )}
      </Draggable>);
  };

  const diffDrag = (i, index) => {
    if (i.issueKey.includes('sbug')) {
      return disabledDrag(i, index);
    }
    if (i.task) {
      return taskDrag(i, index);
    }
    if (i.bug) {
      return bugDrag(i, index);
    }
    if (i.parentRequirement) { // 父需求 / 子需求
      return subRequirementDrag(i, index);
    }
    if (!i.parentRequirement && i.requirement) {
      return requirementDrag(i, index);
    }
  };

  // 每一行前是否有收缩icon
  const getDisplayIcon = (item) => {
    return (
      item.children && item.children.length ?
        <span>
          {
            expandedKeys.includes(item.issueKey) ?
              <span onClick={(e) => { e.stopPropagation(); handleCollapse(item) }}>
                <MyIcon
                  type={"icon-kuozhananniu"}
                  className="f-fs3 f-csp"
                  style={{ position: 'relative', left: getDisplayIndent(item) - 8 }}
                />
              </span>
              :
              <span onClick={(e) => { e.stopPropagation(); handleExpand(item) }}>
                <MyIcon
                  type={"icon-shousuoanniu"}
                  className="f-fs3 f-csp"
                  style={{ position: 'relative', left: getDisplayIndent(item) - 8 }}
                />
              </span>
          }
        </span>
        :
        <span style={{ marginLeft: '16px' }}></span>
    );
  };

  // 点击收缩icon逻辑处理
  const handleCollapse = (item) => {
    let newDisplayKeys = [...displayKeys];
    let newExpandKeys = [...expandedKeys];
    let childrenKeys = [];

    const getChildrenKeys = (arr) => {
      arr.forEach(it => {
        childrenKeys.push(it.issueKey);
        if (it.children && it.children.length) {
          getChildrenKeys(it.children);
        }
      });
    };
    getChildrenKeys(item.children);

    // 先用arrDeduplication去重再看原因
    newDisplayKeys = arrDeduplication(newDisplayKeys.filter(it => !childrenKeys.some(i => i === it)));
    newExpandKeys = newExpandKeys.filter(i => i !== item.issueKey);
    setExpandedKeys(arrDeduplication(newExpandKeys));
    setDisplayKeys(arrDeduplication(newDisplayKeys));
  };

  // 获取缩进的间隔
  const getDisplayIndent = (item) => {
    let indent = 0;

    const getIndent = (it) => {
      if (it.parentIssueKey && issueList.some(i => i.issueKey === it.parentIssueKey)) {
        const obj = issueList.find(i => i.issueKey === it.parentIssueKey) || {};
        indent += 24;
        getIndent(obj);
      }
    };
    getIndent(item);

    return indent;
  };

  // 由组装好的层级树在展开变成有序的列表
  const getBodyContent = (data) => {
    let newDisplayKeys = deepCopy(displayKeys, []);
    if (!newDisplayKeys.includes('sbug')) {
      newDisplayKeys.push('sbug');
    }
    // if (!newDisplayKeys.includes('stask')) {
    //   newDisplayKeys.push('stask');
    // }
    return data.map((item, index) => {
      return <div style={{ display: newDisplayKeys.includes(item.issueKey) ? 'block' : 'none' }}>{diffDrag(item, index)}</div>;
    });
  };

  return (<span className={styles.container}>
    <div className={styles.headerTitle}>
      <span className="f-ib" style={{ width: 'calc(30% + 20px)' }}>
        {
          data.length !== issueList.length &&
          <span>
            {
              allKeys.length === displayKeys.length && !!allKeys.length ?
                <span onClick={(e) => { e.stopPropagation(); setDisplayKeys(defaultKeys); setExpandedKeys([]) }}>
                  <MyIcon type="icon-kuozhananniu" className="f-fs3 f-csp" style={{ position: 'relative' }} />
                </span>
                :
                <span onClick={(e) => { e.stopPropagation(); setDisplayKeys(allKeys); setExpandedKeys(allKeys) }}>
                  <MyIcon type="icon-shousuoanniu" className="f-fs3 f-csp" style={{ position: 'relative' }} />
                </span>
            }
          </span>
        }
        <span className="u-pdl5">名称</span>
      </span>
      <span className="f-ib" style={{ width: 'calc(15% - 20px)', paddingLeft: '14px' }}>状态</span>
      <span className="f-ib" style={{ width: 'calc(20% - 14px)', paddingLeft: '14px' }}>
        预估工作量(人/天)
      </span>
      <span className="f-ib" style={{ width: 'calc(15% - 10px)', paddingLeft: '14px' }}>负责人</span>
      <span className="f-ib" style={{ width: '20%', paddingLeft: '14px' }}>验证人</span>
    </div>

    <div className={styles.rightScroll}>
      {
        getBodyContent(getOrderList())
      }
    </div>
  </span>);
}

export default VersionAddList;

