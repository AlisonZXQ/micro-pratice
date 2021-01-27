import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import { history } from 'umi';
import { getFormLayout, getMentionUsers, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import TextOverFlow from '@components/TextOverFlow';
import { levelMapArr, epicType } from '@shared/ObjectiveConfig';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import { CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { getObjectiveCustomList, updateObjective, updateObjectiveCustom, updateType, updateDescription } from '@services/objective';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 16);

// 目标下没有模块字段？
function Index(props) {
  const { objectiveDetail } = props;
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const subproduct = objectiveDetail.subproduct || {};
  const objective = objectiveDetail.objective || {};
  const project = objectiveDetail.project || {};
  const objectiveCustomFieldRelationInfoList = objectiveDetail.objectiveCustomFieldRelationInfoList || [];
  const valueMap = objectiveDetail.customFieldValueidMap || {};
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const handleSelectProduct = useCallback((value) => {
    const params = {
      productid: value,
    };
    getObjectiveCustomListFun(params);
    getAllSubProductListFun(value);
  }, []);

  useEffect(() => {
    if (objectiveDetail && objectiveDetail.product && objectiveDetail.product.id) {
      handleSelectProduct(objectiveDetail.product.id);
    }
  }, [objectiveDetail, handleSelectProduct]);

  const getObjectiveCustomListFun = (params) => {
    getObjectiveCustomList(params).then((res) => {
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
  const updateObjectiveFun = (type, value) => {
    const params = {
      id: objective.id,
      [type]: value,
    };

    let promise = null;
    if (type === 'remark') {
      promise = updateObjectiveCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: objective.id
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
      props.dispatch({ type: 'objective/getObjectiveDetail', payload: { id: objective.id } });
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
              issueRole={objectiveDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateObjectiveFun('subProductId', value)}
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
              handleSaveSelect={(value) => updateObjectiveFun('level', value)}
              required
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>目标类型</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={objectiveDetail.issueRole}
              value={objective.type}
              dataSource={epicType}
              handleSaveSelect={(value) => updateObjectiveFun('type', value)}
              required
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>到期日</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={objectiveDetail.issueRole}
              value={objective.expect_releasetime}
              handleSave={(value) => updateObjectiveFun('expect_releasetime', value)}
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
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="objective" connid={objective.id} issueRole={objectiveDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={12}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {objective.addtime && moment(objective.addtime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {objective.updatetime && moment(objective.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {objective.reopentimes ? objective.reopentimes : 0}
            </span>
          </FormItem>
          {
            project && project.id &&
            <FormItem label="关联项目" {...getFormLayout(10, 14)}>
              <span className="drawer-right">
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
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={objectiveCustomFieldRelationInfoList}
        type="objective"
        valueMap={valueMap}
        layout={formLayout}
        span={12}
      />
    </Row>

    <Row>
      <PanelCollapse
        title={'验收标准'}
        children={
          <EditIssue
            issueRole={objectiveDetail.issueRole}
            type="rich"
            value={objective.description}
            handleUpdate={(value) => updateObjectiveFun('description', value)}
          />
        }
      />
    </Row>

    {
      !!Object.keys(getSystemDescription(customList)).length &&
      <Row>
        <PanelCollapse
          title={'描述'}
          children={
            <EditIssue
              issueRole={objectiveDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(objectiveCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateObjectiveFun('remark', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(objectiveCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
