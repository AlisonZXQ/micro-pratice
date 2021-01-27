import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Col, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { getFormLayout, equalsObj, deepCopy, getIssueKey, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import {
  getBugCustomList, updateBug, updateModuleid, updateBugCustom, updateFixversionid,
  updateBugtype, updateEstimateCost, updateFindversionid
} from '@services/bug';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { getAllSubProductList } from '@services/product';
import { levelMapArr, onlinebugMap, classifyBug } from '@shared/BugConfig';
import TagApply from '@pages/receipt/components/tag_apply';
import ManPower from '@components/ManPower';
import { EXCLUDE_PUBLISH, CUSTOME_SYSTEM, INCLUDE_PUBLISH } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);

class index extends Component {
  state = {
    subProductList: [],
    moduleList: [],
    findVersionList: [],
    fixVersionList: [],
    versionList: [],
    customList: [],
  };

  componentDidMount() {
    const { bugDetail } = this.props;
    if (bugDetail && bugDetail.product && bugDetail.product.id) {
      this.handleSelectProduct(bugDetail.product.id);
    }

    // 获取模块的
    if (bugDetail && bugDetail.subproduct && bugDetail.subproduct.id) {
      this.getModuleListById(bugDetail.subproduct.id);
      this.handleSearchVersion('', 'findversionid', bugDetail.subproduct.id);
      this.handleSearchVersion('', 'fixversionid', bugDetail.subproduct.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.bugDetail, nextProps.bugDetail)) {
      const productId = nextProps.bugDetail && nextProps.bugDetail.product && nextProps.bugDetail.product.id;
      const subProductId = nextProps.bugDetail && nextProps.bugDetail.subproduct && nextProps.bugDetail.subproduct.id;

      this.handleSelectProduct(productId);
      this.getModuleListById(subProductId);
      this.handleSearchVersion('', 'findversionid', subProductId);
      this.handleSearchVersion('', 'fixversionid', subProductId);
    }
  }

  getBugDetail = () => {
    const bid = getIssueKey();
    this.props.dispatch({ type: 'bug/getBugDetail', payload: { id: bid } });
  }

  getAllSubProductList = (value) => {
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ subProductList: res.result || [] });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getModuleListById = (value) => {
    getModuleList(value, (result) => {
      this.setState({ moduleList: result });
    });
  }

  handleSelectProduct = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ subProductId: '' });
    const params = {
      productid: value,
    };
    this.getBugCustomList(params);
    this.getAllSubProductList(value);
  }

  getBugCustomList = (params) => {
    getBugCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 字段更新
  updateBug = (type, value) => {
    const { customList } = this.state;
    const bid = getIssueKey();
    const params = {
      id: bid,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateBugCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: bid
      });
    } else if (type === 'findversionid') {
      promise = updateFindversionid(params);
    } else if (type === 'fixversionid') {
      promise = updateFixversionid(params);
    } else if (type === 'bugtype') {
      promise = updateBugtype(params);
    } else if (type === 'estimate_cost') {
      promise = updateEstimateCost(params);
    } else {
      promise = updateBug(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getBugDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSearchVersion = (value, type, subproductid) => {
    const { bugDetail } = this.props;
    const subproduct = bugDetail.subproduct || {};
    const subProductId = subproductid || subproduct.id;

    if (subProductId) {
      handleSearchVersion(value, subProductId, type === 'fixversionid' ? EXCLUDE_PUBLISH : INCLUDE_PUBLISH, (versionList) => {
        const arr = [];
        versionList.forEach(it => {
          arr.push({
            ...it,
            ...it.version,
          });
        });
        if (type === 'fixversionid') {
          this.setState({ fixVersionList: arr });
        } else {
          this.setState({ findVersionList: arr });
        }
      });
    }
  }

  getVersionList = (data, type) => {
    const { findVersionList, fixVersionList } = this.state;
    const versionList = type === 'fixversionid' ? fixVersionList : findVersionList;

    const newVersionList = deepCopy(versionList, []);
    const flag = versionList.some(it => it.id === data.id);
    if (!flag && Object.keys(data).length) {
      newVersionList.push(data);
    }
    newVersionList.forEach(it => {
      it.value = it.id;
      it.name = it.name;
      it.label = it.name;
    });
    return newVersionList;
  }

  render() {
    const { bugDetail } = this.props;
    const { moduleList, subProductList, customList } = this.state;
    const subproduct = bugDetail.subproduct || {};
    const bug = bugDetail.bug || {};
    const version = bugDetail.version || {};
    const findversion = bugDetail.findVersion || {};
    const bugCustomFieldRelationInfoList = bugDetail.bugCustomFieldRelationInfoList || [];
    const valueMap = bugDetail.customFieldValueidMap || {};
    const productCustomList = customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM);
    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    return (<div>
      <div className={styles.container}>
        <Card>
          <Row>
            <Col
              span={16}
              className={productCustomList && productCustomList.length ? styles.borderRight : ''}>
              <div className="u-mgt15">
                <Row>
                  <Col span={14}>
                    <FormItem label={<span><span className="needIcon">*</span>子产品</span>} {...formLayout}>
                      {
                        <EditSelectDetail
                          issueRole={bugDetail.issueRole}
                          value={subproduct.id}
                          dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                          handleSaveSelect={(value) => { this.updateBug('subProductId', value) }}
                          required
                          allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                          type="subProduct"
                        />
                      }
                    </FormItem>

                    <FormItem label={<span>模块</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={bugDetail.issueRole}
                        value={bug.moduleid}
                        dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
                        handleSaveSelect={(value) => this.updateBug('moduleid', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>重要性</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={bugDetail.issueRole}
                        value={bug.level}
                        dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
                        handleSaveSelect={(value) => this.updateBug('level', value)}
                        required
                      />
                    </FormItem>

                    <FormItem label={<span><span className="needIcon">*</span>线上缺陷</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={bugDetail.issueRole}
                        value={bug.onlinebug}
                        dataSource={onlinebugMap}
                        handleSaveSelect={(value) => this.updateBug('onlinebug', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>缺陷分类</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={bugDetail.issueRole}
                        value={bug.bugtype}
                        dataSource={classifyBug}
                        handleSaveSelect={(value) => this.updateBug('bugtype', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>预估工作量</span>} {...formLayout}>
                      <EditIssue
                        issueRole={bugDetail.issueRole}
                        type="input"
                        editType="cost"
                        value={bug.estimate_cost}
                        handleUpdate={(value) => this.updateBug('estimate_cost', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>到期日</span>} {...formLayout}>
                      <DatePickerIssue
                        issueRole={bugDetail.issueRole}
                        value={bug.expect_releasetime}
                        handleSave={(value) => this.updateBug('expect_releasetime', value)}
                        type="dueDate"
                      />
                    </FormItem>

                    <FormItem label={<span>发现版本</span>} {...formLayout}>
                      <EditSelectSearchDetail
                        subProductId={subproduct.id}
                        subProductList={subProductList}
                        issueRole={bugDetail.issueRole}
                        value={findversion.id}
                        dataSource={this.getVersionList(findversion, 'findversionid')}
                        handleSearch={(value) => this.handleSearchVersion(value, 'findversionid')}
                        handleSaveSelect={(value) => this.updateBug('findversionid', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>解决版本</span>} {...formLayout}>
                      <EditSelectSearchDetail
                        subProductId={subproduct.id}
                        subProductList={subProductList}
                        issueRole={bugDetail.issueRole}
                        value={version.id}
                        dataSource={this.getVersionList(version, 'fixversionid')}
                        handleSearch={(value) => this.handleSearchVersion(value, 'fixversionid')}
                        handleSaveSelect={(value) => this.updateBug('fixversionid', value)}
                      />
                    </FormItem>

                    <FormItem style={{ marginBottom: '0px' }}>
                      <CustomField
                        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                        valueList={bugCustomFieldRelationInfoList}
                        type="bug"
                        valueMap={valueMap}
                      />
                    </FormItem>

                    <FormItem label={<span>标签</span>} {...formLayout}>
                      <TagApply type="bug" issueRole={bugDetail.issueRole} connid={bug.id} />
                    </FormItem>
                  </Col>

                  {/* 纯文本展示 */}
                  <Col span={10}>
                    <FormItem label="提交时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {bug.addtime && moment(bug.addtime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </FormItem>
                    <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {bug.updatetime && moment(bug.updatetime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </FormItem>
                    <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {bug.reopentimes ? bug.reopentimes : 0}
                      </span>
                    </FormItem>
                    <ManPower type="Bug" id={bug.id} formLayout={getFormLayout(10, 14)} initObj={bugDetail.dwManpower || {}} issueRole={bugDetail.issueRole} />
                  </Col>

                </Row>
              </div>
            </Col>

            <Col
              span={8}
              className="u-pdt15"
              style={{ height: '100%', overflow: 'auto', position: 'absolute', right: '0px' }}
            >
              <CustomField
                customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
                valueList={bugCustomFieldRelationInfoList}
                type="bug"
                valueMap={valueMap}
              />
            </Col>
          </Row>
        </Card>
      </div>

      {
        !!Object.keys(getSystemDescription(customList)).length &&
        <div className={styles.remark}>
          <div className="bbTitle">
            <span className="name">描述</span>
          </div>
          <Card>
            <EditIssue
              issueRole={bugDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(bugCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateBug('description', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
