import React, { Component } from 'react';
import { RightOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, message, Card, Empty } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { getSnapshotDetail, deleteSnapshot } from '@services/report';
import { deleteModal } from '@shared/CommonFun';
import { REPORT_TABS, REOPRT_PERMISSION } from '@shared/ReportConfig';
import Header from '../../components/Header';
import ProjectData from '../../last_data/components/ProjectData';
import VersionData from '../../last_data/components/VersionData';
import styles from '../index.less';

class index extends Component {
  state = {
    visible: false,
    checked: false,
    reportId: '',
    filterObj: {},
    reportDetail: {},
    deleteLoading: false,
  }

  componentDidMount() {
    const { reportid } = this.props.location.query;
    if (reportid) {
      this.getSnapshotDetail();
      this.getUserReportPer();
    }
  }

  getUserReportPer = () => {
    const { productid } = this.props.location.query;
    if (productid) {
      this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: productid } });
    }
  }

  getSnapshotDetail = () => {
    const { reportid } = this.props.location.query;
    const params = {
      id: reportid,
    };
    getSnapshotDetail(params).then((res) => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ reportDetail: res.result || {} });
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleDelete = () => {
    const { reportid, productid } = this.props.location.query;
    const that = this;
    deleteModal({
      title: '删除报告不可恢复',
      content: '确定要删除吗？',
      okCallback: () => {
        that.setState({ deleteLoading: true });
        deleteSnapshot({ id: reportid }).then((res) => {
          that.setState({ deleteLoading: false });
          if (res.code !== 200) return message.error(res.msg);
          message.success('删除报告成功！');
          history.push(`/report/list?productid=${productid}`);
        }).catch((err) => {
          that.setState({ deleteLoading: false });
          return message.error(err || err.message);
        });
      }
    });
  }

  onChange = (value) => {
    this.setState({ checked: value });
  }

  render() {
    const { reportid, productid } = this.props.location.query;
    const { currentUserReportPer } = this.props;
    const { reportDetail, deleteLoading } = this.state;
    const reportSnapshot = reportDetail.reportSnapshot || {};
    return (
      <Card className={`${styles.reportCard} bgCard`}>
        <Header activeKey={`${REPORT_TABS.REPORT_LIST}`} />
        {
          (reportid && productid) ?
            <span>
              <div style={{background: '#fff', padding: '0px 20px'}}>
                <div className="u-pdt10 u-pdb10 f-aic">
                  <span className="f-fs5 f-fwb">报告详情</span>
                  <RightOutlined className='u-mgl10' style={{marginTop: '2px'}} />
                  <span className='f-fs5 u-mgl10'>{reportSnapshot.name}</span>
                </div>
                <div style={{position: 'relative'}}>
                  <span className={`f-fr ${styles.detailTitle}`}>
                    <Button type="primary"
                      className="u-mgr10"
                      onClick={() => this.handleDelete()}
                      loading={deleteLoading}
                      disabled={currentUserReportPer.auth !== REOPRT_PERMISSION.MANAGE}
                    >删除报告</Button>
                    <Button
                      onClick={() => history.push(`/report/list?productid=${productid}`)}
                    >返回</Button>
                  </span>
                </div>
              </div>

              <div style={{ padding: '0px 20px 20px 20px' }}>
                <ProjectData projectDataList={(reportSnapshot && reportSnapshot.projectdata && JSON.parse(reportSnapshot.projectdata)) || []} />
                <VersionData versionDataList={(reportSnapshot && reportSnapshot.versiondata && JSON.parse(reportSnapshot.versiondata)) || []} />
              </div>
            </span> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
        }

      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUserReportPer: state.report.currentUserReportPer,
  };
};

export default connect(mapStateToProps)(Form.create()(index));
