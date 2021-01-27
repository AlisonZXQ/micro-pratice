import React, { Component } from 'react';
import { Radio, Table } from 'antd';
import { connect } from 'dva';
import { drawerDelayFun } from '@utils/helper';
import OrderTime from '@components/OrderTime';
import TextOverFlow from '@components/TextOverFlow';
import DefineDot from '@components/DefineDot';
import EpIcon from '@components/EpIcon';
import { connTypeMapIncludeProject } from '@shared/CommonConfig';
import { MY_ISSUE, orderFieldIssueData, orderFieldIssueNameMap, orderData, orderNameMap, RESPONSE_REQUIRE,
  nameMap, colorMap, typeMap, urlMap, typeNameMap, EXCLUDE_CLOSE_CANCEL } from '@shared/WorkbenchConfig';
import QueryArea from './components/QueryArea';
import QueryMore from './components/QueryMore';


const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class index extends Component {
  state = {
    filterObj: {
      orderby: 1,
      order: 2,
      filtertype: 1,
      current: 1,
    }
  }
  columns = [{
    title: '标题',
    dataIndex: 'name',
    width: '600px',
    render: (text, record) => {
      const type = record.receipt.type;
      const task = record.task || {};
      const receipt = record.receipt || {};

      return <span className='f-aic'>
        {
          type === connTypeMapIncludeProject.task && <span>
            {task.parentid ?
              <EpIcon type={'subTask'} className={`f-fs3 u-mgr10`} /> :
              <EpIcon type={'task'} className={`f-fs3 u-mgr10`} />}
          </span>
        }
        {
          type !== connTypeMapIncludeProject.task &&
          <EpIcon type={typeMap[type]} className={`f-fs3 u-mgr10`} />
        }
        <TextOverFlow
          content={
            <a>{receipt.name}</a>}
          maxWidth={'550px'}
        />
      </span>;
    }
  }, {
    title: '状态',
    dataIndex: 'status',
    width: '150px',
    render: (text, record) => {
      const receipt = record.receipt || {};

      return (<DefineDot
        text={receipt.state}
        statusMap={nameMap[receipt.type]}
        statusColor={colorMap[receipt.type]}
      />);
    }
  }, {
    title: '所属产品',
    dataIndex: 'product',
    render: (text) => {
      return text && text.name;
    }
  }];

  componentDidMount() {
    this.getDefaultFilter();
    this.props.getThis(this);
  }

  getDefaultFilter = () => {
    const { filterObj } = this.state;
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const issueFilter = storageFilter.issue || {};
    let newFilterObj = {
      ...filterObj,
      ...issueFilter,
    };
    newFilterObj = {
      ...newFilterObj,
      state: newFilterObj.state || EXCLUDE_CLOSE_CANCEL,
    };
    this.setState({ filterObj: newFilterObj }, () => this.getIssueListByPage());
  }

  handleJumpIssue = (id) => {
    this.props.dispatch({ type: 'product/setLastProduct', payload: { productId: id } });
  }

  getHref = (type, id) => {
    return `${urlMap[type]}-${id}`;
  }

  getIssueListByPage = () => {
    const { filterObj } = this.state;
    const type = filterObj.type || [];
    let typeArr = type.filter(i => i !== 1);

    const params = {
      ...filterObj,
      type: typeArr.length ? typeArr : MY_ISSUE,
      offset: (filterObj.current - 1) * 10,
      limit: 10,
      orderby: orderFieldIssueNameMap[filterObj.orderby],
      order: orderNameMap[filterObj.order],
    };
    this.props.dispatch({ type: 'myworkbench/getIssueListByPage', payload: { ...params } });
    this.props.dispatch({ type: 'myworkbench/getIssueTotalCount', payload: { ...params } });
  }

  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let NewFilterObj = {
      ...filterObj,
      [key]: value,
    };

    if (key !== 'current') {
      NewFilterObj = {
        ...NewFilterObj,
        current: 1,
      };
    }

    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const newStorageFilter = {
      ...oldStorageFilter,
      issue: NewFilterObj,
    };
    localStorage.setItem('my_workbench_filter', JSON.stringify(newStorageFilter));

    this.setState({
      filterObj: NewFilterObj,
    }, () => this.getIssueListByPage());
  }

  getDefaultOrder = (type) => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const issueFilter = storageFilter.issue || {};
    if (type === 'orderby') {
      return issueFilter.orderby || 1;
    } else {
      return issueFilter.order || 2;
    }
  }

  render() {
    const { issueTotal, issueList, issueLoading } = this.props;
    const { filterObj } = this.state;
    const isrr = RESPONSE_REQUIRE.indexOf(filterObj.filtertype) > -1;

    return (<span>
      <div className="u-mg10">
        <RadioGroup
          onChange={(e) => this.updateFilter('filtertype', e.target.value)}
          value={filterObj.filtertype}
        >
          <RadioButton key={1} value={1}>我负责的</RadioButton>
          <RadioButton key={2} value={2}>我报告的</RadioButton>
          <RadioButton key={3} value={3}>我验证的</RadioButton>
          <RadioButton key={4} value={4}>我关注的</RadioButton>
        </RadioGroup>

        <QueryArea
          updateFilter={this.updateFilter}
          isrr={isrr}
          {...this.props}
        />

        <span className="f-fr">
          <span>
            <span className='grayColor'>排序：</span>
            <OrderTime
              changeOrderField={(value) => this.updateFilter('orderby', value)}
              changeOrder={(value) => this.updateFilter('order', value)}
              orderFieldData={orderFieldIssueData}
              orderData={orderData}
              defaultOrderField={this.getDefaultOrder('orderby')}
              defaultOrder={this.getDefaultOrder('order')}
              from="my_workbench"
            />
          </span>
          {isrr &&
            <span>
              <QueryMore />
            </span>
          }
        </span>

        <Table
          columns={this.columns}
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
                let type = typeNameMap[record.receipt.type];
                if (record.task && record.task.parentid) {
                  type = 'Subtask';
                }

                drawerDelayFun(() => {
                  this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${type}-${record.receipt.connid}` });
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

export default connect()(index);
