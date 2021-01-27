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
import { updateTicket, updateModuleid, updateTicketCustom, getTicketCustomList } from '@services/ticket';
import { getAllSubProductList } from '@services/product';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { levelMapArr, resolveResultMap } from '@shared/TicketConfig';
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

    ticketDetail: {},
  };

  componentDidMount() {
    const { ticketDetail } = this.props;

    if (ticketDetail && ticketDetail.product && ticketDetail.product.id) {
      this.handleSelectProduct(ticketDetail.product.id);
    }

    // 获取模块的
    if (ticketDetail && ticketDetail.subproduct && ticketDetail.subproduct.id) {
      this.getModuleListById(ticketDetail.subproduct.id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!equalsObj(prevProps.ticketDetail, this.props.ticketDetail)) {
      const productId = this.props.ticketDetail && this.props.ticketDetail.product && this.props.ticketDetail.product.id;
      const subProductId = this.props.ticketDetail && this.props.ticketDetail.subproduct && this.props.ticketDetail.subproduct.id;

      this.handleSelectProduct(productId);
      this.getModuleListById(subProductId);
    }
  }

  getTicketDetail = () => {
    const aid = getIssueKey();
    this.props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: aid } });
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
    this.getTicketCustomList(params);
    this.getAllSubProductList(value);
  }

  getTicketCustomList = (params) => {
    getTicketCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 更新字段
  updateTicket = (type, value) => {
    const { customList } = this.state;

    const tid = getIssueKey();
    const params = {
      id: Number(tid),
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleId') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateTicketCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: tid
      });
    } else {
      promise = updateTicket(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      this.getTicketDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { ticketDetail } = this.props;
    const { moduleList, subProductList, customList } = this.state;
    const subproduct = ticketDetail.subproduct || {};
    const ticket = ticketDetail.ticket || {};
    const ticketCustomFieldRelationInfoList = ticketDetail.ticketCustomFieldRelationInfoList || [];
    const valueMap = ticketDetail.customFieldValueidMap || {};
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
                      issueRole={ticketDetail.issueRole}
                      value={subproduct.id}
                      dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                      handleSaveSelect={(value) => { this.updateTicket('subProductId', value) }}
                      required
                      allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                      type="subProduct"
                    />
                  </FormItem>

                  <FormItem label={<span>模块</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={ticketDetail.issueRole}
                      value={ticket.moduleId}
                      dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
                      handleSaveSelect={(value) => this.updateTicket('moduleId', value)}
                    />
                  </FormItem>

                  <FormItem label={<span>期望上线时间</span>} {...formLayout}>
                    <DatePickerIssue
                      issueRole={ticketDetail.issueRole}
                      value={ticket.expectReleaseTime}
                      handleSave={(value) => this.updateTicket('expectReleaseTime', value)}
                      type="dueDate"
                    />
                  </FormItem>

                  <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={ticketDetail.issueRole}
                      value={ticket.level}
                      dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
                      handleSaveSelect={(value) => this.updateTicket('level', value)}
                      required
                    />
                  </FormItem>

                  <FormItem style={{ marginBottom: '0px' }}>
                    <CustomField
                      customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                      valueList={ticketCustomFieldRelationInfoList}
                      type="ticket"
                      valueMap={valueMap}
                    />
                  </FormItem>

                  <FormItem label={<span>标签</span>} {...formLayout}>
                    <TagApply type="ticket" issueRole={ticketDetail.issueRole} connid={ticket.id} />
                  </FormItem>
                </Col>

                {/* 纯文本展示 */}
                <Col span={10}>
                  <FormItem label="提交时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {ticket.createTime && moment(ticket.createTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {ticket.updateTime && moment(ticket.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {ticket.reopenTimes ? ticket.reopenTimes : 0}
                    </span>
                  </FormItem>
                  <FormItem label="解决结果" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {resolveResultMap[ticket.resolveResult]}
                    </span>
                  </FormItem>
                  <ManPower type="Feedback" id={aid} formLayout={getFormLayout(10, 14)} initObj={ticketDetail.dwManpower || {}} issueRole={ticketDetail.issueRole} />

                  <FormItem label="报告来源" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '23px' }}>
                      {ticket && ticket.submitProductName}
                    </span>
                  </FormItem>
                  <FormItem label="报告岗位" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '23px' }}>
                      {ticket && ticket.submitRoleName}
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
                valueList={ticketCustomFieldRelationInfoList}
                type="ticket"
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
              issueRole={ticketDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(ticketCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateTicket('description', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
