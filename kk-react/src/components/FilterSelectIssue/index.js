import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input, Button } from 'antd';
import { equalsObj } from '@utils/helper';
import { connect } from 'dva';
import styles from './index.less';

class FilterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectArr: [],
      inputVal: '',
      visible: false,
      dataSource: [],
    };
  }

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue) {
      this.setState({ selectArr: defaultValue });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.defaultValue, nextProps.defaultValue)) {
      this.setState({ selectArr: nextProps.defaultValue });
    }
  }

  onVisibleChange = (visible) => this.setState({ visible });

  updateSelectArr = (value) => {
    const { onChange } = this.props;
    const { selectArr } = this.state;
    let arr = [];
    if (selectArr.includes(value)) {
      arr = selectArr.filter(item => item !== value);
    } else {
      arr = [...selectArr, value];
    }
    this.setState({ selectArr: arr });
    onChange(arr);
  }

  clearSelect = (e) => {
    e.stopPropagation();
    const { onChange } = this.props;
    this.setState({ selectArr: [] });
    onChange([]);
  }

  selectAll = (e) => {
    e.stopPropagation();
    const { dataSource } = this.props;
    const { onChange } = this.props;
    this.setState({ selectArr: dataSource.map(it => it.value) });
    onChange(dataSource.map(it => it.value));
  }

  matchLabel = () => {
    const { dataSource } = this.props;
    const { selectArr } = this.state;
    const nameArr = [];

    selectArr.forEach(it => {
      const obj = dataSource.find(item => item.value === it) || {};
      nameArr.push(obj.label || it);
    });
    return nameArr;
  }

  menu = () => {
    const { dataSource } = this.props;
    const { inputVal, selectArr } = this.state;
    return (<Menu>
      <div style={{padding: '6px 12px'}}>
        <Input onChange={e => this.setState({ inputVal: e.target.value })} placeholder='搜索内容' />
      </div>
      <div style={{marginBottom: '10px'}}>
        <Button type='primary' style={{ marginLeft: '12px' }} onClick={this.selectAll} size='small'>全选</Button>
        <Button style={{ marginLeft: '12px' }} onClick={this.clearSelect} size='small'>清空</Button>
      </div>
      <div className={styles['m-menu']}>
        {dataSource
          .filter((item) => !inputVal || item.label.includes(inputVal))
          .map((item) => (<div key={item.value} className={styles['m-item']}>
            <Checkbox
              className='f-toe'
              style={{ width: '180px' }}
              checked={selectArr.includes(item.value)}
              onChange={() => this.updateSelectArr(item.value)}
            >{item.label}</Checkbox>
          </div>))}
      </div>
    </Menu>);
  }

  clickParent = () => {
    const key = this.props.selectkey;
    if (key) {
      this.props.getSelectData(key);
    }
  }

  render() {
    const { getPopupContainer } = this.props;
    const { selectArr, visible } = this.state;

    return (
      <Dropdown
        overlay={this.menu()}
        trigger={['click']}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
      >
        <span className="f-csp" onClick={() => this.clickParent()}>
          <span
            className={`${styles.name} f-toe f-vam`}>
            {
              selectArr.length ?
                this.matchLabel().join(',')
                : '全部'
            }
          </span>
          <span className={`f-ib f-vam ${styles.icon}`}><CaretDownOutlined /></span>
        </span>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stoneName: state.createProject.stoneName,
  };
};

export default connect(mapStateToProps)(FilterSelect);
