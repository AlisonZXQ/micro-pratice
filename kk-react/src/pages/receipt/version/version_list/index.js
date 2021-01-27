import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import moment from 'moment';
import { history } from 'umi';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Tag, Spin, message, Empty, Button, Checkbox, Popover } from 'antd';
import { versionPlanDelete, switchVersion, removeFromVersion, closeFromVersion } from '@services/version';
import TextOverFlow from '@components/TextOverFlow';
import { equalsObj } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import { warnModal } from '@shared/CommonFun';
import { versionColor, versionMap, EXCLUDE_PUBLISH, VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import VersionForm from '@pages/receipt/components/VersionForm';
import BatchUpdate from '@components/BatchUpdate';
import { deleteModal, cascaderOpt } from '@shared/CommonFun';
import Header from './components/Header';
import VersionQueryArea from './components/VersionQueryArea';
import ContentQueryArea from './components/ContentQueryArea';
import AddWorkItem from './components/add_work_item';
import VersionAddList from './components/version_add_list';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);


const grid = 8;

const saveVersionSelectType = 'version/saveVersionSelect';
const getVersionSelectType = 'version/getVersionSelect';
const getVersionSelectListType = 'version/getVersionSelectList';
const getProductFlagType = 'product/getProductFlag';

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '',
  margin: '0px 8px 8px 8px',
  width: '98%',
});

const getEmptyListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '',
  margin: grid,
  width: '98%',
  height: 'calc(62vh - 30px - 32px)'
});

// 版本列表的div样式
const getCenterListStyle = (isDraggingOver, isSelected) => ({
  // E6F5FF @color-blue-1 #ffffff @color-white-1  008CFF @color-blue-6
  background: isDraggingOver ? '#E6F5FF' : isSelected ? '#E6F5FF' : '#ffffff',
  borderLeft: isSelected ? '5px #008CFF solid' : null,
  padding: isSelected ? '8px 12px 8px 7px' : '8px 12px',
  margin: '0px 0px 2px 0px',
  width: '100%'
});

class index extends Component {
  state = {
    filterObj: {},
    filterObjReq: {},
    filterObjVer: {},
    activeId: '', // versionId
    productId: '', // productId
    leftUserList: [],
    rightUserList: [],
    stateVersionSelectList: [],
    contentObj: [],

    showCheckbox: false,
    selectData: [],
  }

  componentDidMount() {
    // 处理默认是否展开的逻辑

    const { productid, versionid } = this.props.location.query;
    if (productid) {
      const id = Number(productid);
      this.setState({ productId: id });
      this.getVersionList();

      this.props.dispatch({ type: saveVersionSelectType, payload: {} });
      this.props.dispatch({ type: 'version/saveVersionSelectList', payload: [] });

      this.props.dispatch({ type: getProductFlagType, payload: { productId: id } });
      this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: id } });
      this.props.dispatch({ type: 'product/getAllUserByProductId', payload: { productId: id } });
    }

    // 如果路由有版本id 默认选中该版本
    if (versionid) {
      this.handleChangeVersion(versionid);
    }
  }

  componentWillReceiveProps(nextprops) {
    const { versionid } = this.props.location.query;
    const beforeId = this.props.lastProduct.id;
    const nextId = nextprops.lastProduct.id;

    // 外层子产品切换
    if (beforeId && nextId && beforeId !== nextId) {
      this.setState({ activeId: undefined, filterObj: {} });
      this.handleChange(nextId);
      this.props.dispatch({ type: getProductFlagType, payload: { productId: nextId } });
      this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: nextId } });
      this.props.dispatch({ type: 'product/getAllUserByProductId', payload: { productId: nextId } });
    } else if (!versionid && !equalsObj(this.props.versionList, nextprops.versionList)) {
      const { filterObj } = this.state;
      const noFilter = !Object.keys(filterObj).length; //是否改变筛选条件
      const activeId = this.state.activeId === '' ? undefined : this.state.activeId;
      if (activeId && nextprops.versionList.some(it => it.version.id === Number(activeId))) {
        this.handleChangeVersion(activeId);
      } else {
        const firstId = (nextprops.versionList[0] && nextprops.versionList[0].version.id) || activeId;
        // firstId && noFilter && this.handleChangeVersion(firstId);
        firstId && this.handleChangeVersion(firstId);
      }
    }

    if (!versionid && !equalsObj(this.props.versionSelectList, nextprops.versionSelectList)) {
      this.setState({ stateVersionSelectList: nextprops.versionSelectList });
    }
  }

  getVersionList = () => {
    const { productid } = this.props.location.query;
    const { filterObj, productId } = this.state;
    let newFilterObj = {};
    for (let i in filterObj) {
      if (filterObj[i]) {
        newFilterObj[i] = filterObj[i];
      }
    }
    const params = {
      productId: productId || productid,
      state: EXCLUDE_PUBLISH,
      ...newFilterObj,
    };
    this.props.dispatch({ type: 'version/getVersionList', payload: params });
  }

  // 子产品下拉改变
  handleChange = (value) => {
    history.push(`/manage/version/list?productid=${value}`);
    this.setState({
      productId: value,
    }, () => {
      this.getVersionList();
      this.props.dispatch({ type: saveVersionSelectType, payload: {} });
      this.props.dispatch({ type: 'version/saveVersionSelectList', payload: [] });
      this.props.dispatch({ type: getProductFlagType, payload: { productId: value } });
    });
  }

  onDragEnd = (result) => {
    const { draggableId, source, destination } = result;
    const { versionSelectList } = this.props;
    const { activeId, filterObj } = this.state;

    // 拖拽不在可用区域内
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    } else if (source.droppableId.includes('right')) {
      /**
       * 从版本中删除单据
       */
      const drag = draggableId.split('-');
      const dragSourceObj = versionSelectList.find(i => i.requirement && i.requirement.id === Number(drag[0])) || {};

      const deleteIssue = () => {
        if (destination.droppableId.includes('left')) {
          const params = {
            id: Number(drag[3]),
          };
          versionPlanDelete(params).then((res) => {
            if (res.code !== 200) return message.error(res.msg);
            message.success('版本已更新！');
            this.props.dispatch({ type: getVersionSelectType, payload: { id: activeId } });
            this.props.dispatch({ type: getVersionSelectListType, payload: { versionid: activeId, ...filterObj } });
          }).catch((err) => {
            return message.error(err || err.message);
          });
        }
        if (destination.droppableId.includes('center')) {
          const drag = draggableId.split('-');
          const to = destination.droppableId.split('-');

          const versionId = Number(to[2]);
          this.setState({ activeId: versionId });

          const params = {
            id: Number(drag[3]),
            toversion: to[2],
          };
          switchVersion(params).then((res) => {
            if (res.code !== 200) return message.error(res.msg);
            message.success('版本已更新！');
            this.props.dispatch({ type: getVersionSelectType, payload: { id: versionId } });
            this.props.dispatch({ type: getVersionSelectListType, payload: { versionid: versionId } });
          }).catch((err) => {
            return message.error(err || err.message);
          });
        }
      };

      if (dragSourceObj.hasChildren) {
        warnModal({
          title: '提示',
          content: '当前需求下有关联的下级单据，确认要一起移动吗？',
          okCallback: () => {
            deleteIssue();
          }
        });
      } else {
        deleteIssue();
      }
    }
  };

  // 获取版本列表
  getVersionSelectList = (id) => {
    const { activeId, filterObjVer } = this.state;
    const params = {
      versionid: id || activeId,
      ...filterObjVer,
    };
    this.props.dispatch({ type: getVersionSelectListType, payload: params });
  }

  // 版本切换
  handleChangeVersion = (id) => {
    const { filterObjVer } = this.state;
    const params = {
      versionid: id,
      ...filterObjVer,
    };
    this.props.dispatch({ type: getVersionSelectType, payload: { id } });
    this.props.dispatch({ type: getVersionSelectListType, payload: params });

    this.setState({
      activeId: Number(id),
      selectData: [],
      showCheckbox: false
    });
  }

  updateFilterVersion = (key, value) => {
    const { filterObjVer, activeId } = this.state;
    const newFilterObjVer = {
      ...filterObjVer,
      [key]: value,
    };
    // 查询需求obj
    const params = {
      ...newFilterObjVer,
      versionid: activeId
    };
    this.props.dispatch({ type: getVersionSelectListType, payload: params });

    this.setState({
      filterObjVer: newFilterObjVer,
    });
  }

  // 删除后加载下一个，创建后加载新建的
  getNextVersion = (id) => {
    this.setState({ activeId: id });
    this.props.dispatch({ type: getVersionSelectType, payload: { id } });
    this.props.dispatch({ type: getVersionSelectListType, payload: { versionid: id } });
  }

  updateVersion = (values) => {
    const { filterObj } = this.state;
    const newFilterObj = {
      ...filterObj,
      ...values,
    };
    this.setState({ filterObj: newFilterObj }, () => {
      this.getVersionList();
    });
  }

  resetVersion = () => {
    this.setState({ filterObj: {} }, () => {
      this.getVersionList();
    });
  }

  updateContentObj = (key, value) => {
    const { contentObj } = this.state;
    let newObj = {
      ...contentObj,
      [key]: value,
    };
    this.setState({ contentObj: newObj }, () => this.updateContent());
  }

  updateContent = () => {
    const list = this.props.versionSelectList;
    const { contentObj } = this.state;
    let newList = list;
    if (contentObj.type && !!contentObj.type.length) { //类型过滤
      newList = newList.filter(it => contentObj.type.indexOf(it.type) > -1);
    }
    if (contentObj.responseuid && !!contentObj.responseuid.length) { //负责人过滤
      newList = newList.filter(it => contentObj.responseuid.indexOf(it.responseUser && it.responseUser.id) > -1);
    }
    if (contentObj.requireuid && !!contentObj.requireuid.length) { //验证人过滤
      if (contentObj.requireuid[0] === 0) { //未分配
        newList = newList.filter(it => it.requireUser === undefined);
      } else {
        newList = newList.filter(it => contentObj.requireuid.indexOf(it.requireUser && it.requireUser.id) > -1);
      }
    }
    if (contentObj.name && !!contentObj.name) { //名称过滤
      newList = newList.filter(it => it[it.type] && it[it.type].name.indexOf(contentObj.name) > -1);
    }
    this.setState({ stateVersionSelectList: newList });
  }

  /**
   * @description - 批量操作
   */
  setSelectData = (checked, item) => {
    const { selectData } = this.state;
    const newSelectData = cascaderOpt(item, checked, selectData);
    this.setState({ selectData: newSelectData });
  }

  // 批量移除
  handleRemove = () => {
    const { selectData } = this.state;
    const planIdList = selectData.map(it => it.versionPlan.id);
    deleteModal({
      title: '提示',
      content: '确定批量移除吗？',
      okCallback: () => {
        removeFromVersion({ idList: planIdList }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('批量移除成功！');
          this.getVersionSelectList();
          this.setState({ selectData: [] });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  // 批量关闭
  handleClose = () => {
    const { selectData } = this.state;
    deleteModal({
      title: '提示',
      content: '确定批量关闭吗？',
      okCallback: () => {
        closeFromVersion({ issueKeyList: selectData.map(it => it.issueKey) }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('批量关闭成功！');
          this.getVersionSelectList();
          this.setState({ selectData: [] });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });

  }

  render() {
    const { versionList, versionSelect, verListLoading, verSelectLoading, verSelectListLoading,
      userProductFlag, subProductAll, allProductUser, drawerIssueId
    } = this.props;
    const { activeId, productId, filterObj, stateVersionSelectList, showCheckbox, selectData } = this.state;

    const { productid } = this.props.location.query;

    const displayProduct = (versionSelect && versionSelect.product) || {};


    return ([
      <div className='f-jcsb-aic' style={{ marginBottom: '6px' }}>
        <div className='f-aic u-mgb10'>
          <span className={styles.versionIcon}>
            <MyIcon type="icon-banben2" className={styles.icon} />
          </span>
          <span className='u-mgl10 f-fs3 font-pfm'>版本列表</span>
        </div>
        <div>
          <span style={{ position: 'relative', top: '-4px' }}>
            <VersionForm
              dispatch={this.props.dispatch}
              productId={productId}
              okCallback={(newVersionId) => {
                this.getNextVersion(newVersionId);
                this.props.dispatch({
                  type: 'version/getVersionList', payload: {
                    productId: productId, ...filterObj, state: [VERISON_STATUS_MAP.NEW, VERISON_STATUS_MAP.OPEN]
                  }
                });
              }}
              subProductAll={subProductAll}
              create
              trigger={<Button type='primary'>
                创建版本
              </Button>}
            />
          </span>
        </div>
      </div>,
      <DragDropContext onDragEnd={this.onDragEnd}>

        <Row>
          {/* 版本列表 */}
          <Col style={{
            width: '236px',
            padding: '0px',
          }}
          className={`${styles.centerStyle} f-ib f-vat`}>
            <div>
              {
                <Spin spinning={!!verListLoading}>
                  <VersionQueryArea
                    subProductAll={subProductAll}
                    form={this.props.form}
                    updateVersion={this.updateVersion}
                    resetVersion={this.resetVersion}
                  />
                  {versionList.length ?
                    <div className={styles.centerScroll}>
                      {
                        versionList.map(it => (
                          <div
                            className="f-csp"
                            onClick={() => this.handleChangeVersion(it.version.id)}
                          >
                            <Droppable
                              droppableId={`droppable-center-${it.version.id}`}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className='hoverItem'
                                  ref={provided.innerRef}
                                  style={getCenterListStyle(snapshot.isDraggingOver, it.version.id === activeId)}>
                                  <div className="f-fw">
                                    <TextOverFlow content={it.version.name} maxWidth={'8vw'} />
                                    <span className="f-fr">
                                      <Tag style={{ width: '52px', textAlign: 'center' }} color={versionColor[it.version.state]}>
                                        {versionMap[it.version.state]}
                                      </Tag>
                                    </span>
                                  </div>
                                  <div className={`f-jcsb u-mgt10 ${styles.centerTime}`}>
                                    <span>
                                      {it.version.endtime === 0 ? '-' : moment(it.version.endtime).format('YYYY-MM-DD')}
                                    </span>
                                    <Popover content={`${it.product && it.product.name}/${it.subProduct && it.subProduct.name}`}>
                                      <span className='f-fr f-toe' style={{ width: '100px' }}>
                                        {it.product && it.product.name}/
                                        {it.subProduct && it.subProduct.name}
                                      </span>
                                    </Popover>
                                  </div>
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        ))
                      }
                    </div> :
                    <div className={styles.centerScroll}>
                      <Empty style={{ marginTop: '100px' }} />
                    </div>
                  }

                </Spin>
              }
            </div>
          </Col>

          {/* 版本内容 */}
          <Col style={{ width: 'calc(100% - 236px)', height: 'calc(62vh + 128px)' }} className={`${styles.rightStyle} f-ib f-vat`}>
            {
              !Object.keys(versionSelect).length ?
                <div className="u-mgl10">请先选择版本</div> :
                <Spin spinning={!!verSelectLoading || !!verSelectListLoading}>
                  <Header
                    dispatch={this.props.dispatch}
                    form={this.props.form}
                    versionSelect={versionSelect}
                    versionList={versionList}
                    userProductFlag={userProductFlag}
                    activeId={activeId}
                    filterObj={filterObj}
                    getNextVersion={this.getNextVersion}
                    versionSelectList={stateVersionSelectList}
                    getVersionSelectList={this.getVersionSelectList}
                    getVersionList={this.getVersionList}
                    displayProduct={displayProduct}
                  />
                  <div className='f-jcsb-aic u-mgb10'>
                    <ContentQueryArea
                      updateContentObj={this.updateContentObj}
                    />
                    <span style={{ paddingRight: '8px' }}>
                      <AddWorkItem
                        subProductAll={subProductAll}
                        allProductUser={allProductUser}
                        productid={productid}
                        versionId={activeId}
                        getVersionSelectList={this.getVersionSelectList}
                      />
                    </span>
                  </div>

                  <div>
                    <Droppable droppableId={`droppable-right`}>
                      {(provided, snapshot) => (
                        stateVersionSelectList && stateVersionSelectList.length ?
                          <div
                            ref={provided.innerRef}
                            className={styles.rightContent}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            <VersionAddList
                              versionSelectList={stateVersionSelectList}
                              dispatch={this.props.dispatch}
                              activeId={activeId}
                              showCheckbox={showCheckbox}
                              setSelectData={this.setSelectData}
                              selectData={selectData}
                            />
                            {provided.placeholder}
                          </div> :
                          <div
                            ref={provided.innerRef}
                            style={getEmptyListStyle(snapshot.isDraggingOver)}
                          >
                            <Empty
                              style={{ marginTop: '30px' }}
                              description={
                                <span className={styles.emptyTip}>
                                  暂无需求
                                </span>
                              }>
                              {provided.placeholder}
                            </Empty>
                          </div>
                      )}
                    </Droppable>
                    {/* 批量操作 */}
                    {
                      !!stateVersionSelectList.length &&
                      <div className="f-jcsb-aic u-mgt20">
                        {
                          !showCheckbox &&
                          <span className="u-mgl15">共{stateVersionSelectList.length}个</span>
                        }

                        {
                          showCheckbox &&
                          <span className="u-mgl20">
                            <Checkbox
                              onChange={e => {
                                this.setState({ selectData: e.target.checked ? stateVersionSelectList : [] });
                              }}
                              checked={selectData.length === stateVersionSelectList.length}
                            ></Checkbox>
                            <span className="u-mgr10 u-mgl10">
                              已选择
                              <span>{selectData.length}</span>项
                            </span>
                            {
                              !!selectData.length &&
                              <span>
                                <BatchUpdate
                                  data={selectData}
                                  productId={productid}
                                  refreshFun={() => {
                                    this.setState({ selectData: [] });
                                    this.getVersionSelectList();
                                  }}
                                />
                                <a className="u-mgl10" onClick={() => this.handleRemove()}>移除版本</a>
                                <a className="u-mgl10" onClick={() => this.handleClose()}>批量关闭</a>
                              </span>
                            }
                          </span>
                        }
                        <span>
                          {
                            showCheckbox ?
                              <Button onClick={() => { this.setState({ showCheckbox: false, selectData: [] }) }}>取消操作</Button>
                              :
                              <Button onClick={() => this.setState({ showCheckbox: true })}>批量操作</Button>
                          }
                        </span>
                      </div>
                    }
                  </div>
                </Spin>
            }
          </Col>
        </Row>

      </DragDropContext>,
      <span>
        {
          drawerIssueId &&
          <DrawerComponent
            refreshFun={() => {
              this.getVersionSelectList();
            }}
          />
        }
      </span>
    ]);
  }
}

const mapStateToProps = (state) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,

    versionList: state.version.versionList,
    versionSelect: state.version.versionSelect,
    versionSelectList: state.version.versionSelectList,
    verListLoading: state.loading.effects['version/getVersionList'],
    verSelectLoading: state.loading.effects[getVersionSelectType],
    verSelectListLoading: state.loading.effects[getVersionSelectListType],
    poolUserList: state.version.poolUserList,
    versionUserList: state.version.versionUserList,
    userProductFlag: state.product.userProductFlag,
    lastProduct: state.product.lastProduct,
    subProductAll: state.product.enableSubProductList, // 产品下的所有子产品
    allProductUser: state.product.allProductUser, // 产品下的所有用户
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
