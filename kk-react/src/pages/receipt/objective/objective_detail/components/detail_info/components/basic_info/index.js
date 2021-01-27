import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Col, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { history } from 'umi';
import { getFormLayout, equalsObj, getIssueKey, getMentionUsers, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import { getObjectiveCustomList, updateObjective, updateDescription, updateType, updateObjectiveCustom } from '@services/objective';
import { getAllSubProductList } from '@services/product';
import { levelMapArr, epicType } from '@shared/ObjectiveConfig';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import TextOverFlow from '@components/TextOverFlow';
import TagApply from '@pages/receipt/components/tag_apply';
import ManPower from '@components/ManPower';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(6, 18);

class index extends Component {
  state = {
    subProductList: [],
    versionList: [],
    customList: [],
  };

  componentDidMount() {
    const { objectiveDetail } = this.props;
    if (objectiveDetail && objectiveDetail.product && objectiveDetail.product.id) {
      this.handleSelectProduct(objectiveDetail.product.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.objectiveDetail, nextProps.objectiveDetail)) {
      const productId = nextProps.objectiveDetail && nextProps.objectiveDetail.product && nextProps.objectiveDetail.product.id;
      this.handleSelectProduct(productId);
    }
  }

  getObjectiveDetail = () => {
    const oid = getIssueKey();
    this.props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: oid } });
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

  handleSelectProduct = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ subProductId: '' });
    const params = {
      productid: value,
    };
    this.getObjectiveCustomList(params);
    this.getAllSubProductList(value);
  }

  getObjectiveCustomList = (params) => {
    getObjectiveCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 字段更新
  updateObjective = (type, value) => {
    const { customList } = this.state;

    const oid = getIssueKey();
    const params = {
      id: oid,
      [type]: value,
    };
    let promise = null;
    if (type === 'remark') {
      promise = updateObjectiveCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: oid
      });
    } else if (type === 'description') {
      promise = updateDescription({
        ...params,
        noticeEmailList: getMentionUsers(value).map(it => it.email) || [],
      });
    } else if (type === 'type') {
      promise = updateType(params);
    } else {
      promise = updateObjective(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getObjectiveDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { objectiveDetail } = this.props;
    const { subProductList, customList } = this.state;
    const subproduct = objectiveDetail.subproduct || {};
    const objective = objectiveDetail.objective || {};
    const project = objectiveDetail.project || {};
    const objectiveCustomFieldRelationInfoList = objectiveDetail.objectiveCustomFieldRelationInfoList || [];
    const valueMap = objectiveDetail.customFieldValueidMap || {};
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
                        issueRole={objectiveDetail.issueRole}
                        value={subproduct.id}
                        dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                        handleSaveSelect={(value) => { this.updateObjective('subProductId', value) }}
                        required
                        allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                        type="subProduct"
                      />
                    </FormItem>

                    <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={objectiveDetail.issueRole}
                        value={objective.level}
                        dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
                        handleSaveSelect={(value) => this.updateObjective('level', value)}
                        required
                      />
                    </FormItem>

                    <FormItem label={<span><span className="needIcon">*</span>目标类型</span>} {...formLayout}>
                      <EditSelectDetail
                        issueRole={objectiveDetail.issueRole}
                        value={objective.type}
                        dataSource={epicType}
                        handleSaveSelect={(value) => this.updateObjective('type', value)}
                        required
                      />
                    </FormItem>

                    <FormItem label={<span><span className="needIcon">*</span>到期日</span>} {...formLayout}>
                      <DatePickerIssue
                        issueRole={objectiveDetail.issueRole}
                        value={objective.expect_releasetime}
                        handleSave={(value) => this.updateObjective('expect_releasetime', value)}
                        required
                        type="dueDate"
                      />
                    </FormItem>

                    <FormItem style={{ marginBottom: '0px' }}>
                      <CustomField
                        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                        valueList={objectiveCustomFieldRelationInfoList}
                        type="objective"
                        valueMap={valueMap}
                      />
                    </FormItem>

                    <FormItem label={<span>标签</span>} {...formLayout}>
                      <TagApply type="objective" connid={objective.id} issueRole={objectiveDetail.issueRole} />
                    </FormItem>
                  </Col>

                  {/* 纯文本展示 */}
                  <Col span={10}>
                    <FormItem label="创建时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {objective.addtime ? moment(objective.addtime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </span>
                    </FormItem>
                    <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {objective.updatetime ? moment(objective.updatetime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </span>
                    </FormItem>
                    <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                      <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                        {objective.reopentimes ? objective.reopentimes : 0}
                      </span>
                    </FormItem>
                    {
                      project && project.id &&
                      <FormItem label="关联项目" {...getFormLayout(10, 14)}>
                        <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                          <TextOverFlow content={
                            <a
                              onClick={() => history.push(`/project/detail?id=${project.id}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {project.title}
                            </a>} maxWidth={'10vw'} />
                        </span>
                      </FormItem>
                    }
                    <ManPower type="Objective" id={objective.id} formLayout={getFormLayout(10, 14)} initObj={objectiveDetail.dwManpower || {}} issueRole={objectiveDetail.issueRole} />

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
                valueList={objectiveCustomFieldRelationInfoList}
                valueMap={valueMap}
                type="objective"
              />
            </Col>
          </Row>

        </Card>
      </div>

      <div className={styles.remark}>
        <div className="bbTitle">
          <span className="name">验收标准</span>
        </div>
        <Card>
          <EditIssue
            issueRole={objectiveDetail.issueRole}
            type="rich"
            value={objective.description}
            handleUpdate={(value) => this.updateObjective('description', value)}
            editType="detail_rich"
          />
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
              issueRole={objectiveDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(objectiveCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateObjective('remark', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
