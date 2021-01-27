import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, message, Select } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import debounce from 'lodash/debounce';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const Option = Select.Option;

class ModuleForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      userList: [],
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }


  handleSearch = (value) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ userList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  render() {
    const { form: { getFieldDecorator }, type, moduleObj } = this.props;
    const { userList } = this.state;
    const data = type === 'edit' ? moduleObj : {};

    return (<span>
      <FormItem label="模块名称" {...formLayout}>
        {
          getFieldDecorator('name', {
            initialValue: data.productModule && data.productModule.name,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <Input placeholder="请输入模块名称" className="f-fw" />
          )
        }
      </FormItem>
      <FormItem label="建议默认负责人" {...formLayout}>
        {getFieldDecorator('responseemail', {
          initialValue: data.responseUser ? data.responseUser.email : '',
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
                <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
        <div className={styles.moduleTip}>注：设置后当选择此模块后，建议将自动设置负责人</div>
      </FormItem>
      <FormItem label="建议默认验证人" {...formLayout}>
        {getFieldDecorator('advise_requireemail', {
          initialValue: data.adviseRequireUser ? data.adviseRequireUser.email : '',
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
                <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
        <div className={styles.moduleTip}>注：设置后当选择此模块后，建议将自动设置验证人</div>
      </FormItem>
      <FormItem label="需求默认负责人" {...formLayout}>
        {getFieldDecorator('requirement_responseemail', {
          initialValue: data.requirementResponseUser ? data.requirementResponseUser.email : '',
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
                <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
        <div className={styles.moduleTip}>注：设置后当选择此模块后，需求将自动设置负责人</div>
      </FormItem>
      <FormItem label="需求默认验证人" {...formLayout}>
        {getFieldDecorator('requirement_requireemail', {
          initialValue: data.requirementRequireUser ? data.requirementRequireUser.email : '',
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
                <Option key={it.email} value={it.email}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
        <div className={styles.moduleTip}>注：设置后当选择此模块后，需求将自动设置验证人</div>
      </FormItem>
    </span>);
  }
}

export default ModuleForm;
