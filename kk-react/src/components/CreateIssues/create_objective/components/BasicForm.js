import React, { Component } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message, DatePicker, Tag, Row, Col, Spin } from 'antd';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { getFormLayout, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import { getAllSubProductList } from '@services/product';
import { getObjectiveCustomList } from '@services/objective';
import TinyMCE from '@components/TinyMCE';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import ObjectiveTag from '@pages/receipt/components/tag';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { levelMapArr, epicType } from '@shared/ObjectiveConfig';
import { CUSTOME_SYSTEM, EXCLUDE_PUBLISH, LEVER_MAP } from '@shared/ReceiptConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { handleSearchUser } from '@shared/CommonFun';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

class BasicForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      subProductList: [],
      userList: [],
      customList: [],
      showMore: true,
    };
  }

  componentDidMount() {
    this.props.getThis && this.props.getThis(this);
    if (this.props.productid) {
      this.getAllSubProductList(this.props.productid);
      this.getObjectiveCustomList(this.props.productid);
    }
    if (this.props.defaultValueObj) {
      this.props.form.setFieldsValue({
        ...this.props.defaultValueObj,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.getAllSubProductList(nextProps.productid);
      this.getObjectiveCustomList(nextProps.productid);
    }
  }

  handleSelectProduct = (value) => {
    localStorage.setItem('last_select_product', value);
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductId: undefined,
    });
    this.getAllSubProductList(value);
    this.getObjectiveCustomList(value);
  }

  getAllSubProductList = (id) => {
    this.setState({ loading: true });
    getAllSubProductList(id).then((res) => {
      if (res.code !== 200) return message.error('查询子产品失败', res.message);
      if (res.result) {
        this.setState({ subProductList: res.result, loading: false });
      }
      const defaultSubProduct = res.result ? res.result.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT) : {};
      if (defaultSubProduct.responseUser && defaultSubProduct.responseUser.id) {
        this.props.form.setFieldsValue({
          responseemail: defaultSubProduct.responseUser.email,
          subProductId: defaultSubProduct.id,
        });
      }
    }).catch((err) => {
      return message.error('查询子产品异常', err || err.message);
    });
  }

  getObjectiveCustomList = (productid) => {
    getObjectiveCustomList({ productid }).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result || [] });
        this.props.dispatch({ type: 'receipt/saveCustomList', payload: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
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

  handleSelectSubProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;

    const currentData = data.props.data;
    const responseUser = currentData.responseUser || {};
    if (responseUser && responseUser.id) {
      setFieldsValue({
        responseemail: responseUser.email,
      });
    }
  }

  setShowMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  getDefaultSubProduct = () => {
    const { objectiveDetail, type } = this.props;
    const { subProductList } = this.state;
    const defaultSubProduct = subProductList && subProductList.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);

    // 来自列表页
    if (type === 'list') {
      return defaultSubProduct && defaultSubProduct.id;
    }
    if (objectiveDetail && objectiveDetail.subproduct) {
      return objectiveDetail.subproduct.id;
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
    const { form: { getFieldDecorator }, objectiveDetail, edit, currentUser, productid, showProduct, productList } = this.props;
    const { subProductList, customList, showMore } = this.state;
    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const email = currentUser.user && currentUser.user.email;
    const newDetail = objectiveDetail || {};
    const valueMap = newDetail.customFieldValueidMap || {};
    const objective = newDetail.objective || {};
    const responseUser = newDetail.responseUser || {};
    const requireUser = newDetail.requireUser || {};
    const submitUser = newDetail.submitUser || {};
    const objectiveCustomFieldRelationInfoList = newDetail.objectiveCustomFieldRelationInfoList || [];

    return (
      <Spin spinning={this.state.loading}>
        <FormItem label={<span>
          {edit && !!objective.projectid &&
            <Tag color="blue" className="u-mgr5">项目目标</Tag>}标题</span>} {...bigFormLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标题！' }],
            initialValue: objective.name,
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
            <FormItem label="目标类型" {...formLayout}>
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择目标类型！' }],
                initialValue: objective.type,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择目标类型'>
                  {epicType.map(item =>
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="优先级" {...formLayout}>
              {getFieldDecorator('level', {
                rules: [{ required: true, message: '请选择优先级！' }],
                initialValue: objective.level || LEVER_MAP.P1,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择优先级'>
                  {levelMapArr.map(item =>
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="到期日" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
                rules: [{ required: true, message: '请选择到期日！' }],
                initialValue: objective.expect_releasetime ? moment(objective.expect_releasetime) : undefined,
              })(
                <DatePicker style={{ width: '100%' }} placeholder='请选择到期日' />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="负责人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('responseemail', {
                rules: [{ required: true, message: '请输入负责人！' }],
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
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ responseemail: email })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('submitemail', {
                rules: [{ required: true, message: '请输入报告人！' }],
                initialValue: submitUser.email || email,
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
                >
                  {this.getUserOption()}
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ submitemail: email })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="验证人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('requireemail', {
                rules: [{ required: true, message: '请输入验证人' }],
                initialValue: requireUser.email,
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
              <a onClick={() => this.props.form.setFieldsValue({ requireemail: email })}>分配给我</a>
            </FormItem>
          </Col>
        </Row>

        <CustomField
          form={this.props.form}
          customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
          valueList={objectiveCustomFieldRelationInfoList}
          type="objective"
          valueMap={valueMap}
          create={!Object.keys(newDetail).length}
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
                valueList={objectiveCustomFieldRelationInfoList}
                type="objective"
                valueMap={valueMap}
                create={!Object.keys(newDetail).length}
              />
            </div>
          </div>
        }

        <FormItem label="标签" {...bigFormLayout}>
          <ObjectiveTag {...this.props}></ObjectiveTag>
        </FormItem>

        <FormItem label="验收标准" {...bigFormLayout}>
          {getFieldDecorator('description', {
            initialValue: objective.description,
          })(
            <TinyMCE height={200} placeholder="请尽量描述目标的验收标准" />
          )}
        </FormItem>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescriptionEditValue(objectiveCustomFieldRelationInfoList) || getSystemDescription(customList).defaultValue || objective.remark,
            })(
              <TinyMCE height={200} placeholder="请输入目标的描述" />
            )}
          </FormItem>
        }

        <FormItem label="添加附件" {...bigFormLayout}>
          {
            getFieldDecorator('attachments', {
              initialValue: this.getExtraFile(),
            })(
              <CreateIssuesAttachment
                issueRole={ISSUE_ROLE_VALUE_MAP.MANAGE}
              />
            )
          }
        </FormItem>

      </Spin>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    userHistory: state.receipt.userHistory,
    productList: state.product.productList,
  };
};

export default connect(mapStateToProps)(BasicForm);
