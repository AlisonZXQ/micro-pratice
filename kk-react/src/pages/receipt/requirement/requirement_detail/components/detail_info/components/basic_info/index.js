import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Col, message } from 'antd';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { getFormLayout, equalsObj, deepCopy, getIssueKey, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import {
  getRequirementCustomList, updateRequirement,
  updateModuleid, updateRequirementCustom, updateFixversionid
} from '@services/requirement';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { getAllSubProductList } from '@services/product';
import { levelMapArr } from '@shared/RequirementConfig';
import { CUSTOME_SYSTEM, EXCLUDE_PUBLISH } from '@shared/ReceiptConfig';
import TagApply from '@pages/receipt/components/tag_apply';
import ManPower from '@components/ManPower';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);

class index extends Component {
  state = {
    subProductList: [],
    moduleList: [],
    versionList: [],
    customList: [],
  };

  componentDidMount() {
    const { requirementDetail } = this.props;
    if (requirementDetail && requirementDetail.product && requirementDetail.product.id) {
      this.handleSelectProduct(requirementDetail.product.id);
    }

    // 获取模块的
    if (requirementDetail && requirementDetail.subproduct && requirementDetail.subproduct.id) {
      this.getModuleListById(requirementDetail.subproduct.id);
      this.handleSearchVersion('', requirementDetail.subproduct.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.requirementDetail, nextProps.requirementDetail)) {
      const productId = nextProps.requirementDetail && nextProps.requirementDetail.product && nextProps.requirementDetail.product.id;
      const subProductId = nextProps.requirementDetail && nextProps.requirementDetail.subproduct && nextProps.requirementDetail.subproduct.id;

      this.handleSelectProduct(productId);
      this.getModuleListById(subProductId);
      this.handleSearchVersion('', subProductId);
    }
  }

  getReqirementDetail = () => {
    const rid = getIssueKey();
    this.props.dispatch({ type: 'requirement/getReqirementDetail', payload: { id: rid } });
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
    this.getRequirementCustomList(params);
    this.getAllSubProductList(value);
  }

  getRequirementCustomList = (params) => {
    getRequirementCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 字段更新接口
  updateRequirement = (type, value) => {
    const { customList } = this.state;

    const rid = getIssueKey();
    const params = {
      id: rid,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateRequirementCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: rid
      });
    } else if (type === 'fixversionid') {
      promise = updateFixversionid(params);
    } else {
      promise = updateRequirement(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getReqirementDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSearchVersion = (value, subproductid) => {
    const { requirementDetail } = this.props;
    const subproduct = requirementDetail.subproduct || {};

    const subProductId = subproductid || subproduct.id;
    if (subProductId) {
      handleSearchVersion(value, subProductId || subproduct.id, EXCLUDE_PUBLISH, (versionList) => {
        const arr = [];
        versionList.forEach(it => {
          arr.push({
            ...it,
            ...it.version,
          });
        });
        this.setState({ versionList: arr });
      });
    }
  }

  getVersionList = (data) => {
    const { versionList } = this.state;
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
    const { requirementDetail } = this.props;
    const { moduleList, subProductList, customList } = this.state;
    const subproduct = requirementDetail.subproduct || {};
    const requirement = requirementDetail.requirement || {};
    const project = requirementDetail.project || {};
    const version = requirementDetail.version || {};
    const requirementCustomFieldRelationInfoList = requirementDetail.requirementCustomFieldRelationInfoList || [];
    const valueMap = requirementDetail.customFieldValueidMap || {};
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
                      <EditSelectDetail
                        issueRole={requirementDetail.issueRole}
                        value={subproduct.id}
                        dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                        handleSaveSelect={(value) => { this.updateRequirement('subProductId', value); this.setState({ 'subProductId-edit': false }) }}
                        required
                        allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                        type="subProduct"
                      />
                    </FormItem>

                    <FormItem label={<span>模块</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={requirementDetail.issueRole}
                        value={requirement.moduleid}
                        dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
                        handleSaveSelect={(value) => this.updateRequirement('moduleid', value)}
                        notRequired
                      />
                    </FormItem>

                    <FormItem label={<span>计划上线时间</span>} {...formLayout}>
                      <DatePickerIssue
                        issueRole={requirementDetail.issueRole}
                        value={requirement.expect_releasetime}
                        handleSave={(value) => this.updateRequirement('expect_releasetime', value)}
                        type="dueDate"
                      />
                    </FormItem>

                    <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={requirementDetail.issueRole}
                        value={requirement.level}
                        dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
                        handleSaveSelect={(value) => this.updateRequirement('level', value)}
                        required
                      />
                    </FormItem>

                    <FormItem label={<span>解决版本</span>} {...formLayout}>
                      <EditSelectSearchDetail
                        subProductId={subproduct.id}
                        subProductList={subProductList}
                        issueRole={requirementDetail.issueRole}
                        value={version.id}
                        dataSource={this.getVersionList(version)}
                        handleSearch={this.handleSearchVersion}
                        handleSaveSelect={(value) => this.updateRequirement('fixversionid', value)}
                      />
                    </FormItem>

                    <FormItem label={<span>目标用户</span>} {...formLayout}>
                      <EditIssue
                        issueRole={requirementDetail.issueRole}
                        maxLength={500}
                        value={requirement.targetUser}
                        type={"input"}
                        handleUpdate={(value) => this.updateRequirement('targetUser', value)}
                        data={requirement}
                      />
                    </FormItem>

                    <FormItem style={{ marginBottom: '0px' }}>
                      <CustomField
                        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                        valueList={requirementCustomFieldRelationInfoList}
                        type="requirement"
                        valueMap={valueMap}
                      />
                    </FormItem>

                    <FormItem label={<span>标签</span>} {...formLayout}>
                      <TagApply type="requirement" connid={requirement.id} issueRole={requirementDetail.issueRole} />
                    </FormItem>

                  </Col>
                  {/* 纯文本展示 */}
                  <Col span={10}>
                    <FormItem label="提交时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {requirement.addtime && moment(requirement.addtime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </FormItem>
                    <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {requirement.updatetime && moment(requirement.updatetime).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </FormItem>
                    <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {requirement.reopentimes ? requirement.reopentimes : 0}
                      </span>
                    </FormItem>
                    <FormItem label="关联项目" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {project.title ?
                          <a href={`/v2/project/detail/?id=${project.id}`}>
                            {project.title}
                          </a> : '--'
                        }
                      </span>
                    </FormItem>
                    <ManPower type="Feature" id={requirement.id} formLayout={getFormLayout(10, 14)} initObj={requirementDetail.dwManpower || {}} issueRole={requirementDetail.issueRole} />
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
                valueList={requirementCustomFieldRelationInfoList}
                type="requirement"
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
              issueRole={requirementDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(requirementCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateRequirement('description', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
