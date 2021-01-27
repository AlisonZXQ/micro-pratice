import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, message } from 'antd';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG, LEVER_ICON, LEVER_MAP, LEVER_COLOR, LEVER_NAME } from '@shared/ReceiptConfig';
import styles from './index.less';

const isEmpty = (text) => {
  return text ? text : '请选择';
};

class EditSelect extends Component {
  state = {
    inputValue: '',
    visible: false,
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  handleSelectItem = (value) => {
    this.props.handleSaveSelect(value);
  }

  menu = () => {

    return (
      <Menu style={{ width: '200px' }}>
        <div className={styles['m-menu']}>
          {Object.keys(LEVER_NAME)
            .map((item) => (
              <div
                className={`f-toe ${styles['m-item']} ${item.id === 0 ? 'u-primary' : ''}`}
                onClick={(e) => { e.stopPropagation(); this.handleSelectItem(Number(item)); this.setState({ visible: false }) }}
              >
                <MyIcon type={LEVER_ICON[Number(item)]} className="f-fs3 u-mgr10"/>
                <span style={{ color: LEVER_COLOR[Number(item)] }}>
                  {LEVER_NAME[Number(item)]}
                </span>
              </div>
            ))}
        </div>
      </Menu >);
  };

  onVisibleChange = (visible) => this.setState({ visible });

  handleClick = (e) => {
    e.stopPropagation();
  }

  render() {
    const { value, issueRole, type } = this.props;
    const { visible } = this.state;
    const editAccess = issueRole || ISSUE_ROLE_VALUE_MAP.MANAGE;
    const levelName = LEVER_NAME[value];

    return (
      <span id="select" style={{ position: 'relative' }}>
        {
          editAccess === ISSUE_ROLE_VALUE_MAP.READ &&
          <span className='u-subtitle f-csp' style={{ display: 'table' }} onClick={(e) => { e.stopPropagation(); message.error(NO_OPT_PERMISSION_TIP_MSG) }}>
            <span className={levelName ? styles.noColor : styles.hasColor}>{isEmpty(levelName)}</span>
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
              >
                <span className={levelName ? styles.noColor : styles.hasColor}>{isEmpty(levelName)}</span>
                <CaretDownOutlined className={"dropDownIcon"} style={{ position: 'relative', top: '-1px' }} />
              </span>
            </Dropdown>
          </span>
        }
      </span>
    );
  }
}

export default BusinessHOC()(EditSelect);
