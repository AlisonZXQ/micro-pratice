import React, { Component, } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { CheckOutlined, CloseOutlined, LeftOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Select, Switch, Checkbox, Row, message } from 'antd';
import { getFormLayout } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import { addWorkFlow, getFlowDetail, editFlowData } from '@services/approvalflow';
import { flowMap, noticeTypeListMap, IS_NOTICE_USE, noticeWayArr } from '@shared/ProductSettingConfig';

import styles from './index.less';
import AddPerson from './components/Addperson';
import Content from './components/Content';

const { Option } = Select;
const formLayout = getFormLayout(2, 8);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageType: '',
      custPerson: false,
      productId: null,
      detailData: [],
      isEndItem: false,
      showEditName: false,
    };
  }

  componentDidMount(){
    const { type, productId, id } = this.props.location.query;
    if(id){
      this.getDetailData(id);
    }
    this.setState({ productId: productId});
    if(type === 'new'){
      let newDetailData = {
        workflowName: '审批流程名称'
      };
      this.setState({ detailData: newDetailData });
      this.setState({ pageType: '新建审批流程' });
    }else if(type === 'edit'){
      this.setState({ pageType: '编辑审批流程' });
    }
  }

  changeCust = (e)=>{
    let checked = e.target.checked;
    this.setState({custPerson: checked});
  }

  getDetailData = (id) => {
    const params = {
      id: id,
    };
    getFlowDetail(params).then((res) =>{
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ detailData: res.result });
      this.child.getFlowData(res.result.workflowNodeVOList);
      const arr = res.result.noticeUserTypeList;
      if(arr.indexOf(2) > -1){ //判断是否显示添加人员按钮
        const e = {
          target: {
            checked: true,
          },
        };
        this.changeCust(e);
      }
      this.props.dispatch({type: 'approvalflow/saveFlowData', payload: res.result.workflowNodeVOList});
      this.handleSelectChange(res.result.workflowType); //判断通知类型
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  }

  saveAll = async() =>{
    const { type, id } = this.props.location.query;
    await this.child.confirmChange();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { productId } = this.state;
      let newIsNotice = values.isNotice;
      if(newIsNotice === true){
        newIsNotice = IS_NOTICE_USE.OPEN;
      }else{
        newIsNotice = IS_NOTICE_USE.CLOSE;
      }
      let flowData = JSON.stringify(this.props.flowData);
      let newFlowData = JSON.parse(flowData);
      if(JSON.stringify(newFlowData) === '{}' || newFlowData.length === 2){
        return message.error('请填写节点信息');
      }else{
        newFlowData.shift();
        newFlowData.pop();
        newFlowData && newFlowData.map((item) =>{
          delete item.active;
          let newUserIds = [];
          item.userIds && item.userIds.map(item=>{
            newUserIds.push(item.id || item.key);
          });
          item.userIds = newUserIds;

          let newUsergroupIds = [];
          item.usergroupIds && item.usergroupIds.map(item=>{
            newUsergroupIds.push(item.id || item.key);
          });
          item.usergroupIds = newUsergroupIds;

          let newAppointTypeList = [];
          item.appointTypeList && item.appointTypeList.map(item=>{
            newAppointTypeList.push(item.id || item.key);
          });
          item.appointTypeList = newAppointTypeList;
        });
      }
      let newNoticeUserIds=[];
      values.noticeUserIds && values.noticeUserIds.map(item=>{
        newNoticeUserIds.push(item.key);
      });
      let newNoticeUsergroupIds=[];
      values.noticeUsergroupIds && values.noticeUsergroupIds.map(item=>{
        newNoticeUsergroupIds.push(item.key);
      });
      let newNoticeAppointTypeList=[];
      values.noticeAppointTypeList && values.noticeAppointTypeList.map(item=>{
        newNoticeAppointTypeList.push(item.key);
      });
      if(type === 'edit'){
        const params = {
          id: id,
          workflowName: values.workflowName,
          workflowType: values.workflowType,
          isNotice: newIsNotice,
          noticeTypeList: values.noticeTypeList,
          noticeMethodList: values.noticeMethodList,
          noticeUserTypeList: values.noticeUserTypeList,
          noticeUserIds: newNoticeUserIds,
          noticeUsergroupIds: newNoticeUsergroupIds,
          noticeAppointTypeList: newNoticeAppointTypeList,
          workflowNodeUpdateDtoList: newFlowData
        };
        editFlowData(params).then((res) =>{
          if (res.code !== 200) {
            return message.error(`修改失败, ${res.msg}`);
          }
          message.success(`成功修改流程`);
          this.routeBack();
        }).catch((err) => {
          return message.error(`修改异常, ${err || err.message}`);
        });
      }else{
        const params = {
          productId: productId,
          workflowName: values.workflowName,
          workflowType: values.workflowType,
          isNotice: newIsNotice,
          noticeTypeList: values.noticeTypeList,
          noticeMethodList: values.noticeMethodList,
          noticeUserTypeList: values.noticeUserTypeList,
          noticeUserIds: newNoticeUserIds,
          noticeUsergroupIds: newNoticeUsergroupIds,
          noticeAppointTypeList: newNoticeAppointTypeList,
          workflowNodeCreateDtoList: newFlowData
        };
        addWorkFlow(params).then((res) =>{
          if (res.code !== 200) {
            return message.error(`创建失败, ${res.msg}`);
          }
          message.success(`成功创建流程`);
          this.routeBack();
        }).catch((err) => {
          return message.error(`创建异常, ${err || err.message}`);
        });
      }
    });
  }

  routeBack = ()=>{
    history.push(`/product_setting/approval_flow?id=${this.state.productId}`);
  }

  onRef = (ref) =>{
    this.child = ref;
  }

  approvalflowSave = () => {
    this.child.confirmChange();
  }

  handleSelectChange = (value) => {
    if(value === 4){
      if(this.props.flowData.length>3){
        this.child.getFlowData([]);
      }
      this.setState({ isEndItem: true });
    }else{
      this.setState({ isEndItem: false });
    }
  }

  changeName = (name) => {
    let newDetailData = this.state.detailData;
    newDetailData.workflowName = name;
    this.setState({ newDetailData });
    this.setState({ showEditName: false });
  }


  render() {
    const { pageType, custPerson, detailData, isEndItem, showEditName } = this.state;
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    return (
      <div>
        <div className={styles.createTop}>
          <span>
            <Button type="normal" icon={<LeftOutlined />} onClick={()=>{this.routeBack()}} />
            <span className='u-mgl10'>{ pageType }</span>
          </span>
          <div className='f-jcsb u-mgt20'>
            <div style={{display: 'flex'}}>
              <MyIcon style={{fontSize: '32px'}} type='icon-xiangmuliebiao1' className='u-mgb15' />
              {!showEditName ? <Row className='u-mgl10' style={{lineHeight: '32px', display: 'flex'}}>
                <Form.Item>
                  {getFieldDecorator('workflowName', {
                    initialValue: detailData && detailData.workflowName,
                  })(
                    <span className='f-fs4 f-fwb'>{detailData.workflowName}</span>
                  )}
                </Form.Item>
                <MyIcon
                  style={{fontSize: '16px', marginLeft: '8px', marginTop: '9px'}}
                  type='icon-bianji'
                  onClick={() => this.setState({showEditName: true})}/>
              </Row>:
                <Row className='u-mgl10' style={{lineHeight: '32px', display: 'flex'}}>
                  <Form.Item>
                    {getFieldDecorator('workflowName', {
                      rules: [{ required: true, message: '此项必填，请检查!' }, {max: 50, message: '名称长度不得超出50个字符'}],
                      initialValue: detailData && detailData.workflowName,
                    })(
                      <Input placeholder="请输入流程名称" />
                    )}
                  </Form.Item>
                  <div className={styles.checkButton}>
                    <CheckOutlined onClick={() => this.changeName(getFieldValue('workflowName'))} />
                  </div>
                  <div className={styles.checkButton} onClick={() => this.setState({showEditName: false})}>
                    <CloseOutlined />
                  </div>
                </Row>}
            </div>
            <span>
              <Button type="primary" onClick={()=>{this.saveAll()}} className='u-mgr10'>保存</Button>
              <Button onClick={()=>{this.routeBack()}} type="normal">取消</Button>
            </span>
          </div>
        </div>
        <div className='u-pdl10 u-pdr10'>
          <div className='bbTitle'>
            <span className='name'>基本信息</span>
          </div>
          <div onClick = {()=>{this.approvalflowSave()}} className='u-pd20 bgWhiteModel'>
            <Form {...formLayout}>
              <Form.Item {...formLayout} className='u-mgt10' labelAlign='right' label="流程类型">
                {getFieldDecorator('workflowType', {
                  rules: [{ required: true, message: '此项必填，请检查!' }],
                  initialValue: detailData && detailData.workflowType,
                })(
                  <Select
                    className='u-mgl10'
                    placeholder="请选择流程应用域"
                    onChange={this.handleSelectChange}
                    style={{ width: '100%' }}
                  >
                    {flowMap.map((it) => (
                      <Option key={it.type} value={it.type}>{it.name}</Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
              <Form.Item {...formLayout} labelAlign='right' label="流程通知" className='u-mgt10'>
                {getFieldDecorator('isNotice', {
                  valuePropName: 'checked',
                  initialValue: detailData && detailData.isNotice === IS_NOTICE_USE.OPEN ? true : detailData.isNotice === IS_NOTICE_USE.CLOSE ? false : true,
                })(
                  <Switch style={{marginLeft: '10px'}} checkedChildren="开" unCheckedChildren="关" />
                )}
              </Form.Item>
              {getFieldValue('isNotice') && <div>
                <Form.Item labelAlign='right' label="通知类型">
                  {getFieldDecorator('noticeTypeList', {
                    rules: [{ required: true, message: '此项必填，请检查!' }],
                    initialValue: detailData && detailData.noticeTypeList,
                  })(
                    <Checkbox.Group name="radiogroup" className='u-mgl10'>
                      {noticeTypeListMap.map((it) => (
                        <Checkbox value={it.key}>{it.value}</Checkbox>
                      ))}
                    </Checkbox.Group>
                  )}
                </Form.Item>
                <Form.Item labelAlign='right' label="通知方式">
                  {getFieldDecorator('noticeMethodList', {
                    rules: [{ required: true, message: '此项必填，请检查!' }],
                    initialValue: detailData && detailData.noticeMethodList,
                  })(
                    <Checkbox.Group className='u-mgl10'>
                      {noticeWayArr.map((it) => (
                        <Checkbox value={it.key}>{it.value}</Checkbox>
                      ))}
                    </Checkbox.Group>
                  )}
                </Form.Item>
                <Form.Item labelAlign='right' label="通知人员">
                  {getFieldDecorator('noticeUserTypeList', {
                    rules: [{ required: true, message: '此项必填，请检查!' }],
                    initialValue: detailData && detailData.noticeUserTypeList,
                  })(
                    <Checkbox.Group className='u-mgl10'>
                      <Checkbox value={1}>项目成员</Checkbox>
                      <Checkbox value={2} onChange={(event) => {this.changeCust(event)}}>自定义</Checkbox>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              </div>}
            </Form>
            {custPerson && <AddPerson productId={this.props.location.query.productId} detailData={ detailData } form={ this.props.form } />}
          </div>
          <div className='bbTitle'>
            <span className='name'>节点设置</span>
          </div>
          <Content
            isEndItem={isEndItem}
            productId={this.props.location.query.productId}
            onRef={this.onRef}
            form={this.props.form}
            {...this.props}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    flowData: state.approvalflow.flowData,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
