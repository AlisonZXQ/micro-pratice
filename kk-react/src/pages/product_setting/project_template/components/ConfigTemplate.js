import React, { Component } from 'react';
import { getFormLayout } from '@utils/helper';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Row, Col, Button, Input, Popconfirm, message } from 'antd';
import uuid from 'uuid';
import { equalsObj } from '@utils/helper';
import { workFlowList } from '@services/approvalflow';
import { getFlowRule } from '@services/product_setting';
import { flowMap, PROJECT_CUSTOM_TYPE, PROJECT_CUSTOM_REQUIRED } from '@shared/ProductSettingConfig';
import styles from '../index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(2, 22);
const { Option } = Select;

class ConfigTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectSelect: [],
      resultSelect: [],
      flowList: [],
      initFlowData: [],
    };
  }

  componentDidMount() {
    this.getWorkFlowList();
    this.getFlowRule();
    const { checkedItems } = this.props;
    if (checkedItems.length > 0) {
      this.setInitData(checkedItems);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.checkedItems, nextProps.checkedItems)) {
      this.setInitData(nextProps.checkedItems);
    }
  }

  setInitData = (data) => {
    let projectData = [];
    let resultData = [];
    data && data.map((item) => {
      if (item.projectTcRelation.type === 1) {
        projectData.push(item.projectTemplateCustomField);
      } else {
        resultData.push(item.projectTemplateCustomField);
      }
    });
    this.setState({
      projectSelect: projectData,
      resultSelect: resultData,
    });
    this.props.getConfigBaseData(projectData, 'project');
    this.props.getConfigBaseData(resultData, 'result');
  }

  getWorkFlowList = () => {
    const params = {
      productId: this.props.productid,
    };
    workFlowList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询审批流列表失败, ${res.msg}`);
      }
      this.setState({ flowList: res.result });
    }).catch((err) => {
      return message.error(`查询审批流列表异常, ${err || err.message}`);
    });
  }

  getFlowRule = () => {
    const params = {
      id: this.props.itemData.id,
    };
    getFlowRule(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`获取审批流默认值失败, ${res.msg}`);
      }
      this.setState({ initFlowData: res.result });
    }).catch((err) => {
      return message.error(`获取审批流默认值异常, ${err || err.message}`);
    });
  }

  addProject = () => {
    const arr = this.state.projectSelect;
    arr.unshift({ id: uuid() });
    this.setState({ projectSelect: arr });
  }

  addResult = () => {
    const arr = this.state.resultSelect;
    arr.unshift({ id: uuid() });
    this.setState({ resultSelect: arr });
  }

  handleChange = (value, id, type) => {
    const { projectSelect, resultSelect } = this.state;
    const { data } = this.props;
    const item = data.find((it) => it.id === value);

    let newData = [];

    if (type === 'project' && !projectSelect.find((it) => it.id === value)) {
      projectSelect && projectSelect.map((it) => {
        if (it.id === id) {
          newData.push(item);
        } else {
          newData.push(it);
        }
      });
      this.setState({ projectSelect: newData });
      this.props.getConfigBaseData(newData, type);
    } else if (type === 'result' && !resultSelect.find((it) => it.id === value)) {
      resultSelect && resultSelect.map(it => {
        if (it.id === id) {
          newData.push(item);
        } else {
          newData.push(it);
        }
      });
      this.setState({ resultSelect: newData });
      this.props.getConfigBaseData(newData, type);
    } else {
      return message.warning('请勿重复添加！');
    }
  }

  handleDelete = (item, type) => {
    const { projectSelect, resultSelect } = this.state;
    if (type === 'project') {
      const newData = projectSelect.filter((it) => it.id !== item.id);
      this.setState({ projectSelect: newData });
      this.props.getConfigBaseData(newData, type);
    } else {
      const newData = resultSelect.filter((it) => it.id !== item.id);
      this.setState({ resultSelect: newData });
      this.props.getConfigBaseData(newData, type);
    }
  }

  selectItem = (item, data, type) => {
    const { projectSelect, resultSelect } = this.state;
    let projectData = data;
    let resultData = data;
    if (type === 'project') {
      projectSelect && projectSelect.map((item) => {
        projectData = projectData.filter((it) => it.id !== item.id);
      });
    } else if (type === 'result') {
      resultSelect && resultSelect.map((item) => {
        resultData = resultData.filter((it) => it.id !== item.id);
      });
    }

    if (!item.type) {
      return <span>
        <span className='f-ib' style={{ width: '24.4%' }}></span>
        <Select
          placeholder='请选择'
          style={{ width: '75%' }}
          onChange={(value) => this.handleChange(value, item.id, type)}
          className='u-mgb20'>
          {type === 'project' ?
            projectData && projectData.map((it) => (
              <Option value={it.id} key={it.id}>{it.name}</Option>
            )) :
            resultData && resultData.map((it) => (
              <Option value={it.id} key={it.id}>{it.name}</Option>
            ))
          }
        </Select>
      </span>;
    } else if (item.type === PROJECT_CUSTOM_TYPE.TEXT) {
      return <Row>
        <Col span={20} className='u-mgb20'>

          <Col span={7} className='f-tar' style={{ lineHeight: '32px' }}>
            <span className='needIcon'>{item.required === PROJECT_CUSTOM_REQUIRED.REQUIRED && '*'}</span>
            <span>{item.name}：</span>
          </Col>
          <Col span={17}>
            <Input placeholder='请输入' style={{ width: '100%' }} value='' />
          </Col>
        </Col>
        <Col span={4}>
          <a
            onClick={() => this.handleDelete(item, type)}
            style={{ lineHeight: '32px', paddingLeft: '16px' }}>删除</a>
        </Col>
      </Row>;
    } else {
      return <Row>
        <Col span={20} className='u-mgb20'>

          <Col span={7} className='f-tar' style={{ lineHeight: '32px' }}>
            <span className='needIcon'>{item.required === PROJECT_CUSTOM_REQUIRED.REQUIRED && '*'}</span>
            <span>{item.name}：</span>
          </Col>
          <Col span={17}>
            <Select placeholder='请选择' style={{ width: '100%' }} value={undefined}>
              <Option value={1} key={1}></Option>
            </Select>
          </Col>
        </Col>
        <Col span={4}>
          <a
            onClick={() => this.handleDelete(item, type)}
            style={{ lineHeight: '32px', paddingLeft: '16px' }}>删除</a>
        </Col>
      </Row>;
    }
  }

  clearOption = (type) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ [type]: undefined });
  }

  getInitValue = (type, list) => {
    const { initFlowData } = this.state;

    if (initFlowData && initFlowData.length > 0) {
      const initItem = initFlowData && initFlowData.find((it) => it.workflowType === type);
      const isFind = list && list.find(it => it.id === (initItem && initItem.workflowId));
      return isFind ? (initItem && initItem.workflowId) || undefined : undefined;
    } else {
      return undefined;
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, data } = this.props;

    const { projectSelect, resultSelect, flowList } = this.state;
    return (
      <span>
        <div>
          <div className={styles.configTitle}>基本信息</div>
          <Row gutter={16}>
            <Col span={12}>
              <span className='f-ib f-tar' style={{ width: '24.4%' }}>创建/编辑项目：</span>
              <Button
                type='dashed'
                style={{ width: '75%', marginBottom: '12px' }}
                onClick={() => this.addProject()}
                icon={<PlusOutlined />}>
                添加
              </Button>
              {projectSelect && projectSelect.map((item) => (
                this.selectItem(item, data, 'project')
              ))}
            </Col>

            <Col span={12}>
              <span className='f-ib f-tar' style={{ width: '24.4%' }}>结项：</span>
              <Button
                type='dashed'
                style={{ width: '75%', marginBottom: '12px' }}
                onClick={() => this.addResult()}
                icon={<PlusOutlined />}>
                添加
              </Button>

              {resultSelect && resultSelect.map((item) => (
                this.selectItem(item, data, 'result')
              ))}
            </Col>
          </Row>
        </div>

        <div>
          <div className={`${styles.configTitle} u-mgt10 `}>审批流规则</div>
          {flowMap.map((item) => (
            <Row>
              <Col span={22}>
                <FormItem label={item.name} {...formLayout}>
                  {getFieldDecorator(`flow-${item.type}`, {
                    initialValue: this.getInitValue(item.type, flowList),
                  })(
                    <Select
                      placeholder='请选择'
                      style={{ width: '100%' }}>
                      {flowList && flowList.filter((it) => it.workflowType === item.type).map((item) => (
                        <Option value={item.id}>{item.workflowName}</Option>
                      ))}

                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={2} style={{ lineHeight: '32px', paddingLeft: '16px' }}>
                {getFieldValue(`flow-${item.type}`) && <Popconfirm
                  title={<div>
                    <div>清空后所有的操作将实时生效，</div>
                    <span>存在一定风险，确认继续？</span>
                  </div>}
                  onConfirm={() => this.clearOption(`flow-${item.type}`)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>清空选项</a>
                </Popconfirm>}
              </Col>
            </Row>
          ))}
        </div>
      </span>
    );
  }
}

export default ConfigTemplate;
