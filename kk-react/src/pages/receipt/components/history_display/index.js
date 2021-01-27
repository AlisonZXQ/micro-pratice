import React, { Component } from 'react';
import { Timeline, Table } from 'antd';
import MyIcon from '@components/MyIcon';
import { getHumanTime } from '@utils/helper';
import styles from './index.less';

const TimelineItem = Timeline.Item;
const isEmpty = (text) => {
  return text ? text : '-';
};

class HistoryDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleSystem = (it) => {
    const { keyMap, name } = this.props;
    const obj = it[name] || {};
    const changelogDefault = obj.changelog ? JSON.parse(obj.changelog) : [];
    const changelog = changelogDefault instanceof Array ? changelogDefault : [changelogDefault];

    const columns = [{
      title: '字段名',
      dataIndex: 'key',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line' }}>{isEmpty(keyMap[record.key])}</div>;
      }
    }, {
      title: '原值',
      dataIndex: 'old',
      render: (text, record) => {
        return <div
          style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: isEmpty(record.preventvalue) }}
        ></div>;
      }
    }, {
      title: '新值',
      dataIndex: 'new',
      render: (text, record) => {
        return <div
          style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: isEmpty(record.newvalue) }}
        ></div>;
      }
    }];

    return <Table
      columns={columns}
      dataSource={changelog}
      pagination={false}
    />;
  }

  handleCustom = (it) => {
    const { name } = this.props;
    const obj = it[name] || {};
    const changelogDefault = obj.changelog ? JSON.parse(obj.changelog) : [];
    const changelog = changelogDefault instanceof Array ? changelogDefault : [changelogDefault];

    const columns = [{
      title: '字段名',
      dataIndex: 'key',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line' }}>{isEmpty(text)}</div>;
      }
    }, {
      title: '原值',
      dataIndex: 'preventvalue',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: isEmpty(text) }}></div>;
      }
    }, {
      title: '新值',
      dataIndex: 'newvalue',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: isEmpty(text) }}></div>;
      }
    }];
    return <Table
      columns={columns}
      dataSource={changelog}
      pagination={false}
    />;
  }

  handleComment = (it) => {
    const { name } = this.props;
    const obj = it[name] || {};
    const changelogDefault = obj.changelog ? JSON.parse(obj.changelog) : [];
    const changelog = changelogDefault instanceof Array ? changelogDefault : [changelogDefault];

    const columns = [{
      title: '动作',
      dataIndex: 'key',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }}>
          {
            isEmpty(record.action === 'add' ? '添加' : it.action === 'update' ? '更新' : '删除')
          }
        </div>;
      }
    }, {
      title: '原值',
      dataIndex: 'preventvalue',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: isEmpty(text) }}>
        </div>;
      }
    }, {
      title: '新值',
      dataIndex: 'newvalue',
      render: (text, record) => {
        return <div style={{ whiteSpace: 'pre-line', width: '200px', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: isEmpty(text) }}></div>;
      }
    }];

    return <Table
      columns={columns}
      dataSource={changelog}
      pagination={false}
    />;
  }

  getTitle = (it) => {
    const { titleMap, name, historyType } = this.props;
    const obj = it[name] || {};
    const type = obj.type;
    let realname = '';
    if (it.optUser && it.optUser.realname) {
      realname = it.optUser.realname;
    } else if (it[name] && it[name].optuid === -1) {
      realname = '系统触发';
    }

    const des = (type) => {
      switch (type) {
        case historyType['system_field']:
          return this.handleSystem(it);
        case historyType['custom_field']:
          return this.handleCustom(it);
        case historyType['comment']:
          return this.handleComment(it);
        default:
          return titleMap[type];
      }
    };

    return (<div>
      <span className={styles.changeName}>{realname}</span>
      {titleMap[type] ?
        des(type) :
        '进行了改变'}
    </div>);
  }

  getAttachment = (it) => {
    const { name } = this.props;
    const obj = it[name] || {};
    const changelogDefault = obj.changelog ? JSON.parse(obj.changelog) : [];
    const changelog = changelogDefault instanceof Array ? changelogDefault : [changelogDefault];
    return (changelog.map(it => <span>
      {
        it.action === 'add' ? '添加了附件' : '删除了附件'
      }
      {
        <a>{it.newvalue}</a>
      }
    </span>));
  }

  getSubscriber = (it) => {
    const { name } = this.props;
    const obj = it[name] || {};
    const changelogDefault = obj.changelog ? JSON.parse(obj.changelog) : [];
    const changelog = changelogDefault instanceof Array ? changelogDefault : [changelogDefault];

    return (changelog.map(it => <span>
      {
        it.action === 'add' ? '添加了关注人' : '删除了关注人'
      }
      {
        <a>{it.newvalue}</a>
      }
    </span>));
  }

  getDes = (it) => {
    const { historyType, name } = this.props;
    const obj = it[name] || {};
    const type = obj.type;
    switch (type) {
      case historyType['attachment']:
        return this.getAttachment(it);
      case historyType['subscriber']:
        return this.getSubscriber(it);
      default:
        return null;
    }
  }

  render() {
    const { history, name } = this.props;
    const len = history.length - 1;
    const historyDis = history || [];

    history.sort((a, b) => { return b[name] && b[name].addtime - a[name] && a[name].addtime });

    return (<span className={styles.timeLineStyle}>
      <Timeline>
        {
          historyDis.map((it, index) => (
            <TimelineItem dot={index === len ? <MyIcon type="icon-xiangmudongtaiduigou" /> : <MyIcon type="icon-xiangmudongtaiyuanquan" />}>
              <p style={{ marginBottom: '0.2em' }}>{getHumanTime(it[name] && it[name].addtime)}</p>
              <p style={{ marginBottom: '0.4em' }}>{this.getTitle(it)}</p>
              <p style={{ marginBottom: '0.4em' }}>{this.getDes(it)}</p>
            </TimelineItem>
          ))
        }
      </Timeline>
    </span>);
  }
}

export default HistoryDisplay;
