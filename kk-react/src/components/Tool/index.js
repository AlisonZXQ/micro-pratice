import React, { Component } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Menu, Dropdown, Modal, Select, message, Checkbox, Divider } from 'antd';
import { history } from 'umi';
import { obj2query, getCookie } from '@utils/helper';
import { NO_OPT_PERMISSION_TIP_MSG } from '@shared/ReceiptConfig';

const { Option } = Select;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUpload: false,
      filedValue: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    let arr = [];
    let data = (nextProps.defaultData && nextProps.defaultData.filter((it) => it.key !== 'caozuo')) || [];
    data && data.forEach(item => {
      arr.push(item.key);
    });
    this.setState({ filedValue: arr });
  }

  handleMenuClick = (e) => {
    const key = Number(e.key);
    if(key === 1) {
      this.checkPermission4ImportOpt();
    }else if(key === 2){
      this.setState({ showUpload: true });
    }
  }

  checkPermission4ImportOpt = () => {
    const { hasManagePermission, hasEditPermission } = this.props;
    if(!(hasManagePermission || hasEditPermission)){
      message.error(NO_OPT_PERMISSION_TIP_MSG);
      return;
    }

    history.push(`/manage/receipt/import/?type=${this.props.type}`);
  }

  changeCheck = (e) => {
    const checked = e.target.checked;
    const { data } = this.props;
    let newData = [];
    data.map((item) => {
      newData.push(item.key);
    });
    if(checked) {
      this.setState({ filedValue: newData });
    }else {
      this.setState({ filedValue: [] });
    }
  }

  addField = (val) => {
    let newFiledValue = this.state.filedValue;
    if (newFiledValue.indexOf(val) === -1) {
      newFiledValue.push(val);
      this.setState({ filedValue: newFiledValue });
    }
  }

  deleteField = (val) => {
    let newFiledValue = this.state.filedValue;
    newFiledValue.splice(newFiledValue.indexOf(val), 1);
    this.setState({ filedValue: newFiledValue });
  }

  handleOk = () => {
    const { filedValue } = this.state;
    const { data, newParams, order, orderby, type } = this.props;
    const cookieObj = getCookie();
    let headerValue = [];
    data.map((item) => {
      filedValue.map((it) => {
        if(item.key === it){
          headerValue.push(item);
        }
      });
    });
    const params = {
      u: cookieObj.pmou,
      t: cookieObj.pmot,
      ...newParams,
      order: order,
      orderby: orderby,
      header: JSON.stringify(headerValue)
    };
    const url = `${window.location.origin}/rest/${type}/export`;
    window.open(url + "?" + obj2query(params));
    this.setState({ showUpload: false });
  }

  render() {
    const { showUpload, filedValue } = this.state;
    const { data } = this.props;
    const menu = (
      <Menu onClick={ (e) => this.handleMenuClick(e)}>
        <Menu.Item key={1}>批量导入</Menu.Item>
        <Menu.Item key={2}>导出当前条件数据</Menu.Item>
      </Menu>
    );
    return (
      <span>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            工具 <DownOutlined />
          </Button>
        </Dropdown>
        <Modal
          title="导出当前条件数据"
          okText="确认导出"
          destroyOnClose
          visible={showUpload}
          onOk={() => this.handleOk()}
          onCancel={() => this.setState({ showUpload: false })}
          maskClosable={false}
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span style={{ width: '100px' }}>选择导出字段：</span>
            <div
              style={{ width: '80%' }}
              onMouseDown={(e) => {
                e.preventDefault();
                return false;
              }}
            >
              <Select
                mode="multiple"
                placeholder="请选择导出字段"
                onDeselect={(value)=> this.deleteField(value)}
                style={{ width: '100%' }}
                value={filedValue}
                dropdownRender={menu => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '2px 0' }} />
                    <div style={{ padding: '4px 8px 8px 8px', cursor: 'pointer' }}>
                      <Checkbox onChange={(e) => this.changeCheck(e)}>全选/全不选</Checkbox>
                    </div>
                  </div>
                )}
              >
                {data && data.map((it) => (
                  <Option key={it.key} onClick={() => this.addField(it.key)}>{it.label}</Option>
                ))}
              </Select>
            </div>
          </div>
        </Modal>
      </span>
    );
  }
}

export default Index;
