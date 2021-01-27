import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Radio, Tag, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import DefineDot from '@components/DefineDot';
import {
  riskTypeColorMap, riskTypeNameMap, riskTypeStatusColorMapTag,
  riskTypeStatusMap, riskTypeStatusColorMap, RISK_STATUS_MAP, RISK_LEVEL_MAP
} from '@shared/ProjectConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(4, 18);
const { TextArea } = Input;
const Option = Select.Option;

class RiskForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
    };
  }

  componentDidMount() {
    this.getDefaultData(this.props.editData);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editData && Object.keys(nextProps.editData).length !== 0 && this.props.editData !== nextProps.editData) {
      this.getDefaultData(nextProps.editData);
    }
  }

  getDefaultData = (editData) => {
    if (editData && editData.responseUser) {
      this.setState({ ownerList: [editData.responseUser] });
    }
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
          this.setState({ ownerList: res.result });
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  render() {
    const { form: { getFieldDecorator }, editData, view } = this.props;
    const { ownerList } = this.state;

    return (<Form className="u-form">
      <FormItem label="标题" {...formLayout}>
        {
          view ? editData && editData.name :
            getFieldDecorator('name', {
              initialValue: editData && editData.name,
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <Input placeholder="请输入风险名称，不超过50个字" maxLength={50} />
            )
        }
      </FormItem>

      <FormItem label="负责人" {...formLayout}>
        {
          view ? editData && editData.responseUser && editData.responseUser.name :
            getFieldDecorator('responseuid', {
              initialValue: editData && editData.responseUser && editData.responseUser.id,
              rules: [{ required: true, message: '此项必填！' }]
            })(
              <Select
                allowClear
                showSearch
                placeholder="请输入负责人姓名"
                filterOption={false}
                showArrow={false}
                onSearch={(value) => this.handleSearch(value)}
              >
                {
                  ownerList && ownerList.map(it => (
                    <Option key={it.id} value={it.id}>{it.realname} {it.email}</Option>
                  ))
                }
              </Select>
            )
        }
      </FormItem>

      <FormItem label="状态" {...formLayout}>
        {
          view ?
            <Tag color={riskTypeStatusColorMapTag[editData.state]}>{riskTypeStatusMap[editData.state]}</Tag>
            :
            getFieldDecorator('state', {
              initialValue: editData ? editData.state : RISK_STATUS_MAP.OPEN,
            })(
              <Select>
                <Option key={RISK_STATUS_MAP.OPEN} value={RISK_STATUS_MAP.OPEN}>
                  <DefineDot
                    text={RISK_STATUS_MAP.OPEN}
                    statusMap={riskTypeStatusMap}
                    statusColor={riskTypeStatusColorMap}
                  />
                </Option>
                <Option key={RISK_STATUS_MAP.CLOSE} value={RISK_STATUS_MAP.CLOSE}>
                  <DefineDot
                    text={RISK_STATUS_MAP.CLOSE}
                    statusMap={riskTypeStatusMap}
                    statusColor={riskTypeStatusColorMap}
                  />
                </Option>
              </Select>
            )
        }
      </FormItem>

      <FormItem label="风险描述" {...formLayout}>
        {
          view ? (editData && editData.description) || '-' :
            getFieldDecorator('description', {
              initialValue: editData ? editData.description : '',
            })(
              <TextArea style={{ height: '86px' }} placeholder="请填写内容" disabled={!!view} />
            )
        }
      </FormItem>

      {
        editData && editData.solutions &&
        <FormItem label="应对措施" {...formLayout}>
          {
            view ? (editData && editData.solutions) || '-' :
              getFieldDecorator('solutions', {
                initialValue: editData ? editData.solutions : '',
              })(
                <TextArea style={{ height: '86px' }} placeholder="请填写内容" disabled />
              )
          }
        </FormItem>
      }

      <FormItem label="风险等级" {...formLayout} className='u-mgb0'>
        {
          view ? <Tag color={riskTypeColorMap[editData.level]}>{riskTypeNameMap[editData.level]}</Tag> :
            getFieldDecorator('level', {
              initialValue: editData ? editData.level : RISK_LEVEL_MAP.LOW,
            })(
              <Radio.Group disabled={!!view}>
                <Radio value={RISK_LEVEL_MAP.LOW}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.LOW]}>{riskTypeNameMap[RISK_LEVEL_MAP.LOW]}</Tag></Radio>
                <Radio value={RISK_LEVEL_MAP.MIDDLE}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.MIDDLE]}>{riskTypeNameMap[RISK_LEVEL_MAP.MIDDLE]}</Tag></Radio>
                <Radio value={RISK_LEVEL_MAP.HIGH}><Tag color={riskTypeColorMap[RISK_LEVEL_MAP.HIGH]}>{riskTypeNameMap[RISK_LEVEL_MAP.HIGH]}</Tag></Radio>
              </Radio.Group>
            )
        }
      </FormItem>

    </Form>);
  }
}

export default RiskForm;
