import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, message } from 'antd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { getFormLayout, deepCopy, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import ManPower from '@components/ManPower';
import TagApply from '@pages/receipt/components/tag_apply';
import EditIssue from '@pages/receipt/components/edit_issue';
import {
  getTaskCustomList, updateTask, updateEstimateCost,
  updateModuleid, updateTaskCustom, updateFixversionid, getSubTaskCustomList
} from '@services/task';
import { getAllSubProductList } from '@services/product';
import PanelCollapse from '@pages/receipt/components/drawer_shared/components/panel_collapse';
import { levelMap } from '@shared/TaskConfig';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { EXCLUDE_PUBLISH, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(10, 14);

function Index(props) {
  const { taskDetail, issueId } = props;
  const [moduleList, setModuleList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [customList, setCustomList] = useState([]);
  const [versionList, setVersionList] = useState([]);
  const project = taskDetail.project || {};
  const subproduct = taskDetail.subproduct || {};
  const task = taskDetail.task || {};
  const version = taskDetail.version || {};
  const taskCustomFieldRelationInfoList = taskDetail.taskCustomFieldRelationInfoList || [];
  const valueMap = taskDetail.customFieldValueidMap || {};
  const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

  const handleSelectProduct = useCallback((value) => {
    const params = {
      productid: value,
    };
    getTaskCustomListFun(params);
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

  useDeepCompareEffect(() => {
    if (taskDetail && taskDetail.product && taskDetail.product.id) {
      handleSelectProduct(taskDetail.product.id);
    }
    // 获取模块的
    if (taskDetail && taskDetail.subproduct && taskDetail.subproduct.id) {
      getModuleListByIdFun(taskDetail.subproduct.id);
      handleSearchVersionFun('', taskDetail.subproduct.id);
    }
  }, [taskDetail]);

  const getTaskCustomListFun = (params) => {
    let promise = null;

    if (issueId.includes('Subtask')) {
      promise = getSubTaskCustomList(params);
    } else {
      promise = getTaskCustomList(params);
    }
    promise.then((res) => {
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
  const updateTaskFun = (type, value) => {
    const params = {
      id: task.id,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateTaskCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: task.id
      });
    } else if (type === 'fixversionid') {
      promise = updateFixversionid(params);
    } else if (type === 'estimate_cost') {
      if (task.total !== 0) {
        return message.warning('请在子任务中设置预估工作量');
      } else {
        promise = updateEstimateCost(params);
      }
    } else {
      promise = updateTask(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      props.dispatch({ type: 'task/getTaskDetail', payload: { id: task.id } });
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
              issueRole={taskDetail.issueRole}
              value={subproduct.id}
              dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              handleSaveSelect={(value) => updateTaskFun('subProductId', value)}
              required
              allData={subProductList.map(it => ({ id: it.id, name: it.subProductName }))}
              type="subProduct"
            />
          </FormItem>

          <FormItem label={<span>模块</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={taskDetail.issueRole}
              value={task.moduleid}
              dataSource={moduleList.map(it => ({ id: it.productModule.id, name: it.productModule.name }))}
              handleSaveSelect={(value) => updateTaskFun('moduleid', value)}
              notRequired
            />
          </FormItem>

          <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
            <EditSelectDetail
              issueRole={taskDetail.issueRole}
              value={task.level}
              dataSource={levelMap.map(it => ({ id: it.id, name: it.name }))}
              handleSaveSelect={(value) => updateTaskFun('level', value)}
            />
          </FormItem>

          <FormItem label={<span>解决版本</span>} {...formLayout}>
            <EditSelectSearchDetail
              subProductId={subproduct.id}
              subProductList={subProductList}
              issueRole={taskDetail.issueRole}
              value={version.id}
              dataSource={getVersionListFun(version)}
              handleSearch={handleSearchVersionFun}
              handleSaveSelect={(value) => updateTaskFun('fixversionid', value)}
            />
          </FormItem>

          <FormItem label={<span>到期日</span>} {...formLayout}>
            <DatePickerIssue
              issueRole={taskDetail.issueRole}
              value={task.expect_releasetime}
              handleSave={(value) => updateTaskFun('expect_releasetime', value)}
              type="dueDate"
            />
          </FormItem>

          <FormItem label={<span>预估工作量</span>} {...formLayout}>
            <EditIssue
              issueRole={taskDetail.issueRole}
              type="input"
              editType="cost"
              value={task.estimate_cost}
              handleUpdate={(value) => updateTaskFun('estimate_cost', value)}
            />
          </FormItem>


          <FormItem style={{ marginBottom: '0px' }}>
            <CustomField
              customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
              valueList={taskCustomFieldRelationInfoList}
              type="task"
              valueMap={valueMap}
              layout={formLayout}
            />
          </FormItem>

          <FormItem label={<span>标签</span>} {...formLayout}>
            <TagApply type="task" connid={task.id} issueRole={taskDetail.issueRole} />
          </FormItem>
        </Col>

        {/* 纯文本展示 */}
        <Col span={10}>
          <FormItem label="提交时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {task.addtime && moment(task.addtime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="更新时间" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {task.updatetime && moment(task.updatetime).format('YYYY-MM-DD HH:mm:ss')}
            </span>
          </FormItem>
          <FormItem label="返工次数" {...getFormLayout(10, 14)}>
            <span className="drawer-right">
              {task.reopentimes ? task.reopentimes : 0}
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
          <ManPower type={task.parentid ? "Subtask" : "Task"} id={task.id} formLayout={getFormLayout(10, 14)} initObj={taskDetail.dwManpower || {}} issueRole={taskDetail.issueRole} />
        </Col>
      </Row>
    </div>
    <div className={styles.dividerStyle}></div>

    <Row>
      <CustomField
        customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
        valueList={taskCustomFieldRelationInfoList}
        type="task"
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
              issueRole={taskDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(taskCustomFieldRelationInfoList)}
              handleUpdate={(value) => updateTaskFun('description', value)}
              editType="drawer_rich"
            />
          }
          defaultCollapse={!getSystemDescriptionEditValue(taskCustomFieldRelationInfoList)}
        />
      </Row>
    }

  </div>);
}

export default Index;
