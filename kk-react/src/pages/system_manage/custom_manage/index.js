import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  message,
  Button,
  Spin,
  Divider,
  Tooltip,
  Modal,
  Card,
  Tag,
  Switch,
  Popconfirm,
  Empty,
} from 'antd';
import { connect } from 'dva';
import TextOverFlow from '@components/TextOverFlow';
import { getCustomManageList } from '@services/system_manage';
import { addCustomManage, getCustomManageInfo, updateCustomManage, setCustomValue, deleteCustom, updateSortValue, updateCustomRequired, updateCustomState, refreshCustomField } from '@services/system_manage';
import { deleteModal } from '@shared/CommonFun';
import MyIcon from '@components/MyIcon';
import MoveModal from '@pages/product_setting/issue_setting/components/custom_manage/components/MoveModal';
import { CUSTOME_TYPE_NAME_MAP, CUSTOME_TYPE_MAP, CUSTOME_REQUIRED, ISSUE_CUSTOM_USE, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';
import { FIELD_TYPE, UPDATE_TYPE } from '@shared/SystemManageConfig';
import CustomForm from './components/CustomForm';
import CascaderForm from './components/CascaderForm';
import SelectForm from './components/SelectForm';
import { getSelectData, getCascaderData, getMaxValue } from './components/SaveFun';
import styles from './index.less';

const selectAndCascader = [CUSTOME_TYPE_MAP.SELECT, CUSTOME_TYPE_MAP.MULTISELECT, CUSTOME_TYPE_MAP.CASCADER];

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '', //@color-blue-1
  margin: '0px, 15px',
});

const getItemStyle = (isDragging, draggableStyle) => {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    userSelect: 'none',
    padding: '10px 15px',
    background: isDragging ? '#E6F5FF' : 'white', // @color-blue-1
    cursor: 'move',
    borderBottom: '1px solid #F5F7F9',

    // 默认样式
    ...draggableStyle
  };
};

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      data: [],
      editData: {},

      selectObj: {
        selectData: [{ customlabel: '', customvalue: '' }],
        deleteSelectData: [],
        defaultSelectData: [],
        selectChecked: false,
        defaultSelectChecked: false,
      },

      cascaderObj: {
        cascaderData: [],
        defaultCascaderData: [],
        cascaderChecked: true,
        defaultCascaderChecked: true,
      },

      dialogType: '', // create创建 edit编辑
      current: '', // basic创建编辑基本字段页面，cascader，级联，select，多选单选
      record: {},
      refreshLoading: false,
    };

    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '20vw',
        render: (text, record) => {
          const flag = record.system === FIELD_TYPE.SYSTEM;
          return (<span>
            {
              record.updateState !== UPDATE_TYPE.NOCHANGE && flag &&
              <Tooltip title="当前字段已更改，尚未生效！">
                <MyIcon type="icon-warning" />
              </Tooltip>
            }

            {flag && <Tag color="blue">系统</Tag>}
            <TextOverFlow maxWidth={'15vw'} content={text} />
          </span>);
        }
      },
      {
        title: '应用范围',
        dataIndex: 'fanwei',
        width: '10vw',
        render: (text, record) => {
          const list = record.customFieldIssueVOList || [];
          if (list && list.length) {
            if (list.length === 7) {
              return '全部类型';
            } else {
              return <TextOverFlow maxWidth={'8vw'} content={list.map(it => it.issueName).join(',')} />;
            }
          } else {
            return '-';
          }
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: '10vw',
        render: (text, record) => {
          return record.type ?
            <span>{CUSTOME_TYPE_NAME_MAP[record.type]}</span>
            : '-';
        }
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: '10vw',
        render: (text, record) => {
          return record.description ?
            <TextOverFlow maxWidth={'10vw'} content={record.description} />
            : '-';
        }
      },
      {
        title: '是否必填',
        dataIndex: 'required',
        width: '100px',
        render: (text, record) => {
          const flag = record.required === CUSTOME_REQUIRED.REQUIRED ? true : false;
          // 1必填 2选填
          return (<span>
            <Popconfirm
              title="修改后将直接影响页面的字段显示?"
              onConfirm={() => this.handleChangeState(record.id, 'required', !flag)}
              okText="确定"
              cancelText="取消"
            >
              <Switch checked={text === CUSTOME_REQUIRED.REQUIRED} />
            </Popconfirm>
          </span>
          );
        }
      },
      // {
      //   title: '默认值',
      //   dataIndex: 'moren',
      //   width: '150px',
      //   render: (text, record) => {
      //     return (<span>
      //       <DefaultValue data={record} getCustomManageList={this.getCustomManageList} />
      //     </span>)
      //   }
      // },
      // {
      //   title: '是否生效',
      //   dataIndex: 'updateState',
      //   width: '100px',
      //   render: (text, record) => {
      //     return (<span>
      //       {text === 1 ? '生效' : '未生效'}
      //     </span>)
      //   }
      // },
      {
        title: '是否使用',
        dataIndex: 'state',
        width: '100px',
        render: (text, record) => {
          const flag = record.state === ISSUE_CUSTOM_USE.OPEN ? true : false;

          return (<span>
            <Popconfirm
              title="修改后将直接影响页面的字段显示?"
              onConfirm={() => this.handleChangeState(record.id, 'state', !flag)}
              okText="确定"
              cancelText="取消"
            >
              <Switch checked={text === ISSUE_CUSTOM_USE.OPEN} />
            </Popconfirm>
          </span>
          );
        }
      },
      {
        title: '关联产品',
        dataIndex: 'productCustomFieldVOList',
        width: '100px',
        render: (text, record) => {
          const arr = text || [];
          if (arr.length) {
            if (arr.length === 1) {
              return <TextOverFlow content={arr[0].productVO && arr[0].productVO.name} maxWidth={'90px'} />;
            } else {
              return (<Tooltip title={<div style={{ maxHeight: '200px', overflow: 'auto' }}>
                {
                  arr.map(it => <div>
                    {it.productVO && it.productVO.name}
                  </div>)
                }
              </div>}>
                <div className={styles.relateStyle}>{arr.length}</div>
              </Tooltip>);
            }
          } else {
            return '/';
          }
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: '210px',
        render: (text, record) => {
          const flag = record.system === FIELD_TYPE.SYSTEM;
          return (<div>
            {
              selectAndCascader.some(it => it === record.type) &&
              [<a onClick={() => this.handleSetCustom(record)}>值设置</a>,
                <Divider type="vertical" />]
            }
            <a onClick={() => this.getCustomManageInfo(record)}>编辑</a>
            {flag &&
              <span>
                <Divider type="vertical" />
                <span>
                  <MoveModal
                    getList={this.getList}
                    record={record}
                    list={this.state.data}
                    type='system'
                  />
                </span>
              </span>
            }

            <Divider type="vertical" />
            <a className='delColor'
              onClick={() => { this.setState({ record }, () => this.handleDelete()) }}>
              删除
            </a>
          </div>);
        }
      },
    ];
  }

  componentDidMount() {
    this.getCustomManageList();
  }

  getCustomManageList = () => {
    this.setState({ loading: true });
    getCustomManageList().then(res => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result || [] });
    }).catch(err => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });
  }

  getCustomManageInfo = (record) => {
    this.setState({ visible: true, dialogType: 'edit', current: 'basic', record });

    getCustomManageInfo(record.id).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ editData: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  setSelectData = (type, data) => {
    const { selectObj } = this.state;
    const newSelectObj = {
      ...selectObj,
      [type]: data,
    };
    this.setState({ selectObj: newSelectObj });
  }

  setCascaderData = (type, data) => {
    const { cascaderObj } = this.state;
    const newCascaderObj = {
      ...cascaderObj,
      [type]: data,
    };

    this.setState({ cascaderObj: newCascaderObj });
  }

  handleSetCustom = (record) => {
    this.setState({
      record,
      visible: true,
      dialogType: 'edit',
      current: record.type === CUSTOME_TYPE_MAP.CASCADER ? 'cascader' : 'select'
    });
  }

  handleChangeState = (id, type, value) => {
    const params = {
      customfieldid: id,
      [type]: value ? CUSTOME_REQUIRED.REQUIRED : CUSTOME_REQUIRED.NOT_REQUIRED,
    };
    const fun = type === 'required' ? updateCustomRequired(params) : updateCustomState(params);
    const result = Promise.resolve(fun);
    result.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更改成功！');
      this.getCustomManageList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    const { record } = this.state;
    const id = record.id;
    const productCustomFieldVOList = record.productCustomFieldVOList || [];

    deleteModal({
      title: '确认删除吗？',
      content: <div>
        {
          !productCustomFieldVOList.length &&
          <div>此操作将影响已应用当前字段的产品，此操作不可恢复。</div>
        }
        {
          !!productCustomFieldVOList.length &&
          <div>
            {
              record.system === FIELD_TYPE.CUSTOM ?
                <span>
                  <div>以下产品的事项中使用了该属性，建议先从产品内删除。</div>
                  {
                    productCustomFieldVOList.map(it => <div>
                      {it.productVO && it.productVO.name}
                    </div>)
                  }
                </span>
                :
                <div>此操作将影响已应用当前字段的产品，此操作不可恢复。</div>
            }
          </div>
        }
      </div>,
      okCallback: () => {
        const params = {
          id: id,
        };
        deleteCustom(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除成功！');
          this.getCustomManageList();
          this.setState({ record: {}, editData: {} });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handleOk = () => {
    const { dialogType, current, selectObj, cascaderObj, data, record } = this.state;

    this.props.form.validateFields((err, values) => {
      if (current === 'basic' && err) {
        return;
      }

      const type = values.type || record.type;

      let params = {
        ...values,
        state: values.state ? ISSUE_CUSTOM_USE.OPEN : ISSUE_CUSTOM_USE.CLOSE,
        required: values.required ? CUSTOME_REQUIRED.REQUIRED : CUSTOME_REQUIRED.NOT_REQUIRED,
        sortvalue: getMaxValue(data) + 1,
      };

      if (current !== 'basic') {
        if ((type === CUSTOME_TYPE_MAP.SELECT || type === CUSTOME_TYPE_MAP.MULTISELECT)) {
          if (getSelectData(selectObj).some(i => !i.customlabel)) {
            return message.warn('值不能为空');
          }
          if (!getSelectData(selectObj).length && selectObj.defaultSelectChecked === selectObj.selectChecked) {
            return message.warn('值设置不能为空/未发生改变！');
          }
        } else if (type === CUSTOME_TYPE_MAP.CASCADER && !getCascaderData(cascaderObj).length && cascaderObj.defaultCascaderChecked === cascaderObj.cascaderChecked) {
          return message.warn('值设置不能为空/未发生改变！');
        }
      }

      if (dialogType === 'create') {
        addCustomManage(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('字段创建成功！');
          this.setState({ dialogType: '', current: '', visible: false });
          if (values.type === CUSTOME_TYPE_MAP.SELECT || values.type === CUSTOME_TYPE_MAP.MULTISELECT) {
            // 调用创建select的接口
            this.saveSelectData(res.result);
          } else if (values.type === CUSTOME_TYPE_MAP.CASCADER) {
            // 调用创建cascader的接口
            this.saveCascaderData(res.result);
          } else if (values.type === CUSTOME_TYPE_MAP.INTERGER || values.type === CUSTOME_TYPE_MAP.DECIMAL) {
            // 整数或者小数单位
            this.saveNumber(res.result);
          } else {
            this.getCustomManageList();
          }
        }).catch(err => {
          return message.error(err || err.message);
        });
      } else if (dialogType === 'edit') {
        if (current === 'basic') {
          this.updateCustomManage(values);
        } else if (current === 'select') {
          this.saveSelectData();
        } else if (current === 'cascader') {
          this.saveCascaderData();
        }
      }

    });
  }

  updateCustomManage = async (values) => {
    const { editData } = this.state;
    const params = {
      ...values,
      id: editData.id,
    };

    let promiseArr = [];
    if (editData.type === CUSTOME_TYPE_MAP.INTERGER || editData.type === CUSTOME_TYPE_MAP.DECIMAL) {
      promiseArr = [updateCustomManage(params),
        this.saveNumber(editData.id)];
    } else {
      promiseArr = [updateCustomManage(params)];
    }

    await Promise.allSettled(promiseArr);
    message.success('更新成功！');
    this.getCustomManageList();
    this.setState({ visible: false, record: {}, editData: {} });
  }

  // 整数或者小数的单位需要调用setCustomValue
  saveNumber = (id) => {
    const { form: { getFieldValue } } = this.props;
    const { record } = this.state;

    const params = {
      customfieldid: id || record.id,
      attributeValue: '',
      value: getFieldValue('danwei'),
    };
    this.setState({ visible: false });
    this.getCustomManageList();
    return setCustomValue(params);
  }

  saveSelectData = (id) => {
    const { selectObj, record, selectObj: { selectChecked } } = this.state;
    let newData = getSelectData(selectObj);

    const params = {
      customfieldid: id || record.id,
      attributeValue: selectChecked ? CUSTOM_SELECTTYPE_MAP.TILE : CUSTOM_SELECTTYPE_MAP.SELECT,
      value: JSON.stringify(newData),
    };
    this.setCustomValue(params);
  }

  saveCascaderData = (id) => {
    const { cascaderObj, cascaderObj: { cascaderChecked }, record } = this.state;
    let lastData = getCascaderData(cascaderObj);

    const params = {
      customfieldid: id || record.id,
      attributeValue: cascaderChecked ? CUSTOM_SELECTTYPE_MAP.TILE : CUSTOM_SELECTTYPE_MAP.SELECT,
      value: JSON.stringify(lastData),
    };
    this.setCustomValue(params);
  }

  setCustomValue = (params) => {
    this.setState({ visible: false });
    const promise = setCustomValue(params);
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('值设置成功！');
      this.setState({
        visible: false,
        selectObj: {
          selectData: [{ customlabel: '', customvalue: '' }],
          deleteSelectData: [],
          defaultSelectData: [],
          selectChecked: false,
          defaultSelectChecked: false,
        },

        cascaderObj: {
          cascaderData: [],
          defaultCascaderData: [],
          cascaderChecked: true,
          defaultCascaderChecked: true,
        },
      });
      this.getCustomManageList();
    }).catch(err => {
      return message.error(err || err.message);
    });

  }

  getFooter = () => {
    const { form: { getFieldValue } } = this.props;
    const { dialogType, current } = this.state;
    const selectType = getFieldValue('type');

    switch (current) {
      case 'basic':
        if (dialogType === 'create' && selectAndCascader.some(it => it === selectType)) {
          return [<Button onClick={() => this.setState({ visible: false })}>取消</Button>,
            <Button type="primary" onClick={() => this.setState({
              current: selectType === CUSTOME_TYPE_MAP.CASCADER ? 'cascader' : 'select'
            })}>下一步</Button>];
        } else if ((dialogType === 'create' && !selectAndCascader.some(it => it === getFieldValue('type'))) || dialogType === 'edit') {
          return [<Button onClick={() => this.setState({ visible: false, editData: {}, record: {} })}>取消</Button>,
            <Button type="primary" onClick={() => this.handleOk()}>确定</Button>];
        }
        break;
      case 'select':
      case 'cascader':
        if (dialogType === 'create') {
          return [<Button onClick={() => this.setState({ current: 'basic' })}>上一步</Button>,
            <Button onClick={() => this.setState({ visible: false, editData: {}, record: {} })}>取消</Button>,
            <Button type="primary" onClick={() => this.handleOk()}>确定</Button>];
        } else if (dialogType === 'edit') {
          return [
            <Button onClick={() => this.setState({ visible: false, editData: {}, record: {} })}>取消</Button>,
            <Button type="primary" onClick={() => this.handleOk()}>确定</Button>];
        }
        break;
      default:
        return null;
    }
  }

  getSystemItem = (data) => {
    return data.map((it, index) => <div>
      <Draggable
        key={`${it.id}`}
        draggableId={`${it.id.toString()}`}
        index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`f-aic ${styles.draggerItem}`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            {
              this.columns.map(item =>
                <div
                  className="f-ib"
                  style={{ width: item.width || '5vw' }}
                >
                  {item.render(it[item.dataIndex], it)}
                </div>)
            }
          </div>)}
      </Draggable>
    </div>);
  }

  getCustomItem = (data) => {
    return data.map((it, index) =>
      <div className={styles.customItem}>
        {
          this.columns.map(item =>
            <div
              className="f-ib"
              style={{ width: item.width || '5vw' }}
            >
              {item.render(it[item.dataIndex], it)}
            </div>)
        }
      </div>);
  }

  getTitle = () => {
    return (<div className={styles.customTitle} style={{ display: 'flex', justifyContent: 'space-between', padding: '0px 15px' }}>
      {this.columns.map(item =>
        <div
          className="f-ib"
          style={{ width: item.width || '5vw' }}
        >
          {item.title}
        </div>
      )}
    </div>);
  }

  onDragEnd = (result) => {
    const { source, destination } = result;

    // 不在目标区域
    if (!destination) {
      return;
    }

    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    // 没有变化
    if (sourceIndex === destinationIndex) {
      return;
    }

    const { data } = this.state;
    const systemData = data.filter(it => it.system === FIELD_TYPE.SYSTEM);
    const customData = data.filter(it => it.system !== FIELD_TYPE.SYSTEM);
    const targetObj = systemData[sourceIndex];
    systemData.splice(sourceIndex, 1);
    systemData.splice(destinationIndex, 0, targetObj);
    this.updateSortValue([...systemData.map(it => it.id), ...customData.map(it => it.id)]);
  }

  updateSortValue = (params) => {
    const updatePromise = new Promise((resolve, reject) => {
      resolve(updateSortValue(params));
    });
    updatePromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('排序成功！');
      this.getCustomManageList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleApply = () => {
    this.setState({ refreshLoading: true });
    refreshCustomField().then(res => {
      this.setState({ refreshLoading: false });
      if (res.code !== 200) return message.error(res.msg);
      message.success('应用已生效！');
      this.getCustomManageList();
    }).catch(err => {
      this.setState({ refreshLoading: false });
      return message.error(err || err.message);
    });
  }

  getModalTitle = () => {
    const { dialogType, current } = this.state;
    let title = '';
    if (current === 'basic') {
      if (dialogType === 'create') {
        title = '创建字段';
      } else {
        title = '编辑字段';
      }
    } else {
      title = '菜单值设置';
    }
    return title;
  }

  render() {
    const { currentUser } = this.props;
    const { data, loading, visible, dialogType, editData, current, record, refreshLoading } = this.state;
    const systemData = data.filter(it => it.system === FIELD_TYPE.SYSTEM);
    const customData = data.filter(it => it.system !== FIELD_TYPE.SYSTEM);
    const isPlatFormAdmin = currentUser && currentUser.isPlatFormAdmin;

    return (<div style={{ padding: '0px 15px' }} className={styles.container}>

      <div className='bbTitle f-jcsb-aic'>
        <span className='name'>产品协同管理</span>
        <span className='u-pdb10'>
          <Popconfirm
            title="确定要应用生效吗?"
            onConfirm={() => this.handleApply()}
            okText="确定"
            cancelText="取消"
          >
            <Button
              className='u-mgt10 u-mgl10'
              type="primary"
              loading={refreshLoading}
              disabled={!isPlatFormAdmin}
            >
              应用配置
            </Button>
          </Popconfirm>
          <Button
            className='u-mgl10'
            onClick={() => this.setState({ visible: true, dialogType: 'create', current: 'basic', record: {} })}
            type="primary"
            disabled={!isPlatFormAdmin}
          >
            创建字段
          </Button>
        </span>
      </div>
      <Spin spinning={loading}>
        <Card>
          {this.getTitle()}
          <div style={{ maxHeight: '65vh', overflow: 'auto' }}>
            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId={`droppable-custom`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}>
                    {
                      !data.length ?
                        <div style={{ height: '65vh', paddingTop: '100px' }}>
                          <Empty
                            description={
                              <span className={styles.emptyTip}>
                                暂无自定义字段
                              </span>
                            }>
                          </Empty>
                        </div> :
                        this.getSystemItem(systemData)
                    }
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="u-pd8">
              {this.getCustomItem(customData)}
            </div>
          </div>

        </Card>
      </Spin>

      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false, record: {}, editData: {} })}
        footer={this.getFooter()}
        title={this.getModalTitle()}
        width={800}
        bodyStyle={{ maxHeight: '450px', overflow: 'auto' }}
        maskClosable={false}
        destroyOnClose
      >
        {
          <div style={{ display: current === 'basic' ? 'block' : 'none' }}>
            <CustomForm {...this.props} dialogType={dialogType} editData={editData} />
          </div>
        }
        {
          <div style={{ display: current === 'select' ? 'block' : 'none' }}>
            <SelectForm setSelectData={this.setSelectData} record={record} />
          </div>
        }
        {
          <div style={{ display: current === 'cascader' ? 'block' : 'none' }}>
            <CascaderForm setCascaderData={this.setCascaderData} record={record} />
          </div>
        }
      </Modal>
    </div>);
  }
}
const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
