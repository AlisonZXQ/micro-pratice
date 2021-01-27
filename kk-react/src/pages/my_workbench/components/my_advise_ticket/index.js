import React, { Component } from 'react';
import { connect } from 'dva';
import { Radio, Table, message, Badge, Tag, Popover } from 'antd';
import OrderTime from '@components/OrderTime';
import moment from 'moment';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import EpIcon from '@components/EpIcon';
import TextOverFlow from '@components/TextOverFlow';
import { deepCopy, drawerDelayFun } from '@utils/helper';
import { adviseNameMap, adviseColorDotMap, ticketNameMap, ticketColorDotMap } from '@shared/CommonConfig';
import { updateAdviseState } from '@services/advise';
import { updateTicketState } from '@services/ticket';
import { productList4MyFeedback } from '@services/my_workbench';
import { ADVISE_STATUS_MAP, EXCLUDE_CANCLE_CLOSE, levelMap } from '@shared/AdviseConfig';
import QueryArea from './components/QueryArea';
import RelateIssue from './components/RelateIssue';
import { MY_FEEDBACK, orderFieldAdviseData, orderFieldAdviseNameMap, orderData, orderNameMap, ADVISE_TICKET_TABS } from '@shared/WorkbenchConfig';
import AdviseDiffOperations from './components/AdviseDiffOperations';
import TicketDiffOperations from './components/TicketDiffOperations';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class MyAdvise extends Component {
  state = {
    filterObj: {
      orderby: 1, // 'addtime'
      order: 2, // 'desc'
      filtertype: ADVISE_TICKET_TABS.REPORT,
      current: 1, // 默认第一页
    },
    allProductList: [],
  }

  columns = [{
    title: '标题',
    dataIndex: 'name',
    key: 'name',
    width: '16vw',
    render: (text, record) => {
      return <div>
        <span className='f-vam' style={{ marginRight: '4px' }}>
          {record.advise ?
            <EpIcon type='advise' className='f-fs3'></EpIcon> :
            <EpIcon type='ticket' className='f-fs3'></EpIcon>
          }
        </span>
        <TextOverFlow
          content={
            <a>
              {record.advise && record.advise.name}
              {record.ticket && record.ticket.name}
            </a>}
          maxWidth={'16vw'}
        />
        {!!record.autoCloseLeftDays &&
          <span className='u-mgl5'>
            <Tag>
              {record.autoCloseLeftDays}天后将自动确认关闭
            </Tag>
          </span>
        }

      </div>;
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    render: (text, record) => {
      const isSolved = adviseNameMap[record.advise && record.advise.state] === '已解决' ||
        adviseNameMap[record.advise && record.advise.state] === '已驳回' ||
        ticketNameMap[record.ticket && record.ticket.state] === '已驳回' ||
        ticketNameMap[record.ticket && record.ticket.state] === '已解决';
      return (
        <span>
          {record.advise ?
            <DefineDot
              text={record.advise && record.advise.state}
              statusMap={adviseNameMap}
              statusColor={adviseColorDotMap}
            /> :
            <DefineDot
              text={record.ticket && record.ticket.state}
              statusMap={ticketNameMap}
              statusColor={ticketColorDotMap}
            />}
          {isSolved &&
            <Popover content={<span>
              最新操作时间：
              {record.lastResolveTime}
            </span>} >
              <MyIcon type='icon-tishi' className={styles.tipIcon} />
            </Popover>
          }
        </span>
      );
    },
  }, {
    title: '优先级',
    dataIndex: 'level',
    render: (text, record) => {
      const level = record.receipt && record.receipt.level;
      const item = levelMap.find(it => it.id === level);
      return item ? item.name : '--';
    }
  }, {
    title: '所属产品',
    dataIndex: 'product',
    render: (text, record) => {
      return record.product && record.product.name;
    }
  }, {
    title: '负责人',
    dataIndex: 'response',
    render: (text, record) => {
      const responseUser = record.responseUser || {};

      return responseUser.realname;
    }
  }, {
    title: '报告人',
    dataIndex: 'report',
    render: (text, record) => {
      const submitUser = record.submitUser || {};

      return submitUser.realname;
    }
  }, {
    title: '期望上线时间',
    dataIndex: 'expect_releasetime',
    // width: '16vw',
    render: (text, record) => {
      let time = '';
      if(record && record.advise) {
        time = record && record.advise && record.advise.expect_releasetime;
      }else if(record && record.ticket) {
        time = record && record.ticket && record.ticket.expect_releasetime;
      }
      return (
        <div style={{ minWidth: '120px' }}>{time ? moment(time).format('YYYY-MM-DD') : '--'}</div>
      );
    },
  }, {
    title: '关联单据',
    dataIndex: 'subProductVO',
    width: 200,
    render: (text, record) => {
      return <RelateIssue
        record={record || {}}
        type={record.advise ? 'advise' : 'ticket'}
      />;
    }
  }, {
    title: '操作',
    wdith: 200,
    dataIndex: 'caozuo',
    render: (text, record) => {
      const { filterObj: { filtertype } } = this.state;
      if(record && record.advise) {
        return (<span>
          <AdviseDiffOperations
            record={record}
            {...this.props}
            getList={this.getIssueListByPage}
            handleJump={this.handleJump}
            filtertype={filtertype} />
        </span>);
      }else if(record && record.ticket) {
        return (<span>
          <TicketDiffOperations
            record={record}
            {...this.props}
            getList={this.getIssueListByPage}
            handleJump={this.handleJump}
            filtertype={filtertype} />
        </span>);
      }
    }
  }];

  componentDidMount() {
    this.props.getThis(this);
    this.getDefaultFilter();
    this.productList4MyFeedback();
    this.props.dispatch({ type: 'product/getSameCompanyProduct' });
  }

  componentDidUpdate(preProps) {
    if(preProps.commentLoading !== this.props.commentLoading && !this.props.commentLoading){
      this.getIssueListByPage();
    }
  }

  // 创建完建议后切换成我报告的filtertype为2
  setFilterTypeToREPORT = () => {
    this.updateFilter('filtertype', ADVISE_TICKET_TABS.REPORT);
  }

  productList4MyFeedback = () => {
    productList4MyFeedback().then(res => {
      if (res.code !== 200) return message.error(res.msg);
      this.setState({ allProductList: res.result || [] });
    }).catch(e => {
      return message.error(e || e.message);
    });
  }

  getDefaultFilter = () => {
    const { filterObj } = this.state;
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const adviseFilter = storageFilter.advise || {};
    let newFilterObj = {
      ...filterObj,
      ...adviseFilter,
    };

    newFilterObj = {
      ...newFilterObj,
      state: newFilterObj.state || EXCLUDE_CANCLE_CLOSE,
    };
    this.setState({ filterObj: newFilterObj }, () => this.getIssueListByPage());
  }

  getIssueListByPage = () => {
    const { filterObj } = this.state;
    const type = (filterObj && filterObj.type) || [];

    const params = {
      ...filterObj,
      type: type.length > 0 ? type : MY_FEEDBACK,
      offset: (filterObj.current - 1) * 10,
      limit: 10,
      orderby: orderFieldAdviseNameMap[filterObj.orderby],
      order: orderNameMap[filterObj.order],
    };
    this.props.dispatch({ type: 'myworkbench/getIssueListByPage', payload: { ...params } });
    this.props.dispatch({ type: 'myworkbench/getIssueTotalCount', payload: { ...params } });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    if (key === 'filtertype') {
      // 调用建议的count
      this.props.dispatch({ type: 'myworkbench/getAdviseCount' });
    }

    let newFilterObj = deepCopy(filterObj);
    newFilterObj = {
      ...newFilterObj,
      [key]: value,
    };

    if (key !== 'current') {
      newFilterObj = {
        ...newFilterObj,
        current: 1,
      };
    }

    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const newStorageFilter = {
      ...oldStorageFilter,
      advise: newFilterObj,
    };
    localStorage.setItem('my_workbench_filter', JSON.stringify(newStorageFilter));
    this.setState({ filterObj: newFilterObj }, () => this.getIssueListByPage());
  }

  getDefaultOrder = (type) => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const adviseFilter = storageFilter.issue || {};
    if (type === 'orderby') {
      return adviseFilter.orderby || 1;
    } else {
      return adviseFilter.order || 2;
    }
  }

  handleJump = (record) => {
    const aid = record && record.advise && record.advise.id;
    const tid = record && record.ticket && record.ticket.id;
    const astate = record && record.advise && record.advise.state;
    const tstate = record && record.ticket && record.ticket.state;
    const { filterObj } = this.state;
    const filtertype = filterObj.filtertype;
    const state = astate || tstate;

    if (filtertype === ADVISE_TICKET_TABS.RESPONSE && (state === ADVISE_STATUS_MAP.NEW || state === ADVISE_STATUS_MAP.REOPEN)) {
      const params = {
        id: aid || tid,
        state: ADVISE_STATUS_MAP.ASSESS,
      };
      let updateFun = null;
      if(tid) {
        updateFun = updateTicketState(params);
      }else {
        updateFun = updateAdviseState(params);
      }
      updateFun.then(res => {
        if (res.code !== 200) return message.error(res.msg);
        this.props.dispatch({ type: 'myworkbench/getAdviseCount' });
        this.getIssueListByPage();
        this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: aid ? `Feedback-${aid}` : `Ticket-${tid}` });
      }).catch(err => {
        return message.error(err || err.message);
      });
    } else {
      this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: aid ? `Feedback-${aid}` : `Ticket-${tid}` });
    }
  }

  getFilterProduct = () => {
    const { issueList } = this.props;
    const arr = [];
    issueList && issueList.forEach(it => {
      if (!arr.some(i => i.id === it.product.id)) {
        arr.push({
          ...it.product,
        });
      }
    });
    return arr;
  }

  getColumns = () => {
    const { filterObj } = this.state;
    switch(filterObj.filtertype) {
      case ADVISE_TICKET_TABS.REPORT:
        return this.columns.filter(it => it.dataIndex !== 'report');
      case ADVISE_TICKET_TABS.RESPONSE:
        return this.columns.filter(it => it.dataIndex !== 'response');
      default:
        return this.columns.filter(it => it.dataIndex !== 'caozuo');
    }
  }

  render() {
    const { issueList, issueTotal, issueLoading, count } = this.props;
    const { filterObj, allProductList } = this.state;

    return (<span className={styles.container}>
      <div className="u-mg10" style={{ marginBottom: '0px' }}>
        <RadioGroup
          onChange={(e) => this.updateFilter('filtertype', e.target.value)}
          value={filterObj.filtertype}
        >
          <RadioButton key={ADVISE_TICKET_TABS.REPORT} value={ADVISE_TICKET_TABS.REPORT}>我报告的</RadioButton>
          <RadioButton key={ADVISE_TICKET_TABS.RESPONSE} value={ADVISE_TICKET_TABS.RESPONSE}>
            <Badge count={count}>
              <span>我负责的</span>
            </Badge>
          </RadioButton>
          <RadioButton key={ADVISE_TICKET_TABS.SUBSCRIBE} value={ADVISE_TICKET_TABS.SUBSCRIBE}>我关注的</RadioButton>
        </RadioGroup>

        <QueryArea
          updateFilter={this.updateFilter}
          allProductList={allProductList}
          {...this.props}
        />

        <span className="f-fr">
          <span className='grayColor'>排序：</span>
          <OrderTime
            changeOrderField={(value) => this.updateFilter('orderby', value)}
            changeOrder={(value) => this.updateFilter('order', value)}
            orderFieldData={orderFieldAdviseData}
            orderData={orderData}
            defaultOrderField={this.getDefaultOrder('orderby')}
            defaultOrder={this.getDefaultOrder('order')}
            from="my_workbench"
          />
        </span>

        <Table
          columns={this.getColumns()}
          dataSource={issueList}
          className="u-mgt20"
          pagination={{
            pageSize: 10,
            current: filterObj.current,
            onChange: (num) => this.updateFilter('current', num),
            total: issueTotal,
          }}
          onRow={(record) => {
            return {
              className: 'f-csp',
              onClick: (e) => {
                e.stopPropagation();
                drawerDelayFun(() => {
                  this.handleJump(record);
                }, 200);
              }
            };
          }}
          loading={issueLoading}
        />
      </div>

    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    commentLoading: state.loading.effects['receipt/setCommentState'],
  };
};

export default connect(mapStateToProps)(MyAdvise);
