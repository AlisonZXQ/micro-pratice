import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import { getFormLayout, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import { levelMapArr, resolveResultMap } from '@shared/AdviseConfig';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import { getAdviseCustomList, updateAdvise, updateModuleid, updateAdviseCustom } from '@services/advise';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { getModuleList } from '@shared/CommonFun';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 16);

function Index(props) {
  const { adviseDetail } = props;
  const [moduleList, setModuleList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const subproduct = adviseDetail.subproduct || {};
  const advise = adviseDetail.advise || {};
  const adviseCustomFieldRelationInfoList = adviseDetail.adviseCustomFieldRelationInfoList || [];
  const valueMap = adviseDetail.customFieldValueidMap || {};
  const aid = advise.id;
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const getAdviseCustomListFun = useCallback((params) => {
    getAdviseCustomList(params).then((res) => {
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
    getAdviseCustomListFun(params);
    getAllSubProductListFun(value);
  }, [getAdviseCustomListFun, getAllSubProductListFun]);

  const getModuleListByIdFun = useCallback((value) => {
    getModuleList(value, (result) => {
      setModuleList(result || []);
    });
  }, []);

  useEffect(() => {
    if (adviseDetail && adviseDetail.product && adviseDetail.product.id) {
      handleSelectProduct(adviseDetail.product.id);
    }
    // 获取模块的
    if (adviseDetail && adviseDetail.subproduct && adviseDetail.subproduct.id) {
      getModuleListByIdFun(adviseDetail.subproduct.id);
    }
  }, [adviseDetail, handleSelectProduct, getModuleListByIdFun]);

  // 字段的更新根据type判断调用接口
  const updateAdviseFun = (type, value) => {
    let promise = null;

    const params = {
      id: advise.id,
      [type]: value,
    };
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
      props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: advise.id } });
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
              issueRole={adviseDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateAdviseFun('subProductId', value)}
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
              handleSaveSelect={(value) => updateAdviseFun('moduleid', value)}
            />
          </FormItem>

          <FormItem label={<span>期望上线时间</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={adviseDetail.issueRole}
              value={advise.expect_releasetime}
              handleSave={(value) => updateAdviseFun('expect_releasetime', value)}
              type="dueDate"
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={adviseDetail.issueRole}
              value={advise.level}
              dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
              handleSaveSelect={(value) => updateAdviseFun('level', value)}
              required
            />
          </FormItem>

          <FormItem style={{ marginBottom: '0px' }}>
            <CustomField
              customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
              valueList={adviseCustomFieldRelationInfoList}
              type="advise"
              valueMap={valueMap}
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="advise" connid={advise.id} issueRole={adviseDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={12}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {advise.addtime && moment(advise.addtime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {advise.updatetime && moment(advise.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {advise.reopentimes ? advise.reopentimes : 0}
            </span>
          </FormItem>
          <FormItem label="解决结果" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {resolveResultMap[advise.resolve_result]}
            </span>
          </FormItem>
          <ManPower type="Feedback" id={aid} formLayout={getFormLayout(10, 14)} initObj={adviseDetail.dwManpower || {}} issueRole={adviseDetail.issueRole} />

          <FormItem label="报告来源" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {advise && advise.submitProductName}
            </span>
          </FormItem>
          <FormItem label="报告岗位" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {advise && advise.submitRoleName}
            </span>
          </FormItem>

        </Col>
      </Row>
    </div>
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={adviseCustomFieldRelationInfoList}
        type="advise"
        valueMap={valueMap}
        layout={formLayout}
        span={12}
      />
    </Row>

    {
      !!Object.keys(getSystemDescription(customList)).length &&
      <Row>
        <PanelCollapse
          title={<span>
            描述
          </span>}
          children={
            <EditIssue
              issueRole={adviseDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(adviseCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateAdviseFun('description', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(adviseCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
