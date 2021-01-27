import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import { getFormLayout, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import { levelMapArr, resolveResultMap } from '@shared/TicketConfig';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import { updateTicket, updateModuleid, getTicketCustomList, updateTicketCustom } from '@/services/ticket';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { getModuleList } from '@shared/CommonFun';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 16);

function Index(props) {
  const { ticketDetail } = props;
  const [moduleList, setModuleList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const subproduct = ticketDetail.subproduct || {};
  const ticket = ticketDetail.ticket || {};
  const ticketCustomFieldRelationInfoList = ticketDetail.ticketCustomFieldRelationInfoList || [];
  const valueMap = ticketDetail.customFieldValueidMap || {};
  const tid = ticket.id;
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const getTicketCustomListFun = useCallback((params) => {
    getTicketCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        setCustomList(res.result || []);
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }, []);

  const getAllSubProductListFun = useCallback((value) => {
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        setSubProductList(res.result || []);
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, []);

  const handleSelectProduct = useCallback((value) => {
    const params = {
      productid: value,
    };
    getTicketCustomListFun(params);
    getAllSubProductListFun(value);
  }, [getTicketCustomListFun, getAllSubProductListFun]);

  const getModuleListByIdFun = useCallback((value) => {
    getModuleList(value, (result) => {
      setModuleList(result || []);
    });
  }, []);

  useEffect(() => {
    if (ticketDetail && ticketDetail.product && ticketDetail.product.id) {
      handleSelectProduct(ticketDetail.product.id);
    }
    // 获取模块的
    if (ticketDetail && ticketDetail.subproduct && ticketDetail.subproduct.id) {
      getModuleListByIdFun(ticketDetail.subproduct.id);
    }
  }, [ticketDetail, handleSelectProduct, getModuleListByIdFun]);

  // 字段的更新根据type判断调用接口
  const updateTicketFun = (type, value) => {
    let promise = null;

    const params = {
      id: ticket.id,
      [type]: value,
    };
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
      props.dispatch({ type: 'ticket/getTicketDetail', payload: { id: ticket.id } });
      props.refreshFun();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  return (<div>
    <div>
      <Row>
        <Col span={12}>
          <FormItem label={<span><span className="needIcon">*</span>子产品</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={ticketDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateTicketFun('subProductId', value)}
              required
            />
          </FormItem>

          <FormItem label={<span>模块</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={ticketDetail.issueRole}
              value={ticket.moduleId}
              dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
              handleSaveSelect={(value) => updateTicketFun('moduleId', value)}
            />
          </FormItem>

          <FormItem label={<span>期望上线时间</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={ticketDetail.issueRole}
              value={ticket.expectReleaseTime}
              handleSave={(value) => updateTicketFun('expectReleaseTime', value)}
              type="dueDate"
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={ticketDetail.issueRole}
              value={ticket.level}
              dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
              handleSaveSelect={(value) => updateTicketFun('level', value)}
              required
              allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              type="subProduct"
            />
          </FormItem>

          <FormItem style={{ marginBottom: '0px' }}>
            <CustomField
              customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
              valueList={ticketCustomFieldRelationInfoList}
              type="ticket"
              valueMap={valueMap}
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="ticket" connid={ticket.id} issueRole={ticketDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={12}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {ticket.createTime && moment(ticket.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {ticket.updateTime && moment(ticket.updateTime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {ticket.reopenTimes ? ticket.reopenTimes : 0}
            </span>
          </FormItem>
          <FormItem label="解决结果" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {resolveResultMap[ticket.resolveResult]}
            </span>
          </FormItem>
          <ManPower type="Feedback" id={tid} formLayout={getFormLayout(10, 14)} initObj={ticketDetail.dwManpower || {}} issueRole={ticketDetail.issueRole} />

          <FormItem label="报告来源" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {ticket && ticket.submitProductName}
            </span>
          </FormItem>
          <FormItem label="报告岗位" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {ticket && ticket.submitRoleName}
            </span>
          </FormItem>

        </Col>
      </Row>
    </div>
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={ticketCustomFieldRelationInfoList}
        type="ticket"
        valueMap={valueMap}
        layout={formLayout}
        span={12}
      />
    </Row>

    {
      !!Object.keys(getSystemDescription(customList)).length &&
      <Row>
        <PanelCollapse
          title={'描述'}
          children={
            <EditIssue
              issueRole={ticketDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(ticketCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateTicketFun('description', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(ticketCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
