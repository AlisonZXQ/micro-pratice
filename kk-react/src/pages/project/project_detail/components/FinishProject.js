import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, message, Input, Checkbox, Row } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import { reportType } from '@shared/ProjectConfig';
import { PROJECT_CUSTOM_USECASE } from '@shared/ProductSettingConfig';
import CustomField from '../../create_project/components/CustomField';

const formLayout = getFormLayout(6, 18);
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

class FinishProject extends Component {
  state = {
    list: [],
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
          this.setState({ list: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  render() {
    const { form: { getFieldDecorator }, data, type } = this.props;
    const { list } = this.state;
    const projectDetail = data.projectDetail || {};
    return (<span>
      <FormItem label="项目结果" {...formLayout}>
        {type === 'finishTodo' ? '立项未通过' : type === 'finishDoing' ? '异常终止' : '项目完成'}
      </FormItem>
      {
        type !== 'finishTodo' &&
        <FormItem label="审批人" {...formLayout} className="u-mgt10">
          {getFieldDecorator('reviewer', {
            rules: [{ required: true, message: '此项必填！' }],
          })(
            <Select
              allowClear
              showSearch
              placeholder="请选择"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value)}
              style={{ width: '100%' }}
            >
              {list.map(it => (
                <Option key={it.id} value={it.id}>{it.realname} {it.email}</Option>
              ))}
            </Select>
          )}
        </FormItem>
      }

      <FormItem label="说明" {...formLayout}>
        {getFieldDecorator('description', {
        })(
          <TextArea placeholder="请输入结项说明，最多500字" maxLength={500} />
        )}
      </FormItem>

      {
        type !== 'finishTodo' &&
        <FormItem label="合规性检查项" {...formLayout}>
          {
            getFieldDecorator('reportStatus', {
            })(
              <CheckboxGroup>
                {Object.keys(reportType).map(it => (
                  <Row>
                    <Checkbox key={Number(it)} value={Number(it)}>
                      {reportType[Number(it)]}
                    </Checkbox>
                  </Row>
                ))}
              </CheckboxGroup>
            )
          }
        </FormItem>
      }

      {
        projectDetail.templateId && <CustomField
          form={this.props.form}
          templateId={projectDetail.templateId}
          type={PROJECT_CUSTOM_USECASE.FINISH}
        />
      }
    </span>);
  }
}

export default FinishProject;
