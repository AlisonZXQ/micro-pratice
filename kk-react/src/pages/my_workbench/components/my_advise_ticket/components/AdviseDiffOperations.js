import React, { Component } from 'react';
import { Divider, message, Menu } from 'antd';
import { connect } from 'dva';
import DropDown from '@components/CustomAntd/drop_down';
import AcceptModal from '@pages/receipt/advise/advise_detail/components/AcceptModal';
import RejectModal from '@pages/receipt/advise/advise_detail/components/RejectModal';
import ReOpenModal from '@pages/receipt/advise/advise_detail/components/ReOpenModal';
import { updateAdviseState4Workbench } from '@services/advise';
import { deleteAdviseItem4Workbench, noticeAdvise } from '@services/advise';
import BusinessHOC from '@components/BusinessHOC';
import { ADVISE_STATUS_MAP } from '@shared/AdviseConfig';
import { ADVISE_TICKET_TABS } from '@shared/WorkbenchConfig';
import { deleteModal } from '@shared/CommonFun';

const MenuItem = Menu.Item;

class AdviseDiffOperations extends Component {
  state = {

  }

  acceptThis = null;
  rejectThis = null;
  deleteThis = null;
  reopenThis = null;

  // 新建/重新打开状态下点击受理和驳回先切换到评估中
  handelTo14 = (state, e) => {
    e.stopPropagation();
    const { record } = this.props;
    const aid = record && record.advise && record.advise.id;
    const params = {
      id: aid,
      state: ADVISE_STATUS_MAP.ASSESS,
    };
    updateAdviseState4Workbench(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.props.dispatch({ type: 'myworkbench/getAdviseCount' });
      this.handelUpdateState4Workbench(state, e);
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handelUpdateState4Workbench = (state, e) => {
    e && e.stopPropagation();
    const { record } = this.props;
    const aid = record && record.advise && record.advise.id;
    // 8驳回 7受理
    if (state === ADVISE_STATUS_MAP.REJECTED) {
      this.rejectThis.setState({ visible: true });
      this.getAdviseDetail();
    } else if (state === ADVISE_STATUS_MAP.ACCEPTED) {
      this.acceptThis.setState({ visible: true });
      this.getAdviseDetail();
    } else if (state === ADVISE_STATUS_MAP.REOPEN) {
      this.reopenThis.setState({ visible: true });
      this.getAdviseDetail();
    }
    else {
      const params = {
        id: aid,
        state,
      };
      updateAdviseState4Workbench(params).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success('状态更新成功！');
        this.props.getList();
        if (state === ADVISE_STATUS_MAP.CANCLE) {
          this.props.dispatch({ type: 'myworkbench/getAdviseCount' });
        }
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  getAdviseDetail = () => {
    const { record } = this.props;
    const aid = record.advise.id;
    this.props.dispatch({ type: 'advise/getAdviseDetail', payload: { id: aid } });
  }

  getButtons = () => {
    const { record, currentUser, filtertype } = this.props;

    const responseUser = record.responseUser || {};
    const submitUser = record.submitUser || {};
    const user = currentUser.user || {};
    const state = record.advise && record.advise.state;

    if (submitUser.id === user.id && filtertype === ADVISE_TICKET_TABS.REPORT) {
      if (state === ADVISE_STATUS_MAP.SOLVED) { // 已解决 -> 关闭4
        return ([<a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.CLOSE, e)}>通过验收</a>,
          <Divider type="vertical" />,
          <a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.REOPEN, e)}>拒绝验收</a>]);
      } else if (state === ADVISE_STATUS_MAP.REJECTED) { // 已驳回
        return ([<a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.REOPEN, e)}>重新开始</a>,
          <Divider type="vertical" />,
          <a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.CLOSE, e)}>同意驳回</a>]);
      } else if (state === ADVISE_STATUS_MAP.CLOSE || state === ADVISE_STATUS_MAP.CANCLE) { // 关闭 or 取消 -> 8已驳回
        return (<a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.REOPEN, e)}>重新开始</a>);
      } else { // 其他
        return ([<a disabled>验收通过</a>,
          <Divider type="vertical" />,
          <a disabled>验收拒绝</a>]);
      }
    } else if (responseUser.id === user.id && filtertype === ADVISE_TICKET_TABS.RESPONSE) {
      if (state === ADVISE_STATUS_MAP.ASSESS) { // 评估中
        return ([<a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.ACCEPTED, e)}>受理</a>,
          <Divider type="vertical" />,
          <a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.REJECTED, e)}>驳回</a>]);
      } else if (state === ADVISE_STATUS_MAP.NEW || state === ADVISE_STATUS_MAP.REOPEN) { // 新建/重新打开
        return ([<a onClick={(e) => this.handelTo14(ADVISE_STATUS_MAP.ACCEPTED, e)}>受理</a>,
          <Divider type="vertical" />,
          <a onClick={(e) => this.handelTo14(ADVISE_STATUS_MAP.REJECTED, e)}>驳回</a>]);
      } else if (state === ADVISE_STATUS_MAP.SOLVING || state === ADVISE_STATUS_MAP.ACCEPTED) { // 解决中 已受理
        return [<a disabled>受理</a>,
          <Divider type="vertical" />,
          <a onClick={(e) => this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.REJECTED, e)}>驳回</a>];
      } else { // 其他
        return ([<a disabled>受理</a>,
          <Divider type="vertical" />,
          <a disabled>驳回</a>]);
      }
    } else {
      return '-';
    }
  }

  handleDelete = () => {
    const { record } = this.props;

    deleteModal({
      title: '提示',
      content: '您确定要删除吗？',
      okCallback: () => {
        deleteAdviseItem4Workbench({ id: record.advise.id }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          this.props.getList();
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }

  noticeUser = (record) => {
    const { isBusiness } = this.props;
    const adviseId = record && record.advise && record.advise.id;
    if (adviseId) {
      noticeAdvise(adviseId).then(res => {
        if (res.code !== 200) return message.error(res.msg);
        message.success(`已${!isBusiness ? 'POPO' : ''}提醒该建议负责人！`);
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  }

  setScroll = () => {
    setTimeout(() => {
      document.getElementById('issueid').scrollIntoView();
      if(this.props.globalLoading) {
        this.setScroll();
      }
    }, 100);
  }

  handleView = (record) => {
    this.props.handleJump(record);
    this.setScroll();
  }

  getSubmitMore = () => {
    const { filtertype, record } = this.props;
    const { notificationState4Comment } = record;
    const state = record.advise && record.advise.state;

    const menu = () => {
      return (<Menu style={{ width: '150px' }}>
        <MenuItem key={"delete"} className='f-tac'>
          <a onClick={(e) => { this.handleView(record) }}>查看留言</a>
        </MenuItem>
        {
          filtertype === ADVISE_TICKET_TABS.REPORT &&
          <MenuItem key={"notice"} className='f-tac'>
            <a onClick={(e) => { this.noticeUser(record) }}>提醒</a>
          </MenuItem>
        }

        {
          ![ADVISE_STATUS_MAP.SOLVED, ADVISE_STATUS_MAP.CLOSE, ADVISE_STATUS_MAP.CANCLE, ADVISE_STATUS_MAP.REJECTED].some(it => it === state) &&
          <MenuItem key={"cancle"} className='f-tac'>
            <a onClick={(e) => { this.handelUpdateState4Workbench(ADVISE_STATUS_MAP.CANCLE) }}>取消</a>
          </MenuItem>
        }

        <MenuItem key={"delete"} className='f-tac'>
          <a onClick={(e) => { this.handleDelete() }}>删除</a>
        </MenuItem>
      </Menu>);
    };

    return (<DropDown
      state={notificationState4Comment}
      overlay={menu()}
    />);
  }

  render() {
    const { adviseDetail } = this.props;

    return (<span>
      <AcceptModal
        adviseObj={adviseDetail || {}}
        detailThis={(ref) => this.acceptThis = ref}
        callback={() => this.props.getList()}
      />

      <RejectModal
        advise={adviseDetail.advise || {}}
        detailThis={(ref) => this.rejectThis = ref}
        callback={() => this.props.getList()}
      />

      <ReOpenModal
        advise={adviseDetail.advise || {}}
        detailThis={(ref) => this.reopenThis = ref}
        callback={() => this.props.getList()}
      />

      {this.getButtons()}
      <span className="u-mgl10">
        {this.getSubmitMore()}
      </span>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    adviseDetail: state.advise.adviseDetail,
    globalLoading: state.loading.global,
  };
};

export default BusinessHOC()(connect(mapStateToProps)(AdviseDiffOperations));
