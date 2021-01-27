import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Card, Empty, Spin, Row, Col } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import NoPermission from '@components/403';
import { REPORT_TABS } from '@shared/ReportConfig';
import Header from '../components/Header';
import ProjectData from './components/ProjectData';
import VersionData from './components/VersionData';
import CreateReport from './components/CreateReport';
import styles from './index.less';

class index extends Component {
  state = {
    visible: false,
    filterObjProject: {},
    filterObjVersion: {},
  }

  componentDidMount() {
    const { lastProduct } = this.props;
    if (lastProduct && lastProduct.id) {
      const id = lastProduct.id;
      this.props.dispatch({ type: 'report/getLastDataObj', payload: { productId: id } });
      this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: id } });
    }
  }

  componentWillReceiveProps(nextProps) {
    const beforeId = this.props.lastProduct && this.props.lastProduct.id;
    const nextId = nextProps.lastProduct && nextProps.lastProduct.id;
    if (beforeId !== nextId) {
      const id = nextId;
      history.push(`/report/dashboard?productid=${nextId}`);
      this.props.dispatch({ type: 'report/getLastDataObj', payload: { productId: id } });
      this.props.dispatch({ type: 'report/getUserReportPer', payload: { productId: id } });
    }
  }

  handleEdit = (e) => {
    const { productid } = this.props.location.query;

    e.stopPropagation();
    history.push(`/report/dashboard/edit?productid=${productid}`);
  }

  render() {
    const { lastDataObj, lastDataLoading, currentUserReportPer, reportPermission } = this.props;
    const { productid } = this.props.location.query;

    return (<Card className={`${styles.reportCard} bgCard`}>
      <Header activeKey={`${REPORT_TABS.LAST_DATA}`} />
      {
        productid ?
          reportPermission ?
            <Spin spinning={lastDataLoading} tip="数据加载中……">
              <Row className={styles.dataTitle}>
                <Col span={18}>
                  <span className="f-fs5 f-fwb">{lastDataObj.name}</span>
                </Col>
                <Col span={6} className={styles.buttonOffset}>
                  <span className="f-fr">
                    <CreateReport form={this.props.form} id={productid} hasPer={currentUserReportPer.auth === 2} />
                    <Button className="area" onClick={(e) => this.handleEdit(e)} disabled={currentUserReportPer.auth !== 2}>编辑报表</Button>
                  </span>
                </Col>
              </Row>
              <div style={{ padding: '0px 20px 20px 20px' }}>
                <ProjectData projectDataList={lastDataObj.projectDataList || []} />
                <VersionData versionDataList={lastDataObj.versionDataList || []} />
              </div>
            </Spin> : <NoPermission />
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: '60vh', marginTop: '150px' }} />
      }
    </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    lastDataObj: state.report.lastDataObj,
    lastDataLoading: state.loading.effects['report/getLastDataObj'],
    currentUserReportPer: state.report.currentUserReportPer,
    lastProduct: state.product.lastProduct,
    reportPermission: state.report.reportPermission,
  };
};

export default withRouter(connect(mapStateToProps)(Form.create()(index)));
