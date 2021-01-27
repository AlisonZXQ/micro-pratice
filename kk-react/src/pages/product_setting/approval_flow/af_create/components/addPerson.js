import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Tabs, Select, Popover, message, Col } from 'antd';
import { getUserGroup, getUser } from '@services/approvalflow';
import MyIcon from '@components/MyIcon';
import styles from '../index.less';

const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;

class AddPersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        noticeUserIds: [],
        noticeUsergroupIds: [],
        noticeAppointTypeList: [],
      },
      userGroupData: [],
      userData: [],
    };
  }

  componentDidMount(){
    const obj = this.props.detailData;
    let noticeUserIds = obj.noticeUserIds && obj.noticeUserIds.map((item)=>{
      return {
        key: item.id,
        label: item.name,
      };
    });
    this.handleChange(noticeUserIds, 'noticeUserIds');
    let noticeUsergroupIds = obj.noticeUsergroupIds && obj.noticeUsergroupIds.map((item)=>{
      return {
        key: item.id,
        label: item.name,
      };
    });
    this.handleChange(noticeUsergroupIds, 'noticeUsergroupIds');
    let noticeAppointTypeList = obj.noticeAppointTypeList && obj.noticeAppointTypeList.map((item)=>{
      if(obj.noticeAppointTypeList.indexOf(1)>-1){
        return {
          key: 1,
          label: '单据验收人',
        };
      }
    });
    this.handleChange(noticeAppointTypeList, 'noticeAppointTypeList');

    const { productId } = this.props;
    this.getUserGroup(productId);
  }

  componentWillUnmount(){
    this.setState = (state, callback) => {
      return;
    };
  }

  getUserGroup = (productId) => {
    const params = {
      productId: productId,
    };
    getUserGroup(params).then((res) =>{
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ userGroupData: res.result });
      const obj = res.result.find(it => it.rbacUserGroup.name === '产品用户');
      this.getUser(productId, obj.rbacUserGroup.id);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  }

  getUser = (productId, id) => {
    const params = {
      productId: productId,
      usergroupId: id,
    };
    getUser(params).then((res) =>{
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ userData: res.result });
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  }

  handleChange = (value, type)=>{
    let newValue = value;
    let newData = this.state.data;
    if(type === 'noticeUserIds' && newValue){
      newData.noticeUserIds = newValue;
    }else if(type === 'noticeUsergroupIds' && newValue){
      newData.noticeUsergroupIds = newValue;
    }else if(type === 'noticeAppointTypeList' && newValue){
      newData.noticeAppointTypeList = newValue;
    }
    this.setState({ data: newData });
  }

  dltTag = (value, type) =>{
    const { form: { setFieldsValue } } = this.props;
    const newData = this.state.data;
    let arr = newData[type].filter(item => item !== value);
    if(type === 'noticeUserIds'){
      setFieldsValue({ noticeUserIds: arr });
      newData.noticeUserIds = arr;
    }else if(type === 'noticeUsergroupIds'){
      setFieldsValue({ noticeUsergroupIds: arr });
      newData.noticeUsergroupIds = arr;
    }else if(type === 'noticeAppointTypeList'){
      setFieldsValue({ noticeAppointTypeList: arr });
      newData.noticeAppointTypeList = arr;
    }
    this.setState({ data: newData });
  }


  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { userData, userGroupData } = this.state;
    const { noticeUserIds, noticeUsergroupIds, noticeAppointTypeList } = this.state.data;
    return (
      <span>
        <Col span={2}></Col>
        {noticeUserIds && noticeUserIds.map((item, index) =>{
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={()=>{this.dltTag(item, 'noticeUserIds')}}
            />
          </div>;
        })}
        {noticeUsergroupIds && noticeUsergroupIds.map((item, index) =>{
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={()=>{this.dltTag(item, 'noticeUsergroupIds')}}
            />
          </div>;
        })}
        {noticeAppointTypeList && noticeAppointTypeList.map((item, index) =>{
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={()=>{this.dltTag(item, 'noticeAppointTypeList')}}
            />
          </div>;
        })}
        <Popover content={<div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="用户" key="1">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeUserIds', {
                  initialValue: noticeUserIds,
                })(
                  <Select
                    optionFilterProp="children"
                    optionLabelProp="label"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请选择用户"
                    onChange={(event)=>{this.handleChange(event, 'noticeUserIds')}}
                  >
                    {userData && userData.map(it =>(
                      <Option key={it.user.id} value={it.user.id} label={it.user.realname}>{it.user.realname} {(it.user.email)}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </TabPane>
            <TabPane tab="用户组" key="2">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeUsergroupIds', {
                  initialValue: noticeUsergroupIds,
                })(
                  <Select
                    optionFilterProp="children"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请选择用户组"
                    onChange={(event)=>{this.handleChange(event, 'noticeUsergroupIds')}}
                  >
                    {userGroupData && userGroupData.map(it =>(
                      <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id}>{it.rbacUserGroup.name}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </TabPane>
            <TabPane tab="指定" key="3">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeAppointTypeList', {
                  initialValue: noticeAppointTypeList,
                })(
                  <Select
                    optionFilterProp="children"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请指定"
                    onChange={(event)=>{this.handleChange(event, 'noticeAppointTypeList')}}
                  >
                    <Option key={1} value={1}>单据验收人</Option>
                  </Select>
                )}
              </FormItem>
            </TabPane>
          </Tabs>
        </div>} trigger="click" placement="bottom">
          <Button type="dashed" icon={<PlusOutlined />}>添加人员</Button>
        </Popover>
      </span>
    );
  }
}

export default AddPersion;
