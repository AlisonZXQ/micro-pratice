import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, message, Col, Button, Row, Modal, Input } from 'antd';
import { Link } from 'umi';
import { history } from 'umi';
import { getFormLayout } from '@utils/helper';
import { changeAuditProjectEP } from '@services/project';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import { statusColor, statusMap, priorityMap } from '@shared/ProjectConfig';
import { changeTypeMap } from '@pages/project/change_form/components/Config';
import { PROJECT_STATUS_MAP, PROJECT_AUDIT_TYPE } from '@shared/ProjectConfig';
import { warnModal } from '@shared/CommonFun';
import styles from './index.less';

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

  changeAuditProject = (params, type, order) => {
    this.setState({ type });
    const { id } = this.props.location.query;

    this.setState({ loading: true });
    changeAuditProjectEP(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) {
        return message.error(res.msg);
      }
      // 现在的逻辑是变更未生效还可点击
      // message.success('操作成功！');
      this.setState({ visible: false });
      if (type === 'cancel') {
        history.push(`/project/detail?id=${id}`);
      } else if (res.result){
        history.push(`/project/audit_result/change/${id}/${res.result}`);
      }
      // if (type === 'cancel' || type === 'fail') { // 取消或者不通过直接跳回主页
      //   history.push(`/project/detail?id=${id}`);
      // } else if (type === 'pass') { // 通过初审则刷新页面
      //   this.props.dispatch({ type: 'project/getProjectChange', payload: { id } });
      //   this.props.dispatch({ type: 'project/getOperationPerm', payload: { projectId: id } });
      // }
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error('变更操作异常', err || err.message);
    });
  }

  handleAuditPass = (type) => {
    const { id } = this.props.location.query;

    this.props.form.validateFieldsAndScroll((err, values) => {
      let params = {
        projectId: id,
        state: PROJECT_AUDIT_TYPE.PASS,
        rejectReason: ''
      };

      if (type === 'pass') {
        this.changeAuditProject(params, type);
      }

      if (type === 'fail') {
        if (err) return;
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.FAIL,
          rejectReason: values.comment,
        };
        this.changeAuditProject(params, type);
      }

      if (type === 'cancel') {
        params = {
          projectId: id,
          state: PROJECT_AUDIT_TYPE.CANCLE,
          rejectReason: '',
        };
        const that = this;
        warnModal({
          title: '撤回变更申请',
          content: <span>
            <div>你确认撤回当前变更申请吗？</div>
            <div>*撤回后当前变更申请内容不保存</div>
          </span>,
          className: styles.drawBack,
          okCallback: () => {
            that.changeAuditProject(params, type);

          }
        });
      }
    });
  }

  getButtons = (status) => {
    const { operationPerm } = this.props;
    const { loading, type } = this.state;

    if (status === PROJECT_STATUS_MAP.DOING_CHANGE) {
      return (<div>
        <Button type="primary" className="u-mgr10" onClick={() => this.handleAuditPass('pass')} loading={loading && type === 'pass'} disabled={!(operationPerm && operationPerm.reviewStatus)}>审批通过</Button>
        <Button type="danger" className="u-mgr10" disabled={!(operationPerm && operationPerm.reviewStatus)} onClick={() => this.setState({ visible: true })} loading={loading && type === 'fail'}>不通过</Button>
        <Button className="u-mgr10" onClick={() => this.handleAuditPass('cancel')} disabled={!(operationPerm && operationPerm.withdrawStatus)} loading={loading && type === 'cancel'}>撤回变更</Button>
      </div>);
    } else {
      return null;
    }
  }

  isEmptyData = (text) => {
    return text ? text : '-';
  }

  render() {
    const { visible, down } = this.state;
    const { list, form: { getFieldDecorator }, title } = this.props;
    const { id } = this.props.location.query;
    // 级联字段
    const data = list || {};
    const projectDetail = data.projectDetail || {};

    const flag = list.createCustomFileds && !!list.createCustomFileds.length;

    let newString = data.reason ? data.reason : '-';
    // eslint-disable-next-line
    const pattern = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g;
    const arr = newString.match(pattern);
    if (arr && arr.length) {
      arr.forEach(it => {
        newString = newString.replace(it, '<a href="' + it + '" target=_blank>' + it + '</a>');
      });
    }

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

        <Row className={`${styles.changeHeader} u-mgt10 u-mgb10`}>
          <MyIcon type="icon-danhaoicon" className={styles.icon} />{title}
        </Row>

        <Row className="u-mgb10 u-mgt10">
          <span className="u-title">变更类型：</span>
          <span className="f-fwb u-subtitle">{changeTypeMap[data.reasonType]}</span>
        </Row>
        <Row>
          <span className="u-title">变更原因：</span>
          <span dangerouslySetInnerHTML={{ __html: newString }} className="f-fwb u-subtitle" style={{ whiteSpace: 'pre-wrap' }}></span>
        </Row>
      </Col>

      <Col span={6}>
        <div style={{ position: 'absolute', right: '0px', textAlign: 'right', width: '100%' }}>
          {this.getButtons(projectDetail.status)}
          <Row className="u-mgt40">
            <Col span={10} className="f-pr">
              <div className="f-fs2 u-thirdtitle f-fr f-clb">状态</div>
              <div className="u-mgt5 f-fs4 f-fr f-clb">
                {
                  projectDetail.status ?
                    <DefineDot
                      text={projectDetail.status}
                      statusMap={statusMap}
                      statusColor={statusColor}
                    />
                    : '-'
                }

              </div>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">负责人</div>
              <span className="u-mgt5 f-fs4 f-fr f-clb f-wwb">{this.isEmptyData(projectDetail.owner)}</span>
            </Col>
            <Col span={6}>
              <div className="f-fs2 u-thirdtitle f-fr f-clb">优先级</div>
              <span className="u-mgt5 f-fs4 f-fr f-clb">{projectDetail.priority ? priorityMap[projectDetail.priority] : '-'}</span>
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
      destroyOnClose
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
