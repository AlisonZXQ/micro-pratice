import React, { Component } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, Modal, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import { addVersion } from '@services/version';
import MyIcon from '@components/MyIcon';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 16);

const { Option } = Select;

/**
 * 创建单据的时候创建version弹窗
 */
class VersionForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      type: '',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  openModal = (type) => {
    this.setState({ visible: true, type });
  }

  handleOk = () => {
    const { type } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          ...values,
        };
        params['endtime'] = moment(params['endtime']).valueOf();
        addVersion(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('创建版本成功！');
          this.setState({ visible: false });
          this.props.handleCreateVersion(res.result, type);
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  render() {
    const { form: { getFieldDecorator }, subProductId, subProductList } = this.props;

    return (
      <span>
        <Modal
          title="新建版本"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
          destroyOnClose
        >
          <FormItem label="子产品" {...formLayout}>
            {
              getFieldDecorator('subProductId', {
                initialValue: subProductId,
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select disabled className="f-fw">
                  {subProductList && subProductList.map(it => (
                    <Option key={it.id} value={it.id}>{it.subProductName}</Option>
                  ))}
                </Select>
              )
            }
          </FormItem>

          <FormItem label="版本名称" {...formLayout}>
            {
              getFieldDecorator('name', {
                initialValue: '',
                rules: [
                  { required: true, message: '此项不能为空' },
                  { pattern: /^[^\s]*$/, message: '格式不正确'}
                ]
              })(
                <Input placeholder="请输入版本名称" className="f-fw" maxLength={50} />
              )
            }
          </FormItem>

          <FormItem label="计划发布日期" {...formLayout}>
            {
              getFieldDecorator('endtime', {
                initialValue: undefined,
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <DatePicker suffixIcon={<MyIcon type='icon-riqi' />} className="f-fw" />
              )
            }
          </FormItem>

          <FormItem label="描述" {...formLayout} className='u-mgb0'>
            {getFieldDecorator('description', {
              initialValue: '',
            })(
              <Input placeholder="请输入版本描述，不超过200字" className="f-fw" maxLength={200} />
            )}
          </FormItem>
        </Modal>

      </span>
    );
  }
}

export default (Form.create()(VersionForm));
