import React, { Component } from 'react';
import { connect } from 'dva';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CaretRightOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Collapse, Modal, Row, Table, Tag, message, Spin, Empty } from 'antd';
import { kanbanChangeState } from '@services/version';
import { requirementNameMap, requirementColorMap } from '@shared/CommonConfig';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import { calculateDwm, drawerDelayFun } from '@utils/helper';
import IssueCard from '@pages/receipt/components/issue_card';
import { INCLUDE_PUBLISH, STATUS_CODE, STATUS_CODE_MAP } from '@shared/ReceiptConfig';
import { TASK_STATUS_MAP } from '@shared/TaskConfig';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';
import Header from './components/Header';
import QueryArea from './components/QueryArea';
import styles from './index.less';

const { Panel } = Collapse;
const DrawerComponent = DrawerHOC()(DrawerShared);

const drawerDispatch = 'receipt/saveDrawerIssueId';

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  // padding: grid,
  border: '1px #E8EAEC solid', // @color-black-3
  borderRadius: '2px',
  background: '#fffff', // @color-white-1
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '#F1F3F5', //@color-blue-1 @color-black-2
  padding: grid,
  margin: grid,
  width: '24%',
  marginBottom: '0px',
});

const getListStyleClose = isDraggingOver => ({
  padding: grid,
  margin: grid,
  width: '24%'
});

/**
 * @description - TASK_STATUS_MAP和BUG_STATUS_MAP一样，这里统一用的TASK_STATUS_MAP作为映射
 */
class index extends Component {
  state = {
    filterObj: {},
    showAll: true,
    activeKey: 'all',
    visible: false,
    manpowerVisible: false,
    manpowerData: [],

    draggableId: '',
    source: {},
    destination: {},
    type: 'close',
  };

  columns = [
    {
      title: '负责人',
      dataIndex: 'realname',
      key: 'realname',
      render: (text, record) => {
        return record.realname;
      }
    },
    {
      title: '预估工作量(人天)',
      dataIndex: 'estimate',
      key: 'estimate',
      render: (text, record) => {
        return record.estimate ? calculateDwm(record.estimate) : '0';
      }
    },
    {
      title: '实际工作量(人天)',
      dataIndex: 'act',
      key: 'act',
      render: (text, record) => {
        return record.act ? calculateDwm(record.act) : '0';
      }
    }
  ];

  componentDidMount() {
    const { versionid, productid } = this.props.location.query;
    const params = {
      productId: productid,
      state: INCLUDE_PUBLISH,
    };
    this.props.dispatch({ type: 'version/getVersionList', payload: params });

    this.props.dispatch({ type: 'version/getVersionSelect', payload: { id: versionid } });
    this.props.dispatch({ type: 'version/getKanbanResponseUserList', payload: { versionid: versionid } });
    this.props.dispatch({ type: 'version/getKanbanRequireUserList', payload: { versionid: versionid } });
    this.getVersionKanban();
  }

  getVersionKanban = () => {
    const { versionid } = this.props.location.query;
    const { filterObj } = this.state;
    this.props.dispatch({ type: 'version/getVersionKanban', payload: { versionid: versionid, ...filterObj } });
  }

  handleModalOK = () => {
    const { versionid } = this.props.location.query;
    const { form: { getFieldValue } } = this.props;
    const { draggableId } = this.state;

    this.setState({ visible: false });

    const params = {
      versionid: versionid,
      type: draggableId.split('-')[1],
      id: draggableId.split('-')[0],
      targetstate: getFieldValue('radio'),
    };

    kanbanChangeState(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('状态变更成功！');
      this.getVersionKanban();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  onDragStart = (start) => {
    const droppableId = start.source.droppableId;
    const arr = droppableId.split('-');
    if (arr[2] && arr[2] !== `${STATUS_CODE_MAP.DONE}`) {
      // 处理取消与关闭
      this.setState({ [`drop-${start.type}`]: true });
    }
  }

  onDragEnd = (result) => {
    const { draggableId, source, destination } = result;
    const { versionid } = this.props.location.query;
    const { type } = this.state;

    let params = {};
    // 拖拽到关闭列需要的
    this.setState({
      draggableId,
      source,
      destination,
    });

    this.setState({ [`drop-${result.type}`]: false });

    // 拖拽不在可用区域内
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // 暂不考虑排序
      return;
    } else {
      const droppableArr = destination.droppableId.split('-');
      let commonParams = {
        versionid: versionid,
        type: draggableId.split('-')[1],
        id: draggableId.split('-')[0]
      };
      if (Number(droppableArr[2]) === STATUS_CODE_MAP.DONE) {
        params = {
          ...commonParams,
          targetstate: type === 'close' ? TASK_STATUS_MAP.CLOSE : TASK_STATUS_MAP.CANCLE,
        };
      } else {
        params = {
          ...commonParams,
          targetstate: Number(droppableArr[2]) === STATUS_CODE_MAP.TODO ? TASK_STATUS_MAP.REOPEN : Number(droppableArr[2]),
        };
      }

      kanbanChangeState(params).then(r => {
        if (r.code !== 200) return message.error(r.msg);
        message.success('状态变更成功！');
        this.getVersionKanban();
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  };

  // 这里把其他(key 为 0)放在最后
  getHeaderName = (item) => {
    const { versionKanban } = this.props;
    return (<Row>
      <span>{Number(item) !== 0 ?
        <span>
          {
            versionKanban.titleMap[item].parentRequirementId ?
              <span>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.dispatch({ type: drawerDispatch, payload: `Feature-${versionKanban.titleMap[item].parentRequirementId}` });
                  }}
                >{versionKanban.titleMap[item].parentRequirementName}</a> /
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.dispatch({ type: drawerDispatch, payload: `Feature-${versionKanban.titleMap[item].requirementId}` });
                  }}
                >{versionKanban.titleMap[item].requirementName}</a>
              </span> :
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.dispatch({ type: drawerDispatch, payload: `Feature-${versionKanban.titleMap[item].requirementId}` });
                }}
              >{versionKanban.titleMap[item].requirementName}</a>
          }
        </span>
        : '其他内容'}
      </span>
      <span className='u-mgl30'>{versionKanban.titleMap[item].requirementResponseUser ? versionKanban.titleMap[item].requirementResponseUser.realname : '-'}</span>
      <span className='u-mgl30'>
        {
          versionKanban.titleMap[item].requirementState ?
            <Tag color={requirementColorMap[versionKanban.titleMap[item].requirementState]}>
              {requirementNameMap[versionKanban.titleMap[item].requirementState]}</Tag> :
            <span>-</span>
        }
      </span>
    </Row>);
  }

  onChange = (key) => {
    this.setState({ activeKey: key });
  }

  onClickShowAll = () => {
    const { showAll } = this.state;

    this.setState({
      showAll: !showAll,
      activeKey: !showAll ? 'all' : [],
    });
  }

  onClickManpower = () => {
    const { kanbanResponseUserList, versionKanban } = this.props;
    let manpowerData = [];
    let userMap = {};
    if (kanbanResponseUserList && kanbanResponseUserList.length) {
      kanbanResponseUserList.map(it => {
        if (!userMap[it.realname]) {
          manpowerData.push({
            realname: it.realname,
            estimate: 0,
            act: 0
          });
          userMap[it.realname] = 1;
        }
      });
    }

    //计算预估与实际
    let contentMap = versionKanban && versionKanban.contentMap ? versionKanban.contentMap : {};
    const keys = Object.keys(contentMap);
    keys.map(it => {
      let stateMap = contentMap[it] ? contentMap[it] : {};
      const statekeys = Object.keys(stateMap);
      statekeys.map(item => {
        let stateContents = stateMap[item];
        stateContents.map(item2 => {
          const responseUser = item2.responseUser;
          let currentUserManpower = manpowerData.filter(i => i.realname === responseUser.name);

          if (currentUserManpower && currentUserManpower[0]) {
            const estimateValue = item2.dwManpower && item2.dwManpower.estimate ? item2.dwManpower.estimate: 0 ;
            // 4为关闭
            if (item2.state === TASK_STATUS_MAP.CLOSE) {
              currentUserManpower[0].act += item2.estimateCostSeconds;
            }
            currentUserManpower[0].estimate += estimateValue;
          }
        });

      });
    });

    console.log(userMap, manpowerData);

    this.setState({
      manpowerVisible: true,
      manpowerData: manpowerData
    });
  }

  updateFilter = (key, value) => {
    const { versionid } = this.props.location.query;
    const { filterObj } = this.state;
    const newFilterObj = {
      ...filterObj,
      [key]: value,
    };
    const params = {
      versionid: versionid,
      ...newFilterObj,
    };
    this.props.dispatch({ type: 'version/getVersionKanban', payload: params });
    this.setState({ filterObj: newFilterObj });
  }

  getIsEmpty = (obj) => {
    let empty = false;
    let sum = 0;
    if (!Object.keys(obj).length) {
      empty = true;
    } else {
      Object.keys(obj).forEach(it => {
        sum += obj[it].length;
      });
      if (sum === 0) {
        empty = true;
      }
    }
    return empty;
  }

  getCommonCard = (item, it) => {
    const { versionKanban } = this.props;

    return (
      versionKanban.contentMap[item][it] && versionKanban.contentMap[item][it].map((i, index) => (
        <Draggable
          key={`${i.id}-${i.type}`}
          draggableId={`${i.id}-${i.type}`}
          index={index}>
          {(provided, snapshot) => (
            <div
              className={styles.itemStyle}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
              onClick={(e) => {
                e.stopPropagation();
                drawerDelayFun(() => {
                  this.props.dispatch({ type: drawerDispatch, payload: i.issueKey });
                }, 200);
              }}
            >
              <IssueCard data={i} style={{ border: 'unset' }} />
            </div>
          )}
        </Draggable>
      ))
    );
  }

  handleFocusKey = (type) => {
    this.setState({ type });
  }

  getHeight = (item) => {
    const { versionKanban } = this.props;
    const obj = versionKanban.contentMap[item];
    let max = 1;
    if (obj && Object.keys(obj).length > 0) {
      for (let i in obj) {
        if (obj[i] && obj[i].length > max) {
          max = obj[i].length;
        }
      }
    }
    return max * 60;
  }

  getPanelContent = (item) => {
    const { versionKanban } = this.props;

    const state = versionKanban.titleMap[item].requirementState;
    return (
      <Panel
        className={`${styles.collapseStyle} ${state === REQUIREMENT_STATUS_MAP.NEW ? styles.collapseStart : state === REQUIREMENT_STATUS_MAP.DEVELOPMENT ? styles.collapsePending : state === 0 ? '' : styles.collapseEnd}`}
        header={this.getHeaderName(item)}
        key={item}
      >
        <div style={{ display: 'flex' }}>
          {this.getIsEmpty(versionKanban.contentMap[item]) ?
            <div className={styles.emptyStyle}>暂无数据</div> :
            Object.keys(STATUS_CODE).map((it, index) => (
              <Droppable droppableId={`droppable-${item}-${it}`} type={item}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={Number(it) === STATUS_CODE_MAP.DONE && this.state[`drop-${item}`] ?
                      getListStyleClose(snapshot.isDraggingOver) :
                      getListStyle(snapshot.isDraggingOver)}
                  >
                    {
                      Number(it) === STATUS_CODE_MAP.DONE && this.state[`drop-${item}`] ?
                        <span>
                          <div
                            className={styles.close}
                            onMouseOver={() => this.handleFocusKey('close')}
                            style={{ height: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, lineHeight: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, position: 'sticky', top: 0 }}
                          >
                            关闭
                          </div>
                          <div
                            className={styles.cancel}
                            onMouseOver={() => this.handleFocusKey('cancel')}
                            style={{ height: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, lineHeight: `${this.getHeight(item) > 150 ? 150 : this.getHeight(item)}px`, position: 'sticky', top: this.getHeight(item) > 150 ? 150 : this.getHeight(item) }}
                          >
                            取消
                          </div>
                        </span>
                        : this.getCommonCard(item, it)
                    }
                    {!(Number(it) === STATUS_CODE_MAP.DONE && this.state[`drop-${item}`]) && provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))
          }
        </div>
      </Panel>
    );
  }

  render() {
    const { drawerIssueId } = this.props;
    const { versionSelect, kanbanResponseUserList, kanbanRequireUserList, versionKanban, versionList, versionKanbanLoading } = this.props;
    const { showAll, activeKey, manpowerVisible, manpowerData } = this.state;

    const ids = (versionKanban && versionKanban.titleMap) ? Object.keys(versionKanban.titleMap) : [];
    const getNumber = (value) => {
      let number = 0;
      const { contentMap } = this.props.versionKanban;
      for (let key in contentMap) {
        if (contentMap[key][value]) {
          number = number + contentMap[key][value].length;
        }
      }
      return number;
    };

    return (
      <div>
        <Header
          updateFilter={this.updateFilter}
          versionSelect={versionSelect}
          versionList={versionList}
          {...this.props}
        />
        <div style={{ padding: '0px 20px 20px 20px' }}>
          <ul className={`${styles.ulStyle}`}>
            {
              Object.keys(STATUS_CODE).map(it => (
                <li className={styles.liStyle}>
                  <span>{STATUS_CODE[it]} {getNumber(it)}</span>
                </li>
              ))
            }
          </ul>
          <div className="bgWhiteModel" style={{ paddingTop: '0px' }}>
            <div style={{ lineHeight: '53px', padding: '0px 10px' }}>
              <QueryArea
                updateFilter={this.updateFilter}
                kanbanResponseUserList={kanbanResponseUserList}
                kanbanRequireUserList={kanbanRequireUserList}
              />
              <a className="f-fr f-fs2 f-csp" onClick={this.onClickShowAll}>
                {showAll ? '折叠全部泳道' : '展开全部泳道'}
              </a>
              <span className="f-fr f-fs2 f-csp">
                &nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
              <a className="f-fr f-fs2 f-csp" onClick={this.onClickManpower}>
                工作量汇总
              </a>
            </div>
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
              <Spin spinning={!!versionKanbanLoading}>
                {
                  versionKanban.titleMap && Object.keys(versionKanban.titleMap).length ?
                    <Collapse
                      bordered={false}
                      activeKey={activeKey === 'all' ? ids : activeKey}
                      onChange={this.onChange}
                      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    >
                      {
                        versionKanban.titleMap && Object.keys(versionKanban.titleMap).map(item => (
                          Number(item) !== 0 && this.getPanelContent(item)
                        ))
                      }
                      {
                        versionKanban.titleMap && versionKanban.titleMap[0] &&
                        this.getPanelContent('0')
                      }
                    </Collapse> :
                    <Empty />
                }
              </Spin>
            </DragDropContext>
          </div>
        </div>

        <Modal
          title="工作量汇总"
          visible={manpowerVisible}
          onCancel={() => this.setState({ manpowerVisible: false })}
          onOk={() => this.setState({ manpowerVisible: false })}
          maskClosable={false}
          footer={null}
        >
          <div>
            <Table
              dataSource={manpowerData}
              columns={this.columns}
              pagination={false}
            />
          </div>
        </Modal>
        <span>
          {
            drawerIssueId &&
            <DrawerComponent
              refreshFun={() => {
                this.getVersionKanban();
              }}
            />
          }
        </span>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    versionList: state.version.versionList,
    versionSelect: state.version.versionSelect,
    kanbanResponseUserList: state.version.kanbanResponseUserList,
    kanbanRequireUserList: state.version.kanbanRequireUserList,
    versionKanban: state.version.versionKanban,
    versionKanbanLoading: state.loading.effects['version/getVersionKanban'],
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
