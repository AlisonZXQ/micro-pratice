import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import moment from 'moment';
import { Card, message, Button, Popconfirm, Empty } from 'antd';
import MyIcon from '@components/MyIcon';
import TinyMCE from '@components/TinyMCE';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import { getIssueKey, getMentionUsers } from '@utils/helper';
import { addCommentEP } from '@services/requirement';
import { queryUser } from '@services/project';
import { deleteComment, updateEpComment } from '@services/receipt';

import styles from '../index.less';

class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      commetStatus: 'disabled',
      record: {},
      userList: [],
      loading: false,
    };
    this.mention = null;
  }

  componentDidMount() {
    if (this.props.epKey) {
      this.getCommentEP(this.props.epKey);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.epKey !== nextProps.epKey) {
      this.getCommentEP(nextProps.epKey);
    }

    if (this.props.bottomActive !== nextProps.bottomActive) {
      this.setState({ commetStatus: 'comment' });
    }

    if (this.props.drawerIssueId !== nextProps.drawerIssueId) {
      this.setState({ commetStatus: 'disabled' });
    }
  }

  getCommentEP = (epKey) => {
    const { type, epKey: propsKey } = this.props;
    const params = {
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: getIssueKey() || epKey || propsKey,
    };
    this.props.dispatch({ type: 'requirement/getCommentEP', payload: params });
  }

  handleSearch = (value) => {
    const { productid } = this.props;
    if (value && value.trim().length && value.trim().length > 1) {
      const str = value.slice(1);
      const params = {
        value: str,
        limit: 20,
        offset: 0,
        productid,
      };
      this.setState({ loading: true });
      queryUser(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        if (res.result) {
          this.setState({ userList: res.result });
        }
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`${err || err.msg}获取人员异常`);
      });
    }
  }

  handleAdd = () => {
    const { type, epKey } = this.props;
    const { comment, record } = this.state;

    const params = {
      conntype: RECEIPT_LOG_TYPE[type.toUpperCase()],
      connid: getIssueKey() || epKey,
      content: comment,
      recommentid: record.id || 0,
      noticeEmailList: getMentionUsers(comment).map(it => it.email) || [],
    };

    this.setState({ loading: true });
    addCommentEP(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      message.success('保存备注成功！');
      this.setState({ comment: '', commetStatus: 'disabled' });
      this.getCommentEP();
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`保存备注异常，${err || err.message}`);
    });
  }

  handleUpdate = () => {
    const { record, comment } = this.state;
    const params = {
      id: record.id,
      content: comment,
    };
    updateEpComment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('备注更新成功！');
      this.getCommentEP();
      this.setState({ commetStatus: 'disabled', comment: '' });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  handleDelete = (id) => {
    deleteComment({ id }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除备注成功！');
      this.getCommentEP();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getCommentForm = () => {
    const { currentUser } = this.props;
    const { comment, commetStatus, record, loading } = this.state;
    const userObj = currentUser && currentUser.user ? currentUser.user : {};
    const realname = userObj.realname || '';
    const lastTwoWord = realname && realname.length > 2 ? realname.slice(realname.length - 2) : realname;

    return (<div className={styles.comment}>
      <div className={`${styles.commentUser}`}>
        <span className={styles.lastWord}>
          {lastTwoWord}
        </span>
      </div>

      <div className={styles.commentForm}>
        {
          commetStatus === 'comment' &&
          <div>
            <TinyMCE height={200} placeholder="请输入详情描述" value={comment} onChange={(value, editor) => this.setState({ comment: value })} autoFocus />
            <div className="u-mgt10">
              <Button type="primary" className="u-mgr10" onClick={() => this.handleAdd()} loading={loading}>提交</Button>
              <Button onClick={() => this.setState({ commetStatus: 'disabled' })}>取消</Button>
            </div>
          </div>
        }
        {
          commetStatus === 'disabled' &&
          <a>
            <div
              className={`f-csp ${styles.sendButton}`}
              onClick={() => this.setState({ commetStatus: 'comment', record: {}, comment: '' })}
            >
              点击发表评论
            </div>
          </a>
        }
        {
          commetStatus === 'reply' &&
          <div>
            <div className={styles.reply}>
              回复{record.realname}：{record.content}
            </div>
            <TinyMCE height={200} placeholder="请输入详情描述" value={comment} onChange={(value, editor) => this.setState({ comment: value })} autoFocus />
            <div className="u-mgt10">
              <Button type="primary" className="u-mgr10" onClick={() => this.handleAdd()} loading={loading}>提交</Button>
              <Button onClick={() => this.setState({ commetStatus: 'disabled' })}>取消</Button>
            </div>
          </div>
        }
        {
          commetStatus === 'edit' &&
          <div>
            <TinyMCE height={200} placeholder="请输入详情描述" value={comment} onChange={(value, editor) => this.setState({ comment: value })} autoFocus />
            <div className="u-mgt10">
              <Button type="primary" className="u-mgr10" onClick={() => this.handleUpdate()} loading={loading}>更新</Button>
              <Button onClick={() => this.setState({ commetStatus: 'disabled' })}>取消</Button>
            </div>
          </div>
        }
      </div>
    </div>);
  }

  isSelfRemark = (addUid, loginUid) => {
    return addUid === loginUid;
  }

  getBodyEP = (it) => {
    const lastTwoWord = it.realname && it.realname.length > 2 ? it.realname.slice(it.realname.length - 2) : it.realname;
    const time = moment(it.updatetime).format('YYYY-MM-DD HH:mm:ss');
    const issueRole = this.getIssueRole();
    const { currentUser } = this.props;

    return (<div>
      <div className={styles.parent}>
        <div className={styles.parentUser}>
          <span className={styles.lastWord}>
            {lastTwoWord}
          </span>
        </div>

        <div className={styles.parentDetail}>
          <div className={styles.time}>
            {it.realname} {time}
            <span className={styles.show}>
              <a href={"#bottom"}>
                <MyIcon type="icon-huifu" className={`${styles.icon} f-fs2 u-mgr10 u-mgl10 f-csp`} onClick={() => this.setState({ record: it, commetStatus: 'reply' })} />
              </a>

              {
                (issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE || this.isSelfRemark(it.uid, currentUser.user.id)) ?
                  <Popconfirm
                    title="确定删除吗?"
                    onConfirm={() => this.handleDelete(it.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <MyIcon type="icon-shanchupinglun" className={`${styles.icon} f-fs2 f-csp`} />
                  </Popconfirm>
                  :
                  ''
              }

            </span>
          </div>
          <div className={styles.body} dangerouslySetInnerHTML={{ __html: this.getContent(it.content) }} />
        </div>
      </div>
      {
        !!it.children.length &&
        <div className={styles.childrenBody}>
          <MyIcon type="icon-huifukuangsanjiaoxing" className={styles.arrow} />
          <div className={styles.childrenC}>
            {
              it.children.map(children => this.getChildren(children))
            }
          </div>
        </div>
      }
    </div>);
  }

  getChildren = (it) => {
    const lastTwoWord = it.realname && it.realname.length > 2 ? it.realname.slice(it.realname.length - 2) : it.realname;
    const time = moment(it.updatetime).format('YYYY-MM-DD HH:mm:ss');

    return (
      <div className={styles.children}>
        <div className={styles.parentUser}>
          <span className={styles.lastWord}>
            {lastTwoWord}
          </span>
        </div>

        <div className={styles.parentDetail}>
          <div className={styles.time}>
            {it.realname} {time}
            <span className={styles.show}>
              <Popconfirm
                title="确定删除吗?"
                onConfirm={() => this.handleDelete(it.id)}
                okText="确定"
                cancelText="取消"
              >
                <MyIcon type="icon-shanchupinglun" className={`${styles.icon} f-fs2 f-csp u-mgl10`} />
              </Popconfirm>
            </span>
          </div>
          <div className={styles.body} dangerouslySetInnerHTML={{ __html: this.getContent(it.content) }} />
        </div>
      </div>
    );
  }

  getContent = (text) => {
    let content = text;
    if (!content) {
      return '--';
    }
    const _reg = /(\[\~\w+@[\w.]+\])/g;
    content = content.replace(_reg, (str) => {
      var id = str.indexOf("@");
      return (
        '<a href="http://popo.netease.com/static/html/open_popo.html?ssid=' +
        str.substring(2, str.length - 1) +
        '&sstp=0" target="_blank" title="打开泡泡联系">' +
        str.substring(2, id) +
        "</a>"
      );
    });
    return content;
  }

  getCommentList = () => {
    const { commentEP } = this.props;
    if(commentEP && commentEP.length > 0) {
      return (<div>
        {
          commentEP.map(it => this.getBodyEP(it))
        }
      </div>
      );
    }else {
      return <Empty />;
    }

  }

  getIssueRole = () => {
    const { objectiveDetail, adviseDetail, requirementDetail, taskDetail, bugDetail, detail, type } = this.props;
    let issueRole = ISSUE_ROLE_VALUE_MAP.READ;
    // detail的情况来自单据抽屉
    if (detail) {
      issueRole = detail.issueRole;
    } else if (type === 'advise') {
      issueRole = adviseDetail.issueRole;
    }
    else if (type === 'requirement') {
      issueRole = requirementDetail.issueRole;
    }
    else if (type === 'objective') {
      issueRole = objectiveDetail.issueRole;
    }
    else if (type === 'task' || type === 'subTask') {
      issueRole = taskDetail.issueRole;
    }
    else if (type === 'bug') {
      issueRole = bugDetail.issueRole;
    }
    return issueRole;
  }

  render() {
    return (
      <div className={styles.container}>
        <Card>
          <div style={{ padding: '0px 10px 10px 10px' }}>
            {
              this.getCommentList()
            }
            {
              this.getCommentForm()
            }
          </div>

          <div id="bottom"></div>

        </Card>
      </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    commentEP: state.requirement.commentEP,
    currentUser: state.user.currentUser,
    bottomActive: state.receipt.bottomActive,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(index));
