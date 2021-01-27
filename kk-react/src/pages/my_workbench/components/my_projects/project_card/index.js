import React from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Progress, Tag, Popover } from 'antd';
import moment from 'moment';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import CollectStar from '@components/CollectStar';
import { getFormLayout } from '@utils/helper';
import { priorityMap, statusMap, statusColor, riskTypeColorMap } from '@shared/ProjectConfig';
import { riskcolorMap } from '@shared/WorkbenchConfig';
import styles from './index.less';

const FormItem = Form.Item;
const formLayout = getFormLayout(8, 16);
const dateFormat = 'YYYY-MM-DD';

function ProjectCard(props) {
  const { type, cancelCollect, item, index, itemDetailObj } = props;

  const setLastProductAndJump = async (productId) => {
    await props.dispatch({ type: 'product/setLastProduct', payload: { productId: productId } });
    window.open(`/v2/manage/productadvise/?productid=${productId}`);
  };

  const getBody = (item, index, itemDetailObj) => {
    const productVO = item.productVO || {};
    const subProductVO = item.subProductVO || {};
    const owner = item.owner || {};
    const highRiskList = itemDetailObj.highRiskList || [];
    const middleRiskList = itemDetailObj.middleRiskList || [];
    const lowRiskList = itemDetailObj.lowRiskList || [];
    const totalRiskLength = highRiskList.length + middleRiskList.length + lowRiskList.length;
    const projectWeekReportVO = itemDetailObj.projectWeekReportVO || {};
    const changeStatus = itemDetailObj.changeStatus;

    const getRiskContent = () => {
      return (<div>
        {
          highRiskList.map(it => <div className="u-mgb10">
            <Tag color={riskTypeColorMap[3]}>高</Tag>
            {it.name}
          </div>)
        }
        {
          middleRiskList.map(it => <div className="u-mgb10">
            <Tag color={riskTypeColorMap[2]}>中</Tag>
            {it.name}
          </div>)
        }
        {
          lowRiskList.map((it, index) => <div className={index !== lowRiskList.length - 1 && "u-mgb10"}>
            <Tag color={riskTypeColorMap[1]}>低</Tag>
            {it.name}
          </div>)
        }
      </div>);
    };

    const getRiskBody = () => {
      return (<span>
        <Tag color={riskTypeColorMap[3]}>高</Tag>
        <span className="u-mgr5" style={{ color: riskcolorMap.HIGH }}>{highRiskList.length}</span>
        <Tag color={riskTypeColorMap[2]}>中</Tag>
        <span className="u-mgr5" style={{ color: riskcolorMap.MIDDLE }}>{middleRiskList.length}</span>
        <Tag color={riskTypeColorMap[1]}>低</Tag>
        <span className="u-mgr5" style={{ color: riskcolorMap.LOW }}>{lowRiskList.length}</span>
      </span>);
    };

    const getStatus = (status) => {
      if (Number(status * 100) < 100) {
        return 'active';
      } else if (Number(status * 100) === 100) {
        return 'normal';
      } else if (Number(status * 100) === 0) {
        return '';
      }
    };

    return (<Col span={12} className="u-mgb10">
      <div
        className={` ${styles.card} ${index % 2 === 0 ? styles.even : styles.old}`}
        onClick={() => window.open(`/v2/project/detail/?id=${item.projectId}`)}
      >
        <div className={styles.header}>
          <div className={styles.imgC}>
            <MyIcon type="icon-xiangmuliebiaoicon" className={styles.img} />
          </div>
          <div className={styles.info}>
            <div className={styles.title}>
              <span className="u-mgr5"><TextOverFlow content={item.title} maxWidth={'250px'} /></span>
              <span className={styles.productTag} onClick={(e) => { e.stopPropagation(); setLastProductAndJump(productVO.id) }}>{productVO.name}/{subProductVO.subProductName}</span>

              {changeStatus &&
                <span className="f-fs2 u-mgl5">
                  <Popover content="当前项目内容/目标已变更，请项目负责人发起审批" placement="topLeft">
                    <MyIcon type="icon-tishigantanhaohuang" />
                  </Popover>
                </span>
              }
            </div>
            <div className={styles.status}>
              <span className="u-mgr20">
                <span className="u-thirdtitle">状态：</span>
                <span style={{ position: 'relative' }}>
                  {
                    item.status ?
                      <DefineDot
                        text={item.status}
                        statusMap={statusMap}
                        statusColor={statusColor}
                      />
                      :
                      '--'
                  }

                </span>
              </span>
              <span>
                <span className="u-thirdtitle">优先级：</span>
                {item.priority ? priorityMap[item.priority] : '--'}
              </span>
            </div>
          </div>
          {
            type === 'collect' &&
            <div
              className={styles.star}
              onClick={(e) => e.stopPropagation()}
            >
              <CollectStar
                style={{ fontSize: '24px' }}
                collect={true}
                callback={() => cancelCollect(item.projectId)}
              />
            </div>
          }
        </div>

        <div className={styles.body}>
          <Row gutter={16} className="u-mgt10">
            <Col span={12}>
              <FormItem label="里程碑进度" {...getFormLayout(8, 15)}>
                {
                  itemDetailObj.milestoneDoneStatus ?
                    <Progress
                      percent={Number(itemDetailObj.milestoneDoneStatus * 100).toFixed(2)}
                      size="small"
                      status={getStatus(itemDetailObj.milestoneDoneStatus)}
                    />
                    :
                    '--'
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="负责人" {...formLayout}>
                <TextOverFlow content={`${owner.name}(${owner.email})`} maxWidth={'10vw'} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem label="目标完成率" {...getFormLayout(8, 15)}>
                {
                  itemDetailObj.objectiveDoneStatus ?
                    <Progress
                      percent={Number(itemDetailObj.objectiveDoneStatus * 100).toFixed(2)}
                      size="small"
                      status={getStatus(itemDetailObj.objectiveDoneStatus)}
                    />
                    :
                    '--'
                }
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="截止日期" {...formLayout}>
                {item.endTime ? moment(item.endTime).format(dateFormat) : '--'}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem label="项目风险" {...formLayout}>
                {
                  totalRiskLength ?
                    <Popover
                      content={getRiskContent()}
                      placement="bottomLeft"
                    >
                      {getRiskBody()}
                    </Popover>
                    :
                    getRiskBody()
                }

              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="最新周报" {...formLayout}>
                {
                  projectWeekReportVO.id ?
                    <a href={`/v2/project/project_week_report/view?id=${item.projectId}&reportId=${projectWeekReportVO.id}`}
                      target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      {moment(projectWeekReportVO.startTime).format(dateFormat)} ~
                      {moment(projectWeekReportVO.endTime).format(dateFormat)}
                    </a>
                    :
                    '--'
                }
              </FormItem>
            </Col>
          </Row>
        </div>
      </div>
    </Col>);
  };

  return (<span>
    {getBody(item, index, itemDetailObj)}
  </span>);
}

export default ProjectCard;
