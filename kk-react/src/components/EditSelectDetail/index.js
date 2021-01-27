import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Input, Divider } from 'antd';
import { connect } from 'dva';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import CloudCC from '@pages/receipt/components/CloudCC';
import { deepCopy } from '@utils/helper';

import styles from './index.less';

const isEmpty = (text) => {
  return text ? text : "请选择";
};

export class EditSelectDetail extends Component {
  state = {
    inputValue: '',
    visible: false,
    edit: false,
    newValue: 0,
  };
  cloudccInfoDialogRef = null;

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({ newValue: value });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ newValue: nextProps.value });
    }
    if (this.props.drawerIssueId !== nextProps.drawerIssueId) {
      this.setState({ edit: false });
    }
  }

  handleSelectItem = (value, selectMap) => {
    this.setState({ edit: false });
    this.props.handleSaveSelect(value, selectMap);
  }

  menu = () => {
    const { dataSource, required, type, cloudccData } = this.props;
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
          type === 'cloudcc' &&
          <div className="u-mgl10" onClick={() => this.setState({ visible: false })}>
            没有找到？<CloudCC handleSave={this.handleSelectItem} data={cloudccData} />
          </div>
        }

        {
          !required &&
          <div className={styles['m-menu']}>
            <div
              className={`f-toe ${styles['m-item']} u-primary`}
              onClick={(e) => {
                e.stopPropagation();
                this.setState({ visible: false, newValue: 0 });
              }}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  this.setState({ newValue: item.id, visible: false });
                }}>
                {item.name}
              </div>
            ))}
        </div>
      </Menu>);
  };

  onVisibleChange = (visible) => this.setState({ visible });

  showCloudccDialog = (e) => {
    if (e.target.tagName !== 'A') {
      return;
    }
    this.cloudccInfoDialogRef.setState({ visible: true });
    this.cloudccInfoDialogRef.getCloudccInfo();
  }

  getDisplayName = (displayName, type) => {
    // const { cloudccId } = this.props;
    // if (type === 'cloudcc' && cloudccId) {
    //   return (
    //     displayName ?
    //       <Popover
    //         content={<div onClick={(e) => { e.stopPropagation(); this.showCloudccDialog(e) }} dangerouslySetInnerHTML={{ __html: getCloudccRichValue(displayName) }} />}
    //       >
    //         <span>{displayName}</span>
    //       </Popover> : <span className="u-placeholder">请选择</span>
    //   );
    // }
    // else {
    return (displayName ? displayName : <span className="u-placeholder">请选择</span>);
    // }
  }

  /***
   * @param type - 目前只有subProduct
   * @param allData - type为subProduct的处理
   */
  render() {
    const { dataSource, cloudccData, value, issueRole, type, cloudccId, allData } = this.props;
    const { visible, edit, newValue } = this.state;
    const data = type === 'subProduct' ? allData : (dataSource || []);
    const obj = data.find(it => it.id === newValue) || {};
    const name = obj.name && obj.name.length ? obj.name : '';
    const displayName = name.length > 10 ? `${name.slice(0, 10)}...` : name;

    return (
      <span>
        {
          issueRole === ISSUE_ROLE_VALUE_MAP.READ &&
          <div
            className={'u-subtitle'}
            onClick={() => this.setState({ edit: true })}
            style={{ wordBreak: 'break-all' }}
          >{this.getDisplayName(displayName, type)}
          </div>
        }

        {
          issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
          <span id="select">
            {
              !edit &&
              [<div
                className={'editIssue u-subtitle'}
                onClick={() => this.setState({ edit: true })}
                style={{ wordBreak: 'break-all' }}
              >{this.getDisplayName(displayName, type)}
              </div>]
            }

            {
              edit && [
                <Dropdown
                  trigger={['click']}
                  onClick={e => e.stopPropagation()}
                  overlay={this.menu()}
                  visible={visible}
                  onVisibleChange={this.onVisibleChange}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  <span className='u-subtitle f-csp' style={{ display: 'table' }}>
                    <span style={{ marginRight: '4px' }}>{isEmpty(displayName)}</span>
                    <CaretDownOutlined className={"dropDownIcon"} style={{ display: 'table-cell' }} />
                  </span>
                </Dropdown>,
                <div>
                  <a size="small" type="primary" onClick={() => this.handleSelectItem(newValue)}>保存</a>
                  <Divider type="vertical" />
                  <a size="small" onClick={() => this.setState({ edit: false, newValue: value })}>取消</a>
                </div>]
            }
          </span>
        }
        {/* <CloudccInfoDialog
          refThis={(ref) => this.cloudccInfoDialogRef = ref}
          productid={productid}
          cloudccId={cloudccId}
          cloudccTable={cloudcc_key}
        /> */}
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(EditSelectDetail);
