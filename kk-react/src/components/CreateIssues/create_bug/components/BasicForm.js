import React, { Component } from 'react';
import { DownOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, message, Spin, Modal, Row, Col, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import debounce from 'lodash/debounce';
import { getFormLayout, equalsObj, getSystemDescription, isHasByList, getSystemDescriptionEditValue } from '@utils/helper';
import { getVersionList } from '@services/requirement';
import { getModuleListById } from '@services/product_setting';
import { getBugCustomList } from '@services/bug';
import TinyMCE from '@components/TinyMCE';
import { getAllSubProductList } from '@services/product';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import Tag from '@pages/receipt/components/tag';
import VersionModal from '@pages/receipt/components/create_version';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { levelMapArr, classifyBug, ONLINE_BUG_MAP, BUG_LEVER_MAP } from '@shared/BugConfig';
import { EXCLUDE_PUBLISH, INCLUDE_PUBLISH, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { handleSearchUser, handleSearchVersion } from '@shared/CommonFun';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

class BasicForm extends Component {
  state = {
    loading: false,
    productList: [],
    moduleList: [],
    userList: [],
    versionList: [],
    findVersionList: [],
    customList: [],
    showMore: true,
    subProductList: [],
  };

  componentDidMount() {
    this.props.getThis && this.props.getThis(this);
    if (this.props.productid) {
      this.getAllSubProductList(this.props.productid);
      this.getBugCustomList(this.props.productid);
    }
    const { projectBasic } = this.props;
    if (projectBasic && projectBasic.subProductVO && projectBasic.subProductVO && projectBasic.subProductVO.id) {
      this.getModuleListById(projectBasic.subProductVO.id);
      this.handleSearchVersion('', projectBasic.subProductVO.id);
      this.handleSearchFindVersion('', projectBasic.subProductVO.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.getAllSubProductList(nextProps.productid);
      this.getBugCustomList(nextProps.productid);
    }
    if (!equalsObj(this.props.projectBasic, nextProps.projectBasic)) {
      this.getModuleListById(nextProps.projectBasic.subProductVO.id);
      this.handleSearchVersion('', nextProps.projectBasic.subProductVO.id);
      this.handleSearchFindVersion('', nextProps.projectBasic.subProductVO.id);
    }
  }

  handleSelectProduct = (value) => {
    localStorage.setItem('last_select_product', value);
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductId: '',
      moduleid: undefined,
      fixversionid: undefined,
      findversionid: undefined,
    });
    this.getAllSubProductList(value);
    this.getBugCustomList(value);
  }

  getAllSubProductList = (value) => {
    this.setState({ loading: true });
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
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
        this.handleSearchFindVersion('', defaultSubProduct.id);
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getBugCustomList = (value) => {
    getBugCustomList({ productid: value }).then((res) => {
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
    getModuleListById({ subProductId: value }).then((res) => {
      if (res.code !== 200) return message.error('获取模块信息失败', res.message);
      if (res.result) {
        this.setState({ moduleList: res.result, loading: false });
      }
    }).catch((err) => {
      return message.error('获取模块信息异常', err || err.message);
    });
  }

  handleSearchVersion = debounce((value, subproductid) => {
    const subProductId = subproductid || this.props.form.getFieldValue('subProductId');

    if (subProductId) {
      handleSearchVersion(value, subProductId, EXCLUDE_PUBLISH, (versionList) => {
        this.setState({ versionList });
      });
    }
  }, 800)

  handleSearchFindVersion = (value, subproductid) => {
    const subProductId = subproductid || this.props.form.getFieldValue('subProductId');

    if (subProductId) {
      const params = {
        subProductId,
        name: value,
        state: INCLUDE_PUBLISH,
        offset: 0,
        limit: 100,
      };
      getVersionList(params).then((res) => {
        if (res.code !== 200) return message.error('查询版本列表失败', res.message);
        if (res.result) {
          this.setState({ findVersionList: res.result });
        }
      }).catch((err) => {
        return message.error('查询用户列表异常', err || err.message);
      });
    }
  }

  openRule = () => {
    Modal.info({
      title: '预估工作量格式为：1w、1d、1h、1m',
      content: (
        <div>
          <p className='u-mgt10'>1w：表示为一周，1w=5d</p>
          <p>1d：表示为一天，1d=8h</p>
          <p>1h：表示为1小时</p>
          <p>1m：表示为1分钟</p>
        </div>
      ),
      okText: "知道了",
      centered: true,
      onOk() { },
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
    setFieldsValue({ moduleid: undefined });
    this.getModuleListById(value);
    this.handleSearchVersion('', value);
    this.handleSearchFindVersion('', value);

    const currentData = data.props.data;
    const responseUser = currentData.responseUser || {};
    if (responseUser && responseUser.id) {
      setFieldsValue({
        responseemail: responseUser.email,
      });
    }
  }

  getDefaultProduct = () => {
    const { bugDetail, projectBasic } = this.props;
    if (bugDetail && bugDetail.product) {
      return bugDetail.product.id;
    } else if (projectBasic && projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id) {
      return projectBasic.products[0].id;
    }
  }

  getDefaultSubProduct = () => {
    const { bugDetail, projectBasic, type } = this.props;
    const { subProductList } = this.state;
    const defaultSubProduct = subProductList && subProductList.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);

    // 来自列表页
    if (type === 'list') {
      return defaultSubProduct && defaultSubProduct.id;
    }
    if (bugDetail && bugDetail.subproduct) {
      return bugDetail.subproduct.id;
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

  handleCreateVersion = (value, type) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    const subProductId = getFieldValue('subProductId');
    this.handleSearchVersion('', subProductId);
    if (type === 'fixversionid') {
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
    } else if (type === 'findversionid') {
      const { findVersionList } = this.state;
      const item = {
        version: value,
      };
      let newList = [
        ...findVersionList,
        item
      ];
      this.setState({ findVersionList: newList }, () => {
        setFieldsValue({ findversionid: value && value.id });
      });
    }

  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, bugDetail: detail, currentUser, productList, showProduct, productid } = this.props;
    const { moduleList, versionList, findVersionList, customList, loading, subProductList, showMore } = this.state;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const email = currentUser && currentUser.user && currentUser.user.email;
    let bugDetail = detail || {};
    const valueMap = bugDetail.customFieldValueidMap || {};
    const bug = (bugDetail && bugDetail.bug) || { onlinebug: 2 };
    const responseUser = (bugDetail && bugDetail.responseUser) || {};
    const requireUser = (bugDetail && bugDetail.requireUser) || { email: email };
    const submitUser = (bugDetail && bugDetail.submitUser) || {};
    const bugCustomFieldRelationInfoList = (bugDetail && bugDetail.bugCustomFieldRelationInfoList) || [];
    const version = (bugDetail && bugDetail.version) || {};
    const findversion = (bugDetail && bugDetail.findVersion) || {};

    return (
      <Spin spinning={loading}>
        <VersionModal
          subProductId={getFieldValue('subProductId')}
          subProductList={subProductList}
          handleCreateVersion={this.handleCreateVersion}
          onRef={(ref) => this.versionRef = ref} />

        <FormItem label="标题" placeholder='请输入标题' {...bigFormLayout}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请输入标题！' }],
            initialValue: bug.name,
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
                initialValue: bugDetail && bugDetail.productModule && bugDetail.productModule.id,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择模块'>
                  {moduleList && moduleList.map(item =>
                    <Option key={item.productModule.id} value={item.productModule.id}>{item.productModule.name}</Option>
                  )}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="线上BUG" {...formLayout}>
              {getFieldDecorator('onlinebug', {
                rules: [{ required: true, message: '请选择线上bug！' }],
                initialValue: bug.onlinebug,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择线上bug'>
                  <Option key={ONLINE_BUG_MAP.NONE} value={ONLINE_BUG_MAP.NONE}>无</Option>
                  <Option key={ONLINE_BUG_MAP.YES} value={ONLINE_BUG_MAP.YES}>是</Option>
                  <Option key={ONLINE_BUG_MAP.NO} value={ONLINE_BUG_MAP.NO}>否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="bug分类" {...formLayout}>
              {getFieldDecorator('bugtype', {
                initialValue: bug.bugtype,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择bug分类'>
                  {classifyBug.map(item =>
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  )}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="严重程度" {...formLayout}>
              {getFieldDecorator('level', {
                rules: [{ required: true, message: '请选择严重程度！' }],
                initialValue: bug.level || BUG_LEVER_MAP.NORMAL,
              })(
                <Select style={{ width: '100%' }} placeholder='请选择严重程度'>
                  {levelMapArr.map(item =>
                    <Option key={item.value} value={item.value}>{item.label}</Option>
                  )}
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="预估工作量" {...formLayout}>
              {getFieldDecorator('estimate_cost', {
                initialValue: bug.estimate_cost ? bug.estimate_cost : '0m'
              })(
                <Input placeholder='请输入预估工作量' suffix={
                  <QuestionCircleOutlined className={styles.questionIcon} onClick={() => this.openRule()} />
                } />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="到期日" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
                initialValue: bug.expect_releasetime ? moment(bug.expect_releasetime) : undefined,
              })(
                <DatePicker style={{ width: '100%' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="发现版本" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('findversionid', {
                initialValue: isHasByList(findversion.id, findVersionList, 'version'),
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="输入名称搜索版本"
                  filterOption={false}
                  allowClear={true}
                  onSearch={(value) => this.handleSearchFindVersion(value)}
                  notFoundContent={'暂无数据'}
                >
                  {
                    findVersionList && findVersionList.map(item => (
                      <Option key={item.version.id} value={item.version.id} data={item}>
                        <span>{item.version.name}</span>
                      </Option>
                    ))
                  }
                </Select>
              )}
              <a onClick={() => this.versionRef.openModal('findversionid')}>新建版本</a>
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
                    versionList && versionList.map(it => (
                      <Option key={it.version.id} value={it.version.id} data={it}>
                        <span>{it.version.name}</span>
                      </Option>
                    ))
                  }
                </Select>
              )}
              <a onClick={() => this.versionRef.openModal('fixversionid')}>新建版本</a>
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
                </Select>
              )}
              <a onClick={() => this.props.form.setFieldsValue({ responseemail: email })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('submitemail', {
                rules: [{ required: true, message: '请输入报告人！' }],
                initialValue: submitUser.email ? submitUser.email : email,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="报告人"
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
            <FormItem label="验证人" {...formLayout}>
              {getFieldDecorator('requireemail', {
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
          valueList={bugCustomFieldRelationInfoList}
          type="bug"
          valueMap={valueMap}
          create={!Object.keys(bugDetail).length}
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
                valueList={bugCustomFieldRelationInfoList}
                type="bug"
                valueMap={valueMap}
                create={!Object.keys(bugDetail).length}
              />
            </div>
          </div>
        }

        <Row>
          <FormItem label="标签" {...bigFormLayout}>
            <Tag {...this.props}></Tag>
          </FormItem>
        </Row>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescriptionEditValue(bugCustomFieldRelationInfoList) || getSystemDescription(customList).defaultValue || bug.description,
            })(
              <TinyMCE height={200} placeholder="请尽量描述缺陷的背景、目的" />
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
    productList: state.product.productList,
    userHistory: state.receipt.userHistory,
  };
};

export default connect(mapStateToProps)(BasicForm);
