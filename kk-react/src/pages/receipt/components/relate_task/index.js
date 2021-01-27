import React, { Component } from 'react';
import { Popover, message } from 'antd';
import { Link } from 'umi';
import { getRelationLink } from '@services/receipt';
import { connTypeMap } from '@shared/ReceiptConfig';
import styles from './index.less';

class index extends Component {
  state = {
    rtotalData: []
  };

  componentDidMount() {

  }

  rtotalContent = () => {
    const { rtotalData } = this.state;
    return <span>
      <span>
        一级拆分：<span
          className={styles.showrTotal}>
          {rtotalData && rtotalData.length}
        </span>个
      </span>
      {rtotalData && rtotalData.map((item) => {
        return <div>
          <Link
            onClick={(e) => e.stopPropagation()}
            to={`/my_workbench/taskdetail/Task-${item.id}`}>{item.name}</Link>
        </div>;
      })}
    </span>;
  }

  getRtotalData = (id) => {
    const { issuetype } = this.props;
    this.setState({ rtotalData: [] });
    const params = {
      id: id,
      type: connTypeMap[issuetype],
    };
    getRelationLink(params).then((res) => { //下级任务数据
      if (res.code !== 200) { return message.error(res.msg) }
      this.setState({ rtotalData: res.result.taskSet });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  render() {
    const { record, issuetype } = this.props;
    return (<span>
      <Popover
        content={this.rtotalContent()}
        title={record[issuetype].name}
        trigger="hover">
        <span onMouseEnter={() => this.getRtotalData(record[issuetype].id)} className={styles.rtotalStyle}>{record[issuetype].fsttotal}</span>
      </Popover>
    </span>);
  }
}

export default index;
