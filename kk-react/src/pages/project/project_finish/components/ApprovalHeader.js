import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, message, Col, Button, Row, Modal, Input } from 'antd';
import { Link } from 'umi';
import { history } from 'umi';
import { finishAuditProjectEP } from '@services/project';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import { PROJECT_STATUS_MAP } from '@shared/ProjectConfig';
import { statusColor, statusMap, priorityMap, PROJECT_AUDIT_TYPE } from '@shared/ProjectConfig';
import { getFormLayout } from '@utils/helper';
import HeaderText from '../../project_approval/components/HeaderText';
import ApprovalMsg from './ApprovalMsg';
import styles from '../index.less';

const formLayout = getFormLayout(3, 18);

const FormItem = Form.Item;
const { TextArea } = Input;

class ApprovalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      type: '',
      down: false,
    };
  }

  handleAuditPass = (type) => {
    this.setState({ type });
    const { id } = this.props.location.query;
    let arr = [];
    if (type === 'fail') {
      arr = ['comment'];
    }

    this.props.form.validateFieldsAndScroll(arr, (err, values) => {
      let params = {
        projectId: id,
        state: PROJECT_AUDIT_TYPE.PASS,
        rejectReason: ''
      };

      if (type === 'fail') {
        if (err) return;
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.FAIL,
          rejectReason: values.comment,
        };
      }

      if (type === 'cancel') {
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.CANCLE,
          rejectReason: '',
        };
      }

      this.setState({ loading: true });
      finishAuditProjectEP(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`${res.msg}`);
        // message.success('操作成功！');
        this.setState({ visible: false });
        if (type === 'cancel') {
          history.push(`/project/detail?id=${id}`);
        } else if (res.result){
          history.push(`/project/audit_result/finish/${id}/${res.result}`);
        }
        // this.props.dispatch({ type: 'project/getProjectFinish', payload: { id } });
        // this.props.dispatch({ type: 'project/getOperationPerm', payload: { projectId: id } });
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`审批操作异常, ${err || err.message}`);
      });
    });
  }

  getButtons = (status) => {
    const { operationPerm } = this.props;
    const { loading, type } = this.state;

    if (status === PROJECT_STATUS_MAP.FINISH_APPROVAL) {
      return (<div>
        <Button type="primary" className="u-mgr10" onClick={() => this.handleAuditPass('pass')} loading={type === 'pass' && loading} disabled={!operationPerm.reviewStatus}>审批通过</Button>
        <Button type="danger" className="u-mgr10" onClick={() => this.setState({ visible: true })} disabled={!operationPerm.reviewStatus} loading={type === 'fail' && loading}>不通过</Button>
        <Button className="u-mgr10" onClick={() => this.handleAuditPass('cancel')} disabled={!operationPerm.withdrawStatus} loading={type === 'cancel' && loading}>撤回申请</Button>
      </div>);
    } else {
      return null;
    }
  }

  isEmptyData = (text) => {
    return text ? text : '-';
  }

  getCascadeField = (cascadeValueInfoList) => {
    const arr = [];
    cascadeValueInfoList.forEach(it => {
      if (it.cascadeCategory && !it.cascadeCategory.parentid) {
        const childObj = cascadeValueInfoList.find(item => item.cascadeField.id === it.cascadeField.id && !!item.cascadeCategory.parentid) || {};
        const childValue = childObj.cascadeCategory || {};
        arr.push({
          ...it.cascadeField,
          parentValue: it.cascadeCategory,
          childValue: Object.keys(childValue).length ? childValue : null,
        });
      }
    });
    return arr;
  }

  render() {
    const { visible, down } = this.state;
    const { list, form: { getFieldDecorator } } = this.props;
    const { id } = this.props.location.query;

    const data = list || {};
    const cascadeValueInfoList = data.cascadeValueInfoList || [];
    const cascadeField = this.getCascadeField(cascadeValueInfoList);

    const projectDetail = data.projectDetail || {};
    const createCustomFileds = data.createCustomFileds || [];

    const flag = data.createCustomFileds && !!data.createCustomFileds.length;

    const isEmptyData = (text) => {
      return text ? text : '-';
    };
    return ([<Card className="btn98">
      <Col span={18}>
        <Row className="f-csp f-fs2">
          <Link to={`/project/detail?id=${id}`} className="u-subtitle">
            <span>
              <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" style={{ position: 'relative', top: '-1px' }} />
              返回项目
            </span>
          </Link>
        </Row>

        <Row>
          <HeaderText data={list} title="结项审批" />
          {
            !down &&
            <Col offset={1} span={23}>
              <Row>
                {
                  createCustomFileds && createCustomFileds.map((it, index) => (
                    <Col span={12} className="u-mgb10">
                      <span className="u-title">{it.customField && it.customField.name}：</span>
                      <span className="u-subtitle"> {isEmptyData(it.label || it.value)}</span>
                    </Col>
                  ))
                }
              </Row>

              {/* 项目的级联字段 */}
              <Row>
                {
                  cascadeField && cascadeField.map((it, index) => (
                    <Col span={12} className="u-mgb10">
                      <span className="u-title">{it.fieldname}：</span>
                      <span className="u-subtitle">
                        {it.parentValue && <span>{it.parentValue.name}</span>}
                        {it.childValue && <span>/{it.childValue.name}</span>}
                      </span>
                    </Col>
                  ))
                }
              </Row>
            </Col>
          }
        </Row>
      </Col>

      <Col span={6}>
        <div style={{ position: 'absolute', right: '0px', textAlign: 'right', width: '100%' }}>
          {this.getButtons(projectDetail.status)}
          <Row className="u-mgt40">
            <Col span={8} className="f-pr">
              <div className="f-fs2 u-thirdtitle f-fr f-clb">状态</div>
              <div className="u-mgt5 f-fs4 f-fr f-clb">
                <DefineDot
                  text={projectDetail.status}
                  statusColor={statusColor}
                  statusMap={statusMap}
                />
              </div>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">负责人</div>
              <div className="u-mgt5 f-fs4 f-fr f-clb f-wwb">{this.isEmptyData(projectDetail.owner)}</div>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">优先级</div>
              <div className="u-mgt5 f-fs4 f-fr f-clb">{projectDetail.priority ? priorityMap[projectDetail.priority] : '-'}</div>
            </Col>
          </Row>
        </div>
      </Col>
    </Card>,
    flag &&
    <div className={styles.iconC} onClick={() => this.setState({ down: !this.state.down })}>
      <div className={styles.iconBall}>
        <MyIcon type="icon-zhankaijiantou" className={down ? styles.iconDown : styles.iconUp} />
      </div>
    </div>,

    <div style={{ padding: '0px 15px' }}>
      <div className="bbTitle">
        <span className="name">结项详情</span>
      </div>
      <Card>
        <ApprovalMsg data={list} />
      </Card>
    </div>,

    <Modal
      maskClosable={false}
      visible={visible}
      title="审批不通过"
      onOk={() => this.handleAuditPass('fail')}
      onCancel={() => this.setState({ visible: false })}
    >
      你确认当前项目的审批不通过吗？
      <FormItem label="原因" {...formLayout} className="u-mgt10">
        {getFieldDecorator('comment', {
          rules: [{ required: true, message: '此项必填！' }],
        })(
          <TextArea placeholder="请填写原因" maxLength={1999} />
        )}
      </FormItem>
    </Modal>
    ]);
  }
}
export default withRouter(Form.create()(ApprovalHeader));
