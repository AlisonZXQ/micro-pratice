import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import moment from 'moment';
import { Card, message, Button, Popconfirm } from 'antd';
import MyIcon from '@components/MyIcon';
import TinyMCE from '@components/TinyMCE';
import { addCommentJIRA } from '@services/requirement';
import { deleteJiraComment, updateJiraComment } from '@services/receipt';
import { queryUser } from '@services/project';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import { getMentionUsers } from '@utils/helper';

import styles from '../index.less';

class index extends Component {
  state = {
    comment: '',
    commetStatus: 'disabled',
    record: {},
    userList: [],
    loading: false,
  }

  componentDidMount() {
    const { issueKey } = this.props;
    if (issueKey) {
      this.getCommentJIRA(issueKey);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.issueKey !== nextProps.issueKey && nextProps.issueKey) {
      this.getCommentJIRA(nextProps.issueKey);
    }

    if (this.props.bottomActive !== nextProps.bottomActive) {
      this.setState({ commetStatus: 'comment' });
    }

    if (this.props.drawerIssueId !== nextProps.drawerIssueId) {
      this.setState({ commetStatus: 'disabled' });
    }
  }

  getCommentJIRA = (key) => {
    const issuekey = key || this.props.issueKey;
    const params = {
      issuekey,
      offset: 0,
      limit: 20,
    };
    this.props.dispatch({ type: 'requirement/getCommentJIRA', payload: params });
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
    const { issueKey } = this.props;
    const { comment } = this.state;
    if (issueKey) {
      const params = {
        issuekey: issueKey,
        body: comment,
        noticeEmailList: getMentionUsers(comment).map(it => it.email) || [],
      };

      this.setState({ loading: true });
      addCommentJIRA(params).then((res) => {
        this.setState({ loading: false });
        if (res.code !== 200) return message.error(res.msg);
        message.success('保存备注成功！');
        this.setState({ comment: '' });
        this.getCommentJIRA();
      }).catch((err) => {
        this.setState({ loading: false });
        return message.error(`保存备注异常，${err || err.message}`);
      });
    }
  }

  handleDelete = (id) => {
    const { issueKey } = this.props;
    const params = {
      id,
      issuekey: issueKey,
    };
    deleteJiraComment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('删除备注成功！');
      this.getCommentJIRA();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getCommentForm = () => {
    const { currentUser } = this.props;
    const { comment, commetStatus, loading } = this.state;
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
          <a href="#bottom">
            <div
              className={`f-csp ${styles.sendButton}`}
              onClick={() => this.setState({ commetStatus: 'comment', record: {}, comment: '' })}>
              点击发表评论
            </div>
          </a>
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

  handleUpdate = () => {
    const { issueKey } = this.props;
    const { record, comment } = this.state;
    const params = {
      id: record.id,
      body: comment,
      issuekey: issueKey
    };
    updateJiraComment(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('备注更新成功！');
      this.getCommentJIRA();
      this.setState({ commetStatus: 'disabled', comment: '' });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  isSelfRemark = (body, loginRealname) => {
    //TODO 由于JIRA接口前缀是人姓名，需要判断时只能通过此来校验是否为自己的备注，因此可能存在重名时判断有误的问题
    return body.indexOf(loginRealname) === 0;
  }

  getIssueRole = () => {
    const { objectiveDetail, adviseDetail, requirementDetail, taskDetail, bugDetail, detail, type } = this.props;
    let issueRole = ISSUE_ROLE_VALUE_MAP.READ;
    // detail来自单据抽屉
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
    else if (type === 'task' || type === "subTask") {
      issueRole = taskDetail.issueRole;
    }
    else if (type === 'bug') {
      issueRole = bugDetail.issueRole;
    }

    return issueRole;
  }

  getBodyJIRA = (it) => {
    const time = moment(it.updated).format('YYYY-MM-DD HH:mm:ss');
    const arr = it.body.split(':');
    const issueRole = this.getIssueRole();
    const { currentUser } = this.props;
    const user = currentUser.user || {};

    return (<div className={styles.parent}>
      <div className={styles.parentUser}>
        <span className={styles.lastWord}>
          {
            arr[0].slice(arr[0].length - 2)
          }
        </span>
      </div>

      <div className={styles.parentDetail}>
        <div className={styles.time}>
          {time}
          <span className={styles.show}>
            {
              (issueRole === ISSUE_ROLE_VALUE_MAP.MANAGE || this.isSelfRemark(it.body, user.realname)) ?
                <Popconfirm
                  title="确定删除吗?"
                  onConfirm={() => this.handleDelete(it.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <MyIcon type="icon-shanchupinglun" className={`${styles.icon} f-fs2 f-csp u-mgl10`} />
                </Popconfirm>
                :
                ''
            }
          </span>
        </div>
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: this.getContent(it.body) }}>
        </div>
      </div>
    </div>);
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
    const { commentJIRA } = this.props;
    let comments = commentJIRA.comments || [];

    function compare(a, b) { //排序
      return moment(b.updated).valueOf() - moment(a.updated).valueOf();
    }
    comments.sort(compare);

    return (<div>
      {
        comments && !!comments.length && comments.map(it => this.getBodyJIRA(it))
      }
    </div>
    );
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
    commentJIRA: state.requirement.commentJIRA,
    currentUser: state.user.currentUser,
    bottomActive: state.receipt.bottomActive,
    drawerIssueId: state.receipt.drawerIssueId,
  };
};

export default withRouter(connect(mapStateToProps)(index));
