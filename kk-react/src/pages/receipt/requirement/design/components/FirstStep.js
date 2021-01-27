import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, Radio, Checkbox, DatePicker, message, Card, Col } from 'antd';
import moment from 'moment';
import { equalsObj } from '@utils/helper';
import RichTextEditor from '@components/RichTextEditor';
import UploadFiles from '@components/UploadFiles';
import { queryUser } from '@services/project';
import MyIcon from '@components/MyIcon';
import { platFormObj } from './shared/Config';
import { getTitle } from './shared/Helper';
// import moban from './shared/需求文档标准模板.xlsx';
import styles from '../index.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const controls = [
  'headings', 'list-ul', 'list-ol', 'separator',
  'text-indent', 'separator',
  'text-color', 'bold', 'italic', 'underline', 'separator',
  'remove-styles', 'media', 'link'
];

class FirstStep extends Component {
  state = {
    userList: [],
  }

  componentDidMount() {
    this.getDefaultData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (!equalsObj(this.props.data, nextProps.data)) {
      this.getDefaultData(nextProps);
    }

    if (!equalsObj(this.props.reqData, nextProps.reqData)) {
      this.getDefaultData(nextProps);
    }
  }

  getDefaultData = (props) => {
    const { userList } = this.state;
    const { reqData } = props;

    // 优先恢复data,然后判断需求下是否有默认的负责人
    if (props.data && props.data.responseUser) {
      this.setState({ userList: [props.data.responseUser] });
    }

    if (!userList.length && reqData && reqData.responseUser) {
      this.setState({ userList: [reqData.responseUser] });
    }
  }

  handleSearch = (value, type) => {
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

  handleSelect = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ responseUser: data.props.data });
  }

  getExtraFile = () => {
    const { data, reqAttachment } = this.props;
    let arr = [];
    if (data && data.extraFile) {
      arr = [...data.extraFile];
      return arr;
    }

    if (reqAttachment) {
      reqAttachment.forEach(it => {
        if (it.attachment) {
          arr.push(it.attachment);
        }
      });
      return arr;
    }
    return arr;
  }

  getDefaultDes = () => {
    const { data, reqData } = this.props;

    const requirement = reqData ? reqData.requirement : {};
    let des = '';
    if (data && data.description) {
      des = data.description;
    } else if (requirement && requirement.description) {
      des = requirement.description;
    }

    // 针对设计流程提单保存的富文本内容
    this.props.dispatch({ type: 'design/saveDes', payload: des });
    return des;
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data, reqData } = this.props;
    const { userList } = this.state;
    const requirement = reqData ? reqData.requirement : {};

    return (<Form className="u-mgt20 u-form">
      <Col offset={2} span={20}>
        <Card className={styles.cardStyle}>
          {getTitle('需求名称', true, null)}
          <FormItem>
            {
              getFieldDecorator('name', {
                initialValue: data ? data.name : requirement ? requirement.name : '',
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <Input placeholder="自动填充的需求名称，此处可编辑" style={{ width: '400px' }} />
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          <div>
            {getTitle('需求描述', true, <span className="u-subtitle f-fs1">请务必提供需求的背景、目标、使用场景、用户角色等详细描述。可参考
              {/* <a href={moban} download="需求模板.xlsx">需求模板</a> */}
            </span>)}
          </div>
          <FormItem>
            {
              getFieldDecorator('description', {
                initialValue: this.getDefaultDes(),
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <RichTextEditor
                  height={'200px'}
                  placeholder={<span className="f-fs2">请填写背景、目标、使用场景、用户角色等需求内容完成度请务必达到80%以上</span>}
                  controls={controls}
                />
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('附件资料', false,
            <span className="u-subtitle f-fs1">文档版需求内容、市场调研报告、竞品报告、数据分析报告、用户分析报告、竞品参考图等</span>
          )}
          <FormItem>
            {
              getFieldDecorator('extraFile', {
                initialValue: this.getExtraFile(),
              })(
                <UploadFiles defaultValue={this.getExtraFile()} />
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('涉及平台', true, null)}
          <FormItem>
            {
              getFieldDecorator('platform', {
                initialValue: data && data.platform,
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <CheckboxGroup>
                  {
                    Object.keys(platFormObj).map(it => (<Checkbox value={Number(it)} style={Number(it) !== 7 ? { marginRight: '15px' } : {}}>
                      {platFormObj[it]}
                    </Checkbox>))
                  }
                </CheckboxGroup>
              )
            }
            {getFieldValue('platform') && getFieldValue('platform').includes(7) &&
              getFieldDecorator('extraText', {
                initialValue: data && data.extraText,
              })(
                <Input
                  size="small"
                  className={styles.extraTextInput}
                />
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('优先级', true, null)}
          <FormItem>
            {
              getFieldDecorator('priority', {
                initialValue: data ? data.priority : requirement ? requirement.level : 0,
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <RadioGroup>
                  <Radio value={1}>P0</Radio>
                  <Radio value={2}>P1</Radio>
                  <Radio value={3}>P2</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('时间要求', true, null)}
          <FormItem>
            {
              getFieldDecorator('dueDate', {
                initialValue: data ? moment(data.dueDate) : undefined,
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <DatePicker
                  className="f-fw"
                  placeholder="完整需求的最终交付日期"
                  style={{ width: '400px' }}
                  suffixIcon={<MyIcon type='icon-riqi' />} />
              )
            }
          </FormItem>
        </Card>

        <Card className={styles.cardStyle}>
          {getTitle('需求负责人', true, null)}
          <FormItem>
            {
              getFieldDecorator('responseId', {
                initialValue: (data && data.responseUser) ? data.responseUser.id : (reqData && reqData.responseUser) ? reqData.responseUser.id : '',
                rules: [{ required: true, message: '此项必填！' }],
              })(
                <Select
                  allowClear
                  showSearch
                  placeholder="请输入人名或邮箱"
                  filterOption={false}
                  onSearch={(value) => this.handleSearch(value)}
                  onSelect={(value, data) => this.handleSelect(value, data)}
                  style={{ width: '400px' }}
                >
                  {
                    userList && userList.map(it => (
                      <Option key={it.id} value={it.id} data={it}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              )
            }
          </FormItem>
          {
            getFieldDecorator('responseUser', {
              initialValue: data ? data.responseUser : reqData ? reqData.responseUser : '',
            })(
              <Input style={{ display: 'none' }} />
            )
          }
        </Card>
        <div style={{ height: '20px' }}></div>
      </Col>
    </Form>);
  }
}

export default FirstStep;
