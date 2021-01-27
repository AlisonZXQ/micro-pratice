import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Radio, Select, message, Checkbox, Switch } from 'antd';
import { getFormLayout, equalsObj } from '@utils/helper';
import BusinessHOC from '@components/BusinessHOC';
import { getProductUser } from '@services/product';
import { JIRA_SYNC_USE, FST_TYPE_MAP, subproductIssueTypeArr, subproductEffectArr } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const RadioGroup = Radio.Group;
const Option = Select.Option;

class SubProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    const { data } = this.props;
    if (data && Object.keys(data).length) {
      this.getDefaultData(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      this.getDefaultData(nextProps.data);
    }
  }

  getDefaultData = (data) => {
    const responseUser = data.responseUser;
    if (responseUser) {
      this.setState({ userList: [responseUser] });
    }
  }

  handleSearch = (value) => {
    const { productid } = this.props.location.query;
    const params = {
      name: value,
      limit: 20,
      offset: 0,
      productid
    };
    if (value.length) {
      getProductUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ userList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  includeRequirementAndIssue = () => {
    const { form: { getFieldValue } } = this.props;
    const inRequire = getFieldValue('issueType') && getFieldValue('issueType').indexOf('jiraRequirementSync') > -1;
    const isIssue = getFieldValue('effect') && getFieldValue('effect').indexOf('jiraReceiptSync') > -1;
    if(inRequire && isIssue) {
      return true;
    }
  }

  getEditData = (data) => {
    const limit = data && data.subProductConfig4JiraBo;
    let effect = [];
    let issueType = [];
    subproductEffectArr.map(it => {
      if(limit && limit[it.key]) {
        effect.push(it.key);
      }
    });
    subproductIssueTypeArr.map(it => {
      if(limit && limit[it.key]) {
        issueType.push(it.key);
      }
    });
    return {
      ...data,
      effect,
      issueType,
    };
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data, type, isBusiness } = this.props;
    const { userList } = this.state;
    let editData = {};
    if (type === 'edit') {
      editData = this.getEditData(data);
    }
    return (<span>
      <FormItem label="子产品名称" {...formLayout}>
        {
          getFieldDecorator('name', {
            initialValue: editData.subProductName,
            rules: [{ required: true, message: '此项必填！' }]
          })(
            <Input placeholder="请输入" className="f-fw" />
          )
        }
      </FormItem>
      <FormItem label="子产品负责人" {...formLayout}>
        {getFieldDecorator('responseUid', {
          initialValue: editData.responseUser && editData.responseUser.id,
          rules: [{ required: true, message: '此项必填！' }],
        })(
          <Select
            allowClear
            showSearch
            showArrow={false}
            placeholder="请输入人名"
            filterOption={false}
            onSearch={(value) => this.handleSearch(value)}
            className="f-fw"
          >
            {
              userList && userList.map(it => (
                <Option key={it.id} value={it.id}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      {
        !isBusiness &&
        <span>
          <FormItem label="JIRA副本" {...formLayout}>
            {
              getFieldDecorator('jiraSync', {
                valuePropName: 'checked',
                initialValue: editData.jiraSync === JIRA_SYNC_USE.OPEN ? true : false,
              })(
                <Switch />
              )
            }
          </FormItem>

          {
            getFieldValue('jiraSync') &&
            <span>
              <FormItem label="子产品jira键" {...formLayout}>
                {
                  getFieldDecorator('jiraKey', {
                    initialValue: editData.jiraKey,
                    rules: [{ required: true, message: '此项不能为空' }]
                  })(
                    <Input placeholder="请输入" className="f-fw" />
                  )
                }
              </FormItem>

              <div className={styles.actionArea}>
                <FormItem label="应用范围" {...formLayout}>
                  {
                    getFieldDecorator('effect', {
                      initialValue: editData.effect,
                      rules: [{ required: true, message: '此项不能为空' }]
                    })(
                      <Checkbox.Group style={{ width: '100%' }}>
                        {subproductEffectArr.map(it => (
                          <Checkbox key={it.key} value={it.key}>{it.value}</Checkbox>
                        ))}
                      </Checkbox.Group>
                    )
                  }
                </FormItem>
                {
                  getFieldValue('effect') && getFieldValue('effect').indexOf('jiraReceiptSync') > -1 &&
                  <FormItem label="单据类型" {...formLayout}>
                    {
                      getFieldDecorator('issueType', {
                        initialValue: editData.issueType,
                        rules: [{ required: true, message: '此项不能为空' }]
                      })(
                        <Checkbox.Group style={{ width: '100%' }}>
                          {subproductIssueTypeArr.map(it => (
                            <Checkbox key={it.key} value={it.key}>{it.value}</Checkbox>
                          ))}
                          <Checkbox disabled key='jiraTicketSync' value='jiraTicketSync'>
                            工单
                          </Checkbox>
                        </Checkbox.Group>
                      )
                    }
                  </FormItem>
                }

                {
                  this.includeRequirementAndIssue() &&
                  <FormItem label="一级拆分类型" {...formLayout}>
                    {
                      getFieldDecorator('fstType', {
                        initialValue: editData.fstType ? editData.fstType : FST_TYPE_MAP.TASK,
                      })(
                        <RadioGroup>
                          <Radio key={FST_TYPE_MAP.TASK} value={FST_TYPE_MAP.TASK}>按Task</Radio>
                          <Radio key={FST_TYPE_MAP.SUBTASK} value={FST_TYPE_MAP.SUBTASK}>按SubTask</Radio>
                        </RadioGroup>
                      )
                    }
                  </FormItem>
                }
              </div>

            </span>

          }
        </span>
      }
    </span>);
  }
}

export default withRouter(BusinessHOC()(SubProductForm));
