import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, message, Divider } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import uuid from 'uuid';
import ExistAims from './components/ExistAims';
import NewAims from './components/NewAims';

const isZero = (text) => {
  return text ? text : 0;
};

const isEmpty = (text) => {
  return text ? text : '';
};

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: '',
      aimData: {},
    };
  }

  componentDidMount() {
  }

  getCustomfieldvalueid = (id, value) => {
    const { customSelect } = this.props;
    const arr = customSelect[id] || [];
    const obj = arr.find(it => it.id === value) || {};
    return obj.customvalue;
  }

  getTextRelationId = (valueList, customfieldid) => {
    if (!valueList || !valueList.length) {
      return 0;
    } else {
      const obj = valueList.find(it => it.productCustomField && it.productCustomField.id === customfieldid) || {};
      const relationObj = obj.objectiveCustomFieldRelation || {};
      return isZero(relationObj.id);
    }
  }

  getUnit = (customFileds, customfieldid) => {
    if (!customFileds || !customFileds.length) {
      return '';
    } else {
      const obj = customFileds.find(it => it.id === customfieldid) || {};
      const list = obj.productCustomFieldValueVOList || [];
      return list[0] ? list[0].customlabel : '';
    }
  }

  getSelectRelationId = (valueList, customfieldvalueid) => {
    if (!valueList || !valueList.length || !customfieldvalueid) {
      return 0;
    } else {
      const obj = valueList.find(it => it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customfieldvalueid === customfieldvalueid) || {};
      const relationObj = obj.objectiveCustomFieldRelation || {};
      return isZero(relationObj.id);
    }
  }

  getCustomList = (values, valueList) => {
    const { customFileds } = this.props;

    const arr = [];
    customFileds.forEach(it => {
      if ([1, 2, 3, 6].some(i => i === it.type)) {
        arr.push({
          productCustomField: it,
          objectiveCustomFieldRelation: {
            id: [1, 2, 3, 6].some(i => i === it.type) ? this.getTextRelationId(valueList, it.id) : this.getSelectRelationId(valueList, values[`custom-${it.id}-${it.type}`]),
            customfieldvalueid: isZero([1, 2, 3, 6].some(i => i === it.type) ? 0 : values[`custom-${it.id}-${it.type}`]),
            customvalue: isEmpty([1, 2, 3, 6, 8].some(i => i === it.type) ? values[`custom-${it.id}-${it.type}`] : this.getCustomfieldvalueid(it.id, values[`custom-${it.id}-${it.type}`])),
          },
        });
      } else if ([9, 10].some(i => i === it.type)) {
        arr.push({
          productCustomField: it,
          objectiveCustomFieldRelation: {
            id: [9, 10].some(i => i === it.type) ? this.getTextRelationId(valueList, it.id) : this.getSelectRelationId(valueList, values[`custom-${it.id}-${it.type}`]),
            customfieldvalueid: isZero([9, 10].some(i => i === it.type) ? 0 : values[`custom-${it.id}-${it.type}`]),
            customvalue: isEmpty([9, 10].some(i => i === it.type) ? values[`custom-${it.id}-${it.type}`] : this.getCustomfieldvalueid(it.id, values[`custom-${it.id}-${it.type}`])),
          },
          unit: this.getUnit(customFileds, it.id), // 数字单位
        });
      } else if (it.type === 8) {
        arr.push({
          productCustomField: it,
          objectiveCustomFieldRelation: {
            id: this.getTextRelationId(valueList, it.id),
            customfieldvalueid: 0,
            customvalue: values[`custom-${it.id}-${it.type}`] ? moment(values[`custom-${it.id}-${it.type}`]).format('YYYY-MM-DD') : '',
          },
        });
      } else { // 级联或者多选
        const value = values[`custom-${it.id}-${it.type}`] || [];

        value && value.forEach(item => {
          arr.push({
            productCustomField: it,
            objectiveCustomFieldRelation: {
              id: this.getSelectRelationId(valueList, item),
              customfieldvalueid: isZero(item),
              customvalue: isEmpty(this.getCustomfieldvalueid(it.id, item)),
            }
          });
        });
      }
    });
    return arr;
  }

  getMap = (values) => {
    const { customFileds, customSelect } = this.props;
    const obj = {};
    customFileds.forEach(it => {
      if (it.type === 2) {
        const findObj = customSelect[it.id] && customSelect[it.id].find(item => item.id === values[`custom-${it.id}-${it.type}`]);
        if (findObj) {
          obj[values[`custom-${it.id}-${it.type}`]] = findObj;
        }
      } else if (it.type === 4 || it.type === 5) {
        const value = values[`custom-${it.id}-${it.type}`] || [];
        value.forEach(i => {
          const findObj = customSelect[it.id].find(item => item.id === i);
          if (findObj) {
            obj[i] = findObj;
          }
        });
      }
    });
    return obj;
  }

  // 变更申请页的目标暂存在前端中
  handleChangeOk = () => {
    const { type, aimData } = this.state;
    const valueList = aimData.objectiveCustomFieldRelationInfoList || [];

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let params = {};
      if (type === 'exist' && !!values.exist) {
        // 这里需要保存全集的数据
        // 也需要统一的格式
        params = {
          ...values.exist,
          id: values.exist.id,
          // issueId: values.exist.issueId,
          issueKey: values.exist.issueKey,
          objectiveId: values.exist.objectiveId,
          objectiveStatus: values.exist && values.exist.objectiveStatus,
        };
        this.props.updateProjectAims(params);
      }
      if (type === 'new') {
        const uid = uuid();
        const params = {
          ...values,
          issueType: 'Epic',
          dueDate: values.dueDate ? moment(values.dueDate).format('YYYY-MM-DD') : '',
          issueKey: `ZXQHAPPY-${uid}`,
          // issueId: `ZXQHAPPY-${uid}`,
          objectiveId: `ZXQHAPPY-${uid}`,
          objectiveCustomFieldRelationInfoList: this.getCustomList(values),
          customFieldValueidMap: this.getMap(values),
          objectiveStatus: 1,
        };
        this.props.updateProjectAims(params);
      }

      if (type === 'update') {
        const params = {
          ...values,
          issueType: 'Epic',
          dueDate: values.dueDate && moment(values.dueDate).format('YYYY-MM-DD'),
          issueKey: aimData && aimData.issueKey,
          // issueId: aimData && aimData.issueId,
          objectiveId: aimData && aimData.objectiveId,
          objectiveStatus: aimData && aimData.objectiveStatus,
          objectiveCustomFieldRelationInfoList: this.getCustomList(values, valueList),
          customFieldValueidMap: this.getMap(values),
        };
        this.props.updateProjectAims(params);
      }
      this.setState({ visible: false });
    });
  }

  // 直接取的目标的record
  handleUpdateMsg = () => {
    const { changeData } = this.props;
    const objectiveStatus = changeData.objectiveStatus;

    // 发起变更时目标的不可编辑状态限制为验收/已验收/取消
    if (objectiveStatus && [5, 12, 13].some(it => it === objectiveStatus)) {
      return message.warn('待验收/已验收/取消状态下的目标不可编辑！');
    }

    // 预设自定义字段的值，与第一次创建时刻的自定义字段保持一致
    // const arr = [];
    // changeData.objectiveCustomFieldRelationInfoList &&
    //   changeData.objectiveCustomFieldRelationInfoList.forEach(it => {
    //     arr.push({
    //       ...it.productCustomField
    //     });
    //   });

    // this.props.dispatch({ type: 'aimEP/saveObjectiveCustomEP', payload: arr });

    this.setState({
      type: 'update',
      visible: true,
      aimData: changeData || {}
    });
  }

  render() {
    const { visible, type, aimData } = this.state;

    // changeData标识是否是变更中编辑
    const { form, issueKey, updateProjectAims } = this.props;

    return (<span>
      <Modal
        maskClosable={false}
        title={type === 'exist' ? '添加已有目标' : type === 'update' ? '更新项目目标' : '创建项目目标'}
        visible={visible}
        width={800}
        onOk={() => this.handleChangeOk(updateProjectAims)}
        onCancel={() => this.setState({ visible: false })}
        destroyOnClose
      >
        {type === 'exist' ?
          <ExistAims form={form} {...this.props} /> :
          <NewAims form={form} {...this.props} aimData={aimData} />}
      </Modal>
      {
        issueKey ?
          <span>
            <a onClick={() => this.handleUpdateMsg()}>编辑</a>
          </span>
          :
          <span>
            <a onClick={() => this.setState({ type: 'new', visible: true })}>新建目标</a>
            <Divider type="vertical" />
            <a onClick={() => this.setState({ type: 'exist', visible: true })}>添加已有目标</a>
          </span>
      }
    </span>);
  }
}
const mapStateToProps = (state) => {
  return {
    productList: state.createProject.productList, // 都需要与关联产品绑定
    productByUser: state.product.productList,
    customSelect: state.aimEP.customSelect,
    customFileds: state.aimEP.customFileds,
  };
};

export default connect(mapStateToProps)(Form.create()(index));

