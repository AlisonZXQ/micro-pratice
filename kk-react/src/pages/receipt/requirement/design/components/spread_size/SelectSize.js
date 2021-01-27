import React, { Component } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Row, Col, Checkbox, Input } from 'antd';
import uuid from 'uuid';
import { deepCopy, equalsObj } from '@utils/helper';
import styles from './index.less';

// 渠道三个字段 display, checked, status
// 尺寸三个字段 display, checked, select

class SelectSize extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceList: [], // 全局控制的数据源
      selectSize: [],
      selectSource: -1, // 控制选中后状态
      searchValue: '', // 尺寸搜索框
      addSize: [],
    };
    // this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    const { channelObj } = this.props;
    if (channelObj && !!Object.keys(channelObj).length) {
      const channelList = channelObj.channelList || [];
      this.setState({
        sourceList: deepCopy(channelList, []),
      });
      this.solveDeleteSize(channelObj);
    }

  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.channelObj, nextProps.channelObj)) {
      const channelList = nextProps.channelObj.channelList || [];
      this.setState({
        sourceList: deepCopy(channelList, []),
      });
      this.solveDeleteSize(nextProps.channelObj);
    }

  }

  // 处理已经选择的尺寸被删除的问题，转换为自定义尺寸
  solveDeleteSize = (channelObj) => {
    const { form: { setFieldsValue } } = this.props;
    const { selectSize, addSize, channelSave, channelList } = channelObj;
    const newAddSize = deepCopy(addSize, []);
    const newSelectSize = deepCopy(selectSize, []);

    newSelectSize.forEach(it => {
      if (it.id.includes('source')) { // 渠道下的尺寸全选
        const sourceId = Number(it.id.split('-')[1]);
        // 如果找不到整个渠道都被删除了，渠道下的尺寸全部转成自定义字段
        if (!channelList.some(it => it.id === sourceId)) {
          const obj = channelSave.find(item => item.id === sourceId) || {};
          const sizeList = obj.sizeList || [];
          sizeList.forEach(i => {
            newAddSize.push({
              id: `ZXQHAPPY-${uuid()}`,
              name: `${i.name}(${i.description})`,
            });
          });
          it.id = 'delete';
        }
      } else if (it.id.includes('size')) { // 渠道下的尺寸半选
        const sourceId = Number(it.id.split('-')[1]);
        const sizeId = Number(it.id.split('-')[2]);
        if (!channelList.some(it => it.id === sourceId)) { // 渠道被删除了该尺寸转换为自定义字段
          newAddSize.push({
            id: `ZXQHAPPY-${uuid()}`,
            name: `${it.name}(${it.description})`,
          });
          it.id = 'delete';
        } else if (channelList.some(it => it.id === sourceId)) {
          const sourceObj = channelList.find(it => it.id === sourceId);
          const sizeList = sourceObj.sizeList;
          if (!sizeList.some(i => i.id === sizeId)) { // 渠道还在尺寸被删除了该尺寸转换为自定义字段
            newAddSize.push({
              id: `ZXQHAPPY-${uuid()}`,
              name: `${it.name}(${it.description})`,
            });
            it.id = 'delete';
          }
        }
      }
    });

    this.setState({
      addSize: newAddSize,
      selectSize: newSelectSize.filter(it => it.id !== 'delete'),
    });
    setFieldsValue({
      addSize: newAddSize,
      selectSize: newSelectSize.filter(it => it.id !== 'delete'),
    });
  }

  // 搜索值清空时的做法
  getSourceChecked = () => {
    const { sourceList } = this.state;
    const newArr = deepCopy(sourceList, []);
    newArr.forEach(it => {
      // 全选
      if (it.sizeList.every(item => item.checked)) {
        it.checked = true;
        it.status = false;
        // 半选
      } else if (it.sizeList.some(item => item.checked)) {
        it.checked = false;
        it.status = true;
      } else {
        it.checked = false;
        it.status = false;
      }
    });
    this.setState({ sourceList: newArr });
  }

  // 搜索值变化时
  handleSearch = (value) => {
    if (value === '') {
      // 清空搜索内容时还原渠道的选择表现
      this.getSourceChecked();
    }

    this.setState({ searchValue: value });
    const { sourceList } = this.state;
    const newArr = deepCopy(sourceList, []);
    newArr.forEach(it => {
      // 如果渠道包含该名称，其下面的所有尺寸也都展示
      if (it.name.includes(value)) {
        it.display = true;
        it.sizeList.forEach(item => {
          item.display = true;
        });
      } else { // 渠道名不包含该名称
        let flag = false;
        it.sizeList.forEach(item => {
          if (item.name.includes(value) || item.description.includes(value)) {
            item.display = true;
            flag = true;
          } else {
            item.display = false;
          }
          // 根据flag来判断是否展示渠道
          it.display = flag;
        });
      }
    });

    // 判断完展示哪些之后，需要对渠道的选择状态进行特殊处理(只与当前展示的尺寸有关)
    newArr.forEach(it => {
      const displayList = it.sizeList.filter(item => item.display);
      if (displayList.every(it => it.checked)) {
        it.checked = true;
        it.status = false;
      } else if (displayList.some(it => it.checked)) {
        it.checked = false;
        it.status = true;
      } else {
        it.checked = false;
        it.status = false;
      }
    });

    this.setState({ sourceList: newArr });
  }

  // 渠道的checkbox变化时
  handleChangeSource = (e, id) => {
    const { form: { setFieldsValue } } = this.props;
    const { sourceList } = this.state;
    const newArr = deepCopy(sourceList, []);

    newArr.forEach(it => {
      const displayList = it.sizeList.filter(item => item.display) || [];
      if (it.id === id) {
        it.checked = e.target.checked;
        it.status = false;
        displayList && displayList.forEach(item => {
          item.checked = e.target.checked;
          item.select = true;
        });
      }
    });

    let newSelectSize = this.getSelectArr(newArr);

    // 如果是本来已选择，后来被删除的就转换成自定义尺寸
    // selectSize.forEach(it => {
    //   if (!newSelectSize.some(item => item.id === it.id)) {
    //     newAddSize.push({

    //     });
    //     newSelectSize.push(it);
    //   }
    // });

    this.setState({
      sourceList: newArr,
      selectSize: newSelectSize
    });
    setFieldsValue({ selectSize: newSelectSize });
  }

  // 尺寸的checkbox变化时
  handleChangeSize = (checked, sourceId, sizeId) => {
    const { form: { setFieldsValue } } = this.props;
    const { sourceList } = this.state;
    const newArr = deepCopy(sourceList, []);

    newArr.forEach(it => {
      if (it.id === sourceId) {
        const displayList = it.sizeList.filter(item => item.display);
        let num = checked ? 1 : -1;
        displayList.forEach(item => {
          if (item.checked) {
            num += 1;
          }
          if (item.id === sizeId) {
            item.checked = checked;
          }
        });
        // 大于0小于总长度
        if (num > 0 && num < displayList.length) {
          it.status = true;
          it.checked = false;
          // 等于总长度是全选
        } else if (num === displayList.length) {
          it.status = false;
          it.checked = true;
          // 其他是不选
        } else {
          it.status = false;
          it.checked = false;
        }
      }
    });

    const selectSize = this.getSelectArr(newArr);
    this.setState({
      sourceList: newArr,
      selectSize,
    });
    setFieldsValue({ selectSize: selectSize });
  }

  // 已经选择的尺寸
  getSelectArr = (newArr) => {
    let selectArr = [];
    newArr.forEach(it => {
      // 由size的checked状态来判断
      const flag = it.sizeList && it.sizeList.length && it.sizeList.every(item => item.checked);
      if (flag) {
        selectArr.push({
          id: `source-${it.id}`,
          name: it.name
        });
      } else {
        it.sizeList.forEach(item => {
          if (item.checked) {
            selectArr.push({
              id: `size-${it.id}-${item.id}`,
              name: item.name,
              description: item.description,
            });
          }
        });
      }
    });
    return selectArr;
  }

  // 尺寸的展示
  getSizeDisplay = () => {
    // 展示的是select&display的
    const { sourceList, selectSource } = this.state;
    let arr = [];
    let id = -1;
    sourceList.forEach(it => {
      if (it.sizeList.some(item => item.select)) {
        arr = it.sizeList;
        id = it.id;
      }
    });

    return (
      arr.map(it =>
        it.display &&
        <div className={styles.colStyle} style={{ background: id === selectSource ? styles.SelectColor : '' }}>
          <Checkbox
            key={it.id} value={it.id} checked={it.checked}
            onChange={(e) => this.handleChangeSize(e.target.checked, id, it.id)}
          >{it.name}({it.description})</Checkbox>
        </div>)
    );
  }

  // 点击渠道高亮
  handleClickRow = (id) => {
    this.setState({ selectSource: id });
    const { sourceList } = this.state;
    const newArr = deepCopy(sourceList, []);
    newArr.forEach(it => {
      // 当前所选的渠道
      if (it.id === id) {
        it.sizeList.forEach(item => {
          item.select = true; // 切换这里只会是全选或者半选
        });
        // 当前没有选择的渠道
      } else {
        it.sizeList.forEach(item => {
          item.select = false;
        });
      }
    });
    this.setState({ sourceList: newArr });
  }

  // 渠道的展示
  getSourceDisplay = () => {
    const { sourceList, selectSource } = this.state;

    return (
      sourceList.map(it =>
        it.display &&
        <div className={`${styles.colStyle} f-csp`}
          onClick={() => this.handleClickRow(it.id)}
          style={{ background: selectSource === it.id ? styles.SelectColor : '' }}
        >
          <Checkbox
            key={it.id}
            value={it.id}
            indeterminate={it.status}
            checked={it.checked}
            onChange={(e) => this.handleChangeSource(e, it.id)}
          >
            {it.name}
          </Checkbox>
        </div>
      )
    );
  }

  // 删除已选择的尺寸
  handleDelete = (id) => {
    const { form: { setFieldsValue } } = this.props;
    const { sourceList, addSize } = this.state;
    const newArr = deepCopy(sourceList, []);
    let newAddSize = deepCopy(addSize, []);

    if (id.includes('source')) {
      const sourceId = Number(id.split('-')[1]);
      newArr.forEach(it => {
        if (it.id === sourceId) {
          it.checked = false;
          it.sizeList.forEach(item => {
            item.checked = false;
          });
        }
      });
    } else if (id.includes('size')) {
      const sourceId = Number(id.split('-')[1]);
      const sizeId = Number(id.split('-')[2]);
      newArr.forEach(it => {
        if (it.id === sourceId) {
          it.sizeList.forEach(item => {
            if (item.id === sizeId) {
              item.checked = false;
            }
          });
          if (it.sizeList.every(i => i.checked)) {
            it.checked = true;
            it.status = false;
          } else if (it.sizeList.some(i => i.checked)) {
            it.checked = false;
            it.status = true;
          } else {
            it.checked = false;
            it.status = false;
          }
        }
      });
    } else if (id.includes('ZXQHAPPY')) {
      newAddSize = newAddSize.filter(it => it.id !== id);
    }

    const selectSize = this.getSelectArr(newArr);

    this.setState({
      sourceList: newArr,
      selectSize,
      addSize: newAddSize,
    });
    setFieldsValue({
      selectSize: selectSize,
      addSize: newAddSize
    });

  }

  handleAddSize = () => {
    const { form: { setFieldsValue } } = this.props;
    const { addSize, searchValue, sourceList } = this.state;

    const flag = sourceList.every(it => !it.display);
    // 搜索结果不存在才增加尺寸
    if (flag) {
      let newSize = deepCopy(addSize, []);
      if (searchValue && searchValue.length > 0) {
        newSize.push({
          id: `ZXQHAPPY-${uuid()}`,
          name: searchValue,
        });
      }
      this.setState({
        addSize: newSize,
        searchValue: '',
      });
      setFieldsValue({
        addSize: newSize,
      });

      this.handleSearch('');
    }
  }

  render() {
    const { sourceList, searchValue, addSize, selectSize } = this.state;
    const addSizeState = addSize || [];
    const selectSizeState = selectSize || [];
    const allSize = addSizeState.concat(selectSizeState);

    // 搜索无结果
    const flag = sourceList.every(it => !it.display);

    return (
      <div className={styles.selectContainer}>
        <div>
          <div class={styles.inputContainer}>
            {
              allSize.map(it =>
                <div className={styles.tagStyle}>
                  <span className="u-mgr5" style={{ position: 'relative', top: '-1px'}}>
                    {it.name}
                    {
                      it.description &&
                      <span>({it.description})</span>
                    }
                  </span>
                  <CloseOutlined className={styles.deleteIcon} onClick={() => this.handleDelete(it.id)} />
                </div>)
            }
            <div class="f-ib">
              <Input
                style={{ minWidth: '200px', border: 'unset', height: '25px' }}
                onChange={(e) => this.handleSearch(e.target.value)}
                onPressEnter={() => this.handleAddSize()}
                value={searchValue}
                placeholder="输入自定义尺寸，回车确定"
              />
            </div>
          </div>
          <div class={styles.searchContainer}>
            {
              flag ?
                <span>
                  未找到
                  <span style={{ color: '#F04646' }}>{searchValue}</span>
                  的常用尺寸，您可以点击回车键添加自定义尺寸
                </span>
                :
                <Row>
                  <Col span={11} style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {
                      this.getSourceDisplay()
                    }
                  </Col>

                  <Col span={13} style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {
                      this.getSizeDisplay()
                    }
                  </Col>
                </Row>
            }
          </div>
        </div>
      </div>
    );
  }

}

export default SelectSize;
