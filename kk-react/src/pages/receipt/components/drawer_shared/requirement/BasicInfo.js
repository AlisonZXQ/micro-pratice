import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import { getFormLayout, deepCopy, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import { levelMapArr } from '@shared/RequirementConfig';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import { getRequirementCustomList, updateRequirement, updateModuleid, updateRequirementCustom, updateFixversionid } from '@services/requirement';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { CUSTOME_SYSTEM, EXCLUDE_PUBLISH } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(10, 14);

function Index(props) {
  const { requirementDetail } = props;
  const [moduleList, setModuleList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const [versionList, setVersionList] = useState([]);
  const project = requirementDetail.project || {};
  const subproduct = requirementDetail.subproduct || {};
  const requirement = requirementDetail.requirement || {};
  const version = requirementDetail.version || {};
  const requirementCustomFieldRelationInfoList = requirementDetail.requirementCustomFieldRelationInfoList || [];
  const valueMap = requirementDetail.customFieldValueidMap || {};
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const handleSelectProduct = useCallback((value) => {
    const params = {
      productid: value,
    };
    getRequirementCustomListFun(params);
    getAllSubProductListFun(value);
  }, []);

  const handleSearchVersionFun = useCallback((value, subproductid) => {
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
        setVersionList(arr);
      });
    }
  }, [subproduct.id]);

  useEffect(() => {
    if (requirementDetail && requirementDetail.product && requirementDetail.product.id) {
      handleSelectProduct(requirementDetail.product.id);
    }
    // 获取模块的
    if (requirementDetail && requirementDetail.subproduct && requirementDetail.subproduct.id) {
      getModuleListByIdFun(requirementDetail.subproduct.id);
      handleSearchVersionFun('', requirementDetail.subproduct.id);
    }
  }, [requirementDetail, handleSelectProduct, handleSearchVersionFun]);

  const getRequirementCustomListFun = (params) => {
    getRequirementCustomList(params).then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        setCustomList(res.result || []);
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  };

  const getAllSubProductListFun = (value) => {
    getAllSubProductList(value).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        setSubProductList(res.result || []);
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const getModuleListByIdFun = (value) => {
    getModuleList(value, (result) => {
      setModuleList(result || []);
    });
  };

  // 字段的更新根据type判断调用接口
  // 字段更新接口
  const updateRequirementFun = (type, value) => {
    const params = {
      id: requirement.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateRequirementCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: requirement.id
      });
    } else if (type === 'fixversionid') {
      promise = updateFixversionid(params);
    } else {
      promise = updateRequirement(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      props.dispatch({ type: 'requirement/getReqirementDetail', payload: { id: requirement.id } });
      if (type === 'fixversionid') {
        props.refreshFun({ fixversionid: value });
      }
      props.refreshFun();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const getVersionListFun = (data) => {
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
  };

  return (<div>
    <div>
      <Row>
        <Col span={12}>
          <FormItem label={<span><span className="needIcon">*</span>子产品</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={requirementDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateRequirementFun('subProductId', value)}
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
              handleSaveSelect={(value) => updateRequirementFun('moduleid', value)}
              notRequired
            />
          </FormItem>

          <FormItem label={<span>计划上线时间</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={requirementDetail.issueRole}
              value={requirement.expect_releasetime}
              handleSave={(value) => updateRequirementFun('expect_releasetime', value)}
              type="dueDate"
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={requirementDetail.issueRole}
              value={requirement.level}
              dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
              handleSaveSelect={(value) => updateRequirementFun('level', value)}
              required
            />
          </FormItem>

          <FormItem label={<span>解决版本</span>} {...formLayout}>
            <EditSelectSearchDetail
              subProductId={subproduct.id}
              subProductList={subProductList}
              issueRole={requirementDetail.issueRole}
              value={version.id}
              dataSource={getVersionListFun(version)}
              handleSearch={handleSearchVersionFun}
              handleSaveSelect={(value) => updateRequirementFun('fixversionid', value)}
            />
          </FormItem>

          <FormItem label={<span>目标用户</span>} {...formLayout}>
            <EditIssue
              issueRole={requirementDetail.issueRole}
              maxLength={500}
              value={requirement.targetUser}
              type={"input"}
              handleUpdate={(value) => updateRequirementFun('targetUser', value)}
              data={requirement}
            />
          </FormItem>

          <FormItem style={{ marginBottom: '0px' }}>
            <CustomField
              customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
              valueList={requirementCustomFieldRelationInfoList}
              type="requirement"
              valueMap={valueMap}
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="requirement" connid={requirement.id} issueRole={requirementDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={10}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {requirement.addtime && moment(requirement.addtime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {requirement.updatetime && moment(requirement.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {requirement.reopentimes ? requirement.reopentimes : 0}
            </span>
          </FormItem>
          <FormItem label="关联项目" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
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
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={requirementCustomFieldRelationInfoList}
        type="requirement"
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
              issueRole={requirementDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(requirementCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateRequirementFun('description', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(requirementCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
