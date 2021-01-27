import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Checkbox } from 'antd';
import { getFormLayout } from '@utils/helper';

const FormItem = Form.Item;
const formLayout = getFormLayout(4, 20);
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;

class MemberForm extends Component {
  state = {
    
  }

  render() {
    const { form: { getFieldDecorator }, productRole, userGroup, data, type } = this.props;
    const groupList = userGroup.filter(it => it.name !== '产品用户') || [];
    let editData = {};
    if (type === 'edit') {
      editData = data;
    }

    return (<span>
      {
        type === 'create' &&
        <FormItem label="邮箱" {...formLayout}>
          {
            getFieldDecorator('email', {
              rules: [{ required: true, message: '邮箱必填！' }],
            })(
              <TextArea placeholder="请输入，用逗号(,)分隔的多个邮箱，以批量添加人员" />
            )
          }
        </FormItem>
      }

      <FormItem label="岗位" {...formLayout}>
        {
          getFieldDecorator('roleIdList', {
            initialValue: editData.productRoleVOList && editData.productRoleVOList.map(it => it.id),
          })(
            <CheckboxGroup>
              {
                productRole.map(it =>
                  <Checkbox key={it.id} value={it.id} style={{ marginLeft: '0px' }} className="u-mgb10">
                    {it.roleName}
                  </Checkbox>)
              }
            </CheckboxGroup>
          )
        }
      </FormItem>

      <FormItem label="用户组" {...formLayout}>
        {
          getFieldDecorator('usergroupIdList', {
            initialValue: editData.rbacUsergroupVOList && editData.rbacUsergroupVOList.map(it => it.id),
          })(
            <CheckboxGroup>
              {
                groupList.map(it =>
                  <div className="u-mgb10">
                    <Checkbox key={it.id} value={it.id}>
                      {it.name}
                    </Checkbox>
                  </div>)
              }
            </CheckboxGroup>
          )
        }
      </FormItem>
    </span>);
  }
}

export default MemberForm;
