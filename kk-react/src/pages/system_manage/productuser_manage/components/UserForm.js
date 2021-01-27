import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message, Popover, Button, Row, Col } from 'antd';
import { getFormLayout } from '@utils/helper';
import { getProductListObj } from '@/services/system_manage';
import BusinessHOC from '@components/BusinessHOC';
import MyIcon from '@components/MyIcon';
import styles from '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const formLayout = getFormLayout(4, 18);

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      tagList: [],
    };
  }

  componentDidMount(){
    const { editData, type } = this.props;
    const data = type === 'edit' ? editData : {};
    this.setState({ productList: data.productVOList || [] });
    this.setState({ tagList: data.productVOList || [] });
  }

  handleChange = (value, option) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ productIdList: value });

    let arr = [];
    option.map((item) => {
      arr.push({
        id: item.props.value,
        name: item.props.label,
      });
    });
    this.setState({ tagList: arr });
  }

  handleDelete = (id) => {
    const { form: { setFieldsValue } } = this.props;
    const { tagList } = this.state;
    const newTagList = tagList.filter(it => it.id !== id);
    this.setState({ tagList: newTagList });

    const newProductIdList = [];
    newTagList.map((item) => {
      newProductIdList.push(item.id);
    });
    setFieldsValue({ productIdList: newProductIdList });
  }

  handleSearchProduct = (value) => {
    const params = {
      name: value,
      offset: 0,
      limit: 10,
    };
    getProductListObj(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询产品失败, ${res.msg}`);
      }
      this.setState({ productList: res.result.data });
    }).catch((err) => {
      return message.error('查询产品异常', err || err.msg);
    });
  }

  getContent = () => {
    const { productList } = this.state;
    const { form: { getFieldDecorator }, editData, type } = this.props;
    let productVOList = [];
    const data = type === 'edit' ? editData : {};
    data.productVOList && data.productVOList.map(it => {
      productVOList.push(it.id);
    });
    return (getFieldDecorator('productIdList', {
      initialValue: productVOList,
      rules: [{ required: true, message: '产品不能为空' }]
    })(
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="请输入"
        optionFilterProp="children"
        optionLabelProp="label"
        onChange={(value, option) => this.handleChange(value, option)}
        onSearch={(value) => this.handleSearchProduct(value)}
      >
        {
          productList && productList.map(
            it => <Option key={it.id} value={it.id} label={it.name}>
              {it.name}
            </Option>
          )
        }
      </Select>
    )
    );
  }

  render() {
    const { form: { getFieldDecorator }, editData, entData, type, isBusiness } = this.props;
    const { tagList } = this.state;
    const data = type === 'edit' ? editData : {};

    return (
      <span>

        <FormItem label="邮箱" {...formLayout}>
          {
            getFieldDecorator('email', {
              initialValue: data.email || '',
              rules: [{ required: true, message: '邮箱必填！' }],
            })(
              <TextArea
                disabled={type === 'edit'}
                placeholder="请输入，用逗号(,)分隔的多个邮箱，以批量添加人员" />
            )
          }
        </FormItem>

        <FormItem label="所属企业" {...formLayout}>
          {getFieldDecorator('entid', {
            initialValue: !isBusiness ? 1 : undefined,
            rules: [{ required: true, message: '企业不能为空' }]
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
            >
              {
                entData && entData.map(it => (
                  <Option key={it.id} value={it.id}>{it.name}</Option>
                ))
              }
            </Select>
          )}
        </FormItem>

        <Row style={{display: 'flex', alignItems: 'center'}}>
          <Col span={4} className='f-tar'><span className='needIcon'>*</span>所属产品：</Col>
          <Col span={18}>
            {tagList && tagList.map((item) => (
              <span key={item.id} className={styles.tag}>
                {item.name}
                <MyIcon type="icon-guanbi" className='u-mgl5' onClick={() => this.handleDelete(item.id)} />
              </span>
            ))}
            <Popover
              trigger="click"
              content={this.getContent()}
              placement="bottom"
              overlayStyle={{ width: '300px' }}
            >
              <Button icon={<PlusOutlined />}>添加产品</Button>
            </Popover>
          </Col>
        </Row>
      </span>
    );
  }
}

export default BusinessHOC()(UserForm);
