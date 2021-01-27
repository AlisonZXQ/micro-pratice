import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select } from 'antd';
import { getFormLayout } from '@utils/helper';

const formLayout = getFormLayout(2, 16);
const FormItem = Form.Item;

class EditMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      value: '',
      data: [],
      optionList: [],
    };
  }

  componentDidMount() {
    this.getOptionList();
  }

  getOptionList = () =>{
    const { Option } = Select;
    let children = [];
    const { rolelist } = this.props;
    rolelist.map((item) =>{
      children.push(<Option key={item.roleName} value={item.id}>{item.roleName}</Option>);
    });
    this.setState({optionList: children});
  }

  handleChange = (value) =>{
  }

  render() {
    const { form: { getFieldDecorator }, data } = this.props;
    const roleNames = [];
    data.userVO.projectMemberRoleRelationVOList.map((item, index) => {
      roleNames.push(item.roleid);
    });
    return (<div>
      <FormItem label="用户" {...formLayout}>
        {getFieldDecorator('memberid', {
          initialValue: data && data.memberid,
        })(
          <lable> {data.userVO.name}</lable>
        )}
      </FormItem>
      {/* <FormItem label="角色" {...formLayout}>
        {getFieldDecorator('role', {
          initialValue: data && data.role,
        })(
          <RadioGroup>
            <Radio value={3}>项目成员</Radio>
            <Radio value={2}>项目经理</Radio>
          </RadioGroup>
        )}
      </FormItem> */}
      <FormItem label="角色" {...formLayout}>
        {getFieldDecorator('projectMemberRoleRelationVOList', {
          initialValue: data && roleNames,
        })(
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择用户角色"
            // defaultValue={['a10', 'c12']}
            onChange={this.handleChange()}
          >
            {this.state.optionList}
          </Select>
        )}
      </FormItem>
    </div>);
  }
}

export default EditMember;
