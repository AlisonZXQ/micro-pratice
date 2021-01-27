import React, { Component } from 'react';
import { Menu } from 'antd';
import DropDown from '@components/CustomAntd/drop_down';
import CopyAs from '@pages/receipt/components/copy_as';
import { warnModal } from '@shared/CommonFun';
import { LIMITED_RECEIPT } from '@shared/ReceiptConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';

const MenuItem = Menu.Item;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleUpdate = (e, id, data) => {
    e.stopPropagation();
    this.setState({ visible: false });
    const params = {
      id: id,
      roleLimitType: data,
    };

    if (data === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          this.props.handleUpdate(params);
        }
      });
    } else {
      this.props.handleUpdate(params);
    }
  }

  closeVisible = () => {
    this.setState({ visible: false });
  }

  menu = (record) => {
    const { type } = this.props;
    return (<Menu style={{ width: '150px' }}>
      <MenuItem key={1} className='f-tac'>
        <CopyAs
          {...this.props}
          closeVisible={this.closeVisible}
        />
      </MenuItem>
      {
        (record.issueRole !== ISSUE_ROLE_VALUE_MAP.READ && record.issueRole) &&
        <MenuItem key={2} className='f-tac'>
          { //不受限
            record[type] && record[type].roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={(e) => this.handleUpdate(e, record[type].id, LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          { //受限
            record[type] && record[type].roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={(e) => this.handleUpdate(e, record[type].id, LIMITED_RECEIPT.NOT_LIMITED)}
            >取消设置为受限单据</a>
          }
        </MenuItem>
      }
      <MenuItem key={3} className='f-tac'>
        <a className='delColor'
          onClick={(e) => {
            this.props.checkPermission4DeleteOpt(e, record);
            this.setState({ visible: false });
          }}>
          删除
        </a>
      </MenuItem>
    </Menu>);
  }

  render() {
    const { record } = this.props;
    return (<span>
      <DropDown
        visible={this.state.visible}
        onVisibleChange={(visible) => this.setState({ visible: visible })}
        overlay={this.menu(record)}
      />
    </span>);
  }
}

export default index;
