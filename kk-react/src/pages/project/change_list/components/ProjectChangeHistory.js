import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { history } from 'umi';
import { Table, message, Popover } from 'antd';
import { getProjectChangeVersion } from '@services/project';

class ProjectChangeHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [],
    };
    this.columns = [{
      title: '更新日期',
      dataIndex: 'updatetime',
      render: (text, record) => {
        return record.projectChangeApply && record.projectChangeApply.updatetime
          && moment(record.projectChangeApply.updatetime).format('YYYY-MM-DD HH:mm:ss');
      }
    }, {
      title: '更新人',
      dataIndex: 'realname',
      render: (text, record) => {
        return record.applyUser && record.applyUser.realname;
      }
    }, {
      title: '变更原因',
      dataIndex: 'reason',
      width: '350px',
      render: (text, record) => {
        const length = record.projectChangeApply && record.projectChangeApply.reason && record.projectChangeApply.reason.length;
        if (length) {
          const string = record.projectChangeApply.reason;
          let newString = string;
          // eslint-disable-next-line
          const pattern = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g;
          const arr = newString.match(pattern);
          if (arr && arr.length) {
            arr.forEach(it => {
              newString = newString.replace(it, '<a href="' + it + '" target=_blank>' + it + '</a>');
            });
          }
          return (
            <Popover
              content={<span dangerouslySetInnerHTML={{ __html: newString }}></span>}
            >
              <span
                style={{ maxWidth: '300px' }}
                className={`f-ib f-toe`}
              >
                <span dangerouslySetInnerHTML={{ __html: newString }}></span>
              </span>
            </Popover>
          );
        } else {
          return '-';
        }
      }
    }, {
      title: '变更详情',
      dataIndex: 'link',
      render: (text, record) => {
        const { id } = this.props.location.query;
        const changeId = record.projectChangeApply && record.projectChangeApply.id;
        return (
          <a onClick={() => history.push(`/project/project_change_version?id=${id}&changeId=${changeId}`)}>点击查看</a>
        );
      }
    }];
  }

  componentDidMount() {
    const { id } = this.props.location.query;
    getProjectChangeVersion(id).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ data: res.result });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { data } = this.state;
    return ([
      <Table
        rowKey={record => record.projectChangeApply && record.projectChangeApply.id}
        columns={this.columns}
        dataSource={data}
        pagination={false}
        size="middle"
      />
    ]);
  }
}

export default withRouter(ProjectChangeHistory);
