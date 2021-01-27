import React, { Component } from 'react';
import { Popover } from 'antd';
import { Link } from 'umi';
import styles from './index.less';

class index extends Component {
  state = {
  };

  componentDidMount() {

  }

  rtotalContent = (list) => {
    const { type } = this.props;
    let url = '';
    if (type === 'task') {
      url = '/my_workbench/taskdetail/Task';
    } else {
      url = '/my_workbench/bugdetail/Bug';
    }
    return <span>
      <span>
        {type === 'task' ? '关联任务：' : '关联缺陷：'}
        <span
          className={styles.showrTotal}>
          {list && list.length}
        </span>个
      </span>
      {list && list.map((item) => {
        return <div>
          <Link
            onClick={(e) => e.stopPropagation()}
            to={`${url}-${item.id}`}>{item.name}</Link>
        </div>;
      })}
    </span>;
  }

  render() {
    const { record, type, issuetype } = this.props;
    let list = [];
    if (type === 'task') {
      list = (record && record.taskRef4TicketVOList) || [];
    } else {
      list = (record && record.bugRef4TicketVOList) || [];
    }
    return (<span>
      <Popover
        content={this.rtotalContent(list)}
        title={record[issuetype].name}
        trigger="hover">
        <span className={styles.rtotalStyle}>{list && list.length}</span>
      </Popover>
    </span>);
  }
}

export default index;
