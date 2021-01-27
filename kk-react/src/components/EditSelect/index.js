import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Input, message } from 'antd';
import MyIcon from '@components/MyIcon';
import { deepCopy } from '@utils/helper';
import BusinessHOC from '@components/BusinessHOC';
import CloudCC from '@pages/receipt/components/CloudCC';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import styles from './index.less';

const isEmpty = (text) => {
  return text ? text : '请选择';
};

class EditSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      visible: false,
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  handleSelectItem = (value, selectMap) => {
    this.props.handleSaveSelect(value, selectMap);
  }

  menu = () => {
    const { dataSource, required, type, cloudccData, isBusiness } = this.props;
    const { inputValue } = this.state;

    let data = dataSource ? deepCopy(dataSource, []) : [];

    return (
      <Menu style={{ width: '200px' }}>
        <div style={{ margin: '6px 10px 12px 10px' }}>
          <Input
            onClick={e => e.stopPropagation()}
            onChange={(e) => this.setState({ inputValue: e.target.value })}
            placeholder='请搜索'
            style={{ width: '180px' }} />
        </div>

        {
          type === 'cloudcc' && !isBusiness &&
          <div className="u-mgl10" onClick={() => this.setState({ visible: false })}>
            没有找到想要的？
            <CloudCC handleSave={this.handleSelectItem} data={cloudccData} />
          </div>
        }

        {
          !required &&
          <div className={styles['m-menu']}>
            <div
              className={`f-toe ${styles['m-item']} u-primary`}
              onClick={(e) => { e.stopPropagation(); this.handleSelectItem(0); this.setState({ visible: false }) }}>
              清空已有选项
            </div>
          </div>
        }

        <div className={styles['m-menu']}>
          {data
            .filter(it => !inputValue || it.name.includes(inputValue))
            .map((item) => (
              <div
                className={`f-toe ${styles['m-item']} ${item.id === 0 ? 'u-primary' : ''}`}
                onClick={(e) => { e.stopPropagation(); this.handleSelectItem(item.id); this.setState({ visible: false }) }}>
                {item.name}
              </div>
            ))}
        </div>
      </Menu >);
  };

  onVisibleChange = (visible) => this.setState({ visible });

  handleClick = (e) => {
    e.stopPropagation();
    if (this.props.getModuleListByClick) {
      this.props.getModuleListByClick();
    }
  }

  render() {
    const { dataSource, value, issueRole, type } = this.props;
    const { visible } = this.state;
    const data = dataSource || [];
    const obj = data.find(it => it.id === value) || {};
    const name = obj.name && obj.name.length ? obj.name : '';
    const displayName = name.length > 10 ? `${name.slice(0, 10)}...` : name;
    const editAccess = issueRole || ISSUE_ROLE_VALUE_MAP.MANAGE;

    return (
      <span id="select" style={{ position: 'relative' }}>
        {
          editAccess === ISSUE_ROLE_VALUE_MAP.READ &&
          <span className='u-subtitle f-csp' style={{ display: 'table' }} onClick={(e) => { e.stopPropagation(); message.error(NO_OPT_PERMISSION_TIP_MSG) }}>
            <span className={displayName ? styles.noColor : styles.hasColor}>{isEmpty(displayName)}</span>
            <CaretDownOutlined className={"dropDownIcon"} style={{ display: 'table-cell' }} />
          </span>
        }

        {
          editAccess !== ISSUE_ROLE_VALUE_MAP.READ &&
          <span>
            <Dropdown
              trigger={['click']}
              onClick={e => this.handleClick(e)}
              overlay={this.menu()}
              visible={visible}
              onVisibleChange={this.onVisibleChange}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              <span
                className='u-subtitle f-csp u-pdt10'
                style={type === 'list' ? { display: 'table', position: 'absolute', top: '-26px', height: '44px' } : {}}>
                <span className={displayName ? styles.noColor : styles.hasColor}>{isEmpty(displayName)}</span>
                <CaretDownOutlined className={"dropDownIcon"} style={{ display: 'table-cell' }} />
              </span>
            </Dropdown>
          </span>
        }
      </span>
    );
  }
}

export default BusinessHOC()(EditSelect);
