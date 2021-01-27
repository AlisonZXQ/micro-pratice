import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Cascader, Select, message, Spin, Radio } from 'antd';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import BusinessHOC from '@components/BusinessHOC';
import { queryUser, getProjectDepartMents } from '@services/project';
import { getFormLayout, equalsObj } from '@utils/helper';
import { PROJECT_DATASOURCE } from '@shared/ProjectConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);
const { TextArea } = Input;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class ProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      fetching: false,
      departmentList: [],
    };
    this.handleSearch = debounce(this.handleSearch, 800);
  }

  componentDidMount() {
    const { data, entid } = this.props;
    this.props.dispatch({ type: 'systemManage/getEntlist' });
    if (data && Object.keys(data).length) {
      this.getDefaultData(data);
    }

    if (entid) {
      this.getDefaultDepartments(entid);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      this.getDefaultData(nextProps.data);
    }

    if (this.props.entid !== nextProps.entid) {
      this.getDefaultDepartments(nextProps.entid);
    }
  }

  getDefaultDepartments = (entid) => {
    getProjectDepartMents({ entid }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ departmentList: res.result || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getDefaultData = (data) => {
    const responseUser = data.responseUser;
    if (responseUser) {
      this.setState({ ownerList: [responseUser] });
    }
  }

  handleSearch = (value, type) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.trim().length) {
      this.setState({ fetching: true });
      queryUser(params).then((res) => {
        this.setState({ fetching: false });
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ ownerList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  handleSelectEnt = (value) => {
    this.getDefaultDepartments(value);
  }

  render() {
    const { form: { getFieldDecorator }, type, data, entid, entList, isBusiness } = this.props;
    const { ownerList, fetching, departmentList } = this.state;
    let editData = {};
    if (type === 'edit') {
      editData = data;
    }

    const defaultSource = isBusiness ? PROJECT_DATASOURCE.EP : PROJECT_DATASOURCE.JIRA;

    return (<span>
      <FormItem label="产品名称" {...formLayout}>
        {
          getFieldDecorator('name', {
            initialValue: editData.name,
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Input placeholder="请输入" />
          )
        }
      </FormItem>

      <FormItem label="归属企业" {...formLayout}>
        {
          getFieldDecorator('entid', {
            initialValue: entid,
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Select
              disabled={!!entid}
              showSearch
              optionFilterProp="children"
              className="f-fw"
              onSelect={this.handleSelectEnt}
              placeholder="请选择企业"
            >
              {
                entList.map(it => <Option key={it.id} value={it.id}>{it.name}</Option>)
              }
            </Select>
          )
        }
      </FormItem>

      <FormItem label="归属部门" {...formLayout}>
        {getFieldDecorator('departmentId', {
          initialValue: editData.department && editData.department.map(it => it.deptId),
          rules: [{ required: true, message: '此项必填！' }],
        })(
          <Cascader
            fieldNames={{ label: 'deptName', value: 'deptId', children: 'children' }}
            expandTrigger="hover"
            options={departmentList}
            changeOnSelect
            showSearch
            className="f-fw"
          />
        )}
      </FormItem>

      <FormItem label="产品负责人" {...formLayout}>
        {getFieldDecorator('responseUid', {
          initialValue: editData && editData.responseUser && editData.responseUser.id,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            allowClear
            showSearch
            showArrow={false}
            placeholder="请输入人名或邮箱"
            filterOption={false}
            onSearch={(value) => this.handleSearch(value, 'owner')}
            className="f-fw"
            notFoundContent={fetching ? <Spin size="small" /> : null}
          >
            {
              ownerList && ownerList.map(it => (
                <Option key={it.id} value={it.id}>{it.realname} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="项目管理数据源" {...formLayout} style={{ display: isBusiness ? 'none' : 'block' }}>
        {
          getFieldDecorator('datasource', {
            initialValue: editData.datasource ? editData.datasource : defaultSource,
          })(
            <RadioGroup>
              <Radio key={1} value={1}>EP</Radio>
              <Radio key={2} value={2}>JIRA</Radio>
            </RadioGroup>
          )
        }
      </FormItem>

      <FormItem label="产品描述" {...formLayout}>
        {
          getFieldDecorator('description', {
            initialValue: editData.description,
          })(
            <TextArea placeholder="请输入，不超过200字" maxLength={200} />
          )
        }
      </FormItem>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    entList: state.systemManage.entList,
  };
};

export default BusinessHOC()(connect(mapStateToProps)(ProductForm));
