import React, { useState, memo, useCallback, useRef, useEffect } from 'react';
import { message, Row, Col, Dropdown, Menu, Popover } from 'antd';
import uuid from 'uuid';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'dva';
import { Link } from 'umi';
import EpIcon from '@components/EpIcon';
import EditNoWidthTitle from '@components/EditNoWidthTitle';
import MyIcon from '@components/MyIcon';
import SubscribeUser from '@pages/receipt/components/subscribe_user';
import EditSelectUser from '@components/EditSelectUser';
import CreateLog from '@pages/receipt/components/create_log';
import CopyAs from '@pages/receipt/components/copy_as';
import { warnModal, handleSearchUser } from '@shared/CommonFun';
import AttachmentModal from '@pages/receipt/components/attachment_modal';

import { updateAdvise, updateRequireemail as updateAdviseRequire, deleteAdviseItem } from '@services/advise';
import { updateRequirement, updateRequireemail as updateRequirementRequire, deleteRequireItem } from '@services/requirement';
import { updateObjective, updateRequireemail as updateObjectiveRequire, deleteObjective } from '@services/objective';
import { updateBug, updateRequireemail as updateBugRequire, deleteBugItem } from '@services/bug';
import { updateTask, updateRequireemail as updateTaskRequire, deleteTaskItem } from '@services/task';
import { updateTicket, updateRequireemail as updateTicketRequire, deleteTicketItem } from '@services/ticket';

import EditStatusAdvise from '@pages/receipt/components/drawer_shared/advise/EditStatus';
import EditStatusRequrirement from '@pages/receipt/components/drawer_shared/requirement/EditStatus';
import EditStatusObjective from '@pages/receipt/components/drawer_shared/objective/EditStatus';
import EditStatusBug from '@pages/receipt/components/drawer_shared/bug/EditStatus';
import EditStatusTask from '@pages/receipt/components/drawer_shared/task/EditStatus';
import EditStatusTicket from '@pages/receipt/components/drawer_shared/ticket/EditStatus';

import { ISSUE_ROLE_VALUE_MAP, connTypeMapIncludeProject } from '@shared/CommonConfig';
import { deleteModal, getUserList } from '@shared/CommonFun';
import { LIMITED_RECEIPT } from '@shared/ReceiptConfig';

import { iconMap, detailPatchMap, urlJumpMap, issueUrlMap, detailPatchSaveMap, RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';

import styles from './index.less';
import { history } from 'umi';

const MenuItem = Menu.Item;

const EditStatusMap = {
  'advise': EditStatusAdvise,
  'requirement': EditStatusRequrirement,
  'bug': EditStatusBug,
  'objective': EditStatusObjective,
  'task': EditStatusTask,
  'subTask': EditStatusTask,
  'ticket': EditStatusTicket
};

const updateBasicMap = {
  'advise': updateAdvise,
  'requirement': updateRequirement,
  'bug': updateBug,
  'objective': updateObjective,
  'task': updateTask,
  'subTask': updateTask,
  'ticket': updateTicket
};

const updateRequireMap = {
  'advise': updateAdviseRequire,
  'requirement': updateRequirementRequire,
  'bug': updateBugRequire,
  'objective': updateObjectiveRequire,
  'task': updateTaskRequire,
  'subTask': updateTaskRequire,
  'ticket': updateTicketRequire
};

const deleteItem = {
  'advise': deleteAdviseItem,
  'requirement': deleteRequireItem,
  'bug': deleteBugItem,
  'objective': deleteObjective,
  'task': deleteTaskItem,
  'subTask': deleteTaskItem,
  'ticket': deleteTicketItem
};

let logRef = '';

/**
 * @param type advise,objective,....
 * @param detail adviseDetail, objectiveDetail...
 */
function Index(props) {
  const childRef = useRef();
  const { detail, type: t, issueId, attachmentCount } = props;
  const type = t === 'subTask' ? 'task' : t;

  const [userList, setUserList] = useState([]);
  const [visible, setVisible] = useState(false);
  const issue = detail[type] || {};
  const responseUser = detail.responseUser || {};
  const submitUser = detail.submitUser || {};
  const requireUser = detail.requireUser || {};
  const product = detail.product || {};
  const project = detail.project || {};
  const jirakey = type === 'ticket' ? issue.jiraKey : issue.jirakey;
  const okrId = issue.okrId;
  const epId = issue.id;

  let EditStatus = EditStatusMap[type];

  useEffect(()=>{
    return ()=>{ //卸载时执行
      props.dispatch({ type: 'receipt/saveCurrentTab', payload: '' });
    };
  }, []);

  const handleSearchUserFun = useCallback((value) => {
    handleSearchUser(value, (result) => {
      setUserList(result);
    });
  }, []);

  const updateFun = useCallback((key, value) => {
    const updateBasic = updateBasicMap[type];
    const updateRequire = updateRequireMap[type];

    const params = {
      id: epId,
      [key]: value,
    };

    let promise = null;
    if (key === 'requireemail' || key === 'requireEmail') {
      promise = updateRequire(params);
    } else {
      promise = updateBasic(params);
    }
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('更新成功！');
      props.refreshFun();
      props.dispatch({ type: detailPatchMap[type], payload: { id: epId } });
      // 变换负责人的时候更新关注人列表
      if ((type === 'bug' || type === 'task') && (key === 'responseemail' || key === 'responseEmail')) {
        const params = {
          conntype: connTypeMapIncludeProject[type],
          connid: epId,
        };
        props.dispatch({ type: 'requirement/getSubscribeByType', payload: params });
      }
    }).catch(err => {
      return message.error(err || err.message);
    });
  }, [type, epId]);

  const updateFunRole = useCallback((key, value) => {
    setVisible(false);
    if (value === LIMITED_RECEIPT.LIMITED) {
      warnModal({
        title: '您确定要设置为受限单据么？',
        content: '设置为受限单据后，此单据仅报告人/验证人/负责人/关注人可见。',
        okCallback: () => {
          updateFun(key, value);
        }
      });
    } else {
      updateFun(key, value);
    }
  }, [updateFun]);

  const handleDelete = useCallback(() => {
    deleteModal({
      title: '你确认删除单据吗？',
      okCallback: () => {
        deleteItem[type]({ id: epId }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除单据成功！');
          if (props.refreshFun) {
            props.refreshFun();
          }
          props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: '' });
          props.dispatch({ type: detailPatchSaveMap[type], payload: {} });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    });
  }, [epId, type]);

  const closeVisible = () => {
    setVisible(false);
  };

  const menuMore = useCallback((item) => {
    const { productUserState } = detail;
    return (<Menu>
      <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
        <CopyAs
          type={type}
          record={detail}
          closeVisible={closeVisible}
          getList={props.refreshFun}
        />
      </MenuItem>

      {
        detail.issueRole !== ISSUE_ROLE_VALUE_MAP.READ &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          {item.roleLimitType === LIMITED_RECEIPT.NOT_LIMITED &&
            <a
              onClick={() => updateFunRole('roleLimitType', LIMITED_RECEIPT.LIMITED)}
            >设置为受限单据</a>
          }
          {item.roleLimitType === LIMITED_RECEIPT.LIMITED &&
            <a
              onClick={() => updateFunRole('roleLimitType', LIMITED_RECEIPT.NOT_LIMITED)}
            >取消设置为受限单据</a>
          }
        </MenuItem>
      }

      {
        productUserState &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => {
            logRef.openModal();
            setVisible(false);
          }}>登记日志</a>
        </MenuItem>
      }

      { detail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE &&
        <MenuItem style={{ textAlign: 'center', height: '38px', lineHeight: '30px' }}>
          <a onClick={() => {
            handleDelete();
            setVisible(false);
          }}>删除</a>
        </MenuItem>
      }

    </Menu>);
  }, [handleDelete, detail, type, updateFunRole]);

  const parentLink = () => {
    const { fullLinkData } = props;
    if (t === 'requirement') {
      const pType = 'objective';
      const item = fullLinkData.objectiveSet || [];
      return item.length ? <span>
        <Popover content={item[0].name}>
          <Link className="f-csp" to={`${urlJumpMap[pType]}-${item[0].id}`} target="_blank">
            <EpIcon type={iconMap[pType]} className={`${styles.icon}`} />
            <span className={styles.issueId}>{`Objective-${item[0].id}`}</span>
          </Link>
        </Popover>
        <span className='u-pd5'>/</span>
      </span> : <span></span>;
    } else if (t === 'task') {
      const set = fullLinkData.objectiveSet && fullLinkData.objectiveSet.length ?
        fullLinkData.objectiveSet :
        fullLinkData.requirementSet;
      const pType = fullLinkData.objectiveSet && fullLinkData.objectiveSet.length ?
        'objective' : 'requirement';
      return set && set.length ? <span>
        <Popover content={set[0].name}>
          <Link className="f-csp" to={`${urlJumpMap[pType]}-${set[0].id}`} target="_blank">
            <EpIcon type={iconMap[pType]} className={`${styles.icon}`} />
            <span className={styles.issueId}>
              {`${pType === 'objective' ? 'Objective' : 'Requirement'}-${set[0].id}`}
            </span>
          </Link>
        </Popover>
        <span className='u-pd5'>/</span>
      </span> : <span></span>;
    } else if (t === 'subTask') {
      const pType = 'task';
      const item = fullLinkData.taskSet;
      return item && item.length ? <span>
        <Popover content={item[0].name}>
          <Link className="f-csp" to={`${urlJumpMap[pType]}-${item[0].id}`} target="_blank">
            <EpIcon type={iconMap[pType]} className={`${styles.icon}`} />
            <span className={styles.issueId}>{`Task-${item[0].id}`}</span>
          </Link>
        </Popover>
        <span className='u-pd5'>/</span>
      </span> : <span></span>;
    }
  };

  return (<div className={styles.container}>
    <Row>
      <CreateLog
        onRef={(ref) => logRef = ref}
        currentUser={props.currentUser}
        productid={props && props.lastProduct && props.lastProduct.id}
        connType={RECEIPT_LOG_TYPE[t.toUpperCase()]}
        connId={epId}
      />
      <Col span={15}>
        {parentLink()}
        <Link className="f-csp" to={`${urlJumpMap[t]}-${epId}`} target="_blank">
          <EpIcon type={iconMap[type]} className={`${styles.icon}`} />
          <span className={styles.issueId}>{issueId}</span>
        </Link>

        {
          jirakey &&
          <span className="u-mgl10 f-fs1">
            <a href={`http://jira.netease.com/browse/${jirakey}`} target="_blank" rel="noopener noreferrer">
              <div className={styles.headerTag}>JIRA：{jirakey}</div>
            </a>
          </span>
        }
        {
          !!okrId &&
          <span className="u-mgl10 f-fs1">
            <a href={`http://okr.netease.com/index.html#/okr/detail/${okrId}`} target="_blank" rel="noopener noreferrer">
              <div className={styles.headerTag}>OKR-{okrId}</div>
            </a>
          </span>
        }
        <CopyToClipboard
          style={{ display: 'inline' }}
          text={`${issueId}: ${issue.name} ${window.location.origin}${issueUrlMap[type]}-${epId}` || ''}
          onCopy={() => message.success('复制成功')}
        >
          <MyIcon type="icon-fuzhi" className={`${styles.copy} issueIcon u-mgl5`} />
        </CopyToClipboard>

        {/* {
          !!project.id &&
          <span className={`${styles.headerTag} u-mgl10`}>
            <a href={`/v2/project/detail/?id=${project.id}`} target="_blank" rel="noopener noreferrer">
              项目{project.projectCode}
            </a>
          </span>
        } */}

      </Col>

      <Col span={9}>
        <span className="u-mgl20">
          <SubscribeUser
            type={type}
            connid={issue.id}
            issueRole={detail.issueRole}
            productid={product.id}
          />
        </span>
        {
          (detail.issueRole === ISSUE_ROLE_VALUE_MAP.EDIT || detail.issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE) ?
            <span
              onClick={() => {
                childRef.current.changeVisible();
                document.getElementById('issueid').scrollIntoView();
                props.dispatch({ type: 'receipt/saveCurrentTab', payload: 'attachment' });
              }}
              className={`${styles.opreationLinkIcon} f-iaic`}>
              <MyIcon type="icon-link" />
              <span>
                {attachmentCount === 0 ? '' : `(${attachmentCount})`}
              </span>
            </span>
            :
            ''
        }
        <AttachmentModal
          cRef={childRef}
          connid={issue.id}
          type={type}
          issueRole={detail.issueRole}
        />

        <a href="#bottom" onClick={() => {
          props.dispatch({ type: 'receipt/saveBottomActive', payload: uuid() });
          props.dispatch({ type: 'receipt/saveCurrentTab', payload: 'remark' });
        }}>
          <MyIcon type="icon-remark" className={styles.opreationIcon} />
        </a>

        {
          <Dropdown
            overlay={menuMore(issue)}
            visible={visible}
            onVisibleChange={(visible) => setVisible(visible)}
            trigger={['click']}>
            <MyIcon type="icon-more" className={styles.opreationIcon} />
          </Dropdown>
        }
      </Col>
    </Row>

    <div className="u-mgt10 u-mgb10">
      <span style={{ position: 'relative', top: '-1px' }}>
        {!!issue.parentid && <span className={`${styles.headerTag} u-mgr10`}>子任务</span>}
      </span>

      <EditNoWidthTitle
        title={issue.name}
        issueRole={detail.issueRole}
        handleSave={(value) => updateFun('name', value)}
        titleClassName={styles.editTitle}
      />
    </div>

    <Row style={{ display: 'flex', alignItems: 'center' }}>
      <Col span={4}>
        <span style={{ position: 'relative', top: '0px' }}>
          <EditStatus
            value={issue.state}
            type={type}
            bgHover={true}
            {...props}
          />
        </span>
      </Col>

      <Col span={6}>
        负责人：
        <EditSelectUser
          issueRole={detail.issueRole}
          value={responseUser.email}
          dataSource={getUserList(responseUser, userList)}
          handleSearch={handleSearchUserFun}
          handleSaveSelect={(value) => updateFun(type === 'ticket' ? 'responseEmail' : 'responseemail', value)}
          required
          type="drawer"
        />
      </Col>

      <Col span={6}>
        报告人：
        <EditSelectUser
          issueRole={detail.issueRole}
          value={submitUser.email}
          dataSource={getUserList(submitUser, userList)}
          handleSearch={handleSearchUserFun}
          handleSaveSelect={(value) => updateFun(type === 'ticket' ? 'submitEmail' : 'submitemail', value)}
          required
          type="drawer"
        />
      </Col>

      {
        type !== 'advise' && type !== 'ticket' &&
        <Col span={6}>
          验证人：
          <EditSelectUser
            issueRole={detail.issueRole}
            value={requireUser.email}
            dataSource={getUserList(requireUser, userList)}
            handleSearch={handleSearchUserFun}
            handleSaveSelect={(value) => updateFun('requireemail', value)}
            required={type === 'objective' ? true : false}
            type="drawer"
          />
        </Col>
      }

    </Row>
  </div >);
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    lastProduct: state.product.lastProduct,
    fullLinkData: state.receipt.fullLinkData,
  };
};

export default memo(connect(mapStateToProps)(Index));
