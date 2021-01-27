import React, { Component } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, message, Row, Col, Spin } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { getFormLayout, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import { getAllSubProductList } from '@services/product';
import { getAdviseCustomList } from '@services/advise';
import TinyMCE from '@components/TinyMCE';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import Tag from '@pages/receipt/components/tag';
import { getModuleList, handleSearchUser } from '@shared/CommonFun';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { levelMapArr } from '@shared/AdviseConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { CUSTOME_SYSTEM, LEVER_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

class BasicForm extends Component {
  state = {
    loading: false,
    currentUserDetail: {},
    moduleList: [],
    userList: [],
    customList: [],
    showMore: true,
    subProductList: [],
  };

  componentDidMount() {
    if (this.props.productid) {
      this.getAllSubProductList(this.props.productid);
      this.getAdviseCustomList(this.props.productid);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.getAllSubProductList(nextProps.productid);
      this.getAdviseCustomList(nextProps.productid);
    }
  }

  handleSelectProduct = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductId: '',
      moduleid: undefined,
    });
    this.getAllSubProductList(value);
    this.getAdviseCustomList(value);
  }

  getAllSubProductList = (productid) => {
    this.setState({ loading: true });
    getAllSubProductList(productid).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
        const defaultSubProduct = res.result && res.result.find((it) => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);
        if (defaultSubProduct) {
          this.getModuleList(defaultSubProduct && defaultSubProduct.id);
        } else {
          this.setState({ loading: false });
        }
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

  getAdviseCustomList = (id) => {
    const params = {
      productid: id,
    };
    getAdviseCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result || [] });
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
    getModuleList(id, (result) => this.setState({
      moduleList: result,
      loading: false,
    }));
  }

  getExtraFile = () => {
    const { reqAttachment } = this.props;
    const arr = [];
    if (reqAttachment) {
      reqAttachment.forEach(it => {
        if (it.attachment) {
          arr.push({
            ...it.attachment,
            attachmentId: it.attachment.id,
          });
        }
      });
    }
    return arr;
  }

  setShowMore = () => {
    if (!this.props.productid) {
      message.warning('归属产品不存在');
    } else {
      const { showMore } = this.state;
      this.setState({ showMore: !showMore });
    }
  }

  handleChangeModule = (value, data) => {
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

  getDefaultSubProduct = () => {
    const { adviseDetail, type } = this.props;
    const { subProductList } = this.state;
    const defaultSubProduct = subProductList && subProductList.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);

    // 来自列表页
    if (type === 'list') {
      return defaultSubProduct && defaultSubProduct.id;
    }
    if (adviseDetail && adviseDetail.subproduct) {
      return adviseDetail.subproduct.id;
    }
  }

  getUserHistoryList = () => {
    const { lastProduct } = this.props;
    const productid = lastProduct.id;
    this.props.dispatch({ type: 'receipt/getUserHistory', payload: { productid } });
    this.setState({
      userList: this.props.userHistory
    });
  }

  getUserOption = () => {
    const { userList } = this.state;
    return userList && userList.length && userList.map(it => (
      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
    ));
  }

  render() {
    const { currentUser, adviseDetail: detail, showProduct, productid, productList } = this.props;
    const { moduleList, customList, showMore, subProductList } = this.state;
    const { getFieldDecorator } = this.props.form;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const defaultSubmitEmail = currentUser.user && currentUser.user.email;

    const adviseDetail = detail || {};
    const valueMap = adviseDetail.customFieldValueidMap || {};
    const responseUser = adviseDetail.responseUser || {};
    const submitUser = adviseDetail.submitUser || {};
    const advise = adviseDetail.advise || {};
    const adviseCustomFieldRelationInfoList = adviseDetail.adviseCustomFieldRelationInfoList || [];

    return (
      <Spin spinning={this.state.loading}>
        <FormItem label="标题" {...bigFormLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标题！' }],
            initialValue: advise.name,
          })(
            <Input placeholder='请输入标题' maxLength={100} autoFocus />
          )}
        </FormItem>
        <Row>
          <Col span={12} style={{ display: showProduct ? 'block' : 'none' }}>
            <FormItem label="产品" {...formLayout}>
              {getFieldDecorator('productId', {
                rules: [{ required: true, message: '请选择产品！' }],
                initialValue: Number(productid),
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder='请选择产品'
                  style={{ width: '100%' }}
                  onSelect={(value) => this.handleSelectProduct(value)}
                >
                  {productList && productList.map(item =>
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
                initialValue: this.getDefaultSubProduct(),
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
          <Col span={12}>
            <FormItem label="模块" {...formLayout}>
              {getFieldDecorator('moduleid', {
                initialValue: adviseDetail && adviseDetail.productModule && adviseDetail.productModule.id,
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder='请选择模块'
                  showSearch
                  optionFilterProp="children"
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
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="优先级" {...formLayout}>
              {getFieldDecorator('level', {
                rules: [{ required: true, message: '请选择优先级！' }],
                initialValue: advise.level || LEVER_MAP.P1,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择优先级'>
                  {levelMapArr.map(item =>
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  )}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="期望上线时间" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
                initialValue: advise.expect_releasetime ? moment(advise.expect_releasetime) : undefined,
              })(
                <DatePicker style={{ width: '100%' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="负责人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('responseemail', {
                rules: [{ required: true, message: '请选择负责人！' }],
                initialValue: responseUser.email,
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
                </Select>,
              )}
              <a onClick={() => this.props.form.setFieldsValue({ responseemail: defaultSubmitEmail })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('submitemail', {
                rules: [{ required: true, message: '请选择报告人！' }],
                initialValue: submitUser.email || defaultSubmitEmail,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入报告人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(submitValue) => handleSearchUser(submitValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                  onChange={(value) => { this.props.form.setFieldsValue({ requireemail: value }) }}
                >
                  {this.getUserOption()}
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ submitemail: defaultSubmitEmail })}>分配给我</a>
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
          valueList={adviseCustomFieldRelationInfoList}
          type="advise"
          valueMap={valueMap}
          create={!Object.keys(adviseDetail).length}
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
                valueList={adviseCustomFieldRelationInfoList}
                type="advise"
                valueMap={valueMap}
                create={!Object.keys(adviseDetail).length}
              />
            </div>
          </div>
        }

        <FormItem label="标签" {...bigFormLayout}>
          <Tag {...this.props} />
        </FormItem>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescriptionEditValue(adviseCustomFieldRelationInfoList) || getSystemDescription(customList).defaultValue,
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

      </Spin >
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userHistory: state.receipt.userHistory,
    productList: state.product.productList,
  };
};

export default connect(mapStateToProps)(BasicForm);
