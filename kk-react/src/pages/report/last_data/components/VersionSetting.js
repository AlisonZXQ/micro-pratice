import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, message, Popover } from 'antd';
import moment from 'moment';
import { Link } from 'umi';
import { getVersionPreview } from '@services/report';
import { versionColorDotMap, versionNameMap } from '@shared/CommonConfig';
import DefineDot from '@components/DefineDot';
import { VERISON_STATUS_MAP } from '@shared/ReceiptConfig';
import QueryAreaVersion from './QueryAreaVersion';

const columns = [{
  title: '版本',
  dataIndex: 'name',
  width: '25vw',
  render: (text, record) => {
    return (
      <Popover
        content={record.name}
      >
        <div
          style={{ maxWidth: '25vw' }}
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
    return (<DefineDot
      text={text}
      statusMap={versionNameMap}
      statusColor={versionColorDotMap}
    />);
  }
}, {
  title: '开始日期',
  dataIndex: 'begintime',
  render: (text) => {
    return text ? moment(text).format('YYYY-MM-DD') : '-';
  }
}, {
  title: '计划发布日期',
  dataIndex: 'endtime',
  render: (text) => {
    return text ? moment(text).format('YYYY-MM-DD') : '-';
  }
}, {
  title: '实际发布日期',
  dataIndex: 'releasetime',
  render: (text) => {
    return text ? moment(text).format('YYYY-MM-DD') : '-';
  }
}];


class VersionSetting extends Component {
  state = {
    filterObj: {},
    data: [],
    status: 0,
  }

  componentDidMount() {
    const { versionConditionList } = this.props;
    if (versionConditionList) {
      this.getDefaultValue(this.props);
      this.setState({ status: 1 });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.state;
    if (this.props.versionConditionList !== nextProps.versionConditionList && status === 0) {
      // 默认filterObj
      this.getDefaultValue(nextProps);
    }
  }

  getDefaultValue = (props) => {
    const { filterObj } = this.state;
    const newFilterObj = { ...filterObj };

    if (props.versionConditionList) {
      props.versionConditionList.forEach(it => {
        if (it.filterkey === 'version_state') {
          newFilterObj['state'] = it.filtervalue;
        }
        if (it.filterkey === 'version_begintime' && it.filtervalue) {
          const m = it.filtervalue.split(',');
          newFilterObj['begintime_start'] = (m[0] && !m[0].includes('NaN')) ? new Date(Number(m[0])).getTime() : '';
          newFilterObj['begintime_end'] = (m[1] && !m[1].includes('NaN')) ? new Date(Number(m[1])).getTime() : '';
        }
        if (it.filterkey === 'version_endtime' && it.filtervalue) {
          const m = it.filtervalue.split(',');
          newFilterObj['endtime_start'] = (m[0] && !m[0].includes('NaN')) ? new Date(Number(m[0])).getTime() : '';
          newFilterObj['endtime_end'] = (m[1] && !m[1].includes('NaN')) ? new Date(Number(m[1])).getTime() : '';
        }
        if (it.filterkey === 'version_releasetime' && it.filtervalue) {
          const m = it.filtervalue.split(',');
          newFilterObj['releasetime_start'] = (m[0] && !m[0].includes('NaN')) ? new Date(Number(m[0])).getTime() : '';
          newFilterObj['releasetime_end'] = (m[1] && !m[1].includes('NaN')) ? new Date(Number(m[1])).getTime() : '';
        }
        if (it.filterkey === 'version_subProductIdList') {
          newFilterObj['subProductIdList'] = it.filtervalue;
        }
      });
    }
    this.props.callback('filterObjVersion', newFilterObj);
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
      getVersionPreview(params).then((res) => {
        if (res.code !== 200) return message.error(res.msg);
        this.setState({ data: res.result || [] });
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  getStartTime = (date) => {
    return date ? new Date(date).setHours(0, 0, 0, 0) : '';
  }

  getEndTime = (date) => {
    return date ? new Date(date).setHours(23, 59, 59, 999) : '';
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let newFilterObj = {
      ...filterObj
    };
    if (key === 'startTime' && value) {
      newFilterObj['begintime_start'] = this.getStartTime(value[0]);
      newFilterObj['begintime_end'] = this.getEndTime(value[1]);
    } else if (key === 'endTime' && value) {
      newFilterObj['endtime_start'] = this.getStartTime(value[0]);
      newFilterObj['endtime_end'] = this.getEndTime(value[1]);
    } else if (key === 'releaseTime' && value) {
      newFilterObj['releasetime_start'] = this.getStartTime(value[0]);
      newFilterObj['releasetime_end'] = this.getEndTime(value[1]);
    } else {
      newFilterObj[key] = value;
    }
    this.props.callback('filterObjVersion', newFilterObj);
    this.setState({ filterObj: newFilterObj }, () => this.handlePreview());
  }

  render() {
    const { versionConditionList, subProductAll } = this.props;
    const { data } = this.state;

    return (<div>
      <div className='bbTitle'><span className='name'>配置版本</span></div>
      <QueryAreaVersion
        updateFilter={this.updateFilter}
        versionConditionList={versionConditionList}
        subProductAll={subProductAll}
      />
      <div className="u-mgt8 bgWhiteModel" style={{ paddingBottom: '0px' }}>
        <Table
          className='tableMargin'
          rowKey={record => record.id}
          columns={columns}
          dataSource={data}
          pagination={data.length > 10 ? true : false}
        />
      </div>
    </div>);
  }
}

export default withRouter(VersionSetting);
