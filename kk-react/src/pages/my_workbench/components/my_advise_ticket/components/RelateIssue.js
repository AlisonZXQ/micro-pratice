import React from 'react';
import { Row, Col, Popover } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import EpIcon from '@components/EpIcon';
import { relationNameMap, relationUrlMap } from '@shared/WorkbenchConfig';
import styles from '../index.less';

function RelateIssue(props) {
  const { record, type } = props;
  const rlist = (record && record.requirementRef4AdviseVOList) || [];
  const blist = (record && record.bugRef4TicketVOList) || [];
  const tlist = (record && record.taskRef4TicketVOList) || [];

  const getTime = (time) => {
    return time ? moment(time).format('YYYY-MM-DD') : '--';
  };

  const getPopover = (relaType) => {
    let list = [];
    if(relaType === 'requirement') {
      list = rlist;
    }else if(relaType === 'task') {
      list = tlist;
    }else if(relaType === 'bug') {
      list = blist;
    }
    return (<span>
      <span>
        <Row className="f-fwb u-mgb10">
          <Col span={6}>{relationNameMap[relaType]}</Col>
          <Col span={6}>计划上线时间</Col>
          <Col span={6}>版本排期时间</Col>
          <Col span={6}>实际上线时间</Col>
        </Row>
      </span>
      <span>
        {list.map(it => <Row>
          <Popover content={it.name}>
            <Col span={6} className="f-toe f-ib">
              <a onClick={(e) => { e.stopPropagation() }}>
                <Link to={`${relationUrlMap[relaType]}-${it.id}`} target="_blank">
                  {it.name}
                </Link>
              </a>
            </Col>
          </Popover>
          <Col span={6}>{getTime(it.expectReleaseTime)}</Col>
          <Col span={6}>{getTime(it.versionPlanTime)}</Col>
          <Col span={6}>{getTime(it.actualPublishTime)}</Col>
        </Row>)
        }
      </span>
    </span>);
  };

  const getDetail = (list, relaType) => {
    if(list.length > 0) {
      return (
        <span>
          <EpIcon
            type={relaType}
            className={`f-fs3 u-mgr10 ${relaType === 'bug' ? 'u-mgl10' : ''}`}>
          </EpIcon>

          <Popover
            content={getPopover(relaType)}
            placement="left"
            overlayStyle={{ width: 600 }}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            <span className={styles.relateNumber}>{list.length}</span>
          </Popover>

        </span>
      );
    }else {
      return <span>
        <EpIcon
          type={relaType}
          className={`f-fs3 u-mgr10 ${relaType === 'bug' ? 'u-mgl10' : ''}`}>
        </EpIcon>
        <span className={styles.relateNumber}>{list.length}</span>
      </span>;
    }

  };


  return (<span>
    {
      type === 'advise' &&
      getDetail(rlist, 'requirement')
    }
    {
      type === 'ticket' &&
      getDetail(tlist, 'task')
    }
    {
      type === 'ticket' &&
      getDetail(blist, 'bug')
    }
  </span>);
}

export default RelateIssue;
