import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Row, Col, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { getFormLayout, equalsObj, deepCopy, getIssueKey, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import EditSelectDetail from '@components/EditSelectDetail';
import EditSelectSearchDetail from '@components/EditSelectSearchDetail';
import EditIssue from '@pages/receipt/components/edit_issue';
import DatePickerIssue from '@pages/receipt/components/datepicker';
import CustomField from '@pages/receipt/components/customfiled';
import {
  getTaskCustomList, updateTask,
  updateModuleid, updateTaskCustom, updateFixversionid, updateEstimateCost, getSubTaskCustomList
} from '@services/task';
import { getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { getAllSubProductList } from '@services/product';
import TagApply from '@pages/receipt/components/tag_apply';
import ManPower from '@components/ManPower';
import { EXCLUDE_PUBLISH, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { levelMap } from '@shared/TaskConfig';
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
    const { taskDetail } = this.props;
    if (taskDetail && taskDetail.product && taskDetail.product.id) {
      this.handleSelectProduct(taskDetail.product.id);
    }

    // 获取模块的
    if (taskDetail && taskDetail.subproduct && taskDetail.subproduct.id) {
      this.getModuleListById(taskDetail.subproduct.id);
      this.handleSearchVersion('', taskDetail.subproduct.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.taskDetail, nextProps.taskDetail)) {
      const productId = nextProps.taskDetail && nextProps.taskDetail.product && nextProps.taskDetail.product.id;
      const subProductId = nextProps.taskDetail && nextProps.taskDetail.subproduct && nextProps.taskDetail.subproduct.id;

      this.handleSelectProduct(productId);
      this.getModuleListById(subProductId);
      this.handleSearchVersion('', subProductId);
    }
  }

  getTaskDetail = () => {
    const tid = getIssueKey();
    this.props.dispatch({ type: 'task/getTaskDetail', payload: { id: tid } });
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
    this.getTaskCustomList(params);
    this.getAllSubProductList(value);
  }

  getTaskCustomList = (params) => {
    const pathname = this.props.location.pathname || '';
    const { taskDetail } = this.props;
    const task = taskDetail.task || {};
    let promise = null;
    if (pathname.includes('Subtask') || task.parentid) {
      promise = getSubTaskCustomList(params);
    } else {
      promise = getTaskCustomList(params);
    }

    promise.then((res) => {
      if (res.code !== 200) return message.error('获取自定义信息失败', res.message);
      if (res.result) {
        this.setState({ customList: res.result });
      }
    }).catch((err) => {
      return message.error('获取自定义信息异常', err || err.message);
    });
  }

  // 字段更新接口
  updateTask = (type, value) => {
    const { taskDetail } = this.props;
    const { customList } = this.state;

    const task = taskDetail.task || {};
    const tid = getIssueKey();
    const params = {
      id: tid,
      [type]: value,
    };
    let promise = null;
    if (type === 'moduleid') {
      promise = updateModuleid(params);
    } else if (type === 'description') {
      promise = updateTaskCustom({
        value: value ? value.toString() : '',
        customfieldId: getSystemDescription(customList).id,
        issueId: tid
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
      this.getTaskDetail();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleSearchVersion = (value, subproductid) => {
    const { taskDetail } = this.props;
    const subproduct = taskDetail.subproduct || {};

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
    const { taskDetail } = this.props;
    const { moduleList, subProductList, customList } = this.state;
    const subproduct = taskDetail.subproduct || {};
    const project = taskDetail.project || {};
    const task = taskDetail.task || {};
    const version = taskDetail.version || {};
    const taskCustomFieldRelationInfoList = taskDetail.taskCustomFieldRelationInfoList || [];
    const valueMap = taskDetail.customFieldValueidMap || {};
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
                      issueRole={taskDetail.issueRole}
                      value={subproduct.id}
                      dataSource={enableSubProductList.map(it => ({ id: it.id, name: it.subProductName }))}
                      handleSaveSelect={(value) => { this.updateTask('subProductId', value) }}
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
                      handleSaveSelect={(value) => this.updateTask('moduleid', value)}
                    />
                  </FormItem>


                  <FormItem label={<span><span className="needIcon">*</span>优先级</span>} {...formLayout}>
                    <EditSelectDetail
                      issueRole={taskDetail.issueRole}
                      value={task.level}
                      dataSource={levelMap.map(it => ({ id: it.id, name: it.name }))}
                      handleSaveSelect={(value) => this.updateTask('level', value)}
                    />
                  </FormItem>

                  <FormItem label={<span>解决版本</span>} {...formLayout}>
                    <EditSelectSearchDetail
                      subProductId={subproduct.id}
                      subProductList={subProductList}
                      issueRole={taskDetail.issueRole}
                      value={version.id}
                      dataSource={this.getVersionList(version)}
                      handleSearch={this.handleSearchVersion}
                      handleSaveSelect={(value) => this.updateTask('fixversionid', value)}
                    />
                  </FormItem>

                  <FormItem label={<span>到期日</span>} {...formLayout}>
                    <DatePickerIssue
                      issueRole={taskDetail.issueRole}
                      value={task.expect_releasetime}
                      handleSave={(value) => this.updateTask('expect_releasetime', value)}
                      type="dueDate"
                    />
                  </FormItem>

                  <FormItem label={<span>预估工作量</span>} {...formLayout}>
                    <EditIssue
                      issueRole={taskDetail.issueRole}
                      type="input"
                      editType="cost"
                      value={task.estimate_cost}
                      handleUpdate={(value) => this.updateTask('estimate_cost', value)}
                    />
                  </FormItem>

                  <FormItem style={{ marginBottom: '0px' }}>
                    <CustomField
                      customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name !== '描述')}
                      valueList={taskCustomFieldRelationInfoList}
                      type="task"
                      valueMap={valueMap}
                    />
                  </FormItem>

                  <FormItem label={<span>标签</span>} {...formLayout}>
                    <TagApply connid={task.is} issueRole={taskDetail.issueRole} />
                  </FormItem>
                </Col>

                {/* 纯文本展示 */}
                <Col span={10}>
                  <FormItem label="提交时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {task.addtime && moment(task.addtime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="更新时间" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {task.updatetime && moment(task.updatetime).format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  </FormItem>
                  <FormItem label="返工次数" {...getFormLayout(10, 14)}>
                    <span className="u-subtitle f-ib" style={{ height: '34px' }}>
                      {task.reopentimes ? task.reopentimes : 0}
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
                  <ManPower type={task.parentid ? "Subtask" : "Task"} id={task.id} formLayout={getFormLayout(10, 14)} initObj={taskDetail.dwManpower || {}} issueRole={taskDetail.issueRole} />
                </Col>

              </Row>
            </Col>

            <Col
              span={8}
              className="u-pdt15"
              style={{ height: '100%', overflow: 'auto', position: 'absolute', right: '0px' }}
            >
              <CustomField
                customFileds={customList && customList.filter(it => it.system === CUSTOME_SYSTEM.NOT_SYSTEM)}
                valueList={taskCustomFieldRelationInfoList}
                type="task"
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
              issueRole={taskDetail.issueRole}
              type="rich"
              value={getSystemDescriptionEditValue(taskCustomFieldRelationInfoList)}
              handleUpdate={(value) => this.updateTask('description', value)}
              editType="detail_rich"
            />
          </Card>
        </div>
      }

    </div>);
  }
}

export default withRouter(connect()(index));
