import React from 'react';
import moment from 'moment';
import { Link } from 'umi';
import { Row, Col, Table, Tooltip, Popover, Progress } from 'antd';
import MyIcon from '@components/MyIcon';
import { versionNameMap, versionColorDotMap } from '@shared/CommonConfig';
import DefineDot from '@components/DefineDot';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import styles from '../index.less';

const columns = [{
  title: '版本名称',
  dataIndex: 'name',
  render: (text, record) => {
    return (
      <Popover
        content={record.name}
      >
        <div
          style={{ maxWidth: '10vw' }}
          className={`f-toe`}
        >
          {
            record.state === VERISON_STATUS_MAP.OPEN ?
              <Link to={`/manage/version/detail?versionid=${record.versionid}&productid=${record.productid}`} target="_blank">
                {record.name}
              </Link> :
              record.name
          }
        </div>
      </Popover>);
  }
}, {
  title: '状态',
  dataIndex: 'state',
  render: (text) => {
    return (
      <DefineDot
        text={text}
        statusMap={versionNameMap}
        statusColor={versionColorDotMap}
      />
    );
  }
}, {
  title: '开始日期',
  dataIndex: 'real_starttime',
  render: (text, record) => {
    return (record.state !== VERISON_STATUS_MAP.NEW && text) ? moment(text).format('YYYY-MM-DD') : '-';
  }
}, {
  title: '实际周期（天）',
  dataIndex: 'real_duration',
  render: (text, record) => {
    return record.state === VERISON_STATUS_MAP.PUBLISH ? text.toFixed(0) : '-';
  }
}, {
  title: <Tooltip title={'已完成（关闭）的预估工作量总和'}>工作量（人日）</Tooltip>,
  dataIndex: 'workload',
  render: (text) => {
    return text >= 0 ? text.toFixed(2) : '-';
  }
}, {
  title: <Tooltip title={'需求+子需求+独立任务个数'}>吞吐量</Tooltip>,
  dataIndex: 'throughput'
}, {
  title: <Tooltip title={'（当前已完成（关闭）的需求+子需求+独立任务个数）/吞吐量*100%'}>完成率（%）</Tooltip>,
  dataIndex: 'finish_progress',
  render: (text) => {
    return text >= 0 ? <Progress percent={text.toFixed(2)} size="small" /> : '-';
  }
}, {
  title: <Tooltip title={'实际发布延期天数/（计划发布日期-开始日期）*100%'}>延期率（%）</Tooltip>,
  dataIndex: 'delay_progress',
  render: (text, record) => {
    if(text >= 0 && text <= 100){
      return <Progress percent={text.toFixed(2)} size="small" />;
    }else if(text > 100){
      return <span>{text.toFixed(2)}%</span>;
    }else {
      return '-';
    }
  }
}];


const VersionData = ({ versionDataList }) => {

  const countAll = (type) => {
    let sum = 0;
    versionDataList.forEach(it => {
      if (it[type] > 0) {
        sum += it[type];
      }
    });
    return sum;
  };

  return (<div
    className={`${styles.cardStyle}`}
  >
    <div className='bbTitle'><span className='name'>版本数据</span></div>
    <Row gutter={8}>
      <Col span={6}>
        <div className='bgWhiteModel' style={{padding: '10px 10px 15px 16px'}}>
          <div>版本总数</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgVT}`}>
              <MyIcon type='icon-banbenzongshu' style={{fontSize: '26px'}}/>
            </div>
            <div className={styles.count}>{versionDataList.length}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{padding: '10px 10px 15px 16px'}}>
          <div>已发布</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgAP}`}>
              <MyIcon type='icon-yifabu' style={{fontSize: '26px'}}/>
            </div>
            <div className={styles.count}>{versionDataList.filter(it => it.state === 3).length}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{padding: '10px 10px 15px 16px'}}>
          <div>总工作量（人日）</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgTW}`}>
              <MyIcon type='icon-zonggongzuoliang' style={{fontSize: '26px'}}/>
            </div>
            <div className={styles.count}>{countAll('workload').toFixed(2)}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{padding: '10px 10px 15px 16px'}}>
          <div>平均实际周期（天）</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgAW}`}>
              <MyIcon type='icon-pingjunshijizhouqi' style={{fontSize: '26px'}}/>
            </div>
            <div className={styles.count}>{(versionDataList && versionDataList.filter(it => it.state === 3).length) ? (countAll('real_duration') / (versionDataList.filter(it => it.state === 3)).length).toFixed(2) : '-'}</div>
          </div>
        </div>
      </Col>
    </Row>

    <div className='bgWhiteModel u-mgt8' style={{paddingBottom: '0px'}}>
      <Table
        className='tableMargin'
        rowKey={record => record.id}
        columns={columns}
        dataSource={versionDataList}
        pagination={versionDataList.length>10 ? true : false}
      />
    </div>
  </div>);
};

export default VersionData;
