import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, message, Card, Empty, Spin } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import Forbidden from '@components/403';
import { saveDatafilter } from '@services/report';
import { getFormLayout } from '@utils/helper';
import { warnModal } from '@shared/CommonFun';
import { REPORT_TABS } from '@shared/ReportConfig';
import Header from '../../components/Header';
import ProjectSetting from './ProjectSetting';
import VersionSetting from './VersionSetting';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(2, 6);

class EditDashBoard extends Component {
  state = {
    visible: false,
    filterObjProject: {},
    filterObjVersion: {},
    loading: false,
  }

  componentDidMount() {
    const { productid } = this.props.location.query;
    if (productid) {
      // 子产品下项目所有负责人
      this.props.dispatch({ type: 'report/getProjectOwnerList', payload: { productId: productid } });
      // 获取指定子产品的过滤条件配置
      this.props.dispatch({ type: 'report/getDatafilter', payload: { productId: productid } });
      this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: productid } });
      this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: productid } });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeId = this.props.lastProduct && this.props.lastProduct.id;
    const nextId = nextProps.lastProduct && nextProps.lastProduct.id;

    if (beforeId !== nextId) {
      const id = nextId;
      history.push(`/report/dashboard/edit?productid=${id}`);
      this.props.dispatch({ type: 'report/getProjectOwnerList', payload: { productId: id } });
      // 获取指定子产品的过滤条件配置
      this.props.dispatch({ type: 'report/getDatafilter', payload: { productId: id } });
      this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: id } });
    }
  }

  handleClick = (e) => {
    if (this.area && e.target) {
      if (this.area.contains(e.target)) {
        //
      } else if ((e.toElement.className === 'ant-btn area')
        || (e.toElement.className === 'ant-btn cancel')
        || (e.toElement.className === 'ant-modal-close-x')
        || (e.toElement.className === 'modal-cancel')) {
        //
      } else {
        this.setState({ visible: true });
      }
    }
  }


  getProjectCondition = (filterObjProject) => {
    const projectCondition = [];
    for (let i in filterObjProject) {
      let obj = {};
      if (i === 'starttime_start' && filterObjProject[i]) {
        obj.filterkey = 'project_starttime';
        obj.filtervalue = `${filterObjProject['starttime_start']},${filterObjProject['starttime_end']}`;
      }
      if (i === 'endtime_start' && filterObjProject[i]) {
        obj.filterkey = 'project_endtime';
        obj.filtervalue = `${filterObjProject['endtime_start']},${filterObjProject['endtime_end']}`;
      }
      if (i === 'status' || i === 'priority' || i === 'owner' || i === 'subProductIdList') {
        obj.filterkey = `project_${i}`;
        obj.filtervalue = `${Array.isArray(filterObjProject[i]) ? filterObjProject[i].join(',') : filterObjProject[i]}`;
      }
      // if (i === 'title') {
      //   obj.filterkey = `project_${i}`;
      //   obj.filtervalue = filterObjProject[i];
      // }
      if (Object.keys(obj).length) {
        projectCondition.push(obj);
      }
    }
    return projectCondition;

  }

  getVersionCondition = (filterObjVersion) => {
    const versionCondition = [];
    for (let i in filterObjVersion) {
      let objV = {};
      if (i === 'begintime_start' && filterObjVersion[i]) {
        objV.filterkey = 'version_begintime';
        objV.filtervalue = `${filterObjVersion['begintime_start']},${filterObjVersion['begintime_end']}`;
      }
      if (i === 'endtime_start' && filterObjVersion[i]) {
        objV.filterkey = 'version_endtime';
        objV.filtervalue = `${filterObjVersion['endtime_start']},${filterObjVersion['endtime_end']}`;
      }
      if (i === 'releasetime_start' && filterObjVersion[i]) {
        objV.filterkey = 'version_releasetime';
        objV.filtervalue = `${filterObjVersion['releasetime_start']},${filterObjVersion['releasetime_end']}`;
      }
      if (i === 'state' || i === 'subProductIdList') {
        objV.filterkey = `version_${i}`;
        objV.filtervalue = `${Array.isArray(filterObjVersion[i]) ? filterObjVersion[i].join(',') : filterObjVersion[i]}`;
      }
      // if (i === 'title') {
      //   objV.filterkey = `version_${i}`;
      //   objV.filtervalue = filterObjVersion[i];
      // }
      if (Object.keys(objV).length) {
        versionCondition.push(objV);
      }
    }
    return versionCondition;
  }

  getDiff = () => {
    const { dataFilter, form: { getFieldValue } } = this.props;
    const { filterObjProject, filterObjVersion } = this.state;
    const projectCondition = this.getProjectCondition(filterObjProject);
    const versionCondition = this.getVersionCondition(filterObjVersion);

    let change = false;
    if (dataFilter.name !== getFieldValue('name')) {
      change = true;
    }
    projectCondition.forEach(it => {
      const obj = dataFilter.projectConditionList.find(item => item.filterkey === it.filterkey) || {};
      if ((obj.filterkey && obj.filtervalue !== it.filtervalue) || !obj.filterkey) { // 找到且不等 or 新增
        change = true;
      }
    });

    dataFilter.projectConditionList.forEach(it => {
      if (!projectCondition.some(item => item.filterkey === it.filterkey)) { // 删除
        change = true;
      }
    });

    versionCondition.forEach(it => {
      const obj = dataFilter.versionConditionList.find(item => item.filterkey === it.filterkey) || {};
      if ((obj.filterkey && obj.filtervalue !== it.filtervalue) || !obj.filterkey) { // 找到且不等 or 新增
        change = true;
      }
    });

    dataFilter.versionConditionList.forEach(it => {
      if (!versionCondition.some(item => item.filterkey === it.filterkey)) { // 删除
        change = true;
      }
    });

    return change;
  }

  handleSaveFilter = () => {
    const { productid } = this.props.location.query;
    const { filterObjProject, filterObjVersion } = this.state;
    const projectCondition = this.getProjectCondition(filterObjProject);
    const versionCondition = this.getVersionCondition(filterObjVersion);

    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (!this.getDiff()) { return message.warn('当前条件无变动！') }
      if (productid) {
        const params = {
          productId: productid,
          name: values.name,
          projectCondition: JSON.stringify(projectCondition),
          versionCondition: JSON.stringify(versionCondition),
        };
        // 调用保存的接口
        this.setState({ loading: true });
        saveDatafilter(params).then((res) => {
          this.setState({ loading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success('报表设置已保存！');
          this.props.dispatch({ type: 'report/getDatafilter', payload: { productId: productid } });
        }).catch((e) => {
          this.setState({ loading: false });
          return message.error(e || e.message);
        });
      }
    });
  }

  callback = (key, value) => {
    this.setState({
      [key]: value
    });
  }

  handleBack = () => {
    const { productid } = this.props.location.query;
    if (!this.getDiff()) {
      history.push(`/report/dashboard?productid=${productid}`);
    } else {
      warnModal({
        title: '离开当前页面，所有未保存设置将丢失',
        content: '确认要离开吗？',
        okCallback: () => {
          history.push(`/report/dashboard?productid=${productid}`);
        }
      });
    }
  }

  validFunction = (rule, value, callback) => {
    if (!value.trim().length) {
      callback('名称不能为空！');
    } else {
      callback();
    }
  }

  render() {
    const { form: { getFieldDecorator }, projectOwnerList, dataFilter, dataFilterLoading,
      currentUserReportPer, subProductAll } = this.props;
    const { productid } = this.props.location.query;
    const { loading } = this.state;

    return (<Card className='bgCard'>
      <Header activeKey={`${REPORT_TABS.LAST_DATA}`} />
      <span>
        {
          productid ?
            currentUserReportPer.hasPermission ?
              <Spin spinning={dataFilterLoading}>
                <span ref={area => this.area = area}>
                  <div>
                    <div className={`f-jcsb-aic ${styles.editReport}`}>
                      <span className="f-fwb u-pdl10" style={{ fontSize: '16px' }}>编辑报表</span>
                      <span className="f-fr u-pdr10">
                        <Button className="u-mgr10" type="primary" onClick={() => this.handleSaveFilter()} loading={loading} disabled={currentUserReportPer.auth !== 2}>保存</Button>
                        <Button onClick={() => this.handleBack()} disabled={currentUserReportPer.auth !== 2}>返回</Button>
                      </span>
                    </div>
                    <span>
                      <div className='bbTitle'><span className='name'>报表名称</span></div>
                      <FormItem label="编辑名称" {...formLayout} className={`u-mgb0 f-aic ${styles.editTitle}`}>
                        {
                          getFieldDecorator('name', {
                            initialValue: dataFilter && dataFilter.name,
                            rules: [
                              { required: true, message: '此项必填！' },
                              { validator: this.validFunction }
                            ],
                          })(
                            <Input style={{ width: '300px' }} placeholder="请输入名称，不超过50字" maxLength={50} />
                          )
                        }
                      </FormItem>
                    </span>
                  </div>

                  <ProjectSetting
                    projectConditionList={dataFilter ? dataFilter.projectConditionList : []}
                    projectOwnerList={projectOwnerList}
                    callback={this.callback}
                    subProductAll={subProductAll}
                  />

                  <VersionSetting
                    versionConditionList={dataFilter ? dataFilter.versionConditionList : []}
                    callback={this.callback}
                    subProductAll={subProductAll}
                  />
                </span>
              </Spin> : <Forbidden />
            : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
      </span>
    </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    projectOwnerList: state.report.projectOwnerList,
    dataFilter: state.report.dataFilter,
    dataFilterLoading: state.loading.effects['report/getDatafilter'],
    currentUserReportPer: state.report.currentUserReportPer,
    lastProduct: state.product.lastProduct,
    subProductAll: state.product.enableSubProductList, // 产品下的所有子产品
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(EditDashBoard)));
