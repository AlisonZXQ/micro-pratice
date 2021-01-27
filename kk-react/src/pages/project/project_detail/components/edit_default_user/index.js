import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Tabs, Popover, Button, Select } from 'antd';
import MyIcon from '@components/MyIcon';
import { withRouter } from 'react-router-dom';
import styles from './index.less';

const { TabPane } = Tabs;
const Option = Select.Option;

const tabs = [{
  name: '用户',
  field: 'userList',
  key: 'user',
}, {
  name: '用户组',
  field: 'usergroupList',
  key: 'userGroup',
}, {
  name: '指定',
  field: 'workflowAppointTypeVOList',
  key: 'appoint',
}];

class EditUser extends Component {
  state = {
    workflowAppointTypeVOList: [{ id: 3, name: '单据验收人' }],

    userDisplay: [],
    userGroupDisplay: [],
    appointDisplay: [],
  };

  componentDidMount() {
    this.getDefaultData();
  }

  getDefaultData = () => {
    const { defaultData } = this.props;
    this.setState({
      userDisplay: defaultData.userList || [],
      userGroupDisplay: defaultData.usergroupList || [],
      appointDisplay: defaultData.workflowAppointTypeVOList || [],
    });
  }

  handleDelete = (type, id) => {
    const { form: { setFieldsValue }, defaultData } = this.props;
    const fid = defaultData.workflowNodeId;
    const { userDisplay, userGroupDisplay, appointDisplay } = this.state;

    if (type === 'user') {
      this.setState({ userDisplay: userDisplay.filter(it => it.id !== id) });
      setFieldsValue({ [`user-${fid}`]: userDisplay.filter(it => it.id !== id).map(it => it.id) });
    } else if (type === 'userGroup') {
      this.setState({ userGroupDisplay: userGroupDisplay.filter(it => it.id !== id) });
      setFieldsValue({ [`userGroup-${fid}`]: userGroupDisplay.filter(it => it.id !== id).map(it => it.id) });
    } else {
      this.setState({ appointDisplay: appointDisplay.filter(it => it.id !== id) });
      setFieldsValue({ [`appoint-${fid}`]: appointDisplay.filter(it => it.id !== id).map(it => it.id) });
    }
  }

  handleChange = (value, data, type) => {
    const arr = [];
    data.forEach(it => {
      arr.push({
        id: it.props.value,
        name: it.props.label,
      });
    });
    if (type === 'user') {
      this.setState({ userDisplay: arr });
    } else if (type === 'userGroup') {
      this.setState({ userGroupDisplay: arr });
    } else {
      this.setState({ appointDisplay: arr });
    }
  }

  getContent = () => {
    const { defaultData, form: { getFieldDecorator } } = this.props;
    const id = defaultData.workflowNodeId;
    const { userList, usergroupList } = this.props;
    const { workflowAppointTypeVOList } = this.state;

    return (<Tabs>
      {
        tabs.map(it => <TabPane tab={it.name} key={it.key}>
          {getFieldDecorator(`${it.key}-${id}`, {
            initialValue: defaultData[it.field] ? defaultData[it.field].map(it => it.id) : [],
          })(
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="请指定"
              optionFilterProp="children"
              optionLabelProp="label"
              onChange={(value, data) => this.handleChange(value, data, it.key)}
            >
              {
                it.key === 'user' && userList && userList.map(it => (
                  <Option key={it.user.id} value={it.user.id} label={it.user.realname}>{it.user.realname} {it.user.email}</Option>
                ))
              }
              {
                it.key === 'userGroup' && usergroupList && usergroupList.map(it => (
                  <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id} label={it.rbacUserGroup.name}>{it.rbacUserGroup.name}</Option>
                ))
              }
              {
                it.key === 'appoint' && workflowAppointTypeVOList && workflowAppointTypeVOList.map(it => <Option key={it.id} value={it.id} label={it.name}>{it.name}</Option>)
              }
            </Select>
          )}
        </TabPane>)
      }
    </Tabs>);
  }

  render() {
    const { defaultData } = this.props;
    const { userDisplay, userGroupDisplay, appointDisplay } = this.state;

    return (
      <span>
        {userDisplay.map(it => <div className={`${styles.name} f-ib u-mgr10`}>
          {it.name}
          <MyIcon type="icon-guanbi" className='u-mgl5' onClick={() => this.handleDelete('user', it.id)} />
        </div>)}

        {userGroupDisplay.map(it => <div className={`${styles.name} f-ib u-mgr10`}>
          {it.name}
          <MyIcon type="icon-guanbi" className='u-mgl5' onClick={() => this.handleDelete('userGroup', it.id)} />
        </div>)}

        {appointDisplay.map(it => <div className={`${styles.name} f-ib u-mgr10`}>
          {it.name}
          <MyIcon type="icon-guanbi" className='u-mgl5' onClick={() => this.handleDelete('other', it.id)} />
        </div>)}

        <Popover
          trigger="click"
          content={this.getContent()}
          placement="bottom"
          overlayStyle={{ width: '300px' }}
        >
          <Button type="dashed" icon={<PlusOutlined />} size="small">添加人员</Button>
        </Popover>

        <div>
          <span
            className={styles.nodeName}>
            {defaultData.workflowNodeName}
          </span>
        </div>

      </span>
    );
  }
}

export default withRouter(EditUser);
