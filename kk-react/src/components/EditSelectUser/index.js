import React, { Component, memo } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Input, message, Popover } from 'antd';
import { connect } from 'dva';
import { deepCopy } from '@utils/helper';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';
import styles from './index.less';

export class EditSelectSearch extends Component {
  state = {
    visible: false,
    inputVal: '',
  };

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  onVisibleChange = (visible) => this.setState({ visible });

  handleSelectItem = (e, value, user) => {
    e.stopPropagation();
    this.setState({ inputVal: '' });
    this.props.handleSaveSelect(value, user);
  }

  menu = () => {
    const { dataSource, userHistory, required, system, currentUser } = this.props;
    const { inputVal } = this.state;
    const user = currentUser.user || {};
    const currentEmail = user.email;
    const data = dataSource ? deepCopy(dataSource, []) : [];
    let newUserHistory = deepCopy(userHistory, []);
    let displayData = inputVal.trim().length ? data : newUserHistory;
    if (system) { // 系统管理那边用到的
      displayData = data;
    }

    return (
      <Menu style={{ width: '300px' }}>
        <div style={{ padding: '6px 12px' }}>
          <Input
            onClick={e => e.stopPropagation()}
            value={inputVal}
            onChange={(e) => { this.props.handleSearch(e.target.value); this.setState({ inputVal: e.target.value }) }}
            placeholder='请搜索'
          />
        </div>

        <div style={{ margin: '0px 12px 6px 12px' }}>
          <a onClick={(e) => { this.handleSelectItem(e, currentEmail, user); this.setState({ visible: false }) }}>
            分配给我
          </a>
          {!required &&
            <a
              className='u-mgl20'
              onClick={(e) => { this.handleSelectItem(e, ''); this.setState({ visible: false }) }}>
              清空已有选项
            </a>
          }
        </div>

        <div className={styles['m-menu']} style={{ maxHeight: required ? '200px' : '215px' }}>
          {
            displayData
              .map((item) => (
                <div className={`f-toe ${styles['m-item']} f-pr`} onClick={(e) => { this.handleSelectItem(e, item.value, item); this.setState({ visible: false }) }}>
                  <span className={styles.label}>
                    {item.label}
                  </span>
                </div>
              ))
          }
        </div>

      </Menu>);
  };

  getUserHistory = () => {
    const { lastProduct } = this.props;
    const productid = lastProduct.id;
    this.props.dispatch({ type: 'receipt/getUserHistory', payload: { productid } });
  }

  getPopoverName = (name, fullName) => {
    return <Popover
      content={fullName}
    >
      {name}
    </Popover>;
  }

  getDisabledUser = (str) => {
    const { type } = this.props;
    let name = str.length > 6 ? `${str.slice(0, 6)}...` : str;
    name = name && name.replace('yixin.', '');

    if (type === 'drawer') {
      return <span>
        {this.getPopoverName(name, str) || <span className={styles.unSelect}>请选择</span>}
      </span>;
    } else {
      return (
        <span onClick={(e) => { e.stopPropagation(); message.error(NO_OPT_PERMISSION_TIP_MSG) }}>
          <span>
            {this.getPopoverName(name, str) || <span className={styles.unSelect}>请选择</span>}
          </span>
          <CaretDownOutlined
            className={`dropDownIcon`}
            style={{ top: '-1px', position: 'relative', left: '4px' }} />
        </span>
      );
    }
  }

  /**
   * @param {String} - type detail/drawer/list/objectiveManage（没有背景）
   */
  getUnDisabledUser = (str) => {
    const { type } = this.props;
    const { visible } = this.state;
    let name = str;
    name = name.replace('yixin.', '');

    return (
      <span id="select" className="f-csp" style={{ position: 'relative' }}>
        <Dropdown
          trigger={['click']}
          onClick={e => { e.stopPropagation(); this.getUserHistory() }}
          overlay={this.menu()}
          visible={visible}
          onVisibleChange={this.onVisibleChange}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          <span
            style={type !== 'list' ? {} : { position: 'absolute', height: '44px', top: '-20px', paddingTop: '10px' }}
            className={`f-pr u-subtitle ${type === 'detail' || type === 'drawer' ? styles.bgHover : ''}`}>
            {
              name ?
                <span>
                  {
                    this.getPopoverName(name.length > 6 ? `${name.slice(0, 6)}...` : name, str)
                  }
                  <CaretDownOutlined
                    className={`dropDownIcon`}
                    style={{ top: '-1px', position: 'relative', left: '4px' }} />
                </span>
                :
                <span>
                  <span className={styles.unSelect}>请选择</span>
                  <CaretDownOutlined
                    className={`dropDownIcon`}
                    style={{ position: 'relative', left: '10px', top: '-1px' }} />
                </span>
            }
          </span>
        </Dropdown>
      </span>
    );
  }

  render() {
    const { dataSource, value, issueRole } = this.props;
    const data = dataSource || [];
    const obj = data.find(it => it.value === value) || {};
    const str = obj.name || value || '';
    let role = issueRole || ISSUE_ROLE_VALUE_MAP.MANAGE;

    return (<span>
      {
        (role === ISSUE_ROLE_VALUE_MAP.MANAGE || role === ISSUE_ROLE_VALUE_MAP.EDIT) ?
          this.getUnDisabledUser(str)
          :
          this.getDisabledUser(str)

      }
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    userHistory: state.receipt.userHistory,
    lastProduct: state.product.lastProduct,
    adviseDetail: state.advise.adviseDetail,
    bugDetail: state.bug.bugDetail,
    taskDetail: state.task.taskDetail,
    requirementDetail: state.requirement.requirementDetail,
    objectiveDetail: state.objective.objectiveDetail,
    currentUser: state.user.currentUser,
  };
};

export default memo(connect(mapStateToProps)(EditSelectSearch));
