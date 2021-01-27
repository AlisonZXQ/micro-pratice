import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, DatePicker, Input, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { getFormLayout, equalsObj } from '@utils/helper';
import { queryUser, getObjectiveCustomEP } from '@services/project';
import { getAllSubProductList } from '@services/product';
import { aimType } from '@shared/ProjectConfig';
import TinyMCE from '@components/TinyMCE';
import MyIcon from '@components/MyIcon';
import CustomField from '@pages/receipt/components/customfiled_list'; // 目标下的自定义字段

const FormItem = Form.Item;
const formLayout = getFormLayout(5, 18);
const Option = Select.Option;
const { TextArea } = Input;

class NewAims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assigneeList: [],
      verifierList: [],
      subProductList: [],
      customFileds: [],
    };
  }

  componentDidMount() {
    const { aimData } = this.props;
    if (aimData && Object.keys(aimData).length) {
      this.getDefaultData(aimData);
      this.getAllSubProductList(aimData.productId);
      this.getObjectiveCustomEP(aimData.productId);
    }
  }

  componentWillReceiveProps(nextProps) {
    // 当编辑数据有了以后初始化人员
    if (!equalsObj(this.props.aimData, nextProps.aimData)) {
      this.getDefaultData(nextProps.aimData);
      this.getAllSubProductList(nextProps.aimData.productId);
      this.getObjectiveCustomEP(nextProps.aimData.productId);
    }
  }

  getObjectiveCustomEP = (value) => {
    getObjectiveCustomEP({ productid: value }).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        this.setState({ customFileds: res.result });
        this.props.dispatch({ type: 'aimEP/saveObjectiveCustomEP', payload: res.result });
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getDefaultData = (aimData) => {
    if (aimData && aimData.assigneeUser) {
      this.setState({ assigneeList: [aimData.assigneeUser] });
    }
    if (aimData && aimData.verifierUser) {
      this.setState({ verifierList: [aimData.verifierUser] });
    }
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

  handleSelectProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      product: data.props.data,
      subProductId: '',
    });
    this.props.dispatch({ type: 'aimEP/getObjectiveCustomEP', payload: { productid: value } });
    this.getAllSubProductList(value);
    this.getObjectiveCustomEP(value);
  }

  handleSelectSubProduct = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({
      subProductVO: data.props.data
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

  handleSelectAssignee = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    const obj = {
      id: data.props.data.id,
      name: data.props.data.realname,
      email: data.props.data.email,
    };
    setFieldsValue({ assigneeUser: obj });
  }

  handleSelectVerifier = (value, data) => {
    const { form: { setFieldsValue } } = this.props;
    const obj = {
      id: data.props.data.id,
      name: data.props.data.realname,
      email: data.props.data.email,
    };
    setFieldsValue({ verifierUser: obj });
  }

  // getEditCustomeFields = () => {
  //   const { aimData } = this.props;
  //   const customFileds = aimData ? aimData.objectiveCustomFieldRelationInfoList : [];
  //   const arr = [];
  //   customFileds.forEach(it => {
  //     arr.push({
  //       ...it.productCustomField,
  //       customfieldvalueid: it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customfieldvalueid,
  //       customvalue: it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customvalue,
  //     });
  //   });

  //   return arr;
  // }

  getDes = () => {
    const { aimData } = this.props;
    const description = aimData && aimData.description ? aimData.description : '';

    // 这里的getFieldDecorator的默认值恢复有问题，所以这里的富文本都需要这样处理
    this.props.dispatch({ type: 'design/saveDes', payload: description });
    return description ? description : '';
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, aimData, productByUser } = this.props;
    const { assigneeList, verifierList, subProductList, customFileds } = this.state;
    const subProductVO = aimData.subProductVO || {};
    const valueList = aimData.objectiveCustomFieldRelationInfoList || [];
    const valueMap = aimData.customFieldValueidMap || {};

    return (<Form className="u-form">
      <FormItem label="标题" {...formLayout}>
        {getFieldDecorator('summary', {
          initialValue: aimData && aimData.summary,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Input placeholder="请输入标题，不超过50个字" maxLength={50} />
        )}
      </FormItem>

      <FormItem label="归属产品" {...formLayout}>
        {getFieldDecorator('productId', {
          initialValue: aimData && aimData.product && aimData.product.id,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请选择，若无产品请先创建或添加"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onChange={(value, data) => this.handleSelectProduct(value, data)}
          >
            {
              productByUser && productByUser.map(it => (
                <Option key={it.id} value={it.id} data={it}>{it.name}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem style={{ display: 'none' }}>
        {getFieldDecorator('product', {
          initialValue: aimData && aimData.product,
        })(
          <label />
        )}
      </FormItem>

      <FormItem label="归属子产品" {...formLayout}>
        {getFieldDecorator('subProductId', {
          initialValue: subProductVO.id,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="请选择子产品"
            optionFilterProp="children"
            onChange={(value, data) => this.handleSelectSubProduct(value, data)}
          >
            {subProductList && subProductList.map(it => (
              <Option key={it.id} value={it.id} data={it}>{it.subProductName}</Option>
            ))}
          </Select>
        )}
      </FormItem>

      <FormItem style={{ display: 'none' }}>
        {getFieldDecorator('subProductVO', {
          initialValue: aimData && aimData.subProductVO,
        })(
          <label />
        )}
      </FormItem>

      <FormItem label="目标类型" {...formLayout}>
        {getFieldDecorator('type', {
          initialValue: aimData && aimData.type,
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
        {getFieldDecorator('dueDate', {
          initialValue: (aimData && aimData.dueDate) ? moment(aimData.dueDate) : undefined,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <DatePicker style={{ width: '100%' }} suffixIcon={<MyIcon type='icon-riqi' />} />
        )}
      </FormItem>

      <FormItem label="优先级" {...formLayout}>
        {getFieldDecorator('priorityValue', {
          initialValue: aimData && aimData.priorityValue && Number(aimData.priorityValue),
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select style={{ width: '100%' }} placeholder="请选择">
            <Option key={1} value={1}>P0</Option>
            <Option key={2} value={2}>P1</Option>
            <Option key={3} value={3}>P2</Option>
          </Select>
        )}
      </FormItem>

      <FormItem label="负责人" {...formLayout}>
        {getFieldDecorator('assigneeId', {
          initialValue: aimData && aimData.assigneeUser && aimData.assigneeUser.id,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请选择"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onSearch={(value) => this.handleSearch(value, 'assignee')}
            onChange={(value, data) => this.handleSelectAssignee(value, data)}
          >
            {
              assigneeList && assigneeList.map(it => (
                <Option key={it.id} value={it.id} data={it}>{it.realname || it.name} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem style={{ display: 'none' }}>
        {getFieldDecorator('assigneeUser', {
          initialValue: aimData && aimData.assigneeUser,
        })(
          <label />
        )}
      </FormItem>

      <FormItem label="验收人" {...formLayout}>
        {getFieldDecorator('verifierId', {
          initialValue: aimData && aimData.verifierUser && aimData.verifierUser.id,
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <Select
            showSearch
            placeholder="请选择"
            optionFilterProp="children"
            style={{ width: '100%' }}
            onSearch={(value) => this.handleSearch(value, 'verifier')}
            onChange={(value, data) => this.handleSelectVerifier(value, data)} // select不适用于回填的情况
          >
            {
              verifierList && verifierList.map(it => (
                <Option key={it.id} value={it.id} data={it}>{it.realname || it.name} {it.email}</Option>
              ))
            }
          </Select>
        )}
      </FormItem>

      <FormItem style={{ display: 'none' }} >
        {getFieldDecorator('verifierUser', {
          initialValue: aimData && aimData.verifierUser,
        })(
          <label />
        )}
      </FormItem>

      <FormItem label="验收标准" {...formLayout}>
        {getFieldDecorator('description', {
          initialValue: this.getDes(),
          rules: [{ required: true, message: '此项不能为空' }]
        })(
          <TinyMCE height={200} />
        )}
      </FormItem>

      <FormItem label="描述" {...formLayout}>
        {getFieldDecorator('remark', {
          initialValue: aimData && aimData.remark,
        })(
          <TinyMCE height={200} />
        )}
      </FormItem>

      {
        getFieldValue('productId') &&
        // <CustomField
        //   customFileds={aimData && aimData.productId && aimData.productId === getFieldValue('productId')
        //     ? this.getEditCustomeFields() : customFileds}
        //   form={this.props.form}
        // />
        <CustomField
          customFileds={customFileds}
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

const mapStateToProps = (state) => {
  return {
    customFileds: state.aimEP.customFileds,
  };
};

export default connect(mapStateToProps)(NewAims);
