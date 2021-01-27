import React, { Component } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input, Popover } from 'antd';
import { equalsObj } from '@utils/helper';
import { connect } from 'dva';
import styles from './index.less';

export class FilterSelect extends Component {
  state = {
    selectArr: [],
    inputVal: '',
    visible: false,
  };
  textInput = React.createRef();

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue) {
      this.setState({ selectArr: defaultValue || [] });
    }
  }

  componentWillReceiveProps(nextProps) {
    // 非里程碑的
    if (!equalsObj(this.props.defaultValue, nextProps.defaultValue)) {
      this.setState({ selectArr: nextProps.defaultValue || [] });
    }
    // 点击单据筛选处对应的里程碑的逻辑已经拿掉，改成直接跳转到单据详情
    // 点击查看单据的时候，有个问题，选择一个点击查询了以后点击取消再点击这个单据没反应
    if (this.props.stoneName !== nextProps.stoneName && nextProps.type === 'mileStone') {
      let newArr = []; // 不要带上已选择的
      if (nextProps.stoneName && nextProps.stoneName.length) {
        newArr.push(1);
      }
      this.setState({ selectArr: newArr });
      this.props.onChange(newArr);
    }
  }

  onVisibleChange = (visible) => {
    const { readOnly } = this.props;
    if (readOnly) {
      return;
    }
    this.setState({ visible });
  }

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
    // 清除掉已保存的name，避免问题
    this.props.dispatch({ type: 'createProject/saveStoneName', payload: '' });

    const { onChange } = this.props;
    this.setState({ selectArr: [] });
    onChange([]);
  }

  selectAll = (e) => {
    e.stopPropagation();

    const { onChange, dataSource } = this.props;
    this.setState({ selectArr: dataSource.map(it => it.value) });
    onChange(dataSource.map(it => it.value));
  }

  matchLabel = (value) => {
    const { dataSource } = this.props;
    const matchedData = dataSource.find((item) => item.value === value);
    const newLabel = (matchedData && matchedData.label) || '';
    return matchedData ? newLabel.replace('yixin.', '') : value;
  }

  menu = () => {
    const { dataSource } = this.props;
    const { inputVal, selectArr } = this.state;
    return (<Menu>
      <div style={{ padding: '6px 12px' }}>
        <Input
          ref={this.textInput}
          onChange={e => this.setState({ inputVal: e.target.value })}
          placeholder='搜索内容' />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <a type='primary' style={{ marginLeft: '12px' }} onClick={this.selectAll} size='small'>全选</a>
        <a style={{ marginLeft: '12px' }} onClick={this.clearSelect} size='small'>清空</a>
      </div>
      <div className={styles['m-menu']}>
        {dataSource && dataSource
          .filter((item) => !inputVal || item.label.includes(inputVal))
          .map((item) => (<div key={item.value} className={styles['m-item']}>
            <Checkbox
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

  focusTextInput = () => {
    setTimeout(() => {
      this.textInput.current && this.textInput.current.focus();
    }, 0);
  }

  render() {
    const { getPopupContainer, readOnly, dataSource } = this.props;
    const { selectArr, visible } = this.state;
    // 去除没有在data范围的id
    const allInDataArr = selectArr.filter(it => dataSource && dataSource.find(i => i.value === it)) || [];

    return (
      <Dropdown
        overlay={this.menu()}
        trigger={['click']}
        onClick={this.focusTextInput}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
      >
        <span className="f-csp">
          {readOnly ? <Popover content={
            allInDataArr && allInDataArr.length ? allInDataArr.map(item => this.matchLabel(item)).join(',') : '全部'
          }>
            <span
              className={`${styles.name} f-toe f-vam`}>
              {allInDataArr && allInDataArr.length ? allInDataArr.map(item => this.matchLabel(item)).join(',') : '全部'}
            </span>
          </Popover> : <span>
            <span
              onClick={() => this.clickParent()}
              className={`${styles.name} f-toe f-vam`}>
              {allInDataArr && allInDataArr.length ? allInDataArr.map(item => this.matchLabel(item)).join(',') : '全部'}
            </span>
            <span className={`f-ib f-vam ${styles.icon}`}>
              {!readOnly && <CaretDownOutlined />}
            </span>
          </span>}
          {!!allInDataArr.length && !readOnly &&
            <span className={`f-ib f-vam ${styles.icon} u-icon-close`} onClick={this.clearSelect}>
              <CloseCircleFilled className={styles.closeIcon} title="清空筛选" />
            </span>
          }
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
