import React, { Component } from 'react';
import { Input, Row, Col, Popconfirm, Checkbox, message, Popover } from 'antd';
import uuid from 'uuid';
import { getCustomDefault } from '@services/product_setting';
import { deepCopy, equalsObj } from '@utils/helper';
import { CUSTOME_TYPE_MAP, CUSTOM_SELECTTYPE_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

class AddCascaderDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      checked: true,
      defaultValueData: [],
      customfieldid: 0,
      valueData: [{
        id: uuid(),
        name: '',
        active: true,
        type: 'input',
        child: [{
          id: uuid(),
          type: 'input',
          disabled: true,
          name: ''
        }],
      }],
    };
  }

  componentDidMount() {
    const { record } = this.props;
    if (record && record.id && record.type === CUSTOME_TYPE_MAP.CASCADER) {
      this.getDefaultData(record.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.record, nextProps.record)) {
      const id = nextProps.record && nextProps.record.id;
      const type = nextProps.record && nextProps.record.type;
      if (type === CUSTOME_TYPE_MAP.CASCADER) {
        this.getDefaultData(id);
      }
    }
  }

  getDefaultData = (id) => {
    const setPromise = Promise.resolve(getCustomDefault(id));
    setPromise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      const data = res.result.productCustomFieldValueVOList || [];
      const checked = res.result.attributeValue === `${CUSTOM_SELECTTYPE_MAP.TILE}` ? true : false;
      this.setState({
        valueData: this.getInitData(data),
        defaultValueData: deepCopy(data, []),
        checked,
      });
      this.props.setCascaderData('cascaderData', this.getInitData(data));
      this.props.setCascaderData('defaultCascaderData', deepCopy(data, []));
      this.props.setCascaderData('defaultCascaderChecked', checked);
      this.props.setCascaderData('cascaderChecked', checked);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getInitData = (data) => {
    let arr = [];
    const newData = data;
    const fatherData = newData.filter((it) => it.parentid === 0);
    const childData = newData.filter((it) => it.parentid !== 0);

    fatherData && fatherData.forEach((item) => { //父级数据
      arr.push({
        id: item.id,
        name: item.customlabel,
        active: false,
        type: 'div',
        child: [],
        ...item,
      });
    });
    if (arr.length !== 0) {
      arr[0].active = true;
    }
    childData && childData.forEach((item, index) => { //子级数据
      fatherData.forEach((it, idx) => {
        if (item.parentid === it.id) {
          arr[idx].child.push({
            id: item.id,
            type: 'div',
            disabled: false,
            name: item.customlabel,
            ...item,
          });
        }
      });
    });

    const initChildData = {
      id: uuid(),
      type: 'input',
      disabled: false,
      name: ''
    };
    arr.forEach((item) => {
      item.child.push(initChildData);
    });

    const initData = {
      id: uuid(),
      name: '',
      active: false,
      type: 'input',
      child: [{
        id: uuid(),
        disabled: true,
        name: '',
        type: 'input'
      }],
    };
    arr.push(initData);
    return arr;
  }

  updateParentData = (parent, value) => {
    if (value.trim().length) {
      const { valueData } = this.state;
      let newData = deepCopy(valueData, []);
      const initData = {
        id: uuid(),
        name: '',
        active: false,
        type: 'input',
        child: [{
          id: uuid(),
          disabled: true,
          name: '',
          type: 'input'
        }],
      };

      // 更新
      if (!parent.name && !parent.name.length) {
        newData.push(initData);
      }

      newData.forEach((it) => {
        if (it.id === parent.id) {
          it.name = value;
          it.active = true;
          it.type = 'div';
          it.child[0].disabled = false;
        } else if (it.name) {
          it.active = false;
          it.type = 'div';
        } else if (!it.name) {
          it.active = false;
          it.type = 'input';
        }
      });

      this.setState({ valueData: newData });
      this.props.setCascaderData('cascaderData', newData);
    }
  }

  updateChildData = (childData, value) => {
    const { valueData } = this.state;
    const newData = deepCopy(valueData, []);

    if (value && value.trim().length) {
      const initChild = {
        id: uuid(),
        name: '',
        type: 'input',
        disabled: false,
      };
      newData.forEach(parent => {
        if (parent.active) {
          if (!childData.name.length) {
            parent.child.push(initChild);
          }
          parent.child.forEach(child => {
            if (child.id === childData.id) {
              child.name = value;
              child.type = 'div';
            }
          });
        }
      });
      this.setState({ valueData: newData });
      this.props.setCascaderData('cascaderData', newData);
    }
  }

  handleChildToInput = (id) => {
    const { valueData } = this.state;
    const newData = deepCopy(valueData, []);

    newData.forEach(parent => {
      if (parent.active) {
        parent.child.forEach(child => {
          if (child.id === id) {
            child.type = 'input';
          }
        });
      }
    });
    this.setState({ valueData: newData });
    this.props.setCascaderData('cascaderData', newData);
  }

  handleParentToInput = (id) => {
    const { valueData } = this.state;
    const newData = deepCopy(valueData, []);

    newData.forEach(it => {
      if (it.id === id) {
        it.active = true;
        it.type = 'input';
      } else if (it.name) {
        it.active = false;
        it.type = 'div';
      } else if (!it.name) {
        it.active = false;
        it.type = 'input';
      }
    });
    this.setState({ valueData: newData });
    this.props.setCascaderData('cascaderData', newData);
  }

  handleParentActive = (id) => {
    const { valueData } = this.state;
    const newData = deepCopy(valueData, []);

    newData.forEach(it => {
      if (it.id === id) {
        it.active = true;
      } else {
        it.active = false;
      }
    });
    this.setState({ valueData: newData });
    this.props.setCascaderData('cascaderData', newData);
  }

  unique = (arr) => { //对象去重
    let unique = {};
    let newArr = arr || [];
    newArr.forEach(function (item) {
      unique[JSON.stringify(item, ['name', 'author'])] = item;
    });
    newArr = Object.keys(unique).map(function (u) {
      return JSON.parse(u);
    });
    return newArr;
  }

  handleDeleteParent = (parent) => {
    const id = parent.id;
    const { valueData } = this.state;
    let newData = deepCopy(valueData, []);

    newData = newData.filter(it => it.id !== id);
    this.setState({ valueData: newData });
    this.props.setCascaderData('cascaderData', newData);
  }

  handleDeleteChild = (child) => {
    const id = child.id;
    const { valueData } = this.state;
    let newData = deepCopy(valueData, []);
    newData.forEach(it => {
      if (it.active) {
        it.child = it.child.filter(item => item.id !== id);
      }
    });
    this.setState({ valueData: newData });
    this.props.setCascaderData('cascaderData', newData);
  }

  getParentData = (parent) => {
    return (<div
      className="u-mgb10"
      onClick={() => this.handleParentActive(parent.id)}
    >
      {
        parent.type === 'input' ?
          <Input
            onBlur={(e) => this.updateParentData(parent, e.target.value)}
            defaultValue={parent.name}
            placeholder='请输入' />
          :
          <div
            className={`f-jcsb-aic f-csp ${parent.active ? styles.activeColor : styles.defaultColor}`}
            onDoubleClick={() => this.handleParentToInput(parent.id)}
          >
            <span className={"f-toe " + styles.configName}>
              <Popover
                content={parent.name}
              >
                {parent.name}
              </Popover>
            </span>
            <Popconfirm
              title="删除该选项后, 选项下的层级也将一并删除, 无法恢复"
              onConfirm={(e) => { e.stopPropagation(); this.handleDeleteParent(parent) }}
              okText="确定"
              cancelText="取消"
            >
              <a onClick={(e) => e.stopPropagation()}>删除</a>
            </Popconfirm>
          </div>
      }
    </div>);
  }

  getChildData = (child) => {
    return (<div className="u-mgb10">
      {
        child.type === 'input' ?
          <Input
            onBlur={(e) => this.updateChildData(child, e.target.value)}
            disabled={child.disabled}
            defaultValue={child.name}
            placeholder='请输入' />
          :
          <div
            style={{ height: '30px' }}
            className='f-jcsb-aic f-csp'
            onDoubleClick={() => this.handleChildToInput(child.id)}
          >
            <span className={"f-toe " + styles.configName}>
              <Popover
                content={child.name}
              >
                {child.name}
              </Popover>
            </span>
            <a onClick={() => this.handleDeleteChild(child)}>删除</a>
          </div>
      }
    </div>);
  }

  changeCheck = (value) => {
    this.setState({ checked: value });
    this.props.setCascaderData('cascaderChecked', value);
  }

  render() {
    const { valueData, checked } = this.state;
    const childObj = valueData.find(it => it.active) || {};
    const children = childObj.child || [];

    return (<span>
      <Row className={styles.svTitle}>
        <Col span={12} style={{ padding: '12px 40px 12px' }}>一级选项</Col>
        <Col span={12} style={{ padding: '12px 40px 12px' }}>二级选项</Col>
      </Row>
      <div className={styles.cascaderContent}>
        <Row className={styles.cascaderItem}>
          <Col span={10} offset={1}>
            {
              valueData && valueData.map((parent, index) => (
                this.getParentData(parent)
              ))
            }
          </Col>

          <Col span={10} offset={2}>
            {
              children.map((child) => (
                this.getChildData(child)
              ))
            }
          </Col>
        </Row>
      </div>

      <div className='u-mgt20 u-mgl40'>
        <Checkbox
          checked={checked}
          onChange={(e) => this.changeCheck(e.target.checked)}>
          使用该字段时必须选择到最后一级选项
        </Checkbox>
      </div>
    </span>);
  }
}

export default AddCascaderDialog;
