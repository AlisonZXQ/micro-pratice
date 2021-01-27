import React, { Component } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, message, Row, Col, Spin } from 'antd';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { connect } from 'dva';
import { getFormLayout, equalsObj, getSystemDescription, isHasByList, getSystemDescriptionEditValue } from '@utils/helper';
import { getRequirementCustomList } from '@services/requirement';
import { getModuleListById } from '@services/product_setting';
import TinyMCE from '@components/TinyMCE';
import { getAllSubProductList } from '@services/product';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import Tag from '@pages/receipt/components/tag';
import VersionModal from '@pages/receipt/components/create_version';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { CUSTOME_SYSTEM, EXCLUDE_PUBLISH, LEVER_MAP } from '@shared/ReceiptConfig';
import { levelMapArr } from '@shared/RequirementConfig';
import { handleSearchUser, handleSearchVersion } from '@shared/CommonFun';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

/***
 * @description - 创建需求弹窗
 * @param {Number} - fixversionId 如果传入则固定版本
 * @param {Number} - subProductId 传入固定子产品
 */
class BasicForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      productList: [],
      currentUserDetail: {},
      moduleList: [],
      userList: [],
      versionList: [],
      customList: [],
      subProductList: [],
      showMore: true,
      productid: 0,
    };
    this.handleSearchVersion = debounce(this.handleSearchVersion, 800);
  }

  componentDidMount() {
    this.props.getThis && this.props.getThis(this);

    if (this.props.productid) {
      this.getAllSubProductList(this.props.productid);
      this.getRequirementCustomList(this.props.productid);
    }

    const { projectBasic, requirementDetail } = this.props;
    if (projectBasic && projectBasic.subProductVO && projectBasic.subProductVO && projectBasic.subProductVO.id) {
      this.getModuleListById(projectBasic.subProductVO.id);
      this.handleSearchVersion('', projectBasic.subProductVO.id);
    }
    if (requirementDetail && requirementDetail.subproduct) {
      this.getModuleListById(requirementDetail.subproduct.id);
      this.handleSearchVersion('', requirementDetail.subproduct.id);
    }

    if (this.props.fixversionid) {
      this.props.form.setFieldsValue({ fixversionid: this.props.fixversionid });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.getAllSubProductList(nextProps.productid);
      this.getRequirementCustomList(nextProps.productid);
    }
    if (!equalsObj(this.props.projectBasic, nextProps.projectBasic)) {
      this.getModuleListById(nextProps.projectBasic.subProductVO.id);
      this.handleSearchVersion('', nextProps.projectBasic.subProductVO.id);
    }
    if (!equalsObj(this.props.requirementDetail, nextProps.requirementDetail)) {
      this.getModuleListById(nextProps.requirementDetail.subproduct.id);
      this.handleSearchVersion('', nextProps.requirementDetail.subproduct.id);
    }
  }

  handleSelectProduct = (value) => {
    localStorage.setItem('last_select_product', value);
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductId: undefined,
      moduleid: undefined,
      fixversionid: undefined,
    });
    this.getAllSubProductList(value);
    this.getRequirementCustomList(value);
  }

  getAllSubProductList = (value) => {
    this.setState({ loading: true });
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
        if (this.props.subProductId) {
          this.getModuleListById(this.props.subProductId);
          this.handleSearchVersion('', this.props.subProductId);
        } else if (!(this.props.requirementDetail && this.props.requirementDetail.subproduct)) {
          const defaultSubProduct = res.result ? res.result.find((it) => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT) : {};
          if (Object.keys(defaultSubProduct).length) {
            this.getModuleListById(defaultSubProduct && defaultSubProduct.id);
          } else {
            this.setState({ loading: false });
          }
          if (defaultSubProduct.responseUser && defaultSubProduct.responseUser.id) {
            this.props.form.setFieldsValue({
              responseemail: defaultSubProduct.responseUser.email,
              subProductId: defaultSubProduct.id,
            });
          }

          this.handleSearchVersion('', defaultSubProduct.id);
        }
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getRequirementCustomList = (productid) => {
    getRequirementCustomList({ productid }).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result || [] });
        this.props.dispatch({ type: 'receipt/saveCustomList', payload: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  getModuleListById = (value) => {
    const params = {
      subProductId: value,
    };
    getModuleListById(params).then((res) => {
      if (res.code !== 200) return message.error('获取模块信息失败', res.message);
      if (res.result) {
        this.setState({ moduleList: res.result, loading: false });
      }
    }).catch((err) => {
      return message.error('获取模块信息异常', err || err.message);
    });
  }

  handleSelectSubProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ moduleid: undefined, jiraKey: '' });
    this.getModuleListById(value);
    this.handleSearchVersion('', value);

    const currentData = data.props.data;
    const responseUser = currentData.responseUser || {};
    if (responseUser && responseUser.id) {
      setFieldsValue({
        responseemail: responseUser.email,
      });
    }
  }

  handleSearchVersion = (value, subproductid) => {
    const subProductId = subproductid || this.props.form.getFieldValue('subProductId');
    if (subProductId) {
      handleSearchVersion(value, subProductId, EXCLUDE_PUBLISH, (versionList) => {
        this.setState({ versionList });
      });
    }
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

  getDefaultSubProduct = () => {
    const { requirementDetail, projectBasic, type, subProductId } = this.props;
    const { subProductList } = this.state;
    const defaultSubProduct = subProductList && subProductList.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);

    /**
     * 创建传入子产品，目前应用在需求排期创建需求处
     */
    if (subProductId) {
      return subProductId;
    }
    // 来自列表页面
    if (type === 'list') {
      return defaultSubProduct && defaultSubProduct.id;
    }
    if (requirementDetail && requirementDetail.subproduct) {
      return requirementDetail.subproduct.id;
    } else if (projectBasic && projectBasic.subProductVO && projectBasic.subProductVO && projectBasic.subProductVO.id) {
      return projectBasic.subProductVO.id;
    }
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
    const responseUser = currentData.requirementResponseUser || {};
    const requireUser = currentData.requirementRequireUser || {};
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

  handleCreateVersion = (value) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    const subProductId = getFieldValue('subProductId');
    this.handleSearchVersion('', subProductId);
    const { versionList } = this.state;
    const item = {
      version: value,
    };
    let newList = [
      ...versionList,
      item
    ];
    this.setState({ versionList: newList }, () => {
      setFieldsValue({ fixversionid: value && value.id });
    });
  }

  render() {
    const { currentUser, requirementDetail: detail, subProductNoChange, productList, productid, showProduct } = this.props;

    const { moduleList, versionList, customList, subProductList, showMore } = this.state;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const defaultSubmitEmail = currentUser.user && currentUser.user.email;

    const requirementDetail = detail || {};
    const submitUser = requirementDetail.submitUser || {};
    const requireUser = requirementDetail.requireUser || {};
    const responseUser = requirementDetail.responseUser || {};
    const requirement = requirementDetail.requirement || {};
    const version = requirementDetail.version || {};
    const requirementCustomFieldRelationInfoList = requirementDetail.requirementCustomFieldRelationInfoList || [];

    const valueMap = requirementDetail.customFieldValueidMap || {};

    return (
      <Spin spinning={this.state.loading}>
        <VersionModal
          subProductId={getFieldValue('subProductId')}
          subProductList={subProductList}
          handleCreateVersion={this.handleCreateVersion}
          onRef={(ref) => this.versionRef = ref} />

        <FormItem label="标题" {...bigFormLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标题！' }],
            initialValue: requirement.name,
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
                initialValue: this.getDefaultSubProduct(),
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请选择子产品"
                  optionFilterProp="children"
                  onChange={(value, data) => this.handleSelectSubProduct(value, data)}
                  disabled={!!subProductNoChange}
                >
                  {enableSubProductList && enableSubProductList.map(it => (
                    <Option key={it.id} value={it.id} data={it}>{it.subProductName}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="模块" {...formLayout}>
              {getFieldDecorator('moduleid', {
                initialValue: requirementDetail && requirementDetail.productModule && requirementDetail.productModule.id,
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder='请选择模块'
                  onChange={(value, data) => this.handleChangeModule(value, data)}>
                  {moduleList && moduleList.map(item =>
                    <Option
                      key={item.productModule.id}
                      value={item.productModule.id}
                      data={item}>
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
                initialValue: requirement.level || LEVER_MAP.P1,
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
            <FormItem label="计划上线时间" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
                initialValue: requirement.expect_releasetime ? moment(requirement.expect_releasetime) : undefined,
              })(
                <DatePicker style={{ width: '100%' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="解决版本" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('fixversionid', {
                initialValue: isHasByList(version.id, versionList, 'version'),
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="输入名称搜索版本"
                  filterOption={false}
                  allowClear={true}
                  onSearch={(value) => this.handleSearchVersion(value)}
                  notFoundContent={'暂无数据'}
                >
                  {
                    versionList && versionList.map(item => (
                      <Option key={item.version.id} value={item.version.id} data={item}>
                        <span>{item.version.name}</span>
                      </Option>
                    ))
                  }
                </Select>
              )}
              <a onClick={() => this.versionRef.openModal()}>新建版本</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="负责人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('responseemail', {
                rules: [{ required: true, message: '请选择负责人！' }],
                initialValue: responseUser.email || undefined,
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
              <a onClick={() => this.props.form.setFieldsValue({ responseemail: defaultSubmitEmail })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('submitemail', {
                rules: [{ required: true, message: '请选择报告人！' }],
                initialValue: submitUser.email ? submitUser.email : defaultSubmitEmail,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入报告人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(valueReport) => handleSearchUser(valueReport, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                >
                  {this.getUserOption()}
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ submitemail: defaultSubmitEmail })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="验证人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('requireemail', {
                initialValue: requireUser.email || undefined,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入验证人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(valueRequire) => handleSearchUser(valueRequire, (result) => {
                    this.setState({ userList: result });
                  })}
                  onFocus={this.getUserHistoryList}
                >
                  {this.getUserOption()}
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ requireemail: defaultSubmitEmail })}>分配给我</a>
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <FormItem label="目标用户" {...formLayout}>
              {getFieldDecorator('targetUser', {
                initialValue: requirement.targetUser,
              })(
                <Input placeholder='请输入目标用户' />,
              )}
            </FormItem>
          </Col>
        </Row>

        <CustomField
          form={this.props.form}
          customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
          valueList={requirementCustomFieldRelationInfoList}
          valueMap={valueMap}
          type="requirement"
          create={!Object.keys(requirementDetail).length}
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
                valueList={requirementCustomFieldRelationInfoList}
                valueMap={valueMap}
                type="requirement"
                create={!Object.keys(requirementDetail).length}
              />
            </div>
          </div>
        }

        <Row>
          <FormItem label="标签" {...bigFormLayout}>
            <Tag {...this.props} />
          </FormItem>
        </Row>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescriptionEditValue(requirementCustomFieldRelationInfoList) || getSystemDescription(customList).defaultValue || requirement.description,
            })(
              <TinyMCE height={200} placeholder="请输入详情描述" />
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
    userHistory: state.receipt.userHistory,
    productList: state.product.productList,
  };
};

export default connect(mapStateToProps)(BasicForm);
