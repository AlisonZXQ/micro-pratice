import React, { Component } from 'react';
import { DownOutlined, QuestionCircleOutlined, UpOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Select, DatePicker, message, Spin, Modal, Row, Col, Tag } from 'antd';
import { connect } from 'dva';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { getFormLayout, equalsObj, getSystemDescription, isHasByList, getSystemDescriptionEditValue } from '@utils/helper';
import { getModuleListById } from '@services/product_setting';
import { getTaskCustomList, getSubTaskCustomList } from '@services/task';
import TinyMCE from '@components/TinyMCE';
import { getAllSubProductList } from '@services/product';
import CreateIssuesAttachment from '@components/CreateIssuesAttachment';
import CustomField from '@pages/receipt/components/customfiled_list';
import TagForm from '@pages/receipt/components/tag';
import VersionModal from '@pages/receipt/components/create_version';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { levelMap, taskLevelKeyMap } from '@shared/TaskConfig';
import { CUSTOME_SYSTEM, EXCLUDE_PUBLISH, LEVER_MAP } from '@shared/ReceiptConfig';
import { DEFAULT_SUB_PRODUCT, SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import { handleSearchUser, handleSearchVersion } from '@shared/CommonFun';
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
      productList: [],
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
      this.getTaskCustomList(this.props.productid);
    }

    const { projectBasic, taskDetail } = this.props;
    if (Object.keys(taskDetail).length) {
      this.getDefaultData(taskDetail);
    }

    if (taskDetail && taskDetail.subproduct && taskDetail.subproduct.id) {
      this.getModuleListById(taskDetail.subproduct.id);
      this.handleSearchVersion('', taskDetail.subproduct.id);
    } else if (projectBasic && projectBasic.subProductVO && projectBasic.subProductVO && projectBasic.subProductVO.id) {
      this.getModuleListById(projectBasic.subProductVO.id);
      this.handleSearchVersion('', projectBasic.subProductVO.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.productid !== nextProps.productid) {
      this.getAllSubProductList(nextProps.productid);
      this.getTaskCustomList(nextProps.productid);
    }
    if (!equalsObj(this.props.taskDetail, nextProps.taskDetail)) {
      this.getModuleListById(nextProps.taskDetail.subproduct.id);
      this.handleSearchVersion('', nextProps.taskDetail.subproduct.id);
      this.getDefaultData(nextProps.taskDetail);
    } else if (!equalsObj(this.props.projectBasic, nextProps.projectBasic)) {
      this.getModuleListById(nextProps.projectBasic.subProductVO.id);
      this.handleSearchVersion('', nextProps.projectBasic.subProductVO.id);
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
    this.getTaskCustomList(value);
  }

  getDefaultData = (editData) => {
    const arr = [];
    if (editData && editData.requireUser) {
      const id = editData.requireUser.id;
      if (!arr.some(it => it.id === id)) {
        arr.push(editData.requireUser);
      }
    }
    if (editData && editData.submitUser) {
      const id = editData.submitUser.id;
      if (!arr.some(it => it.id === id)) {
        arr.push(editData.submitUser);
      }
    }
    if (editData && editData.responseUser) {
      const id = editData.responseUser.id;
      if (!arr.some(it => it.id === id)) {
        arr.push(editData.responseUser);
      }
    }
    if (editData && editData.version) {
      this.setState({
        versionList: [{
          version: {
            id: editData.version.id,
            name: editData.version.name,
          }
        }]
      });
    }
    this.setState({ userList: arr });
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
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getTaskCustomList = (productid) => {
    const { createType } = this.props;
    let promise = null;
    if (createType === 'childtask') {
      promise = getSubTaskCustomList({ productid });
    } else {
      promise = getTaskCustomList({ productid });
    }
    promise.then((res) => {
      if (res.code !== 200) return message.error('查询自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result || [] });
        this.props.dispatch({ type: 'receipt/saveCustomList', payload: res.result });
      }
    }).catch((err) => {
      return message.error('查询自定义信息异常', err || err.message);
    });
  }

  getModuleListById = (value) => {
    const params = {
      subProductId: value,
    };
    getModuleListById(params).then((res) => {
      if (res.code !== 200) return message.error('查询模块信息失败', res.message);
      if (res.result) {
        this.setState({ moduleList: res.result, loading: false });
      }
    }).catch((err) => {
      return message.error('查询模块信息异常', err || err.message);
    });
  }

  handleSelectSubProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ moduleid: undefined });
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

  getDefaultProduct = () => {
    const { taskDetail, projectBasic } = this.props;
    if (taskDetail && taskDetail.product) {
      return taskDetail.product.id;
    } else if (projectBasic && projectBasic.products && projectBasic.products[0] && projectBasic.products[0].id) {
      return projectBasic.products[0].id;
    }
  }

  getDefaultSubProduct = () => {
    const { taskDetail, projectBasic, type } = this.props;
    const { subProductList } = this.state;
    const defaultSubProduct = subProductList && subProductList.find(it => it.isDefault === DEFAULT_SUB_PRODUCT.DEFAULT);

    // 来自列表页
    if (type === 'list') {
      return defaultSubProduct && defaultSubProduct.id;
    }
    if (taskDetail && taskDetail.subproduct) {
      return taskDetail.subproduct.id;
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
    const responseUser = currentData.taskResponseUser || {};
    const requireUser = currentData.taskRequireUser || {};
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

  getDefaultModuleId = () => {
    const { taskDetail, createType } = this.props;
    const { moduleList } = this.state;
    const moduleId = taskDetail && taskDetail.productModule && taskDetail.productModule.id;
    if (createType !== 'childtask') {
      if (moduleList.some(it => it.productModule.id === moduleId)) {
        return moduleId;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  getDefaultLevel = () => {
    return taskLevelKeyMap.P1 || LEVER_MAP.P1;
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
    // 有subProductId是风险下创建任务的
    const { form: { getFieldDecorator, getFieldValue }, parentData, createType, acceptTaskDetail,
      currentUser, taskCopyDetail, taskDetail: detail, edit, subProductId, showProduct, productid, productList } = this.props;
    const { moduleList, versionList, customList, loading, subProductList, showMore } = this.state;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const email = currentUser && currentUser.user && currentUser.user.email;
    let taskDetail = detail || {};
    //taskCopyDetail是复制为组件用到的
    if (this.props.isAccept) {
      taskDetail = acceptTaskDetail || {};
    } else if (this.props.isCopyAs) {
      taskDetail = taskCopyDetail || {};
    } else if (createType === 'childtask' && !edit) {
      // 子任务带入任务的信息
      taskDetail = {
        product: detail.product,
        version: detail.version,
        subproduct: detail.subproduct,
      };
    } else {
      taskDetail = {};
    }

    const valueMap = taskDetail.customFieldValueidMap || {};

    const task = (taskDetail && taskDetail.task) || {};
    const responseUser = (taskDetail && taskDetail.responseUser) || {};
    const requireUser = (taskDetail && taskDetail.requireUser) || {};
    const submitUser = (taskDetail && taskDetail.submitUser) || {};
    const taskCustomFieldRelationInfoList = (taskDetail && taskDetail.taskCustomFieldRelationInfoList) || [];
    const version = (parentData && parentData.version) || (taskDetail && taskDetail.version) || {};

    return (
      <Spin spinning={loading}>
        <VersionModal
          subProductId={getFieldValue('subProductId')}
          subProductList={subProductList}
          handleCreateVersion={this.handleCreateVersion}
          onRef={(ref) => this.versionRef = ref} />

        {createType === 'childtask' &&
          <div className={`u-mgb10 ${styles.headerTip}`}>
            <span>当前正在进行的是将任务「{parentData ? parentData.summary || parentData.name : '-'}」拆分为子任务</span>
          </div>
        }
        <FormItem label={<span>
          {edit && !!task.parentid &&
            <Tag color="blue" className="u-mgr5">子任务</Tag>}标题</span>} {...bigFormLayout}>

          {getFieldDecorator('name', {
            initialValue: task.name,
            rules: [{ required: true, message: '请输入标题！' }],
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
                initialValue: subProductId || this.getDefaultSubProduct(),
                rules: [{ required: true, message: '此项不能为空' }]
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  disabled={createType === 'childtask'}
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
                initialValue: this.getDefaultModuleId(),
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
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="优先级" {...formLayout}>
              {getFieldDecorator('level', {
                rules: [{ required: true, message: '请选择优先级！' }],
                initialValue: this.getDefaultLevel(),
              })(
                <Select style={{ width: '100%' }} placeholder='请选择优先级'>
                  {levelMap.map(item =>
                    <Option key={item.id} value={item.id}>{item.name}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="预估工作量" {...formLayout}>
              {getFieldDecorator('estimate_cost', {
                initialValue: task.estimate_cost ? task.estimate_cost : '0m'
              })(
                <Input placeholder='请输入工作量' suffix={
                  <QuestionCircleOutlined className={styles.questionIcon} onClick={() => this.openRule()} />
                } />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="到期日" {...formLayout}>
              {getFieldDecorator('expect_releasetime', {
                initialValue: task.expect_releasetime ? moment(task.expect_releasetime) : undefined,
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
                  disabled={createType === 'childtask'}
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
                initialValue: responseUser.email,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入负责人"
                  optionFilterProp="children"
                  filterOption={false}
                  onSearch={(valueResponse) => handleSearchUser(valueResponse, (result) => {
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
                rules: [{ required: true, message: '请选择报告人！' }],
                initialValue: submitUser.email || email,
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
              <a onClick={() => this.props.form.setFieldsValue({ submitemail: email })}>分配给我</a>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="验证人" {...formLayout} style={{ marginBottom: '0px' }}>
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
                  onSearch={(valueRequire) => handleSearchUser(valueRequire, (result) => {
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
          valueList={taskCustomFieldRelationInfoList}
          type="task"
          valueMap={valueMap}
          create={createType === 'childtask' ? true : !Object.keys(taskDetail).length} // 子任务目前都是创建
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
                valueList={taskCustomFieldRelationInfoList}
                type="task"
                valueMap={valueMap}
                create={createType === 'childtask' ? true : !Object.keys(taskDetail).length}
              />
            </div>
          </div>
        }
        <Row>
          <Col span={12}>
            <FormItem label="标签" {...formLayout}>
              <TagForm {...this.props} />
            </FormItem>
          </Col>

        </Row>

        {
          !!Object.keys(getSystemDescription(customList)).length &&
          <FormItem label="描述" {...bigFormLayout}>
            {getFieldDecorator(`custom-${getSystemDescription(customList).id}-${getSystemDescription(customList).type}`, {
              initialValue: getSystemDescriptionEditValue(taskCustomFieldRelationInfoList) || getSystemDescription(customList).defaultValue || task.description,
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
    currentUser: state.user.currentUser,
    productList: state.product.productList,
    taskDetail: state.task.taskDetail,
    userHistory: state.receipt.userHistory,
  };
};

export default connect(mapStateToProps)(BasicForm);
