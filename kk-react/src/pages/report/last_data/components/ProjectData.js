import React from 'react';
import { Tag, Row, Col, Table, Tooltip, Popover, Progress } from 'antd';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import { statusMap, statusColor, riskTypeColorMap, RISK_LEVEL_MAP } from '@shared/ProjectConfig';
import DefineDot from '@/components/DefineDot';
import styles from '../index.less';

const columns = [{
  title: '项目名称',
  dataIndex: 'name',
  render: (text, record) => {
    return (<Popover
      content={record.name}
    >
      <div
        style={{ maxWidth: '5vw' }}
        className={`f-toe`}
      >
        <Link to={`/project/detail?id=${record.projectid}`} target="_blank">
          {record.name}
        </Link>
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
        statusMap={statusMap}
        statusColor={statusColor}
      />
    );
  }
}, {
  title: '计划周期（天）',
  dataIndex: 'planduration',
  render: (text) => {
    return text >= 0 ? text.toFixed(2) : '-';
  }
}, {
  title: <Tooltip title={'项目内已完成（关闭）的预估工作量总和'}>人力预算（人日）</Tooltip>,
  dataIndex: 'plan_manpower',
  render: (text) => {
    return text >= 0 ? text.toFixed(2) : '-';
  }
}, {
  title: <Tooltip title={'当前已投入人力'}>人力投入（人日）</Tooltip>,
  dataIndex: 'real_manpower',
  render: (text) => {
    return text >= 0 ? text.toFixed(2) : '-';
  }
}, {
  title: <Tooltip title={'当前已完成里程碑数/项目中里程碑总数*100%'}>里程碑进度（%）</Tooltip>,
  dataIndex: 'milestone_progress',
  render: (text) => {
    return text >= 0 ? <Progress percent={text.toFixed(2)} size="small" /> : '-';
  }
}, {
  title: <Tooltip title={'当前已完成目标数/项目中目标总数*100%'}>目标完成率（%）</Tooltip>,
  dataIndex: 'objective_progress',
  render: (text) => {
    return text >= 0 ? <Progress percent={text.toFixed(2)} size="small" /> : '-';
  }
}, {
  title: <Tooltip title={'延期天数/计划周期*100%'}>延期率（%）</Tooltip>,
  dataIndex: 'delay_progress',
  width: 130,
  render: (text, record) => {
    if (text >= 0 && text <= 100) {
      return <Progress percent={text.toFixed(2)} size="small" />;
    } else if (text > 100) {
      return <span>{text.toFixed(2)}%</span>;
    } else {
      return '-';
    }
  }
}, {
  title: <Tooltip title={'项目中的Bug总数/人力投入'}>Bug率(每人日)</Tooltip>,
  dataIndex: 'bug_progress',
  render: (text, record) => {
    if (text) {
      return text.toFixed(2);
    } else {
      return '-';
    }
  }
}, {
  title: '风险数',
  dataIndex: 'fx',
  render: (text, record) => {
    return (<span>
      <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.HIGH]}>高</Tag>
      <span className="u-mgr5">{record.risk_high}</span>
      <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.MIDDLE]}>中</Tag>
      <span className="u-mgr5">{record.risk_middle}</span>
      <Tag color={riskTypeColorMap[RISK_LEVEL_MAP.LOW]}>低</Tag>
      <span className="u-mgr5">{record.risk_low}</span>
    </span>);
  }
}];
const ProjectData = ({ projectDataList }) => {

  return (<div
    className={`${styles.cardStyle}`}
  >
    <div className='bbTitle'><span className='name'>项目数据</span></div>
    <Row gutter={8}>
      <Col span={6}>
        <div className='bgWhiteModel' style={{ padding: '10px 10px 15px 16px' }}>
          <div>项目总数</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgPT}`}>
              <MyIcon type='icon-xiangmuzongshu' style={{ fontSize: '26px' }} />
            </div>
            <div className={styles.count}>{projectDataList.length}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{ padding: '10px 10px 15px 16px' }}>
          <div>已结项</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgAR}`}>
              <MyIcon type='icon-yijiexiang1' style={{ fontSize: '26px' }} />
            </div>
            <div className={styles.count}>{projectDataList.filter(it => it.state === 5).length}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{ padding: '10px 10px 15px 16px' }}>
          <div>已取消</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgAC}`}>
              <MyIcon type='icon-yiquxiao' style={{ fontSize: '26px' }} />
            </div>
            <div className={styles.count}>{projectDataList.filter(it => it.state === 6).length}</div>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className='bgWhiteModel' style={{ padding: '10px 10px 15px 16px' }}>
          <div>已延期</div>
          <div className='f-aic u-mgt10'>
            <div className={`f-jcc-aic ${styles.bgIcon} ${styles.bgAD}`}>
              <MyIcon type='icon-yiyanqi' style={{ fontSize: '26px' }} />
            </div>
            <div className={styles.count}>{(projectDataList.filter(it => it.delay_progress > 0)).length}</div>
          </div>
        </div>
      </Col>
    </Row>

    <div className='bgWhiteModel u-mgt8' style={{ paddingBottom: '0px' }}>
      <Table
        className='tableMargin'
        rowKey={record => record.id}
        columns={columns}
        dataSource={projectDataList}
        pagination={projectDataList.length > 10 ? true : false}
      />
    </div>
  </div>);
};

export default ProjectData;
