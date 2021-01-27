import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, DatePicker, message } from 'antd';
import moment from 'moment';
import { getFormLayout } from '@utils/helper';
import { queryUser } from '@services/project';
import MyIcon from '@components/MyIcon';

const FormItem = Form.Item;
const formLayout = getFormLayout(3, 20);

class SubmitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ownerList: [],
      acceptorList: [],
    };
  }
  componentDidMount() {
    this.getDefaultData(this.props.mileStone);
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (Object.keys(nextProps.mileStone).length !== 0 && this.props.mileStone !== nextProps.mileStone) {
      this.getDefaultData(nextProps.mileStone);
    }
  }

  getDefaultData = (mileStone) => {
    const { form: { setFieldsValue } } = this.props;
    if (mileStone && mileStone.issues) { // 创建项目时的里程碑
      setFieldsValue({ mileContentsTemp: mileStone.issues });
    }
    if (mileStone && mileStone.owner) {
      this.setState({
        ownerList: [mileStone.owner],
        owner: mileStone.owner,
      });
    }
    if (mileStone && mileStone.acceptor) {
      this.setState({
        acceptorList: [mileStone.acceptor],
        acceptor: mileStone.acceptor,
      });
    }
  }

  updateProjectContents = (data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ issues: data });
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
          if (type === 'owner') {
            this.setState({ ownerList: res.result });
          } else {
            this.setState({ acceptorList: res.result });
          }
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  disabledDate = (current) => {
    const { timeRange } = this.props;
    if (timeRange && timeRange.length) {
      const beforeDay = timeRange[0];
      return current && (current < moment(beforeDay).startOf('day') ||
        current > moment(timeRange[1]).endOf('day'));
    }
  }

  handleSelect = (value, data, type) => {
    const { form: { setFieldsValue } } = this.props;
    let obj = {};
    if (data && data.props && data.props.data) {
      obj = {
        id: data.props.data.id,
        name: data.props.data.realname,
        email: data.props.data.email,
      };
    }
    if (type === 'owner') {
      setFieldsValue({ owner: obj });
    } else {
      setFieldsValue({ acceptor: obj });
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, mileStone, mileContentsTemp } = this.props;

    const { ownerList, acceptorList } = this.state;
    return ([
      <Form className="u-form">
        <FormItem label="名称" {...formLayout}>
          {getFieldDecorator('name', {
            initialValue: mileStone && mileStone.name,
            rules: [
              { required: true, message: '此项不能为空' },
              { validator: this.validFunction }
            ]
          })(
            <Input placeholder="请输入时间线名称，不超过50个字" maxLength={50} />
          )}
        </FormItem>
        {/* <FormItem label="负责人" {...formLayout}>
          {getFieldDecorator('ownerId', {
            initialValue: mileStone && mileStone.owner && mileStone.owner.id,
          })(
            <Select
              showSearch
              placeholder="请输入"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value, 'owner')}
              onChange={(value, data) => this.handleSelect(value, data, 'owner')}
              showArrow={false}
            >
              {ownerList.map(it => (
                <Option key={it.id} value={it.id} data={it}>{it.realname || it.name} {it.email}</Option>
              ))}
            </Select>
          )}
        </FormItem>

        {getFieldDecorator('owner', {
          initialValue: mileStone.owner,
        })(
          <label style={{ display: 'none' }} />
        )}

        <FormItem label="验收人" {...formLayout}>
          {getFieldDecorator('acceptorId', {
            initialValue: mileStone && mileStone.acceptor && mileStone.acceptor.id,
          })(
            <Select
              showSearch
              placeholder="请输入"
              filterOption={false}
              onSearch={(value) => this.handleSearch(value, 'acceptor')}
              onChange={(value, data) => this.handleSelect(value, data, 'acceptor')}
              showArrow={false}
            >
              {acceptorList.map(it => (
                <Option key={it.id} value={it.id} data={it}>{it.realname || it.name} {it.email}</Option>
              ))}
            </Select>
          )}
        </FormItem>

        {getFieldDecorator('acceptor', {
          initialValue: mileStone.acceptor,
        })(
          <label style={{ display: 'none' }} />
        )} */}

        <FormItem label="到期日" {...formLayout}>
          {getFieldDecorator('dueDate', {
            initialValue: (mileStone && mileStone.dueDate) ? moment(mileStone.dueDate) : undefined,
            rules: [{ required: true, message: '此项不能为空' }]
          })(
            <DatePicker style={{ width: '100%' }} suffixIcon={<MyIcon type='icon-riqi'/>} />
          )}
        </FormItem>

        {/* {
          !!Object.keys(mileStone).length && mileStone.id &&
          <FormItem label="状态" {...formLayout}>
            {getFieldDecorator('status', {
              initialValue: mileStone && mileStone.status,
            })(
              <Select>
                <Option key={1} value={1}>新建</Option>
                <Option key={2} value={2}>进行中</Option>
                <Option key={3} value={3}>已验收</Option>
              </Select>
            )}
          </FormItem>
        }

        <FormItem label="备注" {...formLayout} style={{marginBottom: '0px'}}>
          {getFieldDecorator('description', {
            initialValue: mileStone && mileStone.description,
          })(
            <TextArea placeholder="给里程碑写点描述，不超过100个字" maxLength={200} style={{height: '80px'}} />
          )}
        </FormItem>

        <FormItem label="关联内容" {...formLayout}>
          {
            (getFieldValue('issues') && getFieldValue('issues').length) ?
              <span>
                <span className="u-mgr10">{getFieldValue('issues').length}个</span>
                <ProjectContents type="去修改" dataType="part" create={this.props.create} updateProjectContents={this.updateProjectContents} />
              </span> :
              <ProjectContents type="去添加" dataType="part" create={this.props.create} updateProjectContents={this.updateProjectContents} />
          }
          {getFieldDecorator('issues', {
            initialValue: mileContentsTemp,
          })(
            <Input style={{ display: 'none' }} />
          )}
        </FormItem> */}
      </Form>
    ]);
  }
}

export default SubmitForm;
