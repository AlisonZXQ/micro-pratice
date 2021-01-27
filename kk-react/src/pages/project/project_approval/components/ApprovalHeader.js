import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, message, Col, Button, Row, Modal, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import { Link } from 'umi';
import { history } from 'umi';
import { getFormLayout } from '@utils/helper';
import { beginAuditProjectWorkFlowEP } from '@services/project';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import { PROJECT_STATUS_MAP, PROJECT_AUDIT_TYPE } from '@shared/ProjectConfig';
import { statusColor, statusMap, priorityMap } from '@shared/ProjectConfig';
import HeaderText from './HeaderText';
import styles from '../index.less';

const formLayout = getFormLayout(3, 18);

const FormItem = Form.Item;
const { TextArea } = Input;

class ApprovalHeader extends Component {
  state = {
    visible: false,
    loading: false,
    type: '',
    down: true,
  };

  handleAuditPass = (type) => {
    this.setState({ type });
    const { id } = this.props.location.query;

    this.props.form.validateFieldsAndScroll((err, values) => {
      // 通过
      let params = {
        projectId: id,
        state: PROJECT_AUDIT_TYPE.PASS,
        rejectReason: ''
      };

      // 不通过
      if (type === 'fail') {
        if (err) return;
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.FAIL,
          rejectReason: values.comment,
        };
      }

      // 取消
      if (type === 'cancel') {
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.CANCLE,
          rejectReason: '',
        };
      }

      this.setState({ loading: true });
      beginAuditProjectWorkFlowEP(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(`${res.msg}`);
        // message.success('操作成功！');
        this.setState({ visible: false });
        if (type === 'cancel') {
          history.push(`/project/detail?id=${id}`);
        } else if (res.result){
          history.push(`/project/audit_result/begin/${id}/${res.result}`);
        }
        // this.props.dispatch({ type: 'project/getProjectBegin', payload: { id } });
        // this.props.dispatch({ type: 'project/getOperationPerm', payload: { projectId: id } });
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error('审批操作异常', err || err.message);
      });
    });
  }

  getButtons = (status) => {
    const { operationPerm } = this.props;
    const { loading, type } = this.state;

    if (status === PROJECT_STATUS_MAP.BEGIN_APPROVAL) {
      return (<div className="f-tar u-mgr20">
        <Button type="primary" className="u-mgr10" onClick={() => this.handleAuditPass('pass')} loading={loading && type === 'pass'} disabled={!operationPerm.reviewStatus}>审批通过</Button>
        <Button type="danger" className="u-mgr10" onClick={() => this.setState({ visible: true })} disabled={!operationPerm.reviewStatus} loading={loading && type === 'fail'}>不通过</Button>
        <Button className="u-mgr10" onClick={() => this.handleAuditPass('cancel')} disabled={!operationPerm.withdrawStatus} loading={loading && type === 'cancel'}>撤回申请</Button>
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
    const { projectBegin, form: { getFieldDecorator } } = this.props;
    const { visible, down } = this.state;
    const { id } = this.props.location.query;

    const cascadeValueInfoList = projectBegin.cascadeValueInfoList || [];
    const cascadeField = this.getCascadeField(cascadeValueInfoList);

    const data = projectBegin || {};
    const projectDetail = data.projectDetail || {};
    const createCustomFileds = data.createCustomFileds || [];

    const isEmptyData = (text) => {
      return text ? text : '-';
    };

    const flag = data.createCustomFileds && !!data.createCustomFileds.length;

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
          <HeaderText data={data} title="立项审批" />

          {/* 自定义字段在展开时才去展示 */}
          {
            !down &&
            <Col offset={1} span={23}>
              <Row>
                {
                  createCustomFileds && createCustomFileds.map((it, index) => (
                    <Col span={12} className="u-mgb10">
                      <span className="u-title">{it.customField && it.customField.name}：</span>
                      <span className="u-subtitle">{isEmptyData(it.label || it.value)}</span>
                    </Col>
                  ))
                }
              </Row>

              {/* 项目的级联字段 */}
              <Row>
                {
                  cascadeField && cascadeField.map((it, index) => (
                    <Col span={12} className="u-mgt10">
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
        <div style={{ position: 'absolute', right: '0px', width: '100%' }}>
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
              <div className="f-fs2 u-thirdtitle  f-fr f-clb">负责人</div>
              <div className="u-mgt5 f-fs4  f-fr f-clb f-wwb">{this.isEmptyData(projectDetail.owner)}</div>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle  f-fr f-clb">优先级</div>
              <div className="u-mgt5 f-fs4  f-fr f-clb">{projectDetail.priority ? priorityMap[projectDetail.priority] : '-'}</div>
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
