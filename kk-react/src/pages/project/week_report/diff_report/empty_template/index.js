import React from 'react';
import { withRouter } from 'react-router-dom';
import { Spin } from 'antd';
import ReportHeader from '../components/ReportHeader';
import EmptyBase from './EmptyBase';
import EmptyProgress from './EmptyProgress';
import ReportRisk from '../components/ReportRisk';
import styles from '../index.less';

/**
 * @description - 空白模版
 * @param {actionType} - 查看/编辑
 * @param {*} props
 */
function Index(props) {
  const { id, reportId } = props.location.query;
  const { reportData, reportDetail, dependLoading, detailLoading, actionType } = props;

  return (<div>
    <ReportHeader reportData={reportData} type={actionType} {...props} />
    <div className={styles.otherCardStyle} id="weekReport">
      <Spin spinning={reportId ? detailLoading : dependLoading}>
        <div className="u-mg20" style={{ marginBottom: '0px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>基本信息</span>
          </div>
          <EmptyBase
            form={props.form}
            actionType={actionType}
            {...props}
            id={id}
            reportId={reportId}
            reportData={reportData}
          />
        </div>

        <div style={{ margin: '0px 20px' }}>
          <div className='bbTitle f-jcsb-aic' style={{ margin: '12px 0px' }}>
            <span className='name'>项目进度</span>
          </div>
          <EmptyProgress
            form={props.form}
            actionType={actionType}
            {...props}
            id={id}
            reportId={reportId}
            reportData={reportData}
          />
        </div>
        <ReportRisk
          {...props}
          actionType={actionType}
          existList={reportDetail && reportDetail.riskList}
          projectId={id}
          reportId={reportId}
        />
      </Spin>
    </div>
  </div>);
}

export default withRouter(Index);
