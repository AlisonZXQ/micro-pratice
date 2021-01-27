import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Tabs, Select, Popover } from 'antd';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';

import styles from '../index.less';

const { TabPane } = Tabs;
const { Option } = Select;
const FormItem = Form.Item;

class AddARPersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        noticeUserIds2: [],
        noticeUsergroupIds2: [],
        noticeAppointTypeList2: [],
      },
    };
  }


  componentDidMount() {
    this.props.onRef(this);

    const { currentNode, flowData } = this.props; //设置tag
    this.updateData(currentNode, flowData);
  }

  updateData = (currentNode, flowData) => { //点击节点更换审批人员信息
    if (JSON.stringify(flowData) !== '{}') {
      let noticeUserIds2 = flowData[currentNode].userIds && flowData[currentNode].userIds.map((item) => {
        return {
          key: item.id || item.key,
          label: item.name || item.label,
        };
      });
      this.handleChange(noticeUserIds2, 'noticeUserIds2');
      let noticeUsergroupIds2 = flowData[currentNode].usergroupIds && flowData[currentNode].usergroupIds.map((item) => {
        return {
          key: item.id || item.key,
          label: item.name || item.label,
        };
      });
      this.handleChange(noticeUsergroupIds2, 'noticeUsergroupIds2');
      let noticeAppointTypeList2 = flowData[currentNode].appointTypeList && flowData[currentNode].appointTypeList.map((item) => {
        if (flowData[currentNode].appointTypeList.indexOf(1) > -1 || flowData[currentNode].appointTypeList[0].key === 1) {
          return {
            key: 1,
            label: '单据验收人',
          };
        }
      });
      this.handleChange(noticeAppointTypeList2, 'noticeAppointTypeList2');
    }
  }


  handleChange = (value, type) => {
    let newValue = value;

    let newData = this.state.data;
    if (type === 'noticeUserIds2' && newValue) {
      newData.noticeUserIds2 = newValue;
    } else if (type === 'noticeUsergroupIds2' && newValue) {
      newData.noticeUsergroupIds2 = newValue;
    } else if (type === 'noticeAppointTypeList2' && newValue) {
      newData.noticeAppointTypeList2 = newValue;
    }
    this.setState({ data: newData });

    this.props.addApprovalPerson(newData);
  }

  dltTag = (value, type) => {
    const { form: { setFieldsValue } } = this.props;
    const newData = this.state.data;
    let newArr = newData[type].filter(item => item !== value);
    if (type === 'noticeUserIds2') {
      setFieldsValue({ noticeUserIds2: newArr });
      newData.noticeUserIds2 = newArr;
    } else if (type === 'noticeUsergroupIds2') {
      setFieldsValue({ noticeUsergroupIds2: newArr });
      newData.noticeUsergroupIds2 = newArr;
    } else {
      setFieldsValue({ noticeAppointTypeList2: [] });
      newData.noticeAppointTypeList2 = newArr;
    }
    this.setState({ data: newData });
    this.props.addApprovalPerson(newData);
  }


  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { userData, userGroupData } = this.props;
    const { noticeUserIds2, noticeUsergroupIds2, noticeAppointTypeList2 } = this.state.data;
    return (
      <span>
        {noticeUserIds2 && noticeUserIds2.map((item, index) => {
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={() => { this.dltTag(item, 'noticeUserIds2') }}
            />
          </div>;
        })}
        {noticeUsergroupIds2 && noticeUsergroupIds2.map((item, index) => {
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={() => { this.dltTag(item, 'noticeUsergroupIds2') }}
            />
          </div>;
        })}
        {noticeAppointTypeList2 && noticeAppointTypeList2.map((item, index) => {
          return <div className={styles.defineTag} key={index}>
            <span>{item.label}</span>
            <MyIcon type='icon-guanbi'
              className='u-mgl5 f-csp'
              onClick={() => { this.dltTag(item, 'noticeAppointTypeList2') }}
            />
          </div>;
        })}
        <Popover content={<div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="用户" key="1">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeUserIds2', {
                  initialValue: noticeUserIds2,
                })(
                  <Select
                    optionFilterProp="children"
                    optionLabelProp="label"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请选择用户"
                    onChange={(event) => { this.handleChange(event, 'noticeUserIds2') }}
                  >
                    {userData && userData.map(it => (
                      <Option key={it.user.id} value={it.user.id} label={it.user.realname}>{it.user.realname} {(it.user.email)}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </TabPane>
            <TabPane tab="用户组" key="2">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeUsergroupIds2', {
                  initialValue: noticeUsergroupIds2,
                })(
                  <Select
                    optionFilterProp="children"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请选择用户组"
                    onChange={(event) => { this.handleChange(event, 'noticeUsergroupIds2') }}
                  >
                    {userGroupData && userGroupData.map(it => (
                      <Option key={it.rbacUserGroup.id} value={it.rbacUserGroup.id}>{it.rbacUserGroup.name}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </TabPane>
            <TabPane tab="指定" key="3">
              <FormItem className="u-mgt10">
                {getFieldDecorator('noticeAppointTypeList2', {
                  initialValue: noticeAppointTypeList2,
                })(
                  <Select
                    optionFilterProp="children"
                    labelInValue
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请指定"
                    onChange={(event) => { this.handleChange(event, 'noticeAppointTypeList2') }}
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

const mapStateToProps = (state) => {
  return {
    flowData: state.approvalflow.flowData,
    currentNode: state.approvalflow.currentNode,
  };
};

export default connect(mapStateToProps)(AddARPersion);
