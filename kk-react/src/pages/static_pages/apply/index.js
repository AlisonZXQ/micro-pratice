import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Input, Button, Col, message, Select } from 'antd';
import { history } from 'umi';
import { productApply, getEntList } from '@services/login';
import { getFormLayout } from '@utils/helper';
import BusinessHOC from '@components/BusinessHOC';
import { ENTERPRISE_MAP } from '@shared/SystemManageConfig';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 14);
const Option = Select.Option;

class Apply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entList: [],
      entData: {
        entid: ENTERPRISE_MAP.NETEASE,
        entname: '网易'
      }
    };
  }

  componentDidMount() {
    this.getEntList();
  }

  getEntList = () => {
    getEntList().then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ entList: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleSubmit = () => {
    const { form: { resetFields }, isBusiness } = this.props;
    const { entData } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (isBusiness && !values.entid) {
        return message.warn('所属企业必填！');
      }
      if (!values.name || !values.email) {
        return message.warn('名称或邮箱必填！');
      }
      if (!isBusiness && !values.jirakey) {
        return message.warn('jira键必填！');
      }
      const params = {
        ...entData,
        ...values,
      };
      productApply(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('申请接入成功');
        resetFields();
      }).catch((err) => {
        return message.error(err || err.message);
      });
    });
  }

  saveEnt = (value, options) => {
    const newData = {
      ...this.state.entData,
      entid: options.props.value,
      entname: options.props.label,
    };
    this.setState({ entData: newData });
  }

  render() {
    const { form: { getFieldDecorator }, isBusiness } = this.props;
    const { entList } = this.state;

    return (<div className="u-mg15">
      <div className="bbTitle">
        <span className="name">新产品申请接入</span>
      </div>

      <Card>
        {!isBusiness && <div className={styles.tip}>项目管理平台泡泡群：1502300</div>}

        {isBusiness &&
          <FormItem label="所属企业" {...formLayout}>
            {getFieldDecorator('entid', {
            })(
              <Select
                style={{ width: '100%' }}
                placeholder="请选择企业"
                onChange={(value, option) => this.saveEnt(value, option)}
              >
                {entList && entList.map((item) => (
                  <Option key={item.id} value={item.id} label={item.name}>{item.name}</Option>
                ))}
              </Select>
            )
            }
            {isBusiness &&
              <div className="u-subtitle">
                没找到企业？
                <a onClick={() => history.push(`/entapply`)}>申请企业</a>
              </div>}
          </FormItem>
        }

        <FormItem label="产品名称" {...formLayout}>
          {
            getFieldDecorator('name', {
            })(
              <Input placeholder="请输入产品名" />
            )
          }
        </FormItem>

        <FormItem label="申请人邮箱" {...formLayout}>
          {
            getFieldDecorator('email', {
              rules: [{
                type: 'email',
                message: '邮箱格式不合法',
              }]
            })(
              <Input placeholder="请输入申请人邮箱" />
            )
          }
          {!isBusiness && <div className="u-subtitle">目前暂时仅支持corp邮箱</div>}
        </FormItem>
        {!isBusiness && <FormItem label="JIRA项目键" {...formLayout}>
          {
            getFieldDecorator('jirakey', {
            })(
              <Input placeholder="请输入JIRA项目键" />
            )
          }
          <div>示例中红色部分：http://jira.netease.com/browse/<span className="delColor">EP</span>-293</div>
        </FormItem>}
        <Col offset={6} span={14}>
          <Button type="primary" className="f-fw" onClick={() => this.handleSubmit()}>立即申请</Button>
        </Col>
      </Card>
    </div>);
  }
}

export default Form.create()(BusinessHOC()(Apply));
