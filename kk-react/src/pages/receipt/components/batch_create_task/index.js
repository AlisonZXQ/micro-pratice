import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Select, Button, Row, Col, Input, message } from 'antd';
import uuid from 'uuid';
import { connect } from 'dva';
import MyIcon from '@components/MyIcon';
import { getFormLayout, deepCopy, equalsObj } from '@utils/helper';
import { getDismantleData, getConfigList } from '@services/product_setting';
import { levelMap, taskLevelKeyMap } from '@shared/TaskConfig';
import { handleSearchUser, getModuleList, handleSearchVersion } from '@shared/CommonFun';
import { EXCLUDE_PUBLISH } from '@shared/ReceiptConfig';
import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;

const bigFormLayout = getFormLayout(3, 20);
const formLayout = getFormLayout(6, 16);

class BatchCreateTask extends Component {
  state = {
    visible: false,
    userList: [],
    plannings: [],
    selectId: 0,
    currentTask: [],

    moduleList: [], // 模块
    versionList: [], // 版本列表
  };

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
    if (!equalsObj(prevProps.requirementDetail, this.props.requirementDetail)) {
      const subproduct = this.props.requirementDetail.subproduct || {};
      getModuleList(subproduct.id, (moduleList) => {
        this.setState({ moduleList });
      });

      handleSearchVersion('', subproduct.id, EXCLUDE_PUBLISH, (versionList) => {
        this.setState({ versionList });
      });
    }
  }

  getDismantleData = () => {
    const { lastProduct } = this.props;
    this.setState({ loading: true });
    const params = {
      productid: lastProduct.id,
    };
    getDismantleData(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取信息失败, ${res.msg}`);
      }
      const arr = res.result || [];
      arr.unshift({
        id: 0,
        name: '自定义',
      });
      this.setState({ plannings: arr });
    }).catch((err) => {
      return message.error('获取信息异常', err || err.msg);
    });
  }

  getConfigList = (value) => {
    const params = {
      dismantleid: value,
    };
    const { requirementDetail } = this.props;
    const requirementName = (requirementDetail && requirementDetail.requirement && requirementDetail.requirement.name) ?
      (requirementDetail && requirementDetail.requirement && requirementDetail.requirement.name) : "";

    const requirement = requirementDetail.requirement || {};
    const fixversionid = requirement.fixversionid || undefined;
    const moduleid = requirement.moduleid || undefined;

    getConfigList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取拆分配置失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      let data = [];
      res.result.map((item) => {
        data.push({
          id: uuid(),
          name: '【' + (item.productDismantleConfig.name || '') + '】' + requirementName,
          responseemail: item.responseUser.email || '',
          submitemail: item.requireUser.email || '',
          requireemail: item.verifyUser.email || '',
          level: taskLevelKeyMap.P1,
          fixversionid,
          moduleid,
        });
      });
      this.setState({ currentTask: data });
    }).catch((err) => {
      return message.error('获取拆分配置异常', err || err.msg);
    });
  }

  handleSave = () => {
    const { currentTask } = this.state;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      if (currentTask && currentTask.length) {
        this.props.handleAdd(currentTask, this.props.record);
        this.setState({ visible: false, currentTask: [], selectId: 0 });
      } else {
        message.warn('请先添加任务！');
      }
    });
  }

  getButtons = () => {
    const { type } = this.props;
    if (type === 'requirementDetail') {
      return (<Button type="dashed" className="u-mgr10" onClick={() => { this.setState({ visible: true }); this.getDismantleData() }}>批量创建任务</Button>);
    } else {
      return <a onClick={() => { this.setState({ visible: true }); this.getDismantleData() }}>批量创建任务</a>;
    }
  }

  handleAdd = () => {
    const { requirementDetail } = this.props;
    const { currentTask } = this.state;
    const requirement = requirementDetail.requirement || {};
    const fixversionid = requirement.fixversionid || undefined;
    const moduleid = requirement.moduleid || undefined;
    const newArr = deepCopy(currentTask, []);

    newArr.push({
      id: uuid(),
      name: '',
      responseemail: '',
      submitemail: '',
      requireemail: '',
      level: taskLevelKeyMap.P1,
      fixversionid,
      moduleid,
    });
    this.setState({ currentTask: newArr });
  }

  handleDelete = (it) => {
    const { currentTask } = this.state;
    this.setState({ currentTask: currentTask.filter(item => item.id !== it.id) });
    message.success('删除成功！');
  }

  setCurrentTask = (id, value, type) => {
    const { currentTask } = this.state;
    const newArr = deepCopy(currentTask, []);
    newArr.forEach(it => {
      if (it.id === id) {
        it[type] = value;
      }
    });
    this.setState({ currentTask: newArr });
  }

  getContent = (it, index) => {
    const { form: { getFieldDecorator }, requirementDetail } = this.props;
    const { userList, moduleList, versionList } = this.state;
    const requirement = requirementDetail.requirement || {};
    const subproduct = requirementDetail.subproduct || {};
    const moduleid = moduleList.some(it => it.productModule && it.productModule.id === requirement.moduleid) ? requirement.moduleid : undefined;
    const fixversionid = versionList.some(it => it.version && it.version.id === requirement.fixversionid) ? requirement.fixversionid : undefined;

    return (
      <div
        className={`u-mgt20 ${styles.createTask}`}>
        <div className='f-jcsb-aic'>
          <span
            className={`f-jcc-aic ${styles.number}`}>
            {index + 1}
          </span>
          <MyIcon type="icon-shanchuchengyuan" className="u-mgr5" onClick={() => this.handleDelete(it)} />
        </div>
        <Row className='u-mgt15'>
          <FormItem label='标题' {...bigFormLayout}>
            {getFieldDecorator(`name-${it.id}`, {
              rules: [{ required: true, message: '请输入标题！' }],
              initialValue: it.name,
            })(
              <Input onChange={(e) => this.setCurrentTask(it.id, e.target.value, 'name')} />
            )}
          </FormItem>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="负责人" {...formLayout}>
              {getFieldDecorator(`responseemail-${it.id}`, {
                rules: [{ required: true, message: '请选择负责人！' }],
                initialValue: it.responseemail,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="负责人"
                  optionFilterProp="children"
                  onSearch={(responseValue) => handleSearchUser(responseValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onChange={(value) => this.setCurrentTask(it.id, value, 'responseemail')}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="验证人" {...formLayout}>
              {getFieldDecorator(`requireemail-${it.id}`, {
                rules: [{ required: true, message: '请选择验证人！' }],
                initialValue: it.requireemail,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="验证人"
                  optionFilterProp="children"
                  onSearch={(requireValue) => handleSearchUser(requireValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onChange={(value) => this.setCurrentTask(it.id, value, 'requireemail')}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="报告人" {...formLayout}>
              {getFieldDecorator(`submitemail-${it.id}`, {
                rules: [{ required: true, message: '请选择报告人！' }],
                initialValue: it.submitemail,
              })(
                <Select
                  allowClear={true}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="报告人"
                  optionFilterProp="children"
                  onSearch={(submitValue) => handleSearchUser(submitValue, (result) => {
                    this.setState({ userList: result });
                  })}
                  onChange={(value) => this.setCurrentTask(it.id, value, 'submitemail')}
                >
                  {
                    userList && userList.length && userList.map(it => (
                      <Option key={it.id} value={it.email}>{it.realname} {it.email}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="优先级" {...formLayout}>
              {getFieldDecorator(`level-${it.id}`, {
                rules: [{ required: true, message: '请选择优先级！' }],
                initialValue: taskLevelKeyMap.P1,
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder="优先级"
                  onChange={(value) => this.setCurrentTask(it.id, value, 'level')}
                >
                  {
                    levelMap.map(it => (
                      <Option key={it.id} value={it.id}>{it.name}</Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label="模块" {...formLayout}>
              {getFieldDecorator(`moduleid-${it.id}`, {
                initialValue: moduleid,
              })(
                <Select
                  style={{ width: '100%' }}
                  placeholder='请选择模块'
                  allowClear
                  onChange={(value) => this.setCurrentTask(it.id, value, 'moduleid')}
                >
                  {moduleList && moduleList.map(item =>
                    <Option key={item.productModule.id} value={item.productModule.id}>{item.productModule.name}</Option>
                  )}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label="解决版本" {...formLayout}>
              {getFieldDecorator(`fixversionid-${it.id}`, {
                initialValue: fixversionid,
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="输入名称搜索版本"
                  filterOption={false}
                  allowClear={true}
                  onSearch={(value) => handleSearchVersion(value, subproduct.id, EXCLUDE_PUBLISH, (versionList) => {
                    this.setState({ versionList });
                  })}
                  onChange={(value) => this.setCurrentTask(it.id, value, 'fixversionid')}
                  notFoundContent={'暂无数据'}
                >
                  {
                    versionList && versionList.map(item => (
                      <Option key={item.version.id} value={item.version.id} data={item}>
                        <span>{item.version.name}</span>
                      </Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { visible, plannings, selectId, currentTask } = this.state;

    return (
      <span>
        {this.getButtons()}
        <Modal
          title="批量创建任务"
          visible={visible}
          width={800}
          onOk={() => this.handleSave()}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          destroyOnClose
        >
          <div className="f-aic">
            <span>拆单方案：</span>
            <Select
              value={selectId}
              style={{ width: 300 }}
              onChange={(value) => this.setState({ selectId: value }, () => this.getConfigList(value))}>
              {
                plannings.map(it => <Option key={it.id} value={it.id}>{it.name}</Option>)
              }
            </Select>
          </div>
          <div className='f-jcsb-aic u-mgt20'>
            <Button icon={<PlusOutlined />} type='dashed' onClick={() => this.handleAdd()}>添加任务</Button>
            {
              !!currentTask.length && <a onClick={() => this.setState({ currentTask: [], selectId: 0 })}>清空</a>
            }

          </div>

          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {
              currentTask.map((it, index) => (
                this.getContent(it, index)
              ))
            }
          </div>
        </Modal>
      </span>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(BatchCreateTask));
