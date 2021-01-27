import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Popover, Empty } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import MyIcon from '@components/MyIcon';
import { PROJECT_STATUS_MAP, PROEJCT_PERMISSION } from '@shared/ProjectConfig';
import CreateWeekReport from '@pages/project/components/create_week_report';
import styles from '../index.less';

class ProjectWeekReport extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    this.props.dispatch({ type: 'weekReport/getWeekReportAll' });
  }

  handleManage = () => {
    const { id } = this.props;
    const { projectBasic } = this.props;
    const productid = projectBasic && projectBasic.products[0] && projectBasic.products[0].id;
    history.push(`/project/manage_members?id=${id}&productid=${productid}`);
  }

  getReportDisplay = (it) => {
    const { id } = this.props;
    const projectWeekReport = it.projectWeekReport || {};

    return (
      <Popover
        content={projectWeekReport.name}
      >
        <span
          className="f-toe f-db"
          style={{ height: '30px', lineHeight: '30px', maxWidth: '90%' }}
        >
          <Link to={`/project/project_week_report/view?id=${id}&reportId=${projectWeekReport.id}&template=${projectWeekReport.templateType}`}>
            <MyIcon type="icon-zhoubao" className="f-fs3 u-mgr5" />
            <span className={styles.text}>{projectWeekReport.name}</span>
          </Link>
        </span>
      </Popover>
    );
  }

  displayWeekReport = (beforThreeReport, roleGroup, id) => {
    return (<span>
      {
        beforThreeReport.map(it =>
          this.getReportDisplay(it)
        )
      }
    </span>);
  }

  render() {
    const { projectBasic, currentMemberInfo, reportAll, id } = this.props;
    const projectDetail = projectBasic.projectDetail || {};
    const roleGroup = currentMemberInfo && currentMemberInfo.roleGroup;
    const beforThreeReport = reportAll ? reportAll.slice(0, 3) : [];

    return (<span className={styles.projectWeekReport}>
      <div className="bbTitle f-jcsb-aic">
        <span className="name">项目周报({reportAll.length})</span>
        <span>
          {roleGroup !== PROEJCT_PERMISSION.READ &&
            <CreateWeekReport
              trigger={<a>创建周报</a>}
              projectId={id}
            />
          }
          {
            projectDetail.status !== PROJECT_STATUS_MAP.FINISH && roleGroup !== PROEJCT_PERMISSION.READ &&
            <Link className="f-aic u-mgl10 f-fr f-fs2" to={`/project/project_week_report/list?id=${id}`}>
              管理
              <MyIcon type="icon-fanhuitubiao" className={styles.icon} />
            </Link>
          }
        </span>
      </div>
      <Card>
        {reportAll && reportAll.length ?
          this.displayWeekReport(beforThreeReport, roleGroup, id)
          :
          <Empty
            description={
              <span>
                当前项目尚未创建任何周报！
              </span>
            }>
          </Empty>
        }
      </Card>
    </span>);
  }

}

const mapStateToProps = (state) => {
  return {
    reportAll: state.weekReport.reportAll,
  };
};

export default withRouter(connect(mapStateToProps)(ProjectWeekReport));
