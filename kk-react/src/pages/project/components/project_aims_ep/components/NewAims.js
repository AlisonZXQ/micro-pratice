import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, DatePicker, Input, message } from 'antd';
import moment from 'moment';
import { getFormLayout, equalsObj, getSystemDescription, getSystemDescriptionEditValue } from '@utils/helper';
import { queryUser, getObjectiveCustomEP } from '@services/project';
import { getAllSubProductList } from '@services/product';
import TinyMCE from '@components/TinyMCE';
import CustomField from '@pages/receipt/components/customfiled_list'; // 目标下的自定义字段
import MyIcon from '@components/MyIcon';
import { aimType } from '@shared/ProjectConfig';
import { LEVER_MAP, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 17);
const Option = Select.Option;

class NewAims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assigneeList: [],
      verifierList: [],
      customFileds: [],
      subProductList: [],
    };
  }

  componentDidMount() {
    const { aimData, form: { setFieldsValue } } = this.props;
    if (aimData && Object.keys(aimData).length) {
      this.getDefaultData(aimData);
      setFieldsValue({
        productid: aimData.objective.productid,
        subProductId: aimData.objective.subProductId,
      });
      this.getAllSubProductList(aimData.objective.productid);
      this.getObjectiveCustomEP(aimData.objective.productid);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { form: { setFieldsValue } } = this.props;

    // 当编辑数据有了以后初始化人员
    if (!equalsObj(this.props.aimData, nextProps.aimData)) {
      setFieldsValue({
        productid: nextProps.aimData.objective.productid,
        subProductId: nextProps.aimData.objective.subProductId,
      });
      this.getDefaultData(nextProps.aimData);
      this.getAllSubProductList(nextProps.aimData.objective.productid);
      this.getObjectiveCustomEP(nextProps.aimData.objective.productid);
    }
  }

  getDefaultData = (aimData) => {
    if (aimData && aimData.responseUser) {
      this.setState({ assigneeList: [aimData.responseUser] });
    }
    if (aimData && aimData.requireUser) {
      this.setState({ verifierList: [aimData.requireUser] });
    }
  }

  handleSelectProduct = (value) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ subProductId: '' });

    this.getAllSubProductList(value);
    this.getObjectiveCustomEP(value);
  }

  getObjectiveCustomEP = (value) => {
    getObjectiveCustomEP({ productid: value }).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ customFileds: res.result });
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
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

  handleSearch = (value, type) => {
    const params = {
      value,
      limit: 20,
      offset: 0,
    };
    if (value.length) {
      queryUser(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          if (type === 'assignee') {
            this.setState({ assigneeList: res.result });
          } else if (type === 'verifier') {
            this.setState({ verifierList: res.result });
          } else {
            this.setState({ reporterList: res.result });
          }
        }
      }).catch((err) => {
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  getEditCustomeFields = () => {
    const { aimData } = this.props;
    const customFileds = aimData ? aimData.objectiveCustomFieldRelationInfoList : [];
    const arr = [];
    customFileds.forEach(it => {
      arr.push({
        ...it.productCustomField,
        customfieldvalueid: it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customfieldvalueid,
        customvalue: it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customvalue,
      });
    });

    return arr;
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, aimData, productByUser } = this.props;
    const { assigneeList, verifierList, customFileds, subProductList } = this.state;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const basicInfo = aimData.objective || {};
    const valueList = aimData.objectiveCustomFieldRelationInfoList || [];
    const valueMap = aimData.customFieldValueidMap || {};

    return (<Form className="u-form">
      <FormItem label="标题" {...formLayout}>
        {getFieldDecorator('name', {
          initialValue: basicInfo && basicInfo.name,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Input placeholder="请输入标题，不超过50个字" maxLength={50} />
        )}
      </FormItem>

      <FormItem label="归属产品" {...formLayout}>
        {getFieldDecorator('productid', {
          initialValue: basicInfo.productid,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请选择，若无产品请先创建或添加"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onChange={(value, data) => this.handleSelectProduct(value)}
          >
            {
              productByUser && productByUser.map(it => (
                <Option key={it.id} value={it.id}>{it.name}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="归属子产品" {...formLayout}>
        {getFieldDecorator('subProductId', {
          initialValue: basicInfo.subProductId,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请选择"
            optionFilterProp="children"
            style={{ width: '100%' }}
          >
            {
              enableSubProductList && enableSubProductList.map(it => (
                <Option key={it.id} value={it.id}>{it.subProductName}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="优先级" {...formLayout}>
        {getFieldDecorator('level', {
          initialValue: basicInfo && basicInfo.level && Number(basicInfo.level),
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select style={{ width: '100%' }} placeholder="请选择">
            <Option key={LEVER_MAP.P0} value={LEVER_MAP.P0}>P0</Option>
            <Option key={LEVER_MAP.P1} value={LEVER_MAP.P1}>P1</Option>
            <Option key={LEVER_MAP.P2} value={LEVER_MAP.P2}>P2</Option>
          </Select>
        )}
      </FormItem>

      <FormItem label="目标类型" {...formLayout}>
        {getFieldDecorator('type', {
          initialValue: basicInfo && basicInfo.type,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select style={{ width: '100%' }} placeholder="请选择">
            {
              Object.keys(aimType).map(it => (
                <Option key={it} value={Number(it)}>{aimType[it]}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="到期日" {...formLayout}>
        {getFieldDecorator('expect_releasetime', {
          initialValue: (basicInfo && basicInfo.expect_releasetime) ? moment(basicInfo.expect_releasetime) : undefined,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <DatePicker style={{ width: '100%' }} suffixIcon={<MyIcon type='icon-riqi' />} />
        )}
      </FormItem>

      <FormItem label="负责人" {...formLayout}>
        {getFieldDecorator('responseemail', {
          initialValue: aimData && aimData.responseUser && aimData.responseUser.email,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请输入"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onSearch={(value) => this.handleSearch(value, 'assignee')}
            showArrow={false}
          >
            {
              assigneeList && assigneeList.map(it => (
                <Option key={it.email} value={it.email}>{it.realname || it.name} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="验收人" {...formLayout}>
        {getFieldDecorator('requireemail', {
          initialValue: aimData && aimData.requireUser && aimData.requireUser.email,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请输入"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onSearch={(value) => this.handleSearch(value, 'verifier')}
            showArrow={false}
          >
            {
              verifierList && verifierList.map(it => (
                <Option key={it.email} value={it.email}>{it.realname || it.name} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem label="验收标准" {...formLayout}>
        {getFieldDecorator('description', {
          initialValue: basicInfo ? basicInfo.description : '',
          rules: [
            { required: true, message: '此项不能为空' },
            { validator: (rule, value, callback) => { value && value.trim() && value.trim().length ? callback() : callback('验收标准不能为空！') } }
          ]
        })(
          <TinyMCE height={200} />
        )}
      </FormItem>

      {
        !!Object.keys(getSystemDescription(customFileds)).length &&
        <FormItem label="描述" {...formLayout}>
          {getFieldDecorator(`custom-${getSystemDescription(customFileds).id}-${getSystemDescription(customFileds).type}`, {
            initialValue: basicInfo ? getSystemDescriptionEditValue(valueList) : (getSystemDescription(customFileds).defaultValue || ''),
          })(
            <TinyMCE height={200} />
          )}
        </FormItem>
      }

      {
        !!getFieldValue('productid') &&
        <CustomField
          customFileds={customFileds.filter(it => !(it.system === CUSTOME_SYSTEM.SYSTEM && it.name === '描述'))}
          valueList={valueList}
          valueMap={valueMap}
          form={this.props.form}
          projectAim
          type="objective"
          create={!(aimData && Object.keys(aimData).length)}
        />
      }
    </Form>
    );
  }
}

export default NewAims;
