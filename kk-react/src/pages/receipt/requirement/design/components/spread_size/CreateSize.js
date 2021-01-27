import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Input, Popconfirm, Button } from 'antd';
import uuid from 'uuid';
import { deepCopy, equalsObj } from '@utils/helper';
import expand from '@assets/expand.png';
import collapse from '@assets/collapse.png';
import styles from './index.less';

const FormItem = Form.Item;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  borderRadius: '2px',
  background: '#fff',
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '#F1F3F5', // @color-blue-1
  width: '100%',
});

// getFieldDecorator两个作用，一个是校验为空，一个是能够双向绑定
class CreateSize extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceList: [],
      defaultList: [],
      errorKey: '',
    };
  }

  componentDidMount() {
    const { channelObj } = this.props;
    if (channelObj && !!Object.keys(channelObj).length) {
      const channelList = channelObj.channelList || [];
      this.setState({
        sourceList: deepCopy(channelList, []),
        defaultList: deepCopy(channelList, []),
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.channelObj, nextProps.channelObj)) {
      const channelList = nextProps.channelObj.channelList || [];
      this.setState({
        sourceList: deepCopy(channelList, []),
        defaultList: deepCopy(channelList, []),
      });
    }
  }

  handleAddSource = () => {
    const { sourceList } = this.state;
    const obj = {
      id: uuid(),
      name: '',
      sizeList: [],
    };
    const newArr = [...sourceList];
    newArr.push(obj);
    this.setState({ sourceList: newArr });
  }

  handleAddSize = (id) => {
    const { sourceList } = this.state;
    const newArr = [...sourceList];
    newArr.forEach(it => {
      if (it.id === id) {
        const obj = {
          id: uuid(),
          productid: '',
          scid: id,
          name: '',
          description: '',
        };
        const newSizeList = [...it.sizeList];
        newSizeList.push(obj);
        it.sizeList = newSizeList;
      }
    });
    this.setState({ sourceList: newArr });
  }

  handleDeleteSource = (sourceId) => {
    const { sourceList } = this.state;
    let newArr = [...sourceList];
    newArr = newArr.filter(it => it.id !== sourceId);
    this.setState({ sourceList: newArr });
  }

  handleDeleteSize = (sourceId, sizeId) => {
    const { sourceList } = this.state;
    let newArr = [...sourceList];
    newArr.forEach(it => {
      if (it.id === sourceId) {
        let newSizeList = [...it.sizeList];
        newSizeList = newSizeList.filter(it => it.id !== sizeId);
        it.sizeList = newSizeList;
      }
    });
    this.setState({ sourceList: newArr });
  }

  handleChangeTitle = (value, sourceId) => {
    const { sourceList } = this.state;
    const newArr = [...sourceList];
    newArr.forEach(it => {
      if (it.id === sourceId) {
        it.name = value;
      }
    });
    this.setState({ sourceList: newArr });
  }

  validFunctionSource = (rule, value, callback, sourceId) => {
    const { sourceList } = this.state;
    const arr = sourceList.filter(it => it.name === value);
    const obj = sourceList.find(it => it.id === sourceId);
    const index = sourceList.findIndex(it => it.id === sourceId);

    try {
      if (arr && arr.length > 1 && index) {
        callback('已添加对应渠道，请勿重复添加!');
      } else if (obj.sizeList.some(it => it.name || it.description) && !value.trim()) {
        callback('渠道名不能为空！');
      } else if (value.trim() && !obj.sizeList.length) {
        callback('尺寸不能为空，请至少添加一个尺寸！');
      } else {
        callback();
      }
    } catch (err) {
      callback(err);
    }
  }

  // 获取渠道名称
  getSourceTitle = (it, index) => {
    const { form: { getFieldDecorator } } = this.props;

    return (
      <Row className={styles.sourceTitle} id={`source-${it.id}`}>
        <Col span={21} className={styles.colStyle}>
          <a
            className={styles.expandIcon}
            onClick={() => this.setState({ [`${it.id}`]: !this.state[`${it.id}`] })}
          >
            {
              this.state[`${it.id}`] ?
                <img src={collapse} alt="collapse" style={{ width: '18px', height: '18px' }} /> :
                <img src={expand} alt="expand" style={{ width: '18px', height: '18px' }} />
            }
          </a>
          <div className={styles.sourceInput}>
            <FormItem>
              {getFieldDecorator(`source-${it.id}`, {
                initialValue: it.name,
                rules: [
                  { validator: (rule, value, callback) => this.validFunctionSource(rule, value, callback, it.id) }
                ],
              })(
                <Input
                  onChange={(e) => this.handleChangeTitle(e.target.value, it.id)}
                  placeholder="请输入渠道名称"
                  maxLength={20}
                />
              )}
            </FormItem>
          </div>
        </Col>

        <Col span={3} className={styles.colStyle} style={{ textAlign: 'center' }}>
          <Popconfirm
            title="删除后渠道内的全部尺寸都将被清除。你确定要删除吗?"
            onConfirm={() => this.handleDeleteSource(it.id)}
            okText="确定"
            cancelText="取消"
          >
            <a>删除</a>
          </Popconfirm>
        </Col>
      </Row>
    );
  }

  handleChangeSize = (value, type, sourceId, sizeId) => {
    const { sourceList } = this.state;
    const newArr = [...sourceList];
    newArr.forEach(it => {
      if (it.id === sourceId) {
        let newSizeList = [...it.sizeList];
        newSizeList.forEach(item => {
          if (item.id === sizeId) {
            item[type] = value;
          }
        });
      }
    });
    this.setState({ sourceList: newArr });
  }

  validFunctionName = (rule, value, callback, sourceIndex, sizeIndex, sourceId) => {
    if (value.trim()) {
      this.props.form.validateFields([`source-${sourceId}`], { force: true });
    }
    const { sourceList } = this.state;
    const sourceObj = sourceList[sourceIndex];
    const sizeObj = sourceObj.sizeList[sizeIndex];
    if ((sourceObj.name || sizeObj.description) && !value.trim()) {
      callback('尺寸不能为空!');
    } else {
      callback();
    }
  }

  validFunctionDes = (rule, value, callback, sourceIndex, sizeIndex, sourceId) => {
    if (value.trim()) {
      this.props.form.validateFields([`source-${sourceId}`], { force: true });
    }
    const { sourceList } = this.state;
    const sourceObj = sourceList[sourceIndex];
    const sizeObj = sourceObj.sizeList[sizeIndex];
    if ((sourceObj.name || sizeObj.name) && !value.trim()) {
      callback('描述不能为空!');
    } else {
      callback();
    }
  }

  // 获取每个渠道下的内容
  getSizeContent = (it, sourceIndex) => {
    const { form: { getFieldDecorator } } = this.props;

    return (!this.state[`${it.id}`] &&
      <Droppable droppableId={`size-${it.id}`} type={`size-${it.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}>
            {
              it.sizeList.map((item, index) =>
                <Draggable
                  key={`size-${item.id}`}
                  draggableId={`size-${it.id}-${item.id}`}
                  index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>
                      {
                        <Row className={styles.sizeRow}>
                          <Col span={7} className={styles.colStyle}></Col>
                          <Col span={7} className={styles.colStyle}>
                            <FormItem id={`name-${it.id}-${item.id}`}>
                              {getFieldDecorator(`name-${it.id}-${item.id}`, {
                                initialValue: item.name,
                                rules: [
                                  { validator: (rule, value, callback) => this.validFunctionName(rule, value, callback, sourceIndex, index, it.id) }
                                ],
                              })(
                                <Input
                                  onChange={(e) => this.handleChangeSize(e.target.value, 'name', it.id, item.id)}
                                  placeholder="请输入尺寸"
                                  maxLength={20}
                                />
                              )}
                            </FormItem>
                          </Col>

                          <Col span={7} className={styles.colStyle}>
                            <FormItem id={`description-${it.id}-${item.id}`}>
                              {getFieldDecorator(`description-${it.id}-${item.id}`, {
                                initialValue: item.description,
                                rules: [
                                  { validator: (rule, value, callback) => this.validFunctionDes(rule, value, callback, sourceIndex, index, it.id) }
                                ],
                              })(
                                <Input
                                  onChange={(e) => this.handleChangeSize(e.target.value, 'description', it.id, item.id)}
                                  placeholder="请输入资源位名称"
                                  maxLength={20}
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={3} className={styles.colStyle} style={{ textAlign: 'center' }}>
                            <a onClick={() => this.handleDeleteSize(it.id, item.id)}>删除</a>
                          </Col>
                        </Row>
                      }
                    </div>
                  )}
                </Draggable>
              )
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  getDiffAndScoreList = () => {
    const { reqData } = this.props;
    const { sourceList, defaultList } = this.state;
    const productId = reqData && reqData.product && reqData.product.id;

    const newArr = deepCopy(sourceList, []);
    const oldList = deepCopy(defaultList, []);
    newArr.forEach((item, index) => {
      // 找不到ADD
      if (!defaultList.some(it => item.id === it.id)) {
        const sizeList = item.sizeList;
        sizeList.forEach((i, indexSize) => {
          i.action = 'ADD';
          i.score = indexSize;
          i.productid = productId;
          i.id = 0;
          i.scid = 0;
        });
        item.action = 'ADD';
        item.score = index;
        item.productid = productId;
        item.id = 0;
        item.uemSizeInfoDTOList = sizeList;
      }

      // 能找到外层是UPDATE，内层需要判断
      if (defaultList.some(it => it.id === item.id)) {
        const oldSizeList = defaultList.find(it => item.id === it.id).sizeList;
        const sizeList = item.sizeList;

        sizeList.forEach((i, indexSize) => {
          i.score = indexSize;
          i.productid = productId;
          if (!oldSizeList.some(ii => ii.id === i.id)) {
            i.action = 'ADD';
            i.id = 0;
            i.scid = item.id; // id提交给后端的是0
          }
          if (oldSizeList.some(ii => ii.id === i.id)) {
            i.action = 'UPDATE';
          }
        });

        oldSizeList.forEach(it => {
          // 删除的
          if (!sizeList.some(i => i.id === it.id)) {
            sizeList.push({
              id: it.id,
              action: 'DELETE',
              productid: productId,
            });
          }
        });
        item.action = 'UPDATE';
        item.score = index;
        item.productid = productId;
        item.uemSizeInfoDTOList = sizeList;
      }
    });

    // 删除的
    oldList.forEach(item => {
      if (!newArr.some(it => it.id === item.id)) {
        newArr.push({
          id: item.id,
          action: 'DELETE',
          productid: productId,
        });
      }
    });

    const filterArr = newArr.filter(it => it.name.length);

    this.props.handleSaveSize(filterArr);
  }

  handleSave = () => {
    // const options = {
    //   scroll: { offsetTop: -100 }
    // };
    // validateFieldsAndScroll
    this.props.form.validateFields((err, values) => {
      if (err) {
        const keysArr = Object.keys(err);
        this.setState({ errorKey: keysArr[0] });
        return;
      }
      this.getDiffAndScoreList();
    });
  }

  // 处理渠道和尺寸排序
  onDragEnd = (result) => {
    const { draggableId, source, destination } = result;

    if (!destination) {
      return;
    }

    const { sourceList } = this.state;
    let newArr = [...sourceList];
    const sourceIndex = source.index;
    const targetIndex = destination.index;
    if (draggableId.includes('source')) {
      const obj = newArr[sourceIndex];
      newArr.splice(sourceIndex, 1);
      newArr.splice(targetIndex, 0, obj);
    } else {
      const sourceId = Number(source.droppableId.split('-')[1]);
      const sourceIndex = source.index;
      const targetIndex = destination.index;
      newArr.forEach(it => {
        if (it.id === sourceId) {
          const obj = it.sizeList[sourceIndex];
          it.sizeList.splice(sourceIndex, 1);
          it.sizeList.splice(targetIndex, 0, obj);
        }
      });
    }
    this.setState({ sourceList: newArr });
  }

  getHeaderText = () => {
    return (
      <Row>
        <Col span={7} className={styles.headerStyle}>
          渠道（不超过20字符）
          <span className={styles.need}>*</span>
        </Col>
        <Col span={7} className={styles.headerStyle}>
          尺寸大小
          <span className={styles.need}>*</span>
        </Col>
        <Col span={7} className={styles.headerStyle}>
          尺寸描述（不超过20字符）
          <span className={styles.need}>*</span>
        </Col>
        <Col span={3} className={styles.headerStyle} style={{ borderRight: '1px solid #E1E2E5' }}>操作</Col>
      </Row>
    );
  }

  render() {
    const { sourceList, errorKey } = this.state;

    return (<div className={styles.createContainer}>

      <div className={styles.button}>
        <span>
          <Button className="u-mgr10" onClick={() => this.handleSave()}>
            <a href={`#${errorKey}`}>保存</a>
          </Button>
          <Button onClick={() => this.props.handleCancel()}>取消</Button>
        </span>
      </div>
      <div style={{ position: 'relative', top: '-30px' }}>
        {this.getHeaderText()}
        <div className={styles.createSize}>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId={`source`} type="source">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}>
                  {
                    sourceList && sourceList.map((it, index) => (<div>
                      <Draggable
                        key={`source-${it.id}`}
                        draggableId={`source-${it.id}`}
                        index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}>

                            {
                              this.getSourceTitle(it, index)
                            }

                            {
                              this.getSizeContent(it, index)
                            }

                            <div>
                              {!this.state[`${it.id}`] &&
                                <Row className={styles.addStyle} style={{ borderBottom: 'unset' }}>
                                  <Col span={7} className={styles.colStyle}>
                                  </Col>
                                  <Col span={17} className={styles.colStyle}>
                                    {
                                      <a onClick={() => this.handleAddSize(it.id)} className="u-mgl10">+添加尺寸</a>
                                    }
                                  </Col>
                                </Row>
                              }
                            </div>
                          </div>
                        )}
                      </Draggable>
                    </div>))
                  }

                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {
              <Row className={styles.addStyle} style={{ borderBottom: '1px solid #E1E2E5' }}>
                <a onClick={() => this.handleAddSource()} className="u-mgl10">+添加渠道</a>
              </Row>
            }

          </DragDropContext>
        </div>
      </div>

    </div>
    );
  }
}

export default Form.create()(CreateSize);
