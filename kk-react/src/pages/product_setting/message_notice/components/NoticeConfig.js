import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  message,
  Spin,
  Table,
  Button,
  Modal,
  Select,
  Switch,
  Checkbox,
  Dropdown,
  Menu,
} from 'antd';
import { getNoticeType, getNoticeReceiver, deleteNoticeUser, addNoticeUser,
  addNoticeType, setNoticeType, addNoticeUserGroup } from '@services/product_setting';
import { getFormLayout } from '@utils/helper';
import Tabs from '@components/Tabs';
import { queryUser } from '@services/project';
import { getUserGroupSearch } from '@services/report';
import MyIcon from '@components/MyIcon';
import BusinessHOC from '@components/BusinessHOC';
import { deleteModal } from '@shared/CommonFun';
import { noticeName, receiptNoticeTypeArr, receiptNoticeType, receiptNoticeUserArr } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formLayout = getFormLayout(5, 13);

class NoticeConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: receiptNoticeType.objective, //目标
      loading: false,
      addVisible: false,
      addGroupVisible: false,
      userEmailList: [],
      userGroupList: [],
      dltid: 0,
      initEvent: '',
    };
    this.columns = [
      {
        title: '通知名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
      },
      {
        title: '通知渠道',
        dataIndex: 'type',
        render: (text, record) => {
          return this.popContent(record);
        }
      },
      {
        title: '通知对象',
        dataIndex: 'users',
        width: 400,
        render: (text, record) => {
          const isSystem = record.key.indexOf('system') > -1;
          const key = this.state.activeKey;
          const isAdviseAndTicket = key === receiptNoticeType.advise || key === receiptNoticeType.ticket;
          const checkedArr = () => {
            let arr = [];
            record.noticeTypes.map(it => {
              arr.push(it.type);
            });
            return arr;
          };
          return <div>
            {!isSystem &&
              <span>
                {receiptNoticeUserArr.map(it => {
                  if(it.name === '验证人' && isAdviseAndTicket) {
                    return '';
                  }else {
                    return <Checkbox
                      checked={checkedArr().indexOf(it.key) > -1}
                      onChange={(e) => this.onChangeNoticeUser(e, record)}
                      value={it.key}>
                      {it.name}
                    </Checkbox>;
                  }
                })}

              </span>
            }

            {text.map((item) => {
              return <span className={styles.userTag}>
                {item.username}
                <MyIcon
                  onClick={() => this.openDltDialog(item)}
                  className='u-mgl5 f-csp'
                  type='icon-guanbi' />
              </span>;
            })}
            <Dropdown overlay={() => this.menu(record)}>
              <Button
                type="dashed"
                size='small'>
                {isSystem ? '添加人员' : '+自定义'}
              </Button>
            </Dropdown>
          </div>;
        }
      },
      {
        title: '是否打开',
        dataIndex: 'type',
        render: (text, record) => {
          return <Switch
            checked={record.type.toString() === '' ? false : record.type.toString() !== '1'}
            onChange={(value) => this.onChangeNoticeType(value, record)} />;
        }
      },
    ];
  }

  componentDidMount() {
    this.getData();
  }

  menu = (record) => {
    return <Menu>
      <Menu.Item onClick={() => this.openAddDialog(record)}>
        <span>添加用户</span>
      </Menu.Item>
      <Menu.Item onClick={() => this.openAddGroupDialog(record)}>
        <span>添加用户组</span>
      </Menu.Item>
    </Menu>;
  }

  openDltDialog = (item) => {
    this.setState({ dltid: item.dltid }, () => this.handleDelete());
  }

  openAddDialog = (record) => {
    this.setState({ initEvent: record.key }, () => this.setState({ addVisible: true }));
  }

  openAddGroupDialog = (record) => {
    this.setState({ initEvent: record.key }, () => this.setState({ addGroupVisible: true }));
  }

  popContent = (record) => {
    const { isBusiness } = this.props;
    return <div>
      <Checkbox.Group
        className='u-mgl10'
        onChange={(value) => this.onChangeNoticeType(value, record)}
        value={record.type}
        name="radiogroup">
        <Checkbox value={2}>站内信通知</Checkbox>
        <Checkbox value={3}>邮件通知</Checkbox>
        {
          !isBusiness && <Checkbox value={4}>泡泡消息通知</Checkbox>
        }

      </Checkbox.Group>
    </div>;
  }

  onChangeNoticeUser = (e, record) => {
    if(e.target.checked) {
      const params = {
        productid: this.props.productid,
        eventkey: record.key,
        type: e.target.value,
        targetReceipt: this.state.activeKey,
        value: 1, //启用
      };
      addNoticeType(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`修改失败, ${res.msg}`);
        }
        message.success('修改成功！');
        this.getData();
      }).catch((err) => {
        return message.error('修改异常', err || err.msg);
      });
    }else {
      const { value } = e.target;
      const { noticeTypes } = record;
      const item = noticeTypes.find(it => it.type === value);
      const params = {
        id: item.dltid,
      };
      deleteNoticeUser(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`修改失败, ${res.msg}`);
        }else {
          message.success('修改成功！');
          this.getData();
        }
      }).catch((err) => {
        return message.error('修改异常', err || err.msg);
      });
    }
  }

  onChangeNoticeType = (value, record) => {

    let newValue = [];
    if(value === true){
      return message.warning('您当前未勾选通知渠道！');
    }else if(value === false){
      newValue = [1];
    }else {
      newValue = value;
    }
    const isSystem = record.key.indexOf('system') > -1;
    const { activeKey } = this.state;

    const params = {
      productid: this.props.productid,
      eventkey: record.key,
      types: newValue,
      targetReceipt: isSystem ? receiptNoticeType.system : activeKey,
    };
    setNoticeType(params).then((res) => {
      if (res.code !== 200) return message.error(`修改失败, ${res.msg}`);
      message.success('修改成功！');
      this.getData();
    }).catch((err) => {
      return message.error('修改异常', err || err.msg);
    });
  }

  getData = () => {
    this.setState({ loading: true });
    const params = {
      productid: this.props.productid
    };
    getNoticeType(params).then((res) => { //通知方式数据
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      const data = res.result;

      let system = [], objective = [], advise = [], requirement = [],
        task = [], subTask = [], bug = [], ticket = [];
      system = data.filter(it => it.targetReceipt === receiptNoticeType.system);
      objective = data.filter(it => it.targetReceipt === receiptNoticeType.objective);
      advise = data.filter(it => it.targetReceipt === receiptNoticeType.advise);
      requirement = data.filter(it => it.targetReceipt === receiptNoticeType.requirement);
      task = data.filter(it => it.targetReceipt === receiptNoticeType.task);
      subTask = data.filter(it => it.targetReceipt === receiptNoticeType.subTask);
      bug = data.filter(it => it.targetReceipt === receiptNoticeType.bug);
      ticket = data.filter(it => it.targetReceipt === receiptNoticeType.ticket);

      const arr = [
        { key: 'system', value: system }, { key: 'objective', value: objective },
        { key: 'advise', value: advise }, { key: 'requirement', value: requirement },
        { key: 'task', value: task }, { key: 'subTask', value: subTask },
        { key: 'bug', value: bug }, { key: 'ticket', value: ticket },
      ];
      arr.forEach(arrItem => {
        let newData = [];
        noticeName.map((item) => {
          let types = [];
          arrItem && arrItem.value.map((it) => {
            if (item.key === it.eventkey) {
              types.push(it.type);
            }
          });
          if (types.length > 1 && types.indexOf(1) > -1) {
            types.splice(types.indexOf(1), 1);
          }
          newData.push({
            key: item.key,
            name: item.value,
            type: types,
            targetReceipt: receiptNoticeType[arrItem.key],
          });
        });
        this.setState({ [`${arrItem.key}First`]: newData }); //第一次处理的数据
      });

      this.getNoticeReceiver(params);
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error('获取信息异常', err || err.msg);
    });
  }
  getNoticeReceiver = (params) => {
    const arr = ['system', 'objective', 'advise', 'requirement',
      'task', 'subTask', 'bug', 'ticket'];

    getNoticeReceiver(params).then((res) => { //通知对象数据
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      const data = res.result;

      arr.forEach(arrItem => {
        const arrFirst = this.state[`${arrItem}First`];
        arrFirst.map((item, index) => {
          let users = [];
          let noticeTypes =[];
          data.forEach((it) => {
            if (item.key === it.eventNotificationReceiver.eventkey && item.targetReceipt === it.eventNotificationReceiver.targetReceipt) {
              const type = it.eventNotificationReceiver.type;
              if(receiptNoticeUserArr.find(it => it.key === type)) { //四类人
                noticeTypes.push({
                  type: type,
                  dltid: it.eventNotificationReceiver.id
                });
              }else { //搜索人
                users.push({
                  username: (it.user && it.user.realname) || (it.userGroup && it.userGroup.name),
                  dltid: it.eventNotificationReceiver.id,
                });
              }
            }
          });
          arrFirst[index].users = users;
          arrFirst[index].noticeTypes = noticeTypes;
        });
        this.setState({ [`${arrItem}Second`]: arrFirst }); //第二次处理的数据
      });

    }).catch((err) => {
      this.setState({ loading: false });
      return message.error('获取信息异常', err || err.msg);
    });
  }

  handleSearch = (value) => {
    const params = {
      value: value,
      offset: 0,
      limit: 10,
    };
    if (value === '') {
      return;
    }
    queryUser(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询人员失败, ${res.msg}`);
      }
      this.setState({ userEmailList: res.result });
    }).catch((err) => {
      return message.error('查询人员异常', err || err.msg);
    });
  }

  handleSearchGroup = (value) => {
    const params = {
      productid: this.props.productid,
      name: value,
      offset: 0,
      limit: 10,
    };
    if (value === '') {
      return;
    }
    getUserGroupSearch(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询用户组失败, ${res.msg}`);
      }
      this.setState({ userGroupList: res.result });
    }).catch((err) => {
      return message.error('查询用户组异常', err || err.msg);
    });
  }

  handleSelectEmail = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ email: data.props.data.email });
  }

  handleSelectGroup = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ usergroupid: value });
  }

  handleEventChange = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ eventkey: value });
  }

  handleDelete = () => {
    const { dltid } = this.state;
    const params = {
      id: dltid,
    };
    deleteModal({
      title: '提示',
      content: '您确认要删除此通知对象吗?',
      okCallback: () => {
        deleteNoticeUser(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`删除失败, ${res.msg}`);
          }
          message.success('删除成功！');
          this.getData();
        }).catch((err) => {
          return message.error('删除异常', err || err.msg);
        });
      }
    });
  }

  handleAddOk = () => {
    this.props.form.validateFieldsAndScroll(['email', 'eventkey'], (err, values) => {
      if (err) return;
      const eventkey = values.eventkey;
      const isSystem = eventkey.indexOf('system') > -1;
      const params = {
        productid: this.props.productid,
        ...values,
        targetReceipt: isSystem ? receiptNoticeType.system : this.state.activeKey,
      };
      addNoticeUser(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`添加失败, ${res.msg}`);
        }
        message.success('添加成功！');
        this.setState({ addVisible: false });
        this.getData();
      }).catch((err) => {
        return message.error('添加异常', err || err.msg);
      });
    });
  }

  handleAddGroupOk = () => {
    this.props.form.validateFieldsAndScroll(['usergroupid', 'eventkey'], (err, values) => {
      if (err) return;
      const eventkey = values.eventkey;
      const isSystem = eventkey.indexOf('system') > -1;
      const params = {
        productid: this.props.productid,
        ...values,
        targetReceipt: isSystem ? receiptNoticeType.system : this.state.activeKey,
      };
      addNoticeUserGroup(params).then((res) => {
        if (res.code !== 200) {
          return message.error(`添加失败, ${res.msg}`);
        }
        message.success('添加成功！');
        this.setState({ addGroupVisible: false });
        this.getData();
      }).catch((err) => {
        return message.error('添加异常', err || err.msg);
      });
    });
  }

  callback = (key) => {
    this.setState({ activeKey: key });
  }

  getFinalyData = (key) => {
    let name = '';
    for(let i in receiptNoticeType) {
      if(receiptNoticeType[i] === key) {
        name = i;
      }
    }
    const arr = this.state[`${name}Second`];
    if(arr) {
      return arr.filter(it => it.key.indexOf('system') === -1);
    }
  }

  render() {
    const { addVisible, userEmailList, userGroupList, activeKey } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (<Spin spinning={this.state.loading}>
      <div style={{ padding: '0px 16px 16px 16px' }}>
        <div className='bbTitle' style={{ marginTop: '0px' }}>
          <span className='name'>系统通知</span>
        </div>
        <div className='bgWhiteModel'>
          <Table
            dataSource={this.state.systemSecond && this.state.systemSecond.filter(it => it.key.indexOf('system')> -1)}
            columns={this.columns}
            pagination={false} />
        </div>
        <div className='bbTitle'>
          <span className='name'>工作项通知</span>
        </div>
        <div className='bgWhiteModel' style={{ overflow: 'auto' }}>
          <Tabs
            tabsData={receiptNoticeTypeArr}
            defaultKey={receiptNoticeType.objective}
            className={styles.tabs}
            callback={this.callback}
          />
          <Table
            dataSource={this.getFinalyData(activeKey)}
            columns={this.columns}
            className='u-mgt10'
            pagination={false} />
        </div>
      </div>

      <Modal
        title="添加通知用户"
        visible={addVisible}
        onOk={this.handleAddOk}
        onCancel={() => this.setState({ addVisible: false })}
        destroyOnClose={true}
        maskClosable={false}
      >
        <FormItem label="邮箱" {...formLayout}>
          {getFieldDecorator('email', {
            initialValue: '',
            rules: [{ required: true, message: '邮箱不能为空' }]
          })(
            <Select
              showArrow={false}
              showSearch
              placeholder="请选择"
              optionFilterProp="children"
              style={{ width: '100%' }}
              onSearch={(value) => this.handleSearch(value)}
              onChange={(value, data) => this.handleSelectEmail(value, data)} // select不适用于回填的情况
            >
              {
                userEmailList && userEmailList.map(it => (
                  <Option key={it.email} value={it.email} data={it}>{it.realname || it.name} {it.email}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="通知事件" {...formLayout}>
          {getFieldDecorator('eventkey', {
            initialValue: this.state.initEvent,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Select
              disabled={true}
              style={{ width: '100%' }}
              onChange={(value) => this.handleEventChange(value)}>
              {noticeName.map((item) => (
                <Option key={item.key} value={item.key}>{item.value}</Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Modal>
      <Modal
        title="添加通知用户组"
        visible={this.state.addGroupVisible}
        onOk={this.handleAddGroupOk}
        onCancel={() => this.setState({ addGroupVisible: false })}
        destroyOnClose={true}
        maskClosable={false}
      >
        <FormItem label="用户组" {...formLayout}>
          {getFieldDecorator('usergroupid', {
            initialValue: '',
            rules: [{ required: true, message: '用户组不能为空' }]
          })(
            <Select
              showArrow={false}
              showSearch
              placeholder="请选择"
              optionFilterProp="children"
              style={{ width: '100%' }}
              onSearch={(value) => this.handleSearchGroup(value)}
              onChange={(value) => this.handleSelectGroup(value)} // select不适用于回填的情况
            >
              {
                userGroupList && userGroupList.map(it => (
                  <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id}>{it.rbacUserGroup.name}-{it.product.name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>
        <FormItem label="通知事件" {...formLayout}>
          {getFieldDecorator('eventkey', {
            initialValue: this.state.initEvent,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Select
              disabled={true}
              style={{ width: '100%' }}
              onChange={(value) => this.handleEventChange(value)}>
              {noticeName.map((item) => (
                <Option key={item.key} value={item.key}>{item.value}</Option>
              ))}
            </Select>
          )}
        </FormItem>
      </Modal>
    </Spin>);
  }
}


export default BusinessHOC()(NoticeConfig);
