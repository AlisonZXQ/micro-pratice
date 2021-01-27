import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Card, Input, message } from 'antd';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { getCloudccData, updateCloudcc, addCloudcc } from '@services/product_setting';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 13);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productid: 0,
      data: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lastProduct && nextProps.lastProduct.id !== this.props.lastProduct.id) {
      this.setState({ productid: nextProps.lastProduct.id }, () => this.getData());
    }
  }

  componentDidMount() {
    const productid = this.props.lastProduct && this.props.lastProduct.id;
    if (productid) {
      this.setState({ productid: productid }, () => this.getData());
    }
  }

  getData = () => {
    const params = {
      productid: this.state.productid,
    };
    getCloudccData(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      this.setState({ data: res.result });
    }).catch((err) => {
      return message.error('获取信息异常', err || err.msg);
    });
  }

  handleSave = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;

      const { data, productid } = this.state;
      if (data && data.id) {
        const params = {
          id: data.id,
          ...values,
        };
        updateCloudcc(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`更改信息失败, ${res.msg}`);
          }
          message.success('更改信息成功！');
        }).catch((err) => {
          return message.error('更改信息异常', err || err.msg);
        });
      }
      else {
        const params = {
          productid: productid,
          ...values,
        };
        addCloudcc(params).then((res) => {
          if (res.code !== 200) {
            return message.error(`保存信息失败, ${res.msg}`);
          }
          message.success('保存信息成功！');
          this.getData();
        }).catch((err) => {
          return message.error('保存信息异常', err || err.msg);
        });
      }


    });
  }

  handleCancel = () => {
    const newData = {};
    const { data } = this.state;
    if (data && data.id) {
      newData.id = data.id;
    }
    newData.apiurl = '';
    newData.username = '';
    newData.password = '';
    newData.recordtype = '';

    this.setState({
      data: newData
    });
  }

  render() {
    const { lastProduct } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { data } = this.state;
    return (<span>
      <div className='settingTitle'>
        {lastProduct.name}-cloudcc配置
      </div>
      <div style={{ padding: '5px 16px 16px 16px' }}>
        <div className='bbTitle'>
          <span className='name'>当前配置</span>
        </div>
        <Card className='bgWhiteModel'>
          <FormItem label="cloudcc接口地址" {...formLayout}>
            {getFieldDecorator('apiurl', {
              initialValue: data && data.apiurl ? data && data.apiurl : '',
            })(
              <Input placeholder="请输入cloudcc接口地址" disabled={false} />,
            )}
            <span className={styles.tip}>注：接口地址示例为：http://crm.163yun.com （注意最后不需要添加/）</span>
          </FormItem>
          <FormItem label="cloudcc用户名" {...formLayout}>
            {getFieldDecorator('username', {
              initialValue: data && data.username ? data && data.username : '',
            })(
              <Input placeholder="请输入cloudcc用户名" disabled={false} />,
            )}
          </FormItem>
          <FormItem label="cloudcc密码" {...formLayout}>
            {getFieldDecorator('password', {
              initialValue: data && data.password ? data.password : '',
            })(
              <Input placeholder="请输入cloudcc密码" disabled={false} />,
            )}
          </FormItem>
          <FormItem label="cloudcc产品ID" {...formLayout}>
            {getFieldDecorator('recordtype', {
              initialValue: data && data.recordtype ? data.recordtype : '',
            })(
              <Input placeholder="请输入产品ID" disabled={false} />,
            )}
          </FormItem>
          <div className='btn98 f-tar u-mgt20'>
            <Button className='u-mgr20' onClick={() => this.handleCancel()}>取消</Button>
            <Button type='primary' onClick={() => this.handleSave()}>保存</Button>
          </div>
        </Card>
      </div>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
