import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Col, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { getFormLayout, equalsObj, getIssueKey, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import { getAdviseCustomList, updateAdvise, updateModuleid, updateAdviseCustom } from '@services/advise';
import { getAllSubProductList } from '@services/product';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { levelMapArr, resolveResultMap } from '@shared/AdviseConfig';
import TagApply from '@pages/receipt/components/tag_apply';
import ManPower from '@components/ManPower';
import { getModuleList } from '@shared/CommonFun';
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

    adviseDetail: {},
  };

  componentDidMount() {
    const { adviseDetail } = this.props;

    if (adviseDetail && adviseDetail.product && adviseDetail.product.id) {
      this.handleSelectProduct(adviseDetail.product.id);
    }

    // 获取模块的
    if (adviseDetail && adviseDetail.subproduct && adviseDetail.subproduct.id) {
      this.getModuleListById(adviseDetail.subproduct.id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!equalsObj(prevProps.adviseDetail, this.props.adviseDetail)) {
      const productId = this.props.adviseDetail && this.props.adviseDetail.product && this.props.adviseDetail.product.id;
      const subProductId = this.props.adviseDetail && this.props.adviseDetail.subproduct && this.props.adviseDetail.subproduct.id;

      this.handleSelectProduct(productId);
      this.getModuleListById(subProductId);
    }
  }

  getAdviseDetail = () => {
    const aid = getIssueKey();
    this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: aid } });
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
    this.getAdviseCustomList(params);
    this.getAllSubProductList(value);
  }

  getAdviseCustomList = (params) => {
    getAdviseCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 更新字段
  updateAdvise = (type, value) => {
    const { customList } = this.state;

    const aid = getIssueKey();
    const params = {
      id: aid,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateAdviseCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: aid
      });
    } else {
      promise = updateAdvise(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getAdviseDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { adviseDetail } = this.props;
    const { moduleList, subProductList, customList } = this.state;
    const subproduct = adviseDetail.subproduct || {};
    const advise = adviseDetail.advise || {};
    const adviseCustomFieldRelationInfoList = adviseDetail.adviseCustomFieldRelationInfoList || [];
    const valueMap = adviseDetail.customFieldValueidMap || {};
    const aid = getIssueKey();
    const productCustomList = customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM);
    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    return (<div>
      <div className={styles.container}>
        <Card>
          <Row>
            <Col
              span={16}
              className={productCustomList && productCustomList.length ? styles.borderRight : ''}>
              <Row className="u-mgt15">
                <Col span={14}>
                  <FormItem label={<span><span className="needIcon">*</span>子产品</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={adviseDetail.issueRole}
                      value={subproduct.id}
                      dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                      handleSaveSelect={(value) => { this.updateAdvise('subProductId', value) }}
                      required
                      allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                      type="subProduct"
                    />
                  </FormItem>

                  <FormItem label={<span>模块</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={adviseDetail.issueRole}
                      value={advise.moduleid}
                      dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
                      handleSaveSelect={(value) => this.updateAdvise('moduleid', value)}
                    />
                  </FormItem>

                  <FormItem label={<span>期望上线时间</span>} {...formLayout}>
                    <DatePickerIssue
                      issueRole={adviseDetail.issueRole}
                      value={advise.expect_releasetime}
                      handleSave={(value) => this.updateAdvise('expect_releasetime', value)}
                      type="dueDate"
                    />
                  </FormItem>

                  <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={adviseDetail.issueRole}
                      value={advise.level}
                      dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
                      handleSaveSelect={(value) => this.updateAdvise('level', value)}
                      required
                    />
                  </FormItem>

                  <FormItem style={{ marginBottom: '0px' }}>
                    <CustomField
                      customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                      valueList={adviseCustomFieldRelationInfoList}
                      type="advise"
                      valueMap={valueMap}
                    />
                  </FormItem>

                  <FormItem label={<span>标签</span>} {...formLayout}>
                    <TagApply type="advise" issueRole={adviseDetail.issueRole} connid={advise.id} />
                  </FormItem>
                </Col>

                {/* 纯文本展示 */}
                <Col span={10}>
                  <FormItem label="提交时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {advise.addtime && moment(advise.addtime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {advise.updatetime && moment(advise.updatetime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {advise.reopentimes ? advise.reopentimes : 0}
                    </span>
                  </FormItem>
                  <FormItem label="解决结果" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {resolveResultMap[advise.resolve_result]}
                    </span>
                  </FormItem>
                  <ManPower type="Feedback" id={aid} formLayout={getFormLayout(10, 14)} initObj={adviseDetail.dwManpower || {}} issueRole={adviseDetail.issueRole} />

                  <FormItem label="报告来源" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '23px' }}>
                      {advise && advise.submitProductName}
                    </span>
                  </FormItem>
                  <FormItem label="报告岗位" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '23px' }}>
                      {advise && advise.submitRoleName}
                    </span>
                  </FormItem>

                </Col>
              </Row>
            </Col>
            <Col span={8}
              className="u-pdt15"
              style={{ height: '100%', overflow: 'auto', position: 'absolute', right: '0px' }}
            >
              <CustomField
                customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
                valueList={adviseCustomFieldRelationInfoList}
                type="advise"
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
              issueRole={adviseDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(adviseCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateAdvise('description', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
