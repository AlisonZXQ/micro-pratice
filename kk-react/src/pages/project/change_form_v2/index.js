import React, { useEffect, useState } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, message, Button } from 'antd';
import { history } from 'umi';
import { connect } from 'dva';
import BackToPreview from '@components/BackToPreview';
import ChangeProjectFlow from '@pages/project/project_detail/components/submit_approval/ChangeProjectFlow';
import { getEditProject, submitChangeFlowEP } from '@services/project';
import { APPROVAL_FLOW_SETTING_TYPE } from '@shared/ProjectConfig';
import ChangeReasonForm from './components/ChangeReasonForm';
import ChangeTable from './components/ChangeTable';
import styles from './index.less';

function Index(props) {
  const { form: { getFieldValue, getFieldsValue }, workFlow, changeDetail } = props;
  const { projectId } = props.location.query;
  const [editData, setEditData] = useState({});
  const [changeLoading, setChangeLoading] = useState(false);

  useEffect(() => {
    getEditProject(projectId).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      if (res.result) {
        setEditData(res.result || {});
      }
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }, [projectId]);

  useEffect(() => {
    props.dispatch({ type: 'project/getChangeDetail', payload: { projectId } });
  }, [projectId]);

  const handleSave = () => {
    props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let arr = [];
      let submitParams = {};

      if (workFlow.length) {
        workFlow.forEach(it => {
          if (it.updateStatus === APPROVAL_FLOW_SETTING_TYPE.UN_EDIT) {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: it.userList.map(it => it.id),
              usergroupIdList: it.usergroupList.map(it => it.id),
            });
          } else {
            arr.push({
              workflowId: it.workflowNodeId,
              workflowNodeName: it.workflowNodeName,
              userIdList: getFieldsValue()[`user-${it.workflowNodeId}`],
              usergroupIdList: getFieldsValue()[`userGroup-${it.workflowNodeId}`],
            });
          }
        });

        // 限制每个审批节点至少有一个人员
        let flagArr = [];
        arr.forEach(it => {
          const con = it.userIdList.concat(it.usergroupIdList);
          if (con && !con.length) {
            flagArr.push(it);
          }
        });

        if (flagArr.length) {
          return message.warn(`${flagArr.map(it => it.workflowNodeName).join(',')}人员不能为空！`);
        }
        submitParams = {
          workflowApplyUserDtoList: arr,
        };
      } else {
        submitParams = {
          workflowApplyUserDtoList: [],
        };
      }
      const params = {
        projectId: projectId,
        reason: getFieldValue('reason'),
        reasonType: getFieldValue('reasonType'),
        workflowApplyUserDtoList: submitParams.workflowApplyUserDtoList,
      };

      setChangeLoading(true);
      submitChangeFlowEP(params).then((res) => {
        setChangeLoading(false);
        if (res.code !== 200) {
          return message.error(res.msg);
        }
        // message.success('操作成功');
        history.push(`/project/audit_result/change/${projectId}/${res.result || 0}`);
      }).catch((err) => {
        setChangeLoading(false);
        return message.error('发起变更异常', err || err.message);
      });
    });
  };

  return (<div>
    <Card className={styles.backCard}>
      <BackToPreview link={`/project/detail?id=${projectId}`} title="返回项目" />
    </Card>

    <div className="u-mgl15">
      <div className="bbTitle">
        <span className="name">项目变更</span>
        <span className={`${styles.changeButton} btn98`}>
          <Button className="u-mgr10" onClick={() => history.push(`/project/detail?id=${projectId}`)}>取消</Button>
          <Button type="primary" onClick={() => handleSave()} loading={changeLoading}>确定</Button>
        </span>
      </div>
      <Card>
        <ChangeReasonForm
          form={props.form}
        />

        <ChangeProjectFlow
          form={props.form}
          data={editData}
        />
      </Card>

      <div className="bbTitle"><span className="name">变更详情</span></div>
      <Card>
        <ChangeTable projectId={projectId} changeDetail={changeDetail} />
      </Card>
    </div>
  </div>);
}

const mapStateToProps = (state) => {
  return {
    workFlow: state.project.changeWorkFlow,
    changeDetail: state.project.changeDetail,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
