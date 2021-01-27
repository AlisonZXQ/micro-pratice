import React, { Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import EditSelectStatus from '@components/EditSelectStatus';
import { updateAdviseState } from '@services/advise';
import DefineDot from '@components/DefineDot';
import AcceptModal from '@pages/receipt/advise/advise_detail/components/AcceptModal';
import RejectModal from '@pages/receipt/advise/advise_detail/components/RejectModal';
import ReOpenModal from '@pages/receipt/advise/advise_detail/components/ReOpenModal';
import { ISSUE_ROLE_VALUE_MAP, adviseNameMap, adviseColorDotMap } from '@shared/CommonConfig';
import { ADVISE_STATUS_MAP } from '@shared/AdviseConfig';

class EditStatus extends Component {
  rejectThis = null;
  acceptThis = null;
  reopenThis = null;

  handelUpdateState = (state) => {
    const { adviseDetail, listDetail } = this.props;
    let advise = {};
    if (listDetail) {
      advise = listDetail.advise;
    } else {
      advise = adviseDetail.advise || {};
    }
    // 8驳回 7受理
    if (state === ADVISE_STATUS_MAP.REJECTED) {
      this.rejectThis.setState({ visible: true });
    } else if (state === ADVISE_STATUS_MAP.ACCEPTED) {
      this.acceptThis.setState({ visible: true });
    } else if (state === ADVISE_STATUS_MAP.REOPEN) {
      this.reopenThis.setState({ visible: true });
    } else {
      const params = {
        id: advise.id,
        state,
      };
      updateAdviseState(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('状态更新成功！');
        this.getRefresh();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  };

  getRefresh = () => {
    const { adviseDetail, listDetail } = this.props;
    const advise = adviseDetail.advise || {};
    if (!listDetail) {
      this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: advise.id } });
    }
    if (this.props.refreshFun) {
      this.props.refreshFun();
    }
  }

  getCurrentUserType = () => {
    const { adviseDetail, listDetail, currentUser, list } = this.props;
    const user = currentUser.user || {};
    let submitUser = {};
    let responseUser = {};
    let requireUser = {};
    if (list && listDetail && Object.keys(listDetail).length) {
      submitUser = listDetail.submitUser || {};
      responseUser = listDetail.responseUser || {};
      requireUser = listDetail.requireUser || {};
    } else if (adviseDetail && Object.keys(adviseDetail).length) {
      submitUser = adviseDetail.submitUser || {};
      responseUser = adviseDetail.responseUser || {};
      requireUser = adviseDetail.requireUser || {};
    }
    const userTypeArr = [];
    if (submitUser.id === user.id) {
      userTypeArr.push('报告人');
    }
    if (responseUser.id === user.id) {
      userTypeArr.push('负责人');
    }
    if (requireUser.id === user.id) {
      userTypeArr.push('验证人');
    }
    return userTypeArr;
  };

  render() {
    const { value, type, adviseDetail, bgHover, listDetail } = this.props;
    let advise = {};
    if (listDetail) {
      advise = listDetail.advise;
    } else {
      advise = adviseDetail.advise || {};
    }

    let issueRole = 0;
    if (listDetail) {
      issueRole = listDetail.issueRole;
    } else {
      issueRole = adviseDetail.issueRole;
    }

    return (<>
      <AcceptModal
        adviseObj={listDetail || adviseDetail}
        detailThis={(ref) => this.acceptThis = ref}
        callback={() => this.getRefresh()}
      />

      <RejectModal
        advise={advise}
        detailThis={ref => this.rejectThis = ref}
        callback={() => this.getRefresh()}
      />

      <ReOpenModal
        advise={advise}
        detailThis={ref => this.reopenThis = ref}
        callback={() => this.getRefresh()}
      />

      {
        issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <EditSelectStatus
          value={value}
          type={type}
          handleUpdate={(value) => this.handelUpdateState(value)}
          bgHover={bgHover}
          currentUserType={this.getCurrentUserType()}
        />
      }
      {
        issueRole !== ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <span style={{ position: 'relative', top: '-2px' }}>
          <DefineDot
            text={value}
            statusMap={adviseNameMap}
            statusColor={adviseColorDotMap}
          />
        </span>
      }
    </>);
  }
}

const mapStateToProps = (state) => {
  return {
    adviseDetail: state.advise.adviseDetail,
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(EditStatus);
