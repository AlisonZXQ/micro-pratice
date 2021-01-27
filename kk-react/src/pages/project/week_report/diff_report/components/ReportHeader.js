import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Input, Button, message, Modal } from 'antd';
import { history } from 'umi';
import html2canvas from 'html2canvas';
import { withRouter } from 'react-router-dom';
import MyIcon from '@components/MyIcon';
import ProjectList from '@components/ProjectList';
import { WEEKREPORT_TYPE, PROEJCT_PERMISSION, RISK_LEVEL_MAP } from '@shared/ProjectConfig';
import { uploadImg } from '@services/weekReport';
import { createWeekReport, updateWeekReport, deleteWeekReport, endWeekReport, sendReportEmail } from '@services/weekReport';
import { deleteModal } from '@shared/CommonFun';
import { dataURLtoBlob } from '@utils/helper';
import styles from '../index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
/**
 * @description - 周报的头部卡片
 * @param {Object} reportData - 已创建的周报数据
 * @param {Object} reportDepend - 周报首次未创建前获取的数据
 * @param {String} type - 当前是创建/查看/编辑
 */
function ReportHeader(props) {
  const { form: { getFieldDecorator, getFieldValue }, reportData, currentMemberInfo, reportDepend, actionType, reportDetail } = props;
  const { id, reportId, template } = props.location.query;
  const roleGroup = currentMemberInfo.roleGroup;

  const [editTitle, setEditTitle] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [delayLoading, setDelayLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const displayName = actionType === 'view' ? '查看周报' : actionType === 'edit' ? '编辑周报' : '新建周报';

  const extra = [
    { name: '周报管理', link: `/project/project_week_report/list?id=${id}` },
    { name: displayName, link: null }
  ];

  const getPermission = () => {
    const flag = reportDetail && reportDetail.weekReportInfo &&
      reportDetail.weekReportInfo.createUser && currentMemberInfo.userVO && (reportDetail.weekReportInfo.createUser.email
        !== currentMemberInfo.userVO.email);
    return currentMemberInfo.role === PROEJCT_PERMISSION.READ && flag;
  };

  const handleEndReport = () => {
    const params = {
      id: reportId,
      state: WEEKREPORT_TYPE.DONE,
    };

    endWeekReport(params).then((res) => {
      if (res.code !== 200) return message.error(`周报归档失败，${res.msg}`);
      message.success('周报归档成功！');
      history.push(`/project/project_week_report/list?id=${id}`);
    }).catch((err) => {
      return message.error(`周报归档失败，${err || err.message}`);
    });
  };

  const handleDeleteReport = (id, reportId) => {
    deleteModal({
      title: '删除周报',
      content: '此操作将不可恢复，你确定要继续吗？',
      okCallback: () => {
        deleteWeekReport(reportId).then((res) => {
          if (res.code !== 200) return message.error(`删除周报失败，${res.msg}`);
          message.success('删除周报成功！');
          history.push(`/project/project_week_report/list?id=${id}`);
        }).catch((err) => {
          return message.error(`删除周报异常，${err || err.message}`);
        });
      }
    });
  };

  const handleUpdate = () => {
    history.push(`/project/project_week_report/edit?id=${id}&reportId=${reportId}&template=${template}`);
  };

  const getSelectUser = () => {
    return <span>
      您确认要将当前周报发送给全部项目成员吗？
      <div className={styles.sendEmailSelect}>
        <span className={ styles.selectLabel }>抄送人：</span>
        {
          getFieldDecorator('cc', {
          })(
            <TextArea
              className={styles.select}
              placeholder="请输入抄送人（请用逗号分隔多个邮箱地址）" />
          )
        }
      </div>
    </span>;
  };

  const handleSendEmail = () => {
    setSendLoading(true);
    setDelayLoading(true);
    setTimeout(() => {
      setDelayLoading(false);
    }, 1000);
    // 先截图再发送
    html2canvas(document.getElementById("weekReport"), {
      allowTaint: true,
      useCORS: true,
    }).then((canvas) => {
      let base64url = canvas.toDataURL('image/jpeg', 1.0);
      const blob = dataURLtoBlob(base64url);
      const formData = new FormData();
      formData.append('file', blob);
      uploadImg(formData).then((res) => {
        if (res.code === 200) {
          const url = res.result.url;
          sendReportEmail({
            id: reportId,
            html: `<a href=${window.location.href}><img src=${url} alt="邮件"/></a>`,
            cc: getFieldValue('cc') ? getFieldValue('cc').replace(/\，/g, ',') : '',
          }).then(res => {
            setSendLoading(false);
            setVisible(false);
            if (res.code !== 200) return message.error(`${res.msg}`);
            message.success(`${res.result}`);
          }).catch(err => {
            setSendLoading(false);
            setVisible(false);
            return message.error(err || err.message);
          });
        }
      }).catch(err => {
        return message.error(err || err.message);
      });
    });
  };

  const handleSave = () => {
    const { template } = props.location.query;

    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let params = {
        ...values,
        description: values.description ? values.description : `-`,
        starttime: new Date(values.timeRange[0]).getTime(),
        endtime: new Date(values.timeRange[1]).getTime(),
        status: reportDepend.status,
        plan_manpower: reportDepend.plan_manpower,
        act_manpower: reportDepend.act_manpower,
        manpower: reportDepend.manpower,
        responseuid: reportDepend.responseUser && reportDepend.responseUser.id,
        objectiveData: JSON.stringify(reportDepend.objectiveData),
        milestoneData: JSON.stringify(reportDepend.milestoneData),
        projectData: JSON.stringify(reportDepend.projectData),
        progressData: values.currentPlan && values.currentPlan.map(it => it.issueKey),
        nextPlanData: values.nextPlan && values.nextPlan.map(it => it.issueKey),
        level: values.level || RISK_LEVEL_MAP.LOW,
        templateType: Number(template),
      };

      if (reportId) {
        params = {
          ...params,
          id: Number(reportId),
        };
        updateWeekReport(params).then((res) => {
          if (res.code !== 200) return message.error(`更新周报失败！，${res.msg}`);
          message.success('更新周报成功！');
          history.push(`/project/project_week_report/list?id=${id}`);
        }).catch((err) => {
          return message.error(`更新周报异常！，${err || err.msg}`);
        });
      } else {
        createWeekReport(params).then((res) => {
          if (res.code !== 200) return message.error(`创建周报失败！，${res.msg}`);
          message.success('创建周报成功！');
          history.push(`/project/project_week_report/list?id=${id}`);
        }).catch((err) => {
          return message.error(`创建周报异常！，${err || err.msg}`);
        });
      }
    });
  };

  const getButtons = () => {
    if (actionType === 'view') {
      return [
        <Button className="u-mgr10" onClick={() => history.push(`/project/project_week_report/list?id=${id}`)}>返回</Button>,
        <Button className="u-mgr10" onClick={() => handleEndReport()} disabled={roleGroup === PROEJCT_PERMISSION.READ}>归档</Button>,
        <Button type="danger" disabled={getPermission() || roleGroup === PROEJCT_PERMISSION.READ} className="u-mgr10" onClick={() => handleDeleteReport(id, reportId)}>删除</Button>,
        <Button className="u-mgr10" type="primary" onClick={() => handleUpdate()} disabled={roleGroup === PROEJCT_PERMISSION.READ}>编辑</Button>,
        <Button className="" type="primary" onClick={() => {setVisible(true)}} disabled={roleGroup === PROEJCT_PERMISSION.READ || sendLoading || delayLoading}>发送邮件</Button>
      ];
    } else {
      return [
        <Button className="u-mgr10" onClick={() => history.push(`/project/project_week_report/list?id=${id}`)}>取消</Button>,
        <Button className="" type="primary" onClick={() => handleSave()} disabled={roleGroup === PROEJCT_PERMISSION.READ.READ}>保存</Button>
      ];
    }
  };

  return (
    <div>
      <Card
        className={styles.topCardStyle}
      >
        <ProjectList extra={extra} id={id} />
        {
          <span className="f-ib">
            <FormItem style={{ display: editTitle ? 'inline-block' : 'none' }}>
              {getFieldDecorator('name', {
                initialValue: reportData.name,
                rules: [{ required: true, message: '此项必填！' }]
              })(
                <Input style={{ width: '500px' }} placeholder="请输入周报标题" maxLength={50} className="f-ib u-mgt20" />
              )}
            </FormItem>
            {
              !editTitle && <span className="u-mgt20 f-ib u-mgr10 f-fs4" style={{ fontFamily: 'PingFangSC-Medium' }}>{getFieldValue('name') || reportData.name}</span>
            }
            {
              editTitle ?
                <span className="f-ib u-mgt25">
                  <div className={`${styles.checkButton} u-mgl10`} onClick={() => setEditTitle(false)}>
                    <CheckOutlined />
                  </div>
                  <div className={`${styles.checkButton} u-mgl10`} onClick={() => setEditTitle(false)}>
                    <CloseOutlined />
                  </div>
                </span> :
                actionType !== 'view' &&
                <MyIcon
                  onClick={() => setEditTitle(true)}
                  style={{ fontSize: '16px' }}
                  type='icon-bianji'
                  className="issueIcon"
                />
            }
          </span>
        }

        <span className="f-fr btn98 u-mgt20">
          {
            reportData.state !== WEEKREPORT_TYPE.DONE &&
            getButtons()
          }
        </span>
      </Card>
      <Modal
        title='发送邮件'
        onCancel={() => setVisible(false)}
        destroyOnClose
        footer={<span>
          <Button onClick={() => setVisible(false)}>取消</Button>
          <Button type='primary' loading={sendLoading} onClick={handleSendEmail}>确定</Button>
        </span>}
        visible={visible}>
        {getSelectUser()}
      </Modal>
    </div>
  );
}

export default withRouter(ReportHeader);
