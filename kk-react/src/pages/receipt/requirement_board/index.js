import React, { useState, useEffect, useCallback } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Spin, message, Dropdown, Empty, Card } from 'antd';
import { connect } from 'dva';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { requirementNameMap } from '@shared/CommonConfig';
import MyIcon from '@components/MyIcon';
import Modal from '@components/CustomAntd/modal';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import ReviewResultForm from '@pages/receipt/components/drawer_shared/requirement/ReviewResultForm';
import { REQUIREMENT_STATUS_MAP, OPEN_REQUIREMENT, BOARD_FILTER_TYPE, BOARD_DEFAULT } from '@shared/RequirementConfig';
import { setRequirementState } from '@services/requirement';
import { boardColumns, childColumnsMap, columnDatasMap, boardColumnsNameMap, canDropStatusMap } from '@shared/RequirementConfig';
import BoardQueryArea from './components/BoardQueryArea';
import CreateBoard from './create_board';
import AddRequirement from './add_requirement';
import { getBoardData, getFilterParams, getDrag } from './components/BoardFun';
import KanbanMenu from './components/KanbenMenu';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '#F1F3F5', // @color-blue-1 @color-black-2
  width: '254px',
  marginBottom: '10px',
  minHeight: '100px',

  height: 'calc(100vh - 250px)',
  overflowX: 'hidden'
});

function Index(props) {
  const { kanbanList, kanbanIssue, drawerIssueId, kanbanIssueLoading, lastProduct, enableSubProductList } = props;
  const { productid } = props.location.query;
  const [collapseObj, setCollapseObj] = useState({});
  const [showChildObj, setShowChildObj] = useState({});
  const [sourceDropId, setSourceDropId] = useState('');
  const [hoverId, setHoverId] = useState('');
  const [visible, setVisible] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const [currentKanban, setCurrentKanban] = useState({});
  const [draggableId, setDraggableId] = useState('');
  const [filterObj, setFilterObj] = useState({});

  /**
   * @description - 前端筛选
   * @param {*} data
   */
  const processData = (data) => {
    const { subProductIdList, responseUidList, name } = filterObj;
    return data
      .filter(it => !subProductIdList || !subProductIdList.length || (it.subProductVO && it.subProductVO.id && subProductIdList.includes(it.subProductVO.id)))
      .filter(it => !responseUidList || !responseUidList.length || (it.responseUser && it.responseUser.id && responseUidList.includes(it.responseUser.id)))
      .filter(it => !name || (it.name && it.name.includes(name)));
  };

  const boardDataObj = getBoardData(processData(kanbanIssue));

  useEffect(() => {
    getKanbanList();
    props.dispatch({ type: 'product/getAllSubProductList', payload: { productid } });
  }, [productid]);

  const getKanbanList = useCallback(() => {
    props.dispatch({ type: 'requirementBoard/getKanbanList', payload: productid });
  }, [productid]);

  useDeepCompareEffect(() => {
    if (lastProduct.id !== Number(productid)) {
      setCurrentKanban({});
    }
  }, [lastProduct]);

  /**
   * @description - 初始化进入页面的展示
   */
  useDeepCompareEffect(() => {
    let defaultKanban = {};
    if (Object.keys(currentKanban).length) {
      defaultKanban = currentKanban;
    } else {
      defaultKanban = kanbanList.find(it => it.isDefault === BOARD_DEFAULT.DEFAULT)
        || kanbanList.find(it => it.type === BOARD_FILTER_TYPE.ALL_OPEN)
        || kanbanList[0] || {};
    }
    handleChangeKanban(defaultKanban || {});
  }, [kanbanList]);

  const getShowChildDrop = (item, dropDataArr) => {
    const dropIdsArr = columnDatasMap[item];

    return (<div>
      <div className={`f-jcsb ${styles.header}`}>
        <span>
          <span className={styles.text}>{boardColumnsNameMap[item]}</span>
          <span className={styles.number}>{dropDataArr.length}</span>
          <a
            onClick={() => setShowChildObj({ ...showChildObj, [item]: false })}
            className="u-mgl10 f-fs1"
          >收起子泳道</a>
        </span>

        <span onClick={() => setCollapseObj({ ...collapseObj, [item]: true })}>
          <MyIcon type="icon-zhankai1" className={styles.expandIcon} />
        </span>
      </div>

      <div className={styles.dropContainer}>
        {
          dropIdsArr.map(it => (
            <div className={styles.showChild}>
              <div>
                <span className={styles.text}>{requirementNameMap[it]}</span>
                <span className={styles.number}>{boardDataObj[it].length}</span>
              </div>
              <Droppable droppableId={`child-${it}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {
                      boardDataObj[it].map((it, index) => getDrag(it, index, props))
                    }
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))
        }
      </div>
    </div>);
  };

  const getHideChildDrop = (item, dropDataArr) => {
    return (<div>
      <div className={`f-jcsb ${styles.header}`}>
        <span>
          <span className={styles.text}>{boardColumnsNameMap[item]}</span>
          <span className={styles.number}>{dropDataArr.length}</span>
          <span>
            {
              !!childColumnsMap[item].length &&
              <a
                onClick={() => setShowChildObj({ ...showChildObj, [item]: true })}
                className="u-mgl10 f-fs1"
              >展开子泳道</a>
            }
          </span>
        </span>

        <span onClick={() => setCollapseObj({ ...collapseObj, [item]: true })}>
          <MyIcon type="icon-zhankai1" className={styles.expandIcon} />
        </span>
      </div>

      <Droppable droppableId={`parent-${item}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {
              sourceDropId && sourceDropId !== `parent-${item}` ?
                // item==='todo'?
                <span>
                  {
                    canDropStatusMap[item].map(it =>
                      <div
                        className={styles.changeState}
                        onMouseOver={() => setHoverId(it.key)}
                        // style={{ height: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, lineHeight: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, position: 'sticky', top: 0 }}
                        style={{ height: '150px', lineHeight: '150px' }}
                      >
                        {it.name}
                      </div>)
                  }
                  <div
                    onMouseOver={() => setHoverId('')}
                    style={{ height: `calc(100vh - 250px - ${canDropStatusMap[item].length * 150}px)` }}>
                  </div>
                </span>
                :
                <span>{dropDataArr.map((it, index) => getDrag(it, index, props))}</span>
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>);
  };

  const getDrop = (item) => {
    const dropIdsArr = columnDatasMap[item];
    let dropDataArr = [];
    dropIdsArr.forEach(it => {
      dropDataArr = dropDataArr.concat(boardDataObj[it]);
    });

    return (<div className={styles.drop}>
      {
        collapseObj[item]
          ?
          <div className={styles.collapse}>
            <span onClick={() => setCollapseObj({ ...collapseObj, [item]: false })}>
              <MyIcon type="icon-zhankai1" className={styles.icon} />
            </span>
            <span>
              <span className={styles.text}>{boardColumnsNameMap[item]}</span>
              <span className={styles.number}>{dropDataArr.length}</span>
            </span>
          </div>
          :
          <div>
            {
              showChildObj[item] ?
                getShowChildDrop(item, dropDataArr)
                :
                getHideChildDrop(item, dropDataArr)
            }
          </div>
      }

    </div>);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    const { droppableId: endDroppableId } = destination;
    const { droppableId: startDroppableId } = source;
    setSourceDropId('');

    // 没有发生移动return
    if (endDroppableId === startDroppableId || !destination) return;
    let params = {
      id: draggableId,
      state: 0,
      reviewResult: "",
      rejectDesc: "",
    };
    if (endDroppableId.includes('parent')) {
      if (hoverId === REQUIREMENT_STATUS_MAP.EVALUATION) {
        setVisible(true);
        setDraggableId(draggableId);
      } else if (hoverId) {
        params.state = hoverId;
        setRequirementStateFun(params);
      }
    } else if (endDroppableId.includes('child')) {
      const endState = Number(endDroppableId.split('-')[1]);
      if (endState === REQUIREMENT_STATUS_MAP.EVALUATION) {
        setVisible(true);
        setDraggableId(draggableId);
      } else {
        params.state = endState;
        setRequirementStateFun(params);
      }
    }
  };

  const handleOK = () => {
    props.form.validateFields((err, values) => {
      if (err) return;
      const params = {
        id: draggableId,
        state: REQUIREMENT_STATUS_MAP.EVALUATION,
        reviewResult: values.reviewresult,
        rejectDesc: values.rejectdesc || '',
      };
      setRequirementStateFun(params);
    });
  };

  const setRequirementStateFun = (params) => {
    setRequirementState([params]).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      setVisible(false);
      message.success('状态更新成功！');
      getIssueFun();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  };

  const handleChangeKanban = async (item) => {
    // setCurrentKanban({});
    let data = {};
    if (item.type === BOARD_FILTER_TYPE.FILTER) {
      data = await getFilterParams(item.filterId, productid);
    }
    if (item.type === BOARD_FILTER_TYPE.ALL_OPEN) {
      data = {
        ...data,
        productid,
        state: OPEN_REQUIREMENT,
      };
    } else if (item.type === BOARD_FILTER_TYPE.ALL) {
      data = {
        ...data,
        productid,
      };
    }
    data = {
      ...data,
      orderby: 'addtime',
      order: 'desc',
    };
    setCurrentKanban(item || {});
    setFilterParams(data);
    getIssueFun({
      ...data,
      requirementKanbanId: item.id
    });
  };

  const getIssueFun = useCallback((params) => {
    const newParams = params || {
      ...filterParams,
      requirementKanbanId: currentKanban.id
    };
    const kanbanId = params ? params.requirementKanbanId : currentKanban.id;
    if (kanbanId) {
      props.dispatch({
        type: 'requirementBoard/getRequirementIssue',
        payload: newParams
      });
    } else {
      props.dispatch({
        type: 'requirementBoard/saveRequirementIssue',
        payload: []
      });
    }
  }, [filterParams, currentKanban]);

  const onDragStart = (start) => {
    const { source: { droppableId } } = start;
    setSourceDropId(droppableId);
  };

  const updateFilter = (key, name) => {
    setFilterObj({
      ...filterObj,
      [key]: name
    });
  };

  return (<div className="u-mg15">
    <div className='f-aic u-mgb15 f-jcsb-aic'>
      <span className='f-aic'>
        <span className={styles.boardIcon}>
          <MyIcon type="icon-xuqiukanban" className={styles.icon} />
        </span>
        <span className='u-mgl10 f-fs3 font-pfm'>需求看板</span>
      </span>

      <span>
        <CreateBoard
          productid={productid}
          getKanbanList={getKanbanList}
          kanbanList={kanbanList}
          setCurrentKanban={setCurrentKanban}
        />
      </span>
    </div>

    <div className={styles.boardHeader}>
      {
        kanbanList.length ?
          <Dropdown
            overlay={<KanbanMenu
              kanbanList={kanbanList}
              handleClickGetIssue={handleChangeKanban}
              getKanbanList={getKanbanList}
              setCurrentKanban={setCurrentKanban}
            />}
          >
            <span className="f-csp">
              <span className={styles.name}>{currentKanban.name}</span>
              <MyIcon type="icon-xia" className={styles.icon} />
            </span>
          </Dropdown>
          :
          <span style={{ position: 'relative', top: '2px' }}>暂无看版</span>
      }

      <BoardQueryArea
        kanbanIssue={kanbanIssue}
        updateFilter={updateFilter}
        enableSubProductList={enableSubProductList}
      />
      {
        currentKanban.type === BOARD_FILTER_TYPE.CUSTOM &&
        <span className='f-fr'>
          <AddRequirement
            productid={productid}
            kanbanIssue={kanbanIssue}
            currentKanban={currentKanban}
            handleChangeKanban={handleChangeKanban}
          />
        </span>
      }
    </div>

    {
      kanbanList.length ?
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
        >
          <Spin spinning={kanbanIssueLoading}>
            <div style={{ display: 'flex', overflowX: 'auto', height: 'calc(100vh - 200px)' }}>
              {
                boardColumns.map(item =>
                  getDrop(item))
              }
            </div>
          </Spin>
        </DragDropContext>
        :
        <Card>
          <Empty className={styles.empty} />
        </Card>
    }

    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => handleOK()}
    >
      <ReviewResultForm form={props.form} />
    </Modal>

    {
      drawerIssueId &&
      <DrawerComponent
        refreshFun={() => {
          getIssueFun();
        }}
      />
    }
  </div >);
}

const mapStateToProps = (state) => {
  return {
    kanbanList: state.requirementBoard.kanbanList,
    kanbanIssue: state.requirementBoard.kanbanIssue,
    kanbanIssueLoading: state.loading.effects[`requirementBoard/getRequirementIssue`],
    drawerIssueId: state.receipt.drawerIssueId,
    lastProduct: state.product.lastProduct,
    enableSubProductList: state.product.enableSubProductList,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
