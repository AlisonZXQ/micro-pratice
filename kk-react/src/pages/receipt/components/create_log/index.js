import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { InputNumber, Select, Modal, Row, Col, message } from 'antd';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { getAllUserByProductId, addWorkLoad, updateWorkLoad } from '@services/product';
import TinyMCE from '@components/TinyMCE';

const FormItem = Form.Item;
const formLayout = getFormLayout(3, 21);
const littleFormLayout = getFormLayout(6, 18);

const { Option } = Select;

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      productList: [],
      editObj: {}
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  openModal = (it) => {
    this.setState({ editObj: it });
    this.setState({ visible: true });
    this.getUserList();
  }

  getUserList = () => {
    const { productid } = this.props;
    const params = {
      productId: productid,
      name: ''
    };
    getAllUserByProductId(params).then((res) => {
      if(res.code !== 200) return message.error(res.msg);
      this.setState({ productList: res.result });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { connId, connType, edit } = this.props;
        const { editObj } = this.state;
        if(!edit) {
          const params = {
            connId,
            connType,
            ...values,
          };
          addWorkLoad(params).then((res) => {
            if(res.code !== 200) return message.error(res.msg);
            this.setState({ visible: false });
            message.success('创建成功');
            this.props.dispatch({ type: 'receipt/getLogList', payload: {connId, connType} });
            const { form: { resetFields } } = this.props;
            resetFields();
          }).catch(err => {
            return message.error(err || err.message);
          });
        }else {
          const params = {
            id: editObj.id,
            ...values,
          };
          updateWorkLoad(params).then((res) => {
            if(res.code !== 200) return message.error(res.msg);
            this.setState({ visible: false });
            message.success('更新成功');
            this.props.dispatch({ type: 'receipt/getLogList', payload: {connId, connType} });
            const { form: { resetFields } } = this.props;
            resetFields();
          }).catch(err => {
            return message.error(err || err.message);
          });
        }
      }
    });
  }

  handleCancle = () => {
    this.setState({ visible: false, editObj: {} });
    const { form: { resetFields } } = this.props;
    resetFields();
  }

  render() {
    const { form: { getFieldDecorator }, currentUser, edit } = this.props;
    const currentId = currentUser && currentUser.user && currentUser.user.id;
    const { productList, editObj } = this.state;

    return (<span>
      <Modal
        title={edit ? '编辑日志' : '登记日志'}
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancle}
        destroyOnClose
        width={660}
      >
        <Row>
          <Col span={12}>
            <FormItem label="耗费工时" {...littleFormLayout}>
              {
                getFieldDecorator('workload', {
                  initialValue: editObj && editObj.workload,
                  rules: [
                    { required: true, message: '此项不能为空' },
                  ]
                })(
                  <InputNumber
                    min={0}
                    step={1}
                    placeholder='请输入'
                    style={{ width: '80%' }}
                    onChange={this.handleNumberChange} />
                )
              }
              <span className='u-mgl10'>h</span>
            </FormItem>
          </Col>

          <Col span={12}>
            <FormItem label="提交人" {...littleFormLayout}>
              {
                getFieldDecorator('uid', {
                  initialValue: edit ? (editObj && editObj.user && editObj.user.id) : currentId,
                  rules: [{ required: true, message: '此项不能为空' }]
                })(
                  <Select className="f-fw">
                    {productList && productList.map(it => (
                      <Option key={it.id} value={it.id}>{it.name}</Option>
                    ))}
                  </Select>
                )
              }
            </FormItem>
          </Col>
        </Row>

        <FormItem label="描述" {...formLayout}>
          {getFieldDecorator('description', {
            initialValue: editObj && editObj.description,
          })(
            <TinyMCE height={200} placeholder="请输入详情描述" />
          )}
        </FormItem>
      </Modal>

    </span>);
  }
}

const mapStateToProps = (state) => {
};

export default connect(mapStateToProps)(Form.create()(index));
