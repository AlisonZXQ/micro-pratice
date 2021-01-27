import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { message, Table, Popover } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import { getProjectPreview } from '@services/report';
import { statusMap, statusColor, priorityMap } from '@shared/ProjectConfig';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@/components/DefineDot';
import QueryAreaProject from './QueryAreaProject';

const columns = [{
  title: '项目名称',
  dataIndex: 'title',
  width: '15vw',
  render: (text, record) => {
    return (<Popover
      content={record.project.title}
    >
      <div
        style={{ maxWidth: '15vw' }}
        className={`f-toe`}
      >
        <Link to={`/project/detail?id=${record.project.id}`} target="_blank">
          {record.project.title}
        </Link>
      </div>
    </Popover>);
  }
}, {
  title: '项目简介',
  dataIndex: 'description',
  width: '15vw',
  render: (text, record) => {
    return (record.project.description ? <TextOverFlow content={record.project.description} maxWidth={'15vw'} /> : '-');
  }
}, {
  title: '状态',
  dataIndex: 'status',
  render: (text, record) => {
    return(
      <DefineDot
        text={record.project.status}
        statusMap={statusMap}
        statusColor={statusColor}
      />
    );
  }
}, {
  title: '优先级',
  dataIndex: 'priority',
  render: (text, record) => {
    return (record.project.priority ? priorityMap[record.project.priority] : '-');
  }
}, {
  title: '负责人',
  dataIndex: 'ownerUser',
  render: (text, record) => {
    return text.realname ? text.realname : '-';
  }
}, {
  title: '创建人',
  dataIndex: 'creatorUser',
  render: (text, record) => {
    return text.realname ? text.realname : '-';
  }
}, {
  title: '起止时间',
  dataIndex: 'qizhi',
  render: (text, record) => {
    return (<span>
      {(record.project.startTime && record.project.endTime) ?
        <span>
          {moment(record.project.startTime).format('YYYY-MM-DD')} ~
          {moment(record.project.endTime).format('YYYY-MM-DD')}
        </span> : '-'
      }
    </span>);
  }
}];

class ProjectSetting extends Component {
  state = {
    filterObj: {},
    data: [],
    status: 0,
  }

  componentDidMount() {
    const { projectConditionList } = this.props;
    if (projectConditionList) {
      this.setState({ status: 1 });
      this.getDefaultValue(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.state;
    if (this.props.projectConditionList !== nextProps.projectConditionList && status === 0) {
      // 默认filterObj
      this.getDefaultValue(nextProps);
    }
  }

  getDefaultValue = (props) => {
    const { filterObj } = this.state;
    const newFilterObj = {...filterObj};
    if (props.projectConditionList) {
      props.projectConditionList.forEach(it => {
        if (it.filterkey === 'project_status') {
          newFilterObj['status'] = it.filtervalue;
        }
        if (it.filterkey === 'project_starttime' && it.filtervalue) {
          const m = it.filtervalue.split(',');
          newFilterObj['starttime_start'] = (m[0] && !m[0].includes('NaN')) ? moment(m[0]).format('YYYY-MM-DD') : '';
          newFilterObj['starttime_end'] = (m[1] && !m[1].includes('NaN')) ? moment(m[1]).format('YYYY-MM-DD') : '';
        }
        if (it.filterkey === 'project_endtime' && it.filtervalue) {
          const m = it.filtervalue.split(',');
          newFilterObj['endtime_start'] = (m[0] && !m[0].includes('NaN')) ? moment(m[0]).format('YYYY-MM-DD') : '';
          newFilterObj['endtime_end'] = (m[1] && !m[1].includes('NaN')) ? moment(m[1]).format('YYYY-MM-DD') : '';
        }
        if (it.filterkey === 'project_priority') {
          newFilterObj['priority'] = it.filtervalue;
        }
        if (it.filterkey === 'project_owner') {
          newFilterObj['owner'] = it.filtervalue;
        }
        if (it.filterkey === 'project_subProductIdList') {
          newFilterObj['project_subProductIdList'] = it.filtervalue;
        }
      });
    }
    this.props.callback('filterObjProject', newFilterObj);
    this.setState({ filterObj: newFilterObj }, () => this.handlePreview());
  }

  handlePreview = () => {
    const { productid } = this.props.location.query;
    const { filterObj } = this.state;
    if (productid) {
      const params = {
        productId: productid,
        ...filterObj,
      };
      getProjectPreview(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.setState({ data: res.result || [] });
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let newFilterObj = {
      ...filterObj
    };
    if (key === 'startTime' && value) {
      newFilterObj['starttime_start'] = value[0] ? moment(value[0]).format('YYYY-MM-DD') : '';
      newFilterObj['starttime_end'] = value[1] ? moment(value[1]).format('YYYY-MM-DD') : '';
    } else if (key === 'endTime' && value) {
      newFilterObj['endtime_start'] = value[0] ? moment(value[0]).format('YYYY-MM-DD') : '';
      newFilterObj['endtime_end'] = value[1] ? moment(value[1]).format('YYYY-MM-DD') : '';
    } else {
      newFilterObj[key] = value;
    }
    this.props.callback('filterObjProject', newFilterObj);
    this.setState({ filterObj: newFilterObj }, () => this.handlePreview());
  }

  render() {
    const { projectOwnerList, projectConditionList, subProductAll } = this.props;
    const { data } = this.state;

    return (<div>
      <div className='bbTitle'><span className='name'>配置项目</span></div>
      <QueryAreaProject
        projectOwnerList={projectOwnerList}
        updateFilter={this.updateFilter}
        projectConditionList={projectConditionList}
        subProductAll={subProductAll}
      />
      <div className="u-mgt8 bgWhiteModel" style={{paddingBottom: '0px'}}>
        <Table
          className='tableMargin'
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          pagination={data.length>10 ? true : false}
        />
      </div>

    </div>);
  }
}

export default withRouter(ProjectSetting);
