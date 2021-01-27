import React, { Component } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input } from 'antd';
import { connect } from 'dva';
import styles from './index.less';

const MenuItem = Menu.Item;

class FilterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectArr: [],
      inputVal: '',
      visible: false,
    };
  }

  componentDidMount() {
    const { defaultValue } = this.props;
    if (defaultValue) {
      this.setState({ selectArr: defaultValue });
    }
  }
  
  componentWillReceiveProps(nextProps) { 
    const { defaultValue } = nextProps;
    // 刚进入默认加载值，当dataFilter加载完成以后不再变动不在走此渠道
    if(defaultValue && this.props.defaultValue !== nextProps.defaultValue && this.props.dataFilter !== nextProps.dataFilter) {
      this.setState({ selectArr: defaultValue });
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
    // 清除掉已保存的name，避免问题
    this.props.dispatch({ type: 'createProject/saveStoneName', payload: name });

    const { onChange } = this.props;
    this.setState({ selectArr: [] });
    onChange([]);
  }

  matchLabel = (value) => {
    const { dataSource } = this.props;
    const matchedData = dataSource.find((item) => item.value === value);
    return matchedData ? matchedData.label : value;
  }

  menu = () => {
    const { dataSource } = this.props;
    const { inputVal, selectArr } = this.state;
    return (<Menu>
      <MenuItem>
        <Input onChange={e => this.setState({ inputVal: e.target.value })} />
      </MenuItem>
      <div className={styles['m-menu']}>
        {dataSource
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
        <span className="f-csp">
          <span className={`${styles.name} f-toe f-vam`}>
            {selectArr.length ? selectArr.map(item => this.matchLabel(item)).join(',') : '全部'}</span>
          <span className={`f-ib f-vam ${styles.icon}`}><CaretDownOutlined /></span>
          {!!selectArr.length && <span className={`f-ib f-vam ${styles.icon} u-icon-close`} onClick={this.clearSelect}>
            <CloseCircleFilled title="清空筛选" /></span>}
        </span>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    dataFilter: state.report.dataFilter,
  };
};

export default connect(mapStateToProps)(FilterSelect);
