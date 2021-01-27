import React, { Component } from 'react';
import { CaretDownOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Menu, Dropdown, Checkbox, Input } from 'antd';
import { connect } from 'dva';
import { equalsObj } from '@utils/helper';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
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
    if (!equalsObj(this.props.defaultValue, nextProps.defaultValue)) {
      this.setState({ selectArr: nextProps.defaultValue || [] });
    }
  }

  onVisibleChange = (visible) => {
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
    const pendingData = dataSource.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE);
    const stopData = dataSource.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.UNABLE);
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
        <div className={styles.tip}>进行中</div>
        {pendingData && pendingData
          .filter((item) => !inputVal || item.label.includes(inputVal))
          .map((item) => (<div key={item.value} className={styles['m-item']}>
            <Checkbox
              checked={selectArr.includes(item.value)}
              onChange={() => this.updateSelectArr(item.value)}
            >{item.label}</Checkbox>
          </div>))
        }
        {stopData && !!stopData.length &&
          <div className={styles.line}></div>
        }
        <div className={styles.tip}>已停用</div>
        {stopData && stopData
          .filter((item) => !inputVal || item.label.includes(inputVal))
          .map((item) => (<div key={item.value} className={styles['m-item']}>
            <Checkbox
              checked={selectArr.includes(item.value)}
              onChange={() => this.updateSelectArr(item.value)}
            >{item.label}</Checkbox>
          </div>))
        }
      </div>
    </Menu>);
  }

  focusTextInput = () => {
    setTimeout(() => {
      this.textInput.current && this.textInput.current.focus();
    }, 0);
  }

  render() {
    const { getPopupContainer, dataSource } = this.props;
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
          {<span>
            <span
              className={`${styles.name} f-toe f-vam`}>
              {allInDataArr && allInDataArr.length ? allInDataArr.map(item => this.matchLabel(item)).join(',') : '全部'}
            </span>
            <span className={`f-ib f-vam ${styles.icon}`}>
              <CaretDownOutlined />
            </span>
          </span>}
          {!!allInDataArr.length &&
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
  };
};

export default connect(mapStateToProps)(FilterSelect);
