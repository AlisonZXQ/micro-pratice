import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Badge, Input, Spin, message } from 'antd';
import moment from 'moment';
import EpIcon from '@components/EpIcon';
import { getUserList, handleSearchUser, warnModal } from '@shared/CommonFun';
import EditSelectUser from '@components/EditSelectUser';
import MyIcon from '@components/MyIcon';
import PopoverTip from '@components/PopoverTip';
import StyleDatePicker from '@components/CustomAntd/StyleDatePicker';
import EditSelectLevel from '@components/EditSelectLevel';
import { deleteModal } from '@shared/CommonFun';
import { LEVER_ICON } from '@shared/ReceiptConfig';
import { CYCLE_TYPE_TIME } from '@shared/CommonConfig';
import { orderMap, orderByMap } from '@shared/ObjectiveManage';
import { getStartTime, getEndTime, getDeptLayerTreeData } from '@utils/helper';
import { editObjective, addObjectiveKR, editObjectiveKR, deleteObjectiveKR } from '@services/objective_manage';
import FilterTree from '@components/FilterTree';
import AddParentObjective from './components/AddParentObjective';
import MoreOperation from './components/MoreOperation';
import ObjectiveListQuery from './components/ObjectiveListQuery';
import styles from './index.less';

const { TextArea } = Input;

function OrganizationList(props, ref) {
  const { objectiveList, dispatch, objectiveListLoading, currentUser } = props;
  const [filterObj, setFilterObj] = useState({});
  const [userList, setUserList] = useState([]);
  const [showAddInputObj, setShowAddInputObj] = useState({});
  const [showEditKRObj, setShowEditKRObj] = useState({});
  const [showEditObjectiveObj, setShowEditObjectiveObj] = useState({});
  const deptFullLink = currentUser.deptFullLink || [];
  const defaultUserDept = deptFullLink && deptFullLink[deptFullLink.length - 1] && deptFullLink[deptFullLink.length - 1].deptId;
  const user = useMemo(() => {
    return currentUser.user || {};
  }, [currentUser])
  let localFilterObj = {};
  try {
    localFilterObj = localStorage.getItem('objective_manage_list') ? JSON.parse(localStorage.getItem('objective_manage_list')) : {};
  } catch {
  }

  useImperativeHandle(ref, () => {
    return {
      getObjectiveListFun,
    };
  });

  useEffect(() => {
    setFilterObj(localFilterObj);
  }, [])

  const getObjectiveListFun = useCallback((conveyFilter) => {
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
      order: orderMap[filter.order || 2],
      orderBy: orderByMap[filter.orderBy || 1],
    };
    dispatch({ type: 'objectiveManage/getObjectiveList', payload: params });
  }, [user, filterObj]);

  useEffect(() => {
    if (user.id) {
      getObjectiveListFun(localFilterObj);
    }
  }, [user.id]);

  const updateFilter = (key, value) => {
    const newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    localStorage.setItem('objective_manage_list', JSON.stringify(newFilterObj));
    getObjectiveListFun(newFilterObj);
    setFilterObj(newFilterObj);
  };

  /**
   * @description - 更新目标名称/部门/优先级/到期日/负责人
   * @param {String} key - 更新的字段
   * @param {String} value - 更新的值
   * @param {Object} objective - 更新的目标
   */
  const updateObjective = (key, value, objective) => {
    let params = {
      id: objective.id,
      [key]: value,
    }
    if (key === 'deptId') {
      const index = deptFullLink.findIndex(it => it.deptId === value[0]);
      const arr = deptFullLink.slice(0, index + 1);
      const parentObjectiveVO = objective.parentObjectiveVO || {};
      params = {
        ...params,
        [key]: value[0],
        deptFullPath: arr.map(it => it.deptName).join('-')
      }
      if (parentObjectiveVO.id) {
        warnModal({
          title: '提示',
          content: '修改部门后对齐目标将会清空，是否确定修改部门？',
          okCallback: () => {
            editObjectiveFun(params);
          }
        })
      } else {
        editObjectiveFun(params);
      }
    } else {
      editObjectiveFun(params);
    }
  };

  const editObjectiveFun = (params) => {
    editObjective(params).then(res => {
      message.success('更新目标成功！');
      if (res.code !== 200) return message.error(res.msg);
      getObjectiveListFun();
    }).catch(err => {
      return message.error(err || err.message);
    })
  }

  /**
   * @description - 添加kr切换为input
   * @param {*} item
   */
  const handleAddKR = (item) => {
    const newShowAddInputObj = {
      ...showAddInputObj,
      [item.id]: true
    };
    setShowAddInputObj(newShowAddInputObj);
  };

  /**
   * @description - 添加关键结果
   * @param {String} value - 关键结果
   * @param {Object} objective - 目标
   */
  const handleBlurAddKR = (value, objective) => {
    if (!value.trim().length) {
      return message.warn('此项必填！');
    } else {
      addObjectiveKR({
        orgObjectiveId: objective.id,
        name: value,
      }).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('添加关键结果成功！');
        getObjectiveListFun();
        const newShowAddInputObj = {
          ...showAddInputObj,
          [objective.id]: false
        };
        setShowAddInputObj(newShowAddInputObj);
      }).catch(err => {
        return message.error(err || err.message);
      })
    }
  };

  /**
   * @description - 切换kr到编辑撞塌
   * @param {Object} kr
   */
  const handleEditKR = (kr) => {
    const newShowEditKRObj = {
      ...showEditKRObj,
      [kr.id]: true
    };
    setShowEditKRObj(newShowEditKRObj);
  };

  /**
   * @description - 编辑kr
   * @param {String} value
   * @param {Object} kr
   * @param {Object} objective
   */
  const handleBlurEditKRInput = (value, kr, objective) => {
    if (!value.trim().length) {
      return message.warn('此项不能为空！');
    } else {
      editObjectiveKR({
        krId: kr.id,
        name: value
      }).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('更新关键结果成功!');
        getObjectiveListFun();
        const newShowEditKRObj = {
          ...showEditKRObj,
          [kr.id]: false
        };
        setShowEditKRObj(newShowEditKRObj);
      }).catch(err => {
        return message.error(err || err.message);
      })
    }
  };

  /**
   * @description - 删除关键结果
   * @param {*} objective
   * @param {*} kr
   */
  const handleDeleteKR = (objective, kr) => {
    deleteModal({
      title: '提示',
      content: '确认删除该关键结果吗？',
      okCallback: () => {
        deleteObjectiveKR({ krId: kr.id }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除关键结果成功！');
          getObjectiveListFun();
        }).catch(err => {
          return message.error(err || err.message);
        })
      }
    });
  };

  /**
   * @description - 编辑切换目标到输入
   * @param {*} objective
   */
  const handleEditObjective = (objective) => {
    const newShowEditObjectiveObj = {
      ...showEditObjectiveObj,
      [objective.id]: true
    };
    setShowEditObjectiveObj(newShowEditObjectiveObj);
  };

  /**
   * @description - 更新目标
   * @param {String} value 目标name
   * @param {Object} objective 目标对象
   */
  const handleBlurEditObjectiveInput = (value, objective) => {
    if (!value.trim().length) {
      return message.warn('此项不能为空！');
    } else {
      updateObjective('name', value, objective);
      const newShowEditObjectiveObj = {
        ...showEditObjectiveObj,
        [objective.id]: false
      };
      setShowEditObjectiveObj(newShowEditObjectiveObj);
    }
  };

  const getObjectiveList = (item) => {
    const responseUser = item.responseUser || {};
    const productVO = item.productVO || {};
    const projectVO = item.projectVO || {};
    const keyResult = item.keyResult || [];
    const parentObjectiveVO = item.parentObjectiveVO || {};
    const level = item.level;
    const dueDate = item.dueDate;
    const department = item.department || [];
    const deptId = department[department.length - 1].deptId;

    return (<div className={styles.objective}>
      <span
        className={styles.tag}
        onClick={() => {
          dispatch({ type: 'receipt/saveDrawerIssueId', payload: `Objective-${item.id}` });
        }}
      >
        {productVO.id &&
          <PopoverTip trigger={<MyIcon type="icon-liebiao-chanpin" />} content={productVO.name} />
        }
        {projectVO.id &&
          <PopoverTip trigger={<MyIcon type="icon-liebiao-xiangmu" />} content={projectVO.name} />}
      </span>
      <div className={styles.firstPart}>
        <span>
          <EpIcon type="objective" />
          <span className={styles.title}>
            {
              showEditObjectiveObj[item.id] ?
                <Input
                  defaultValue={item.name}
                  onBlur={(e) => handleBlurEditObjectiveInput(e.target.value, item)}
                  className="u-mgt10"
                />
                :
                <span onDoubleClick={() => handleEditObjective(item)}>{item.name}</span>
            }
          </span>
        </span>
        <span className={styles.moreOpt}>
          <span>
            {
              parentObjectiveVO.id ?
                <PopoverTip trigger={<span className={styles.hasParent}>已对齐</span>} content={parentObjectiveVO.name} />
                :
                <AddParentObjective
                  data={item}
                  deptId={deptId}
                  refreshFun={getObjectiveListFun}
                />
            }
          </span>
          <span>
            <MoreOperation
              data={item}
              parentData={parentObjectiveVO}
              refreshFun={getObjectiveListFun}
            />
          </span>
        </span>
      </div>

      <div className={styles.secondPart}>
        <span className="u-mgr10">
          <FilterTree
            onChange={(value) => updateObjective('deptId', value, item)}
            defaultValue={deptId ? [deptId] : [defaultUserDept]}
            treeData={getDeptLayerTreeData(deptFullLink)}
          />
        </span>

        <span className="u-mgr10" className={styles.level}>
          <MyIcon type={LEVER_ICON[level]} className={styles.levelIcon} />
          <EditSelectLevel
            value={level}
            handleSaveSelect={value => updateObjective('level', value, item)}
          />
        </span>

        <MyIcon type="icon-rili" className={styles.dateIcon} />
        <StyleDatePicker
          onChange={(value) => updateObjective('dueTime', moment(value).valueOf(), item)}
          defaultValue={moment(dueDate)}
          required
        />
        <span className="u-mgl10" className={styles.responseUser}>
          <EditSelectUser
            issueRole={1}
            value={responseUser.email}
            dataSource={getUserList(responseUser, userList)}
            handleSearch={(value) => handleSearchUser(value, (result) => {
              setUserList(result || []);
            })}
            handleSaveSelect={(value) => updateObjective('responseEmail', value, item)}
            required
            type='objectiveManage'
          />
        </span>
      </div>

      <div className={styles.thirdPart}>
        {
          keyResult.map(it =>
            showEditKRObj[it.id] ?
              <TextArea
                defaultValue={it.name}
                onBlur={(e) => handleBlurEditKRInput(e.target.value, it, item)}
                className="u-mgt10"
              />
              :
              <div
                className={styles.keyResult}
                onDoubleClick={() => handleEditKR(it)}
              >
                <span>
                  <Badge color={"blue"} />
                  <span className={styles.name}>{it.name}</span>
                </span>
                <span>
                  <MyIcon type="icon-shanchu" className="f-csp" onClick={() => handleDeleteKR(item, it)} />
                </span>
              </div>)
        }
        {
          showAddInputObj[item.id] &&
          <TextArea
            className="u-mgt10"
            placeholder="请输入，建议使用可量化、结果导向的描述方式"
            onBlur={(e) => handleBlurAddKR(e.target.value, item)}
          />
        }
        <div className={styles.addKR}>
          <a
            onClick={() => handleAddKR(item)}
            disabled={showAddInputObj[item.id]}
          >+ 添加关键结果</a>
        </div>
      </div>
    </div>);
  };

  return (<div>
    <div className={styles.query}>
      <ObjectiveListQuery
        updateFilter={updateFilter}
        deptFullLink={deptFullLink}
      />
    </div>

    <Spin spinning={objectiveListLoading}>
      <div className={styles.container}>
        {
          objectiveList.map(item =>
            getObjectiveList(item)
          )
        }
      </div>
    </Spin>

  </div>);
}

export default forwardRef(OrganizationList);
