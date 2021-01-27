import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import { getFormLayout, deepCopy, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import { levelMapArr, onlinebugMap, classifyBug } from '@shared/BugConfig';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import {
  getBugCustomList, updateBug, updateModuleid, updateBugCustom, updateFixversionid,
  updateBugtype, updateEstimateCost, updateFindversionid
} from '@services/bug';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { EXCLUDE_PUBLISH, INCLUDE_PUBLISH, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(10, 14);

function Index(props) {
  const { bugDetail } = props;
  const [moduleList, setModuleList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const [findVersionList, setFindVersionList] = useState([]);
  const [fixVersionList, setFixVersionList] = useState([]);
  const product = bugDetail.product || {};
  const subproduct = bugDetail.subproduct || {};
  const bug = bugDetail.bug || {};
  const version = bugDetail.version || {};
  const findversion = bugDetail.findVersion || {};
  const bugCustomFieldRelationInfoList = bugDetail.bugCustomFieldRelationInfoList || [];
  const valueMap = bugDetail.customFieldValueidMap || {};
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const handleSelectProduct = useCallback((value) => {
    const params = {
      productid: value,
    };
    getBugCustomListFun(params);
    getAllSubProductListFun(value);
  }, []);

  const getModuleListByIdFun = useCallback((value) => {
    getModuleList(value, (result) => {
      setModuleList(result || []);
    });
  }, []);

  const handleSearchVersionFun = useCallback((value, type, subProductId) => {
    if (product.id && subproduct.id) {

      handleSearchVersion(value, subProductId || subproduct.id, type === 'fixversionid' ? EXCLUDE_PUBLISH : INCLUDE_PUBLISH, (versionList) => {
        const arr = [];
        versionList.forEach(it => {
          arr.push({
            ...it,
            ...it.version,
          });
        });
        if (type === 'findversionid') {
          setFindVersionList(arr);
        } else {
          setFixVersionList(arr);
        }
      });
    }
  }, [product.id, subproduct.id]);

  useEffect(() => {
    if (bugDetail && bugDetail.product && bugDetail.product.id) {
      handleSelectProduct(bugDetail.product.id);
    }
    // 获取模块的
    if (bugDetail && bugDetail.subproduct && bugDetail.subproduct.id) {
      getModuleListByIdFun(bugDetail.subproduct.id);
      handleSearchVersionFun('', 'fixversionid', bugDetail.subproduct.id);
      handleSearchVersionFun('', 'findversionid', bugDetail.subproduct.id);
    }
  }, [bugDetail, handleSelectProduct, getModuleListByIdFun, handleSearchVersionFun]);

  const getBugCustomListFun = (params) => {
    getBugCustomList(params).then((res) => {
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

  // 字段的更新根据type判断调用接口
  // 字段更新接口
  const updateBugFun = (type, value) => {
    const params = {
      id: bug.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateBugCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: bug.id
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
      props.dispatch({ type: 'bug/getBugDetail', payload: { id: bug.id } });
      props.refreshFun();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const getVersionListFun = (data, type) => {
    const versionList = type === 'findversionid' ? findVersionList : fixVersionList;

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
              issueRole={bugDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateBugFun('subProductId', value)}
              required
              allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              type="subProduct"
            />
          </FormItem>

          <FormItem label={<span>模块</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={bugDetail.issueRole}
              value={bug.moduleid}
              dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
              handleSaveSelect={(value) => updateBugFun('moduleid', value)}
              notRequired
            />
          </FormItem>

          <FormItem label={<span>重要性</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={bugDetail.issueRole}
              value={bug.level}
              dataSource={levelMapArr.map(it => ({ id: it.value, name: it.label }))}
              handleSaveSelect={(value) => updateBugFun('level', value)}
              required
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>线上缺陷</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={bugDetail.issueRole}
              value={bug.onlinebug}
              dataSource={onlinebugMap}
              handleSaveSelect={(value) => updateBugFun('onlinebug', value)}
            />
          </FormItem>

          <FormItem label={<span>缺陷分类</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={bugDetail.issueRole}
              value={bug.bugtype}
              dataSource={classifyBug}
              handleSaveSelect={(value) => updateBugFun('bugtype', value)}
            />
          </FormItem>

          <FormItem label={<span>预估工作量</span>} {...formLayout}>
            <EditIssue
              issueRole={bugDetail.issueRole}
              type="input"
              editType="cost"
              value={bug.estimate_cost}
              handleUpdate={(value) => updateBugFun('estimate_cost', value)}
            />
          </FormItem>

          <FormItem label={<span>到期日</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={bugDetail.issueRole}
              value={bug.expect_releasetime}
              handleSave={(value) => updateBugFun('expect_releasetime', value)}
              type="dueDate"
            />
          </FormItem>

          <FormItem label={<span>发现版本</span>} {...formLayout}>
            <EditSelectSearchDetail
              subProductId={subproduct.id}
              subProductList={subProductList}
              issueRole={bugDetail.issueRole}
              value={findversion.id}
              dataSource={getVersionListFun(findversion, 'findversionid')}
              handleSearch={(value) => handleSearchVersionFun(value, 'findversionid')}
              handleSaveSelect={(value) => updateBugFun('findversionid', value)}
            />
          </FormItem>

          <FormItem label={<span>解决版本</span>} {...formLayout}>
            <EditSelectSearchDetail
              subProductId={subproduct.id}
              subProductList={subProductList}
              issueRole={bugDetail.issueRole}
              value={version.id}
              dataSource={getVersionListFun(version, 'fixversionid')}
              handleSearch={(value) => handleSearchVersionFun(value, 'fixversionid')}
              handleSaveSelect={(value) => updateBugFun('fixversionid', value)}
            />
          </FormItem>

          <FormItem style={{ marginBottom: '0px' }}>
            <CustomField
              customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
              valueList={bugCustomFieldRelationInfoList}
              type="bug"
              valueMap={valueMap}
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="bug" connid={bug.id} issueRole={bugDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={10}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {bug.addtime && moment(bug.addtime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {bug.updatetime && moment(bug.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {bug.reopentimes ? bug.reopentimes : 0}
            </span>
          </FormItem>
          <ManPower type="Bug" id={bug.id} formLayout={getFormLayout(10, 14)} initObj={bugDetail.dwManpower || {}} issueRole={bugDetail.issueRole} />
        </Col>
      </Row>
    </div>
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={bugCustomFieldRelationInfoList}
        type="bug"
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
              issueRole={bugDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(bugCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateBugFun('description', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(bugCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
