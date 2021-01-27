import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Button, Row, Col, Divider, Select, Modal, Input } from 'antd';
import { getCascaderField, addCategoryValue, deleteCategoryValue, updateCategoryValue } from '@services/system_manage';
import { queryTemplateSelect, getCategoryList } from '@services/project';
import { getFormLayout, deepCopy } from '@utils/helper';
import { deleteModal } from '@shared/CommonFun';
import styles from '../index.less';

const Option = Select.Option;
const FormItem = Form.Item;
const fromLayout = getFormLayout(6, 14);

class index extends Component {
  state = {
    cascaderData: {},
    selectList: [],
    currentId: '',
    displayObj: {},
    currentParent: 0,
    visible: false,
    record: {},
    type: '',
  }

  componentDidMount() {
    const { id } = this.props;
    if (id) {
      this.getCascaderField(id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this.getCascaderField(nextProps.id);
    }
  }

  getCascaderField = (id) => {
    const params = {
      id: id || this.props.id,
    };
    getCascaderField(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ cascaderData: res.result || {} });
      this.queryTemplateSelect(res.result.projectTemplateCustomField.id);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  queryTemplateSelect = (id) => {
    queryTemplateSelect(id).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ selectList: res.result || [] });
      if (res.result[0]) {
        this.setState({ currentId: res.result[0].id }, () => this.getCategoryList());
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleChange = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ name: '' });
    this.setState({ currentId: value, currentParent: '' }, () => this.getCategoryList());
  }

  getCategoryList = () => {
    const { form: { setFieldsValue } } = this.props;
    const { cascaderData, currentId, currentParent } = this.state;
    const cascadeField = cascaderData.cascadeField || {};

    const params = {
      cascadefieldid: cascadeField.id,
      customfieldvalueid: currentId,
    };
    getCategoryList(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ displayObj: res.result || [] });
      let levelone = res.result.levelone || [];
      if (levelone.length && !currentParent) {
        this.setState({ currentParent: levelone[0].id });
        setFieldsValue({ parentid: levelone[0].id });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    const { record } = this.state;
    deleteModal({
      title: '',
      content: `您确认要删除级联值【${record.name}】吗`,
      okCallback: () => {
        deleteCategoryValue({ id: record.id }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除值成功！');
          this.getCategoryList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });

  }

  getParent = () => {
    const { displayObj, currentParent } = this.state;
    let levelone = displayObj.levelone || [];

    return levelone.map(it =>
      <div
        onClick={() => this.setState({ currentParent: it.id })}
        className={currentParent === it.id ? styles.common : styles.activeCommon}
      >
        <span>{it.name}</span>
        <span className="f-fr">
          <a onClick={() => this.setState({ visible: true, type: 'edit', record: it })}>编辑</a>
          <Divider type="vertical" />
          <a className="delColor" onClick={() => { this.setState({ record: it }, () => this.handleDelete()) }}>删除</a>
        </span>
      </div>);
  }

  getChild = () => {
    const { displayObj, currentParent } = this.state;
    const arr = displayObj[currentParent] || [];
    return arr.map(it =>
      <div className={styles.common}>
        <span>{it.name}</span>
        <span className="f-fr">
          <a onClick={() => this.setState({ visible: true, type: 'edit', record: it })}>编辑</a>
          <Divider type="vertical" />
          <a className="delColor" onClick={() => { this.setState({ record: it }, () => this.handleDelete()) }}>删除</a>
        </span>
      </div>);
  }

  handleAddParent = () => {
    const { form: { setFieldsValue } } = this.props;

    this.setState({ visible: true, type: 'create' }, () => {
      setFieldsValue({ parentid: 0 });
    });
  }

  handleAddChild = () => {
    const { form: { setFieldsValue } } = this.props;
    const { currentParent } = this.state;
    this.setState({ visible: true, type: 'create' }, () => {
      setFieldsValue({ parentid: currentParent });
    });
  }

  handleOk = () => {
    const { id } = this.props;
    const { currentId, type, record } = this.state;

    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (type === 'create') {
        const params = {
          cascadefieldid: id,
          customfieldvalueid: currentId,
          ...values,
        };
        addCategoryValue(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('添加字段成功！');
          this.getCategoryList();
          this.setState({ visible: false });
        }).catch(err => {
          return message.error(err || err.message);
        });
      } else {
        const params = {
          id: record.id,
          name: values.name,
        };
        updateCategoryValue(params).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('更新字段成功！');
          this.getCategoryList();
          this.setState({ visible: false });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  render() {
    const { callback, form: { getFieldDecorator } } = this.props;
    const { selectList, cascaderData, currentId, displayObj, visible, record, type } = this.state;
    const cascadeField = cascaderData.cascadeField || {};
    const projectTemplateCustomField = cascaderData.projectTemplateCustomField || {};
    let levelone = deepCopy(displayObj.levelone, []);
    levelone.unshift({
      id: 0,
      name: "根级联值",
    });

    return (<span className={styles.cascader}>

      <div className="u-mgb10 f-tar">
        <Button className="u-mgr10" onClick={() => callback()}>返回</Button>
        <Button type="primary" onClick={() => this.handleAddParent()}>创建级联值</Button>
      </div>
      <div className={styles.tip}>提示：当前关联字段：{cascadeField.fieldname}({cascadeField.required === 1 ? '必填' : '选填'})，
      此关联字段的值将会以【{cascadeField.type === 1 ? '项目' : '单据'}】自定义字段【{projectTemplateCustomField.name}】当前选中值而联动,目前联动值可最大配置两级，请按需要完成以下配置!</div>
      <Row>请选择联动的自定义字段值：
        <Select
          style={{ width: 300 }}
          value={currentId}
          onChange={(value) => this.handleChange(value)}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          {
            selectList && selectList.map(it =>
              <Option key={it.id} value={it.id}>
                {it.customlabel}
              </Option>)
          }
        </Select>
      </Row>

      <Row gutter={16} className="u-mgt10">
        <Col span={12}>
          <div className={styles.title}>一级</div>
          {this.getParent()}
          <Button type="dashed" onClick={() => this.handleAddParent()} className="u-mgt10">+ 添加级联值</Button>
        </Col>
        <Col span={12}>
          <div className={styles.title}>二级</div>
          {this.getChild()}
          <Button type="dashed" onClick={() => this.handleAddChild()} className="u-mgt10">+ 添加级联值</Button>
        </Col>
      </Row>

      <Modal
        title={type === 'create' ? "创建级联值" : '编辑级联值'}
        visible={visible}
        maskClosable={false}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.handleOk()}
        destroyOnClose
      >
        {
          type === 'edit' &&
          <>
            <FormItem label="当前级联值名称" {...fromLayout}>
              {
                getFieldDecorator('name', {
                  initialValue: record.name,
                  rules: [{ required: true, message: '此项必填！' }]
                })(<Input placeholder="级联值名称" />)
              }
            </FormItem>
          </>
        }
        {
          type === 'create' &&
          <>
            <FormItem label="上一级级联值" {...fromLayout}>
              {
                getFieldDecorator('parentid', {
                  rules: [{ required: true, message: '此项必填！' }]
                })(<Select className="f-fw">
                  {
                    levelone.map(it => <Option key={it.id} value={it.id}>
                      {it.name}
                    </Option>)
                  }
                </Select>)
              }
            </FormItem>
            <FormItem label="当前级联值名称" {...fromLayout}>
              {
                getFieldDecorator('name', {
                  rules: [{ required: true, message: '此项必填！' }]
                })(<Input placeholder="子级联值名称" />)
              }
            </FormItem>
          </>
        }

      </Modal>
    </span>);
  }
}


export default Form.create()(index);
