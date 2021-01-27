import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  message,
  Button,
  Spin,
  Divider,
  Modal,
  Card,
  Tag,
  Switch,
  Popconfirm,
  Empty,
  Popover,
} from 'antd';
import {
  getCustomData, getCustomItem, deleteCustomField, updateCustomManage, addCustomField,
  updateCustomState, updateCustomRequired, setCustomValue, updateSortValue
} from '@services/product_setting';
import { withRouter } from 'react-router-dom';
import TextOverFlow from '@components/TextOverFlow';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import { CUSTOME_TYPE_NAME_MAP, CUSTOM_SELECTTYPE_MAP, CUSTOME_TYPE_MAP, ISSUE_CUSTOM_USE, CUSTOME_REQUIRED, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import MoveModal from './components/MoveModal';
import { deleteModal } from '@shared/CommonFun';
import CustomForm from './components/CustomForm';
import CascaderForm from './components/CascaderForm';
import SelectForm from './components/SelectForm';
import DefaultValue from './components/DefaultValue';
import styles from './index.less';

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '', // @color-blue-1
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

    // styles we need to apply on draggables
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
    };

    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '20vw',
        render: (text, record) => {
          return (<span>
            {record.system === CUSTOME_SYSTEM.SYSTEM && <Tag color="blue">系统</Tag>}
            <TextOverFlow maxWidth={'12vw'} content={text} />
          </span>);
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
        title: '应用范围',
        dataIndex: 'fanwei',
        width: '10vw',
        render: (text, record) => {
          const list = record.customFieldIssueVOList || [];
          if (list && list.length === 7) {
            return '全部类型';
          } else {
            return list && list.length ?
              <TextOverFlow maxWidth={'8vw'} content={list.map(it => it.issueName).join(',')} />
              : '-';
          }
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
      {
        title: '默认值',
        dataIndex: 'moren',
        width: '150px',
        render: (text, record) => {
          return (<span>
            <DefaultValue data={record} getList={this.getList} />
          </span>);
        }
      },
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
        title: 'cloudcc表',
        dataIndex: 'cloudcc_key',
        width: '100px',
        render: (text, record) => {
          return (<span>
            {((record.type === CUSTOME_TYPE_MAP.SELECT || record.type === CUSTOME_TYPE_MAP.MULTISELECT) && text) || '-'}
          </span>);
        }
      },
      {
        title: 'cloudcc列',
        dataIndex: 'cloudcc_field',
        width: '100px',
        render: (text, record) => {
          return (<span>
            {((record.type === CUSTOME_TYPE_MAP.SELECT || record.type === CUSTOME_TYPE_MAP.MULTISELECT) && record.cloudcc_field) || '-'}
          </span>);
        }
      },
      {
        title: '操作',
        dataIndex: 'operator',
        width: '250px',
        render: (text, record) => {
          return (<div>
            {
              [CUSTOME_TYPE_MAP.SELECT, CUSTOME_TYPE_MAP.MULTISELECT, CUSTOME_TYPE_MAP.CASCADER].some(it => it === record.type) &&
              [<a onClick={() => this.handleSetCustom(record)}>值设置</a>,
                <Divider type="vertical" />]
            }
            <a onClick={() => this.getCustomManageInfo(record)}>编辑</a>
            <Divider type="vertical" />
            <span>
              <MoveModal
                getList={this.getList}
                record={record}
                productid={this.props.productid}
              />
            </span>
            <Divider type="vertical" />
            <a className='delColor'
              onClick={() => {this.setState({ record }, () => this.handleDelete()) }}>
              移除
            </a>
          </div>);
        }
      },
    ];
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    const params = {
      productid: this.props.productid,
    };
    this.setState({ loading: true });
    getCustomData(params).then(res => {
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

    const params = {
      id: record.id,
    };
    getCustomItem(params).then(res => {
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
      [type]: value ? ISSUE_CUSTOM_USE.OPEN : ISSUE_CUSTOM_USE.CLOSE,
    };
    const fun = type === 'required' ? updateCustomRequired(params) : updateCustomState(params);
    const result = Promise.resolve(fun);
    result.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更改成功！');
      this.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    const { record } = this.state;
    const params = {
      id: record.id,
    };
    const _this = this;
    deleteModal({
      title: '确认要移除吗？',
      content: `此操作将影响已应用当前字段的产品，此操作不可恢复。`,
      okCallback: () => {
        const deletePromise = Promise.resolve(deleteCustomField(params));
        deletePromise.then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('移除成功！');
          _this.getList();
          _this.setState({ record: {}, editData: {} });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  handleOk = () => {
    const { productid } = this.props.location.query;
    const { dialogType, current } = this.state;

    this.props.form.validateFields((err, values) => {
      if (current === 'basic' && err) {
        return;
      }

      let params = {
        ...values,
        state: values.state ? ISSUE_CUSTOM_USE.OPEN : ISSUE_CUSTOM_USE.CLOSE,
        required: values.required ? CUSTOME_REQUIRED.REQUIRED : CUSTOME_REQUIRED.NOT_REQUIRED,
        productid,
      };

      if (dialogType === 'create') {
        addCustomField(params).then(res => {
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
            this.getList();
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
    this.getList();
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
    this.setCustomValue(params);
  }

  saveSelectData = (id) => {
    const { selectObj: { selectData, defaultSelectData, selectChecked, defaultSelectChecked }, record } = this.state;

    if (!selectData.length || selectData.some(it => it.customlabel === '')) {
      return message.warn('不能为空!');
    }

    let newData = [];

    defaultSelectData.forEach(it => {
      if (!selectData.some(i => i.id === it.id)) {
        newData.push({
          action: 'DELETE',
          customvalueid: it.id,
          customlabel: it.customlabel,
          customvalue: it.customvalue,
        });
      }
    });

    selectData.forEach((item) => {
      const obj = defaultSelectData.find(i => i.id === item.id) || {};
      if (Object.keys(obj).length) {
        if (item.customlabel === obj.customlabel) {
          newData.push({
            action: 'none',
            customvalueid: item.id,
            customlabel: item.customlabel,
            customvalue: item.customvalue,
          });
        } else {
          newData.push({
            action: 'UPDATE',
            customvalueid: item.id,
            customlabel: item.customlabel,
            customvalue: item.customvalue,
          });
        }
      } else {
        newData.push({
          action: "ADD",
          customlabel: item.customlabel,
          customvalue: item.customvalue,
        });
      }
    });

    newData = newData.filter(i => i.action !== 'none');

    if (!newData.length && defaultSelectChecked === selectChecked) {
      return message.warn('当前没有变动！');
    }

    const params = {
      customfieldid: id || record.id,
      attributeValue: selectChecked ? CUSTOM_SELECTTYPE_MAP.TILE : CUSTOM_SELECTTYPE_MAP.SELECT,
      value: JSON.stringify(newData),
    };
    this.setCustomValue(params);
  }

  saveCascaderData = (id) => {
    const { cascaderObj: { cascaderData, cascaderChecked, defaultCascaderData, defaultCascaderChecked }, record } = this.state;
    const defaultData = defaultCascaderData;

    let newData = [];
    let addData = [];
    let updateData = [];
    let deleteData = [];

    cascaderData.forEach((item) => {
      newData.push(item);
      item.child && item.child.forEach((it) => {
        if (it.name) {
          it.parentid = item.id;
          newData.push(it);
        }
      });
    });

    defaultData.forEach(it => {
      if (!newData.some(i => i.id === it.id)) {
        deleteData.push({
          uuid: it.id,
          action: 'DELETE',
          customlabel: it.customlabel,
          customvalue: it.customlabel,
          customvalueid: it.id,
          parentid: it.parentid,
        });
      }
    });

    newData.forEach(it => {
      if (!defaultData.some(i => i.id === it.id)) {
        addData.push(it);
      } else {
        updateData.push(it);
      }
    });

    addData.forEach((item) => {
      item.action = 'ADD';
      item.customlabel = item.name;
      item.customvalue = item.name;
      item.uuid = item.id;
      item.parentid = item.child ? 0 : item.parentid;
      item.customvalueid = item.id;
      delete item.active;
      delete item.child;
      delete item.type;
    });

    updateData.forEach((it) => {
      const item = defaultData.find(i => i.id === it.id) || {};
      if (it.name !== item.customlabel) {
        it.action = 'UPDATE';
        it.customvalueid = it.id;
        it.uuid = it.id;
        it.customlabel = it.name;
      } else {
        it.customvalueid = it.id;
        it.uuid = it.id;
        it.action = 'none';
      }
      delete item.active;
      delete item.child;
      delete item.type;
    });

    updateData = updateData.filter((it) => it.action !== 'none');
    let lastData = [...deleteData, ...addData, ...updateData];
    lastData = lastData.filter(it => it.customlabel);

    if (!lastData.length && defaultCascaderChecked === cascaderChecked) {
      return message.warn('未发生变动！');
    }

    const params = {
      customfieldid: id || record.id,
      attributeValue: cascaderChecked ? CUSTOM_SELECTTYPE_MAP.TILE : CUSTOM_SELECTTYPE_MAP.SELECT,
      value: JSON.stringify(lastData),
    };
    this.setCustomValue(params);
  }

  setCustomValue = (params) => {
    this.setState({ visible: false });
    setCustomValue(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`设置值失败, ${res.msg}`);
      }
      message.success('设置值成功!');
      this.getList();
      this.setState({ record: {}, editData: {} });
    }).catch((err) => {
      return message.error('设置值异常', err || err.msg);
    });
  }

  getFooter = () => {
    const { form: { getFieldValue } } = this.props;
    const { dialogType, current } = this.state;
    const selectType = getFieldValue('type');

    switch (current) {
      case 'basic':
        if (dialogType === 'create' && [CUSTOME_TYPE_MAP.SELECT, CUSTOME_TYPE_MAP.MULTISELECT, CUSTOME_TYPE_MAP.CASCADER].some(it => it === selectType)) {
          return [<Button onClick={() => this.setState({ visible: false })}>取消</Button>,
            <Button type="primary" onClick={() => this.setState({ current: selectType === CUSTOME_TYPE_MAP.CASCADER ? 'cascader' : 'select' })}>下一步</Button>];
        } else if ((dialogType === 'create' && ![CUSTOME_TYPE_MAP.SELECT, CUSTOME_TYPE_MAP.MULTISELECT, CUSTOME_TYPE_MAP.CASCADER].some(it => it === getFieldValue('type'))) || (dialogType === 'edit')) {
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
    const { isBusiness } = this.props;
    const columns = isBusiness ? this.columns.filter(i => i.dataIndex !== 'cloudcc_field' && i.dataIndex !== 'cloudcc_key') : this.columns;

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
              columns.map(item =>
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
    const { isBusiness } = this.props;
    const columns = isBusiness ? this.columns.filter(i => i.dataIndex !== 'cloudcc_field' && i.dataIndex !== 'cloudcc_key') : this.columns;

    return data.map((it, index) =>
      <div style={{ borderBottom: '1px solid #F5F7F9', minHeight: '40px', padding: '10px 15px', display: 'flex', justifyContent: 'space-between' }}>
        {
          columns.map(item =>
            <div
              className="f-ib"
              style={{ width: item.width || '5vw' }}
            >
              {this.getRender(item.dataIndex, it[item.dataIndex], it, item)}
            </div>)
        }
      </div>);
  }

  getRender = (key, value, it, item) => {
    if (key === 'required' || key === 'state') {
      return <span>{value === CUSTOME_REQUIRED.REQUIRED ? '是' : '否'}</span>;
    } else if (key === 'operator') {
      return <spqan>-</spqan>;
    } else {
      return item.render(value, it);
    }
  }

  getTitle = () => {
    const { isBusiness } = this.props;
    const columns = isBusiness ? this.columns.filter(i => i.dataIndex !== 'cloudcc_field' && i.dataIndex !== 'cloudcc_key') : this.columns;

    return (<div className={styles.customTitle} style={{ display: 'flex', justifyContent: 'space-between', padding: '0px 15px' }}>
      {columns.map(item =>
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
    if (!destination) {
      return;
    }
    const { data } = this.state;
    const systemData = data.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM);
    const customData = data.filter(it => it.system !== CUSTOME_SYSTEM.SYSTEM);
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const targetObj = customData[sourceIndex];
    customData.splice(sourceIndex, 1);
    customData.splice(destinationIndex, 0, targetObj);
    this.updateSortValue([...systemData.map(it => it.id), ...customData.map(it => it.id)]);
  }

  updateSortValue = (params) => {
    const updatePromise = new Promise((resolve, reject) => {
      resolve(updateSortValue(params));
    });
    updatePromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('排序成功！');
      this.getList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { data, loading, visible, dialogType, editData, current, record } = this.state;
    const systemData = data.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM);
    const customData = data.filter(it => it.system !== CUSTOME_SYSTEM.SYSTEM);

    return (<div style={{ padding: '0px 15px' }} className={styles.container}>

      <div className='bbTitle f-jcsb-aic'>
        <div>
          <span className='name'>自定义字段</span>
          <Popover content={<span>
            系统字段配置请联系平台管理员（默认值可自行修改）
          </span>} trigger="click" placement="bottom">
            <MyIcon type="icon-icon-test" className="u-mgl5 f-fs3" />
          </Popover>
        </div>
        <Button
          className='u-mgl10'
          onClick={() => this.setState({ visible: true, dialogType: 'create', current: 'basic', record: {} })}
          type="primary"
        >
          添加字段
        </Button>
      </div>

      <Spin spinning={loading}>
        <Card>
          {this.getTitle()}
          <div style={{ height: '65vh', overflow: 'auto' }}>
            <div className="u-pd8" style={{ position: 'relative' }}>
              {this.getCustomItem(systemData)}
            </div>
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
                        this.getSystemItem(customData)
                    }
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Card>
      </Spin>

      <Modal
        visible={visible}
        onCancel={() => this.setState({ visible: false, record: {}, editData: {} })}
        footer={this.getFooter()}
        title={dialogType === 'create' ? '添加字段' : current === 'basic' ? '编辑字段' : '菜单值设置'}
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

export default withRouter(BusinessHOC()(Form.create()(Index)));
