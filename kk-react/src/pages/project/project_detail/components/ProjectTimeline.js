import React, { Component } from 'react';
import { Card, Timeline } from 'antd';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import styles from '../index.less';

class DetailTimeline extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  getContent = (it) => {
    const nodeName = it.needNodeName ? it.nodeName : '';
    const desc = it.desc ? it.desc : '--';
    if (it.needUser) { //用户操作
      return <span>
        {it.userVO.name + it.operate + desc + nodeName}
        {it.needReason ? `，原因：${it.reason}` : ''}
      </span>;
    } else { //系统操作
      return <span>
        {nodeName + desc}
        {it.needUrl &&
          <a className='u-mgl5' onClick={() => {
            history.push(it.url);
          }}>
            {it.url !== '' && it.desc.indexOf('变更') > -1 && '变更详情'}
            {it.url !== '' && it.desc.indexOf('立项') > -1 && '立项详情'}
            {it.url !== '' && it.desc.indexOf('结项') > -1 && '结项详情'}
          </a>
        }
      </span>;
    }
  }

  render() {
    const { projectEvent, id } = this.props;
    const data = projectEvent || [];

    return (<span>
      <div className="bbTitle">
        <span className="name">项目动态</span>
        <a
          className="f-aic f-fr f-fs2"
          onClick={() => history.push(`/project/timeline_detail?projectId=${id}`)}
        >
          更多
          <MyIcon type="icon-fanhuitubiao" style={{ fontSize: '10px', marginLeft: '5px', transform: 'rotate(180deg)' }} />
        </a>

      </div>
      <Card
        className={styles.projectTimeline}
      >
        <Timeline>
          {
            data.map((it, index) => (
              <Timeline.Item dot={index === 0 ? <MyIcon type="icon-xiangmudongtaiduigou" /> : <MyIcon type="icon-xiangmudongtaiyuanquan" />}>
                <p className={styles.itemTime}>{it.time}</p>
                <p style={{ marginBottom: '0.4em' }}>{this.getContent(it)}</p>
              </Timeline.Item>
            ))
          }
        </Timeline>
      </Card>
    </span>);
  }

}

export default DetailTimeline;
