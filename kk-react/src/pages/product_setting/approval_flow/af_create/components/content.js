import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Col, Input, Select, Checkbox, message } from 'antd';
import { connect } from 'dva';
import { getFormLayout } from '@utils/helper';
import { getUserGroup, getUser } from '@services/approvalflow';
import MyIcon from '@components/MyIcon';
import { approvalTypeMap } from '@shared/ProductSettingConfig';
import AddARPerson from './AddARPerson';

import styles from '../index.less';

const formLayout = getFormLayout(2, 8);
const { Option } = Select;

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetail: false,
      showAddButton: false,
      detailData: {},
      flowData: [
        { nodeName: 'START' },
        { nodeName: 'END' },
      ],
      currentNode: null,
      approvalPersonRule: false,
      checkDefault: false,
      newData: {
        noticeUserIds2: [],
        noticeUsergroupIds2: [],
        noticeAppointTypeList2: [],
      },
      userGroupData: [],
      userData: [],
    };
  }

  componentDidMount(){
    this.props.onRef(this);
    this.getUserGroup(this.props.productId);
  }

  getFlowData = (flowData) => {
    flowData.unshift({ nodeName: 'START' });
    flowData.push({ nodeName: 'END' });
    this.setState({flowData: flowData});
  }

  getUserGroup = (productId) => {
    const params = {
      productId: productId,
    };
    getUserGroup(params).then((res) =>{
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ userGroupData: res.result });
      const obj = res.result.find(it => it.rbacUserGroup.name === '产品用户');
      this.getUser(productId, obj.rbacUserGroup.id);
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  }

  getUser = (productId, id) => {
    const params = {
      productId: productId,
      usergroupId: id,
    };
    getUser(params).then((res) =>{
      if (res.code !== 200) {
        return message.error(`获取数据失败, ${res.msg}`);
      }
      this.setState({ userData: res.result });
    }).catch((err) => {
      return message.error(`获取数据异常, ${err || err.message}`);
    });
  }


  addNode(i){
    let arr = this.state.flowData;
    if(this.props.isEndItem && arr.length>=3){
      return message.error(`流程类型为验收，仅允许添加一个审批节点`);
    }
    this.openDetail(i);
    arr.splice(i, 0, {nodeName: '未命名节点'});
    this.setState({flowData: arr});
    this.setState({currentNode: i});
  }


  dltNode(i){
    let arr = this.state.flowData;
    if(arr[i].active){
      this.setState({showDetail: false});
    }
    arr.splice(i, 1);
    this.setState({flowData: arr});
  }


  async openDetail(idx){
    if(this.state.showDetail){
      await this.confirmChange();
    }

    this.setState({showDetail: true});
    this.setState({currentNode: idx});
    await this.props.dispatch({type: 'approvalflow/saveCurrentNode', payload: idx});
    const { flowData } = this.state;
    let dData = {
      nodeNames: flowData[idx].nodeName,
      nodeType: flowData[idx].nodeType || 1,
      isDefault: flowData[idx].isDefault === 1 ? true : flowData[idx].isDefault === 2 ? false : true,
      userIds: flowData[idx].userIds || [],
      usergroupIds: flowData[idx].usergroupIds || [],
      appointTypeList: flowData[idx].appointTypeList || [],
      id: idx,
    };
    this.setState({detailData: dData});
    let newFlowData = this.state.flowData;
    newFlowData.map((item, index) =>{
      if(index === idx){
        item.active = true;
      }else{
        item.active = false;
      }
    });
    this.setState({ flowData: newFlowData });

    this.child && this.child.updateData(idx, newFlowData);

  }

  onRef = (ref) => {
    this.child = ref;
  }


  closeDetail = () =>{
    this.setState({showDetail: false});
    const newFlowData = this.state.flowData;
    newFlowData.map((item, index) =>{
      item.active = false;
    });

    const { currentNode } = this.state;
    const { getFieldValue } = this.props.form;
    newFlowData[currentNode].nodeName = getFieldValue('nodeNames');
    newFlowData[currentNode].nodeType = getFieldValue('approvalType');
    newFlowData[currentNode].isDefault = getFieldValue('isDefault') ? 1 : 2;
    newFlowData[currentNode].userIds = getFieldValue('noticeUserIds2');
    newFlowData[currentNode].usergroupIds = getFieldValue('noticeUsergroupIds2');
    newFlowData[currentNode].appointTypeList = getFieldValue('noticeAppointTypeList2');
    this.setState({ flowData: newFlowData });
    this.props.dispatch({type: 'approvalflow/saveFlowData', payload: newFlowData});
  }

  setHover(data){
    this.setState({showAddButton: data});
  }

  addApprovalPerson = (newData)=>{
    this.setState({ newData });
    const flag = !newData.noticeUserIds2.length && !newData.noticeUsergroupIds2.length && !newData.noticeAppointTypeList2.length;
    if(!flag){
      this.setState({approvalPersonRule: false});
    }else {
      this.setState({approvalPersonRule: true});
    }
  }

  confirmChange = ()=>{
    if(!this.state.showDetail){
      return;
    }
    this.props.form.validateFields(['nodeNames', 'approvalType'], (err, values) =>{
      if (err) return ;
      const { newData } = this.state;
      const flag = !newData.noticeUserIds2.length && !newData.noticeUsergroupIds2.length && !newData.noticeAppointTypeList2.length;
      if (flag && !this.props.form.getFieldValue('isDefault')){
        this.setState({ approvalPersonRule: true });
        message.warning('请将当前节点信息填写完整');
      }else{
        this.setState({ approvalPersonRule: false });
        this.closeDetail();
      }
    });
  }

  defineNode = (it, idx, type) => {
    return <div
      style={{position: 'relative'}}
      className={`${type === 'dot' ? '' : styles.hoverNode} ${it.active ? styles.activeNode : ''}`}
      onClick={type === 'dot' ? ()=> {return} : ()=>{this.openDetail(idx)}}>
      <div className={`f-jcc-aic ${type === 'dot' ? styles.startButton : styles.nodeButton}`}>
        <div className={`f-jcc-aic ${type === 'dot'? styles.circleDot: it.active ? styles.activeNumber : styles.number}`}>
          {type === 'dot' ? '' : idx}
        </div>
      </div>
      {type !== 'dot' &&
        <MyIcon type='icon-guanbi'
          className={styles.deleteButton}
          onClick={(e)=>{e.stopPropagation();this.dltNode(idx)}}
        />
      }
      <div className={`f-toe ${styles.nodeNameStyle}`}>
        {it.nodeName}
      </div>
    </div>;
  }

  renderFlow = (btns) => {
    var flowData = [];
    if(btns.length <=2){
      flowData = btns.map((it, idx) => (
        this.defineNode(it, idx, 'dot')
      ));
    }else{
      flowData = btns.map((it, idx) => {
        if (idx === 0 || idx === btns.length-1){
          return(this.defineNode(it, idx, 'dot'));
        }else {
          return(this.defineNode(it, idx, 'node'));
        }
      });
    }
    for (let i = flowData.length - 1; i > 0; i--) {
      if(this.state.showAddButton || flowData.length === 2){
        flowData.splice(i, 0,
          <div className='f-aic'>
            <span className={styles.nodeLine}></span>
            <div onClick={() => {this.addNode(i)}} className={`f-jcc-aic ${styles.addButton}`}>
              <PlusOutlined />
            </div>
            <span className={styles.nodeLine}></span>
          </div>
        );
      }else{
        flowData.splice(i, 0,
          <div className='f-aic'>
            <span className={styles.grayLine}></span>
          </div>
        );
      }
    }
    return flowData;
  }

  render() {
    const { flowData, showDetail, approvalPersonRule, newData, detailData, userGroupData, userData, currentNode } = this.state;
    const { form: { getFieldDecorator, getFieldValue }, isEndItem } = this.props;
    const flag = !newData.noticeUserIds2.length && !newData.noticeUsergroupIds2.length && !newData.noticeAppointTypeList2.length;
    return(<div style={{ width: '100%'}} className='u-mgt10'>
      <div
        className={`f-wsn f-aic f-csp ${showDetail ? 'f-oh' : 'f-oa'} ${styles.contentFlow}`}
        onMouseEnter={()=>this.setHover(true)}
        onMouseLeave={()=>this.setHover(false)}>
        {this.renderFlow(flowData)}
      </div>
      {showDetail && <div className={styles.bgWhite}>
        <div className={`u-pd10 u-mgl20 u-mgr20 ${styles.contentBorder}`}></div>
        <Form {...formLayout}>
          <Form.Item className='u-mgt10' labelAlign='right' label="节点名称">
            {getFieldDecorator('nodeNames', {
              initialValue: detailData.nodeNames,
              rules: [{ required: true, message: '此项必填，请检查!' }, {max: 50, message: '名称长度不得超出50个字符'}],
            })(
              <Input placeholder='请输入节点名称'/>
            )}
          </Form.Item>
          <Form.Item className='u-mgt10' labelAlign='right' label="审批类型">
            {getFieldDecorator('approvalType', {
              initialValue: detailData.nodeType,
              rules: [{ required: true, message: '此项必填，请检查!' }],
            })(
              <Select
                disabled={isEndItem}
                placeholder="请选择审批类型"
                onChange={this.handleSelectChange}
                style={{ width: '100%' }}
              >
                {
                  approvalTypeMap.map((it) => (
                    <Option value={it.key}>{it.value}</Option>
                  ))
                }
              </Select>,
            )}
          </Form.Item>
          <Form.Item className='u-mgt10' labelAlign='right' label="审批人员">
            {getFieldDecorator('approvalPerson', {
              rules: [{ required: getFieldValue('isDefault')===undefined ? false: !getFieldValue('isDefault'), message: ' '}],
            })(
              <span>
                <AddARPerson
                  onRef={this.onRef}
                  userGroupData={userGroupData}
                  userData={userData}
                  currentNode={currentNode}
                  form={ this.props.form }
                  addApprovalPerson={this.addApprovalPerson}
                />
                { !getFieldValue('isDefault') && approvalPersonRule && flag && <p style={{position: 'absolute', color: '#F04646', width: '200px'}}>此项必填，请检查!</p>}
              </span>
            )}
          </Form.Item>
          <Form.Item className='u-mgt10' labelAlign='left' label="">
            <Col span={6}></Col>
            <Col span={18}>
              {getFieldDecorator('isDefault', {
                valuePropName: 'checked',
                initialValue: detailData.isDefault,
                rules: [{ required: false, message: '' }],
              })(
                <Checkbox>仅设为默认人员，允许各项目进行修改</Checkbox>
              )}
            </Col>
          </Form.Item>
        </Form>
      </div>}
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    currentNode: state.approvalflow.currentNode,
  };
};

export default connect(mapStateToProps)(Content);
