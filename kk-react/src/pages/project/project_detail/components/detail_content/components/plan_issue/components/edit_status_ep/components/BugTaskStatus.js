import React, { useState, useCallback } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import DefineDot from '@components/DefineDot';
import EditSelectStatus from '@components/EditSelectStatus';
import { bugTaskNameArr, ISSUE_ROLE_VALUE_MAP, bugTaskNameMap, bugTaskColorDotMap } from '@shared/CommonConfig';
import MyIcon from '@components/MyIcon';
import { updateBugState } from '@services/bug';
import { updateTaskState } from '@services/task';
import AutoCloseSubTaskModal from '@pages/receipt/task/task_detail/components/AutoCloseSubTaskModal';

import { TASK_STATUS_MAP } from '@shared/TaskConfig';
import styles from '../index.less';


const EditStatus = (props) => {
  const { record, type } = props;
  const [visible, setVisible] = useState(false);
  const [currentState, setCurrentState] = useState({});
  const [taskIds, setTaskIds] = useState([]);
  const issueRole = record.issueRole;
  const [autoCloseSubTaskRef, setAutoCloseSubTaskRef] = useState(null);

  const handelUpdateState = useCallback((value) => {
    const obj = bugTaskNameArr.find(it => it.key === value) || {};
    if (type === 'bug') {
      setVisible(true);
      setCurrentState(obj);
    }
    else if (type === 'task') {
      console.log('任务', obj, record);

      //关闭父任务
      if (obj.key === TASK_STATUS_MAP.CLOSE && record.issueKey.indexOf('Task-') === 0) {
        const taskid = record.issueKey.split('-')[1];
        console.log('关闭子任务提示弹窗', taskid);
        setTaskIds([taskid]);
        console.log('autoCloseSubTaskRef', autoCloseSubTaskRef);
        autoCloseSubTaskRef.setState({ visible: true });
      }
      //非关闭
      else {
        setVisible(true);
        setCurrentState(obj);
      }
    }

  }, [record, type, autoCloseSubTaskRef]);

  const reloadPlanning = () => {
    props.dispatch({ type: 'project/getProjectPlanning', payload: { id: record.projectId } });
  };

  const handleOk = () => {
    const issueKey = record.issueKey;
    const id = issueKey.split('-')[1];
    const params = [{
      id: id,
      state: currentState.key,
    }];
    let promise = null;
    if (type === 'bug') {
      promise = updateBugState(params);
    } else {
      promise = updateTaskState(params);
    }

    promise.then(res => {
      if (res.code !== 200) { return message.error(res.msg) }
      message.success('更新成功！');
      setVisible(false);
      reloadPlanning();
    }).catch(err => {
      return message.error(err || err.message);
    });
  };


  return (<span onClick={(e) => e.stopPropagation()}>
    {
      issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
      <EditSelectStatus
        value={record.statusid}
        type={type}
        handleUpdate={(value) => handelUpdateState(value)}
      />
    }

    {
      issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
      <span>
        <DefineDot
          text={record.statusid}
          statusMap={bugTaskNameMap}
          statusColor={bugTaskColorDotMap}
        />
      </span>
    }

    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => handleOk()}
    >
      <div>
        <MyIcon className={styles.getIconStyle} type="icon-tishigantanhao" />
        <span className={styles.modalTitle}>操作确认</span>
      </div>
      <div className={styles.getContentStyle}>
        {
          <span>
            您确认设置当前{record.issuetype}的状态为【{currentState.name}】吗？
          </span>
        }
      </div>
    </Modal>
    <AutoCloseSubTaskModal
      taskIds={taskIds}
      getThis={(ref) => setAutoCloseSubTaskRef(ref)}
      refreshFn={() => {
        reloadPlanning();
      }}
    />
  </span>);

};

export default connect()(EditStatus);
