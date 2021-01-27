import React, { Component } from 'react';
import { Card, Timeline, Spin, Empty } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { history } from 'umi';
import FilterSelect from '@components/FilterSelect';
import MyIcon from '@components/MyIcon';
import { timelineType } from '@shared/ProjectConfig';
import styles from './index.less';

const stateType = 'project/getProjectEvent';
const transYmd = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      params: {
        typeList: [],
        projectId: 0,
      },
    };
  }

  componentDidMount() {
    const { projectId } = this.props.location.query;
    if (projectId) {
      const newParams = {
        ...this.state.params,
        projectId: projectId,
      };
      this.setState({ params: newParams }, () => {
        this.props.dispatch({ type: stateType, payload: newParams });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataList: nextProps.projectEvent });
  }

  updateFilterUser = (value) => {
    const { projectEvent } = this.props;
    const otherData = projectEvent.filter((it) => !it.needUser);
    const userData = projectEvent.filter((it) => it.needUser);
    if (!value.length) {
      this.setState({ dataList: projectEvent });
      return;
    }
    const newDataList = [];
    value && value.forEach(item => {
      if (item === 0) {
        otherData && otherData.forEach((it) => {
          newDataList.push(it);
        });
      } else {
        userData && userData.forEach((it) => {
          if (it.userVO.id === item) {
            newDataList.push(it);
          }
        });
      }
    });
    this.setState({ dataList: newDataList });
  }

  updateFilter = (key, value) => {
    if (key === 'userList') {
      this.updateFilterUser(value);
    } else {
      const newParams = {
        ...this.state.params,
        [key]: value,
      };
      this.setState({ params: newParams }, () => {
        this.props.dispatch({ type: stateType, payload: newParams });
      });
    }
  }

  transWeek = (num) => {
    const arr = ['日', '一', '二', '三', '四', '五', '六'];
    return '星期' + arr[num];
  };

  transData = (data) => { //按照日期进行分类
    let dataArr = [];
    data.map(mapItem => {
      if (dataArr.length === 0) {
        dataArr.push({ time: mapItem.time, List: [mapItem] });
      } else {
        let res = dataArr.some(item => {//判断相同日期，有就添加到当前项
          if (transYmd(item.time) === transYmd(mapItem.time)) {
            item.List.push(mapItem);
            return true;
          }
        });
        if (!res) {//如果没找相同日期添加一个新对象
          dataArr.push({ time: mapItem.time, List: [mapItem] });
        }
      }
    });
    return dataArr;
  }

  getUserList = (data) => { //数据筛选并去重
    let userList = [];
    data.map((it) => {
      if (it.needUser) {
        userList.push(it.userVO);
      }
    });

    let obj = {};
    userList = userList.reduce((item, next) => {
      if (!obj[next.id]) {
        item.push(next);
        obj[next.id] = true;
      }
      return item;
    }, []);

    userList.push({
      name: '其他',
      id: 0,
    });
    return userList;
  }

  getContent = (it) => {
    const nodeName = it.needNodeName ? it.nodeName : '';
    const desc = it.desc ? it.desc : '--';
    if (it.needUser) { //用户操作
      return <span>
        {it.userVO.name + it.operate + desc + nodeName}
        {it.needReason ? `，原因：${it.reason}` : ''}
      </span>;
    } else { //系统操作
      return <span>
        {nodeName + desc}
        {it.needUrl &&
          <a className='u-mgl5' onClick={() => {
            history.push(it.url);
          }}>
            {it.url !== '' && it.desc.indexOf('变更') > -1 && '变更详情'}
            {it.url !== '' && it.desc.indexOf('立项') > -1 && '立项详情'}
            {it.url !== '' && it.desc.indexOf('结项') > -1 && '结项详情'}
          </a>
        }
      </span>;
    }
  }

  render() {
    const { projectId } = this.props.location.query;
    const { eventLoading, projectEvent } = this.props;
    const { dataList } = this.state;

    const userList = this.getUserList(projectEvent);
    const newData = this.transData(dataList);
    return (<span>
      <Spin spinning={eventLoading}>
        <div className={`${styles.head} f-aic`}>
          <span className='f-csp ' onClick={() => history.push(`/project/detail?id=${projectId}`)}>
            <MyIcon type="icon-fanhuitubiao" className="u-mgr5 f-fs1" />
            返回项目
          </span>
        </div>
        <Card className={`bgCard`}>
          <div className='bbTitle f-jcsb-aic'>
            <span className='name'>项目动态</span>
          </div>
          <div className={styles.timeLine}>
            <span className="m-query f-ib u-mgt10 u-mgb10 u-mgl20">
              <span className='queryHover'>
                <span className="f-ib f-vam grayColor">操作人：</span>
                <FilterSelect
                  onChange={(value) => this.updateFilter('userList', value)}
                  dataSource={userList && userList.map((item) => ({
                    label: item.name, value: item.id,
                  }))}
                />
              </span>

              <span className='queryHover'>
                <span className="f-ib f-vam grayColor">类型：</span>
                <FilterSelect
                  onChange={(value) => this.updateFilter('typeList', value)}
                  dataSource={timelineType.map((item) => ({
                    label: item.name, value: item.id,
                  }))}
                />
              </span>

            </span>

            {newData && !!newData.length && <div className={styles.timeContent}>
              {newData && newData.map((item) => (
                <div className={styles.timeItem}>
                  <span className={styles.timeTag}>
                    {transYmd(item.time)}
                    <span> </span>
                    {this.transWeek(moment(item.time).format('d'))}
                  </span>
                  <Timeline style={{ marginTop: '16px' }}>
                    {item.List && item.List.map((it) => (
                      <Timeline.Item>
                        <span>{it.time}</span>
                        <span className='u-mgl10'>{this.getContent(it)}</span>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              ))}
            </div>}

            {newData && newData.length === 0 && <Empty
              description={
                <span className={styles.emptyTip}>
                  暂无项目动态
                </span>
              }>
            </Empty>}

          </div>
        </Card>
      </Spin>
    </span>);
  }

}

const mapStateToProps = (state) => {
  return {
    projectEvent: state.project.projectEvent,
    eventLoading: state.loading.effects[stateType],
  };
};

export default connect(mapStateToProps)(Index);
