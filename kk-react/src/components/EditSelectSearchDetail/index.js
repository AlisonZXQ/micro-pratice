import React, { Component } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Input, Divider } from 'antd';
import { connect } from 'dva';
import VersionModal from '@pages/receipt/components/create_version';
import { deepCopy } from '@utils/helper';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import styles from './index.less';

const MenuItem = Menu.Item;

const isEmpty = (text) => {
  return text ? text : '请选择';
};

export class EditSelectSearch extends Component {
  state = {
    visible: false,
    edit: false,
    newValue: '',
    versionList: [],
  };

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

  handleSelectItem = (e, value) => {
    e.stopPropagation();
    this.setState({ visible: false, edit: false });
    this.props.handleSaveSelect(value);
  }

  menu = () => {
    const { dataSource, required } = this.props;
    const { versionList } = this.state;
    const data = deepCopy(versionList.length > 0 ? versionList : dataSource, []);
    if (!required) {
      data.unshift({
        value: 0,
        name: '清空已选项',
        label: '清空已选项'
      });
    }

    return (
      <Menu style={{ width: '200px' }}>
        <MenuItem>
          <Input
            onClick={e => e.stopPropagation()}
            onChange={(e) => this.props.handleSearch(e.target.value)}
            placeholder='请搜索'
            style={{ width: '180px' }} />
        </MenuItem>

        <div className={styles['m-menu']}>
          {data && data
            .map((item) => (
              <div
                className={`f-toe ${styles['m-item']} ${item.value === 0 ? 'u-primary' : ''}`}
                onClick={(e) => {
                  this.setState({ newValue: item.value, visible: false });
                }}>
                {item.label}
              </div>
            ))}
        </div>

      </Menu>);
  };

  onVisibleChange = (visible) => this.setState({ visible });

  handleCreateVersion = (value) => {
    const item = {
      version: value,
      value: value.id,
      name: value.name,
      label: value.name,
    };
    const arr = [
      item,
      ...this.props.dataSource
    ];
    this.setState({ newValue: value.id });
    this.setState({ versionList: arr });
    this.props.handleSearch('');
  }

  render() {
    const { dataSource, value, issueRole, noCreateVersion, subProductId, subProductList } = this.props;
    const { visible, edit, newValue, versionList } = this.state;
    const data = versionList.length > 0 ? versionList : dataSource.length > 0 ? dataSource : [];
    const obj = data.find(it => it.value === newValue) || {};

    return (
      <span>
        <VersionModal
          subProductId={subProductId}
          subProductList={subProductList}
          handleCreateVersion={this.handleCreateVersion}
          onRef={(ref) => this.versionRef = ref} />
        {
          issueRole === ISSUE_ROLE_VALUE_MAP.READ &&
          <div
            className={'u-subtitle'}
            onClick={() => this.setState({ edit: true })}
            style={{ wordBreak: 'break-all' }}
          >{obj.name ? obj.name : <span className="u-placeholder">请选择</span>}
          </div>
        }

        {
          issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
          <span className="f-csp" id="select">
            {
              !edit &&
              [<div
                className={'editIssue u-subtitle'}
                onClick={() => this.setState({ edit: true })}
                style={{ wordBreak: 'break-all' }}
              >{obj.name ? obj.name : <span className="u-placeholder">请选择</span>}
              </div>]
            }

            {
              edit &&
              [<Dropdown
                trigger={['click']}
                onClick={e => e.stopPropagation()}
                overlay={this.menu()}
                visible={visible}
                onVisibleChange={this.onVisibleChange}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                <span className='u-subtitle'>
                  <span style={{ marginRight: '4px', maxWidth: '150px' }} className="f-toe f-ib">{isEmpty(obj.name || '请选择')}</span>
                  <CaretDownOutlined className={"dropDownIcon"} style={{ position: 'relative', top: '-12px' }} />
                </span>
              </Dropdown>,
              <div>
                <a size="small" type="primary" onClick={(e) => this.handleSelectItem(e, newValue)}>保存</a>
                <Divider type="vertical" />
                <a size="small" onClick={() => this.setState({ edit: false, newValue: value })}>取消</a>
                {!noCreateVersion && <span>
                  <Divider type="vertical" />
                  <a onClick={() => this.versionRef.openModal()}>新建版本</a>
                </span>}
              </div>]
            }
          </span>
        }
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(EditSelectSearch);
