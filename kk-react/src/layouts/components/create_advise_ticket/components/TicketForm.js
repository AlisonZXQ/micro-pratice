import React, { Component } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, message, Row, Col } from 'antd';
import { connect } from 'dva';
import { getFormLayout, getSystemDescription, equalsObj } from '@utils/helper';
import { getAllSubProductList } from '@services/product';
import { getModuleListById } from '@services/product_setting';
import { getTicketCustomList } from '@services/ticket';
import TinyMCE from '@components/TinyMCE';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import Tag from '@pages/receipt/components/tag';
import { levelMapArr } from '@shared/TicketConfig';
import { CUSTOME_REQUIRED, CUSTOME_SYSTEM, LEVER_MAP } from '@shared/ReceiptConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';

import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { handleSearchUser } from '@shared/CommonFun';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

// 1.选择了子产品默认填充负责人
// 2.选择了模块默认填充负责人和验证人（如果有的话）
// 3.报告人变动更改验证人
class BasicForm extends Component {
  state = {
    loading: false,
    productList: [],
    currentUserDetail: {},
    moduleList: [],
    userList: [],
    customList: [],
    showMore: true,
    subProductList: [],
  }

  componentDidMount() {
    this.props.dispatch({ type: 'product/getSameCompanyProduct' });
    const { allProductList } = this.props;
    if (allProductList.length > 0) {
      const defaultProductId = this.getDefaultProjectId(allProductList);
      this.handleSelectProduct(defaultProductId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.allProductList, nextProps.allProductList)) {
      const defaultProductId = this.getDefaultProjectId(nextProps.allProductList);
      this.handleSelectProduct(defaultProductId);
    }
  }

  handleSelectProduct = (value) => {
    localStorage.setItem('my_workbench_productid', JSON.stringify(value));
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductId: undefined,
      moduleid: undefined,
    });
    this.getAllSubProductList(value);
    this.getTicketCustomList(value);
  }

  getAllSubProductList = (productid) => {

    getAllSubProductList(productid).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
        const defaultSubProduct = res.result && res.result.find((it) => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);
        this.getModuleList(defaultSubProduct.id);
        if (defaultSubProduct.responseUser && defaultSubProduct.responseUser.id) {
          this.props.form.setFieldsValue({
            responseemail: defaultSubProduct.responseUser.email,
            subProductId: defaultSubProduct.id,
          });
        }
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getTicketCustomList = (id) => {
    const params = {
      productid: id,
    };
    getTicketCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
        this.props.dispatch({ type: 'receipt/saveCustomList', payload: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  handleSelectSubProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    this.getModuleList(value);
    setFieldsValue({
      moduleid: undefined,
    });
    const currentData = data.props.data;
    const responseUser = currentData.responseUser || {};
    if (responseUser && responseUser.id) {
      setFieldsValue({
        responseemail: responseUser.email,
      });
    }
  }

  getModuleList = (id) => {
    const newParams = {
      subProductId: id,
    };
    getModuleListById(newParams).then((res) => {
      if (res.code !== 200) return message.error('获取模块信息失败', res.message);
      if (res.result) {
        this.setState({ moduleList: res.result });
      }
    }).catch((err) => {
      return message.error('获取模块信息异常', err || err.message);
    });
  }

  setShowMore = () => {
    const { form: { getFieldValue } } = this.props;
    if (!getFieldValue('productId')) {
      return message.warning('归属产品不存在');
    } else {
      const { showMore } = this.state;
      this.setState({ showMore: !showMore });
    }
  }

  handleChangeModule = (item, data) => {
    const currentData = data.props.data;
    const responseUser = currentData.responseUser || {};
    const requireUser = currentData.adviseRequireUser || {};
    if (responseUser && responseUser.id) {
      this.props.form.setFieldsValue({
        responseemail: responseUser.email,
      });
    }
    if (requireUser && requireUser.id) {
      this.props.form.setFieldsValue({
        requireemail: requireUser.email,
      });
    }
  }

  getUserHistoryList = () => {
    const { getFieldValue } = this.props.form;
    const productid = getFieldValue('productId');
    if (productid) {
      this.props.dispatch({ type: 'receipt/getUserHistory', payload: { productid } });
      this.setState({
        userList: this.props.userHistory
      });
    }
  }

  getUserOption = () => {
    const { userList } = this.state;
    return userList && userList.length && userList.map(it => (
      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
    ));
  }

  getDefaultProjectId = (list) => {
    const localProductId = localStorage.getItem('my_workbench_productid') ? JSON.parse(localStorage.getItem('my_workbench_productid')) : null;
    const epItem = list && list.find(it => it.name === 'Easy Project');
    const epProductId = (epItem && epItem.id) || null;
    const listProductId = list && list[0] && list[0].id;
    if (localProductId) { //本地
      return localProductId;
    } else if (epProductId) { //名称为ep
      return epProductId;
    } else if (listProductId) { //列表第一项
      return listProductId;
    }
  }

  render() {
    const { currentUser, allProductList } = this.props;
    const { moduleList, customList, showMore, subProductList } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const defaultProductId = this.getDefaultProjectId(allProductList);

    return (
      <span>
        <FormItem label="标题" {...bigFormLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标题！' }],
          })(
            <Input placeholder='请输入标题' maxLength={100} autoFocus />
          )}
        </FormItem>
        <Row>
          <Col span={12}>
            <FormItem label="产品" {...formLayout}>
              {getFieldDecorator('productId', {
                initialValue: defaultProductId,
                rules: [{ required: true, message: '请选择产品！' }],
              })(
                <Select
                  showSearch
                  filterOption={false}
                  placeholder='输入搜索或选择产品'
                  optionFilterProp="children"
                  onChange={(value) => this.handleSelectProduct(value)}
                  style={{ width: '100%' }}>
                  {allProductList && allProductList.map(item =>
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="子产品" {...formLayout}>
              {getFieldDecorator('subProductId', {
                rules: [{ required: true, message: '请选择子产品！' }],
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder='请选择子产品'
                  onChange={(value, data) => this.handleSelectSubProduct(value, data)}
                  style={{ width: '100%' }}>
                  {enableSubProductList && enableSubProductList.map(item =>
                    <Option key={item.id} value={item.id} data={item}>{item.subProductName}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="模块" {...formLayout}>
              {getFieldDecorator('moduleid', {
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder='请选择模块'
                  onChange={(value, data) => this.handleChangeModule(value, data)}
                >
                  {moduleList && moduleList.map(item =>
                    <Option
                      key={item.productModule.id}
                      value={item.productModule.id}
                      data={item}
                    >
                      {item.productModule.name}
                    </Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="优先级" {...formLayout}>
              {getFieldDecorator('level', {
                rules: [{ required: true, message: '请选择优先级！' }],
                initialValue: LEVER_MAP.P1,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择优先级'>
                  {levelMapArr.map(item =>
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="期望上线时间" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
              })(
                <DatePicker style={{ width: '100%' }} />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="负责人" {...formLayout}>
              {getFieldDecorator('responseemail', {
                rules: [{ required: true, message: '请选择负责人！' }],
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入负责人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(value) => handleSearchUser(value, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                >
                  {this.getUserOption()}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout}>
              {getFieldDecorator('submitemail', {
                initialValue: currentUser && currentUser.user && currentUser.user.email,
                rules: [{ required: true, message: '请选择报告人！' }],
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入报告人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(reportValue) => handleSearchUser(reportValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                  onChange={(value) => { this.props.form.setFieldsValue({ requireemail: value }) }}
                >
                  {this.getUserOption()}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12} style={{ display: 'none' }}>
            <FormItem label="验证人" {...formLayout}>
              {getFieldDecorator('requireemail', {
                initialValue: currentUser && currentUser.user && currentUser.user.email,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入验证人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(requireValue) => handleSearchUser(requireValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                >
                  {this.getUserOption()}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>

        <CustomField
          form={this.props.form}
          customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
          valueList={[]}
          type="ticket"
          create={true}
        />

        {
          customList && !!customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM).length &&
          <div>
            <div
              className={`${styles.showMore} u-mgb20 f-csp f-tac`}>
              <span onClick={() => this.setShowMore()}>
                <span>{showMore ? '收起' : '展开'}更多选项</span>
                {showMore ? <UpOutlined className={styles.icon} /> :
                  <DownOutlined className={styles.icon} />}
              </span>
            </div>
            <div style={showMore ? { display: 'block' } : { display: 'none' }}>
              <CustomField
                form={this.props.form}
                customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
                valueList={[]}
                type="ticket"
                create={true}
              />
            </div>
          </div>
        }

        <FormItem label="标签" {...bigFormLayout}>
          <Tag {...this.props} productid={getFieldValue('productId')} />
        </FormItem>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescription(customList).defaultValue,
            })(
              <TinyMCE height={200} placeholder="请输入详情描述" />
            )}
          </FormItem>
        }

        <FormItem label="附件" {...bigFormLayout}>
          {
            getFieldDecorator('attachments', {
              initialValue: [],
            })(
              <CreateIssuesAttachment
                issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
              />
            )
          }
        </FormItem>

      </span>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    userHistory: state.receipt.userHistory,
  };
};

export default connect(mapStateToProps)(BasicForm);
