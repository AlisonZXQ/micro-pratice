import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Row, Col, message, DatePicker, Table, Checkbox, Button, Spin, Pagination, Empty, Popover } from 'antd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { drawerDelayFun } from '@utils/helper';
import EditTitle from '@components/EditTitle';
import EpIcon from '@components/EpIcon';
import EditStatusObjective from '@pages/receipt/components/drawer_shared/objective/EditStatus';
import EditStatusRequirement from '@pages/receipt/components/drawer_shared/requirement/EditStatus';
import MyIcon from '@components/MyIcon';
import EditSelectUser from '@components/EditSelectUser';
import EditSelect from '@components/EditSelect';
import { handleSearchUser, getUserList, getModuleList, warnModal } from '@shared/CommonFun';
import { ISSUE_TYPE_MAP } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { updateRequirement, updateModuleid } from '@services/requirement';
import { updateObjective } from '@services/objective';
import CreateRequirement from '@pages/receipt/components/create_requirement';
import { batchDeleteRelation } from '@services/requirement_plan';
import { getEditRequirementTitle, getEditObjectiveTitle, processLinkedRequirement } from './PlanListFun';
import PlanMap from '../../plan_map';
import TwoColumnsQuery from './TwoColumnsQuery';
import AddUnlinkedRequirement from './AddUnlinkedRequirement';
import BatchUpdateObjective from './BatchUpdateObjective';
import styles from '../index.less';

function TwoColumns(props) {
  const { planList, productid, setColumns, getPlanList, unLinkedObj, unlinkedLoading,
    planListLoading, jumpId, getUnLinkedList, filterObj, setFilterObj } = props;
  const [currentObjective, setCurrentObjective] = useState({ id: 0, name: '未规划目标的需求' });
  const [moduleList, setModuleList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [selectData, setSelectData] = useState([]);
  const unLinkedList = unLinkedObj.list || [];

  /**
   * 更新需求
   */
  const handleUpdateRequirement = useCallback((type, value, record) => {
    const params = {
      id: record.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else {
      promise = updateRequirement(params);
    }
    promise.then(result => {
      if (result.code !== 200) return message.error(result.msg);
      message.success('更新成功！');
      getPlanList();
      getUnLinkedList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [getPlanList, getUnLinkedList]);

  /**
   *  更新目标
   * */
  const handleUpdateObjective = useCallback((type, value, record) => {
    const params = {
      id: record.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'name') {
      promise = updateObjective(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      getPlanList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [getPlanList]);

  useEffect(() => {
    if (jumpId) {
      setColumns('twoColumns');
      const id = Number(jumpId);
      const obj = planList.find(it => it.id === id) || {};
      setCurrentObjective(obj);
      document.getElementById(`objective-${id}`) && document.getElementById(`objective-${id}`).scrollIntoView();
    }
  });

  useDeepCompareEffect(() => {
    const currentSelectObj = planList.find(it => it.id === currentObjective.id) || { id: 0, name: '未规划目标的需求' };
    setCurrentObjective(currentSelectObj);
  }, [planList]);

  useEffect(() => {
    getUnLinkedList();
  }, [productid]);

  useDeepCompareEffect(() => {
    if (Object.keys(filterObj).length && !currentObjective.id) {
      getUnLinkedList();
    }
  }, [filterObj]);

  const updateFilter = (key, value) => {
    setFilterObj({
      ...filterObj,
      [key]: value,
    });
  };

  const getObjectiveColumn = (item) => {
    return (<div
      className={item.id === currentObjective.id ? styles.objectiveActive : styles.objective}
      onClick={(e) => {
        setCurrentObjective(item);
        props.dispatch({ type: 'requirementPlan/saveJumpId', payload: 0 });
        setShowCheckbox(false);
        setSelectData([]);
      }}
      id={`objective-${item.id}`}
    >
      <Popover content={item.name} placement="topLeft">
        <div className={styles.twoLine} style={{ WebkitBoxOrient: 'vertical' }}>
          <EpIcon type="objective" />
          <a
            className={styles.name}
            onClick={(e) => {
              e.stopPropagation();
              drawerDelayFun(() => {
                props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${item.issueKey}` });
              }, 200);
            }}
          >
            {item.name}
          </a>
        </div>
      </Popover>
      <div className="f-jcsb-aic">
        <span>
          <EditStatusObjective
            issueRole={item.issueRole}
            value={item.state}
            bgHover={false}
            planListDetail={item}
            refreshFun={getPlanList}
          />
        </span>

        <span>
          <PlanMap data={item} />
        </span>
      </div>
    </div>);
  };

  const getModuleItem = (it) => {
    const productModuleVO = it.productModuleVO || {};
    const subProductVO = it.subProductVO || {};
    const modules = [];

    moduleList.forEach(it => {
      modules.push({
        id: it.productModule.id,
        name: it.productModule.name,
      });
    });
    if (productModuleVO && productModuleVO.id && !modules.some(it => it.id === productModuleVO.id)) {
      modules.push({
        id: productModuleVO.id,
        name: productModuleVO.name,
      });
    }

    return (it.issueType === ISSUE_TYPE_MAP.REQUIREMENT &&
      <div style={{ position: 'relative', top: '8px' }}>
        <EditSelect
          issueRole={it.issueRole}
          value={productModuleVO.id}
          dataSource={modules}
          handleSaveSelect={(value) => handleUpdateRequirement('moduleid', value, it)}
          required={true}
          getModuleListByClick={() => getModuleList(subProductVO.id, (result) => setModuleList(result))}
          type='list'
        />
      </div>);
  };

  const getRequirementColumn = () => {
    const dataSource = currentObjective.children || [];
    const requirementList = currentObjective.id ? processLinkedRequirement(dataSource, filterObj) : unLinkedList;

    return (<div className={styles.requirement}>
      <div className={styles.header}>
        <div className="f-jcsb-aic u-mgt10 u-mgb10 u-pdr10">
          {
            currentObjective.id ?
              <span className="u-mgl10">
                <EditTitle
                  title={currentObjective.name}
                  issueRole={currentObjective.issueRole}
                  handleSave={(value) => handleUpdateObjective('name', value, currentObjective)}
                  titleStyle={getEditObjectiveTitle()}
                  hoverShow
                  maxWidth={'45vw'}
                />
              </span>
              :
              <span className={styles.name}>{currentObjective.name}</span>
          }
          <span>
            <CreateRequirement
              parentIssueId={currentObjective.id}
              refreshFun={() => currentObjective.id ? getPlanList() : getUnLinkedList()}
              productid={productid}
              trigger={<a>创建需求</a>}
            />
            {
              !!currentObjective.id &&
              <AddUnlinkedRequirement
                productid={productid}
                parentIssueId={currentObjective.id}
                getPlanList={getPlanList}
              />
            }
          </span>
        </div>
        <div className="u-mgb10">
          <TwoColumnsQuery
            updateFilter={updateFilter}
          />
        </div>
      </div>

      <Spin spinning={currentObjective.id ? false : unlinkedLoading}>
        <div className={styles.content}>
          <div className={styles.title}>
            {showCheckbox &&
              <span className={`${styles.item} ${styles.littleItem}`}></span>
            }
            <span className={`${styles.item} ${styles.bigItem}`}>
              标题
            </span>
            <span className={styles.item}>
                状态
            </span>
            <span className={`${styles.item}`}>
                计划上线时间
            </span>
            <span className={styles.item}>
                模块
            </span>
            <span className={styles.item}>
                负责人
            </span>
            <span className={styles.item}>
                目标用户
            </span>
          </div>

          <div className={styles.table}>
            {requirementList && requirementList.map(it => (
              <div
                onClick={() => {
                  drawerDelayFun(() => {
                    props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${it.issueKey}` });
                  }, 200);
                }}
                className={styles.column}>
                { showCheckbox &&
                  <span className={`${styles.item} ${styles.littleItem}`}>
                    <Checkbox
                      checked={selectData.find(item => item.id === it.id)}
                      onChange={(e) => {
                        let arr = [...selectData];
                        if (e.target.checked) {
                          arr.push(it);
                        } else {
                          arr.splice(arr.findIndex(item => item.id === it.id));
                        }
                        setSelectData(arr);
                      }}></Checkbox>
                  </span>
                }

                {/* 标题 */}
                <span className={`${styles.item} ${styles.bigItem}`} id='title'>
                  <span className="u-mgr5" style={{ fontSize: '16px' }}>
                    <EpIcon type='requirement' />
                  </span>
                  <EditTitle
                    title={it.name}
                    issueRole={it.issueRole}
                    handleSave={(value) => handleUpdateRequirement('name', value, it)}
                    titleStyle={getEditRequirementTitle()}
                    hoverShow
                    maxWidth={'7vw'}
                  />
                </span>
                {/* 状态 */}
                <span className={styles.item}>
                  <EditStatusRequirement
                    issueRole={it.issueRole}
                    value={it.state}
                    bgHover={false}
                    planListDetail={it}
                    refreshFun={() => {
                      getPlanList();
                      getUnLinkedList();
                    }}
                  />
                </span>
                {/* 计划上线时间 */}
                <span className={`${styles.item}`}>
                  {it.issueType === ISSUE_TYPE_MAP.REQUIREMENT &&
                    <div onClick={(e) => {
                      e.stopPropagation();
                    }}>
                      {
                        it.issueRole === ISSUE_ROLE_VALUE_MAP.READ ?
                          <div onClick={() => message.error('您暂无权限操作！')}>
                            <DatePicker
                              className={styles.datePicker}
                              open={false}
                              value={it.expectReleaseTime ? moment(it.expectReleaseTime) : 0}
                            />
                          </div>
                          :
                          <DatePicker
                            className={styles.datePicker}
                            value={it.expectReleaseTime ? moment(it.expectReleaseTime) : 0}
                            suffixIcon={<MyIcon type='icon-xia' className={styles.dateIcon} />}
                            onChange={(value) => {
                              handleUpdateRequirement('expect_releasetime', new Date(value).valueOf(), it);
                            }}
                          />
                      }
                    </div>}
                </span>
                {/* 模块 */}
                <span className={styles.item}>
                  {getModuleItem(it)}
                </span>
                {/* 负责人 */}
                <span className={styles.item}>
                  {it.issueType === ISSUE_TYPE_MAP.REQUIREMENT &&
                    <span style={{ position: 'relative', top: '2px' }}>
                      <EditSelectUser
                        issueRole={it.issueRole}
                        value={it.responseUser.email}
                        dataSource={getUserList(it.responseUser, userList)}
                        handleSearch={(value) => handleSearchUser(value, (result) => setUserList(result))}
                        handleSaveSelect={(value) => handleUpdateRequirement('responseemail', value, it)}
                        required
                        type='list'
                      />
                    </span>}
                </span>
                {/* 目标用户 */}
                <span className={styles.item}>
                  <EditTitle
                    title={it.targetUser}
                    issueRole={it.issueRole}
                    handleSave={(value) => handleUpdateRequirement('targetUser', value, it)}
                    titleStyle={getEditRequirementTitle()}
                    hoverShow
                    maxWidth="6vw"
                  />
                </span>
              </div>
            ))}
          </div>

          <div className={`f-jcsb-aic u-mgt10 ${styles.bottom}`}>
            {
              !showCheckbox &&
              <span>
                共{requirementList.length}个
                {
                  !currentObjective.id &&
                  <Pagination
                    defaultCurrent={1}
                    className="f-ib u-mgl10"
                    style={{ position: 'relative', top: '11px' }}
                    total={unLinkedObj.total || 0}
                    pageSize={10}
                    current={filterObj.current || 1}
                    onChange={value => updateFilter('current', value)}
                  />
                }
              </span>
            }
            {
              showCheckbox &&
              <span className={styles.footerCheck}>
                <Checkbox
                  onChange={(e) =>
                    setSelectData(e.target.checked ?
                      requirementList
                      : [])}
                ></Checkbox>
                <span className="u-mgl10">共{requirementList.length}个</span>
                <span className="u-mgr10 u-mgl10">
                  已选择
                  <span>{selectData.length}</span>项
                </span>
                {
                  !!selectData.length && !currentObjective.id &&
                  <BatchUpdateObjective
                    data={selectData}
                    planList={planList}
                    callback={() => {
                      getUnLinkedList();
                      getPlanList();
                      setSelectData([]);
                    }}
                  />
                }
                {
                  !!selectData.length && !!currentObjective.id &&
                  <a onClick={() => handleRemoveFromObjective()}>批量解绑</a>
                }
              </span>
            }
            <span>
              {
                showCheckbox ?
                  <Button onClick={() => { setShowCheckbox(false); setSelectData([]) }}>取消操作</Button>
                  :
                  <Button onClick={() => setShowCheckbox(true)}>批量操作</Button>
              }
            </span>
          </div>
        </div>
      </Spin>

    </div>);
  };

  const handleRemoveFromObjective = () => {
    warnModal({
      title: '提示',
      content: '确定批量解绑这些需求吗？',
      okCallback: () => {
        const params = {
          parentIssueKey: currentObjective.issueKey,
          issueKeyList: selectData.map(it => it.issueKey),
          issueType: ISSUE_TYPE_MAP.REQUIREMENT,
          parentIssueType: ISSUE_TYPE_MAP.OBJECTIVE,
        };
        batchDeleteRelation(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          getUnLinkedList();
          getPlanList();
          setSelectData([]);
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  };

  const onDragEnd = (result) => {
    console.log(result);
  };

  return (<div className={styles.twoColumnsContainer}>
    <DragDropContext onDragEnd={onDragEnd}>
      <Row>
        <Col span={5} className={styles.left}>
          <Spin spinning={planListLoading}>
            <div
              className={currentObjective.id ? styles.alone : styles.aloneActive}
              onClick={() => {
                getUnLinkedList();
                setCurrentObjective({ id: 0, name: '未规划目标的需求' });
                props.dispatch({ type: 'requirementPlan/saveJumpId', payload: 0 });
                setShowCheckbox(false);
                setSelectData([]);
              }}
            >
              <span
                className={styles.name}
              >
                未规划目标的需求
              </span>
            </div>
            {planList.length ?
              planList.map(item =>
                getObjectiveColumn(item))
              :
              <Empty className={styles.empty} />
            }
          </Spin>
        </Col>

        <Col span={19} className={styles.right}>
          <div
            className={styles.leftLine}
            onClick={() => {
              setColumns('oneColumns');
              localStorage.setItem('requirement_plan_collapse', 'oneColumns');
              props.dispatch({ type: 'requirementPlan/saveJumpId', payload: 0 });
            }}
          >
            <div
              className={styles.icon}
            >
              <MyIcon
                type="icon-zhankaijiantou"
              />
            </div>
          </div>
          {getRequirementColumn()}
        </Col>
      </Row>
    </DragDropContext>
  </div>);
}

export default TwoColumns;
