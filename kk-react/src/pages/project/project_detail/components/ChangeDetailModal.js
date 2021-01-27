import React, { useState } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import ChangeTable from '@pages/project/change_form_v2/components/ChangeTable';

const ChangeDetailModal = (props) => {
  const { children, projectId, changeDetail } = props;
  const [visible, setVisible] = useState(false);

  const getChangeDetail = () => {
    props.dispatch({ type: 'project/getChangeDetail', payload: { projectId } });
  };

  return (<span>
    <span onClick={() => { setVisible(true); getChangeDetail() }}>{children}</span>
    <Modal
      title="变更详情"
      visible={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      width={800}
    >
      <ChangeTable projectId={projectId} changeDetail={changeDetail} />
    </Modal>
  </span>);
};

const mapStateToProps = (state) => {
  return {
    changeDetail: state.project.changeDetail,
  };
};

export default connect(mapStateToProps)(ChangeDetailModal);
