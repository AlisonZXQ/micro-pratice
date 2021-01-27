import React, { Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';

import AdviseArea from '@pages/receipt/advise/advise_list/components/QueryArea';
import RequirementArea from '@pages/receipt/requirement/requirement_list/components/QueryArea';
import TaskArea from '@pages/receipt/task/task_list/components/QueryArea';
import BugArea from '@pages/receipt/bug/bug_list/components/QueryArea';
import ObjectiveArea from '@pages/receipt/objective/objective_list/components/QueryArea';
import TicketArea from '@pages/receipt/ticket/ticket_list/components/QueryArea';
import SearchNameId from '@pages/receipt/components/search_name_id';
import QueryMore from '@components/QueryMore';
import FilterSelect from '@components/FilterSelect';

import { getAdviseCustomList } from '@services/advise';
import { aQueryMoreList } from '@shared/AdviseConfig';
import { getRequirementCustomList } from '@services/requirement';
import { rQueryMoreList } from '@shared/RequirementConfig';
import { getTaskCustomList } from '@services/task';
import { tQueryMoreList } from '@shared/TaskConfig';
import { getBugCustomList } from '@services/bug';
import { bQueryMoreList } from '@shared/BugConfig';
import { getObjectiveCustomList } from '@services/objective';
import { oQueryMoreList } from '@shared/ObjectiveConfig';
import { getTicketCustomList } from '@services/ticket';
import { ticketQueryMoreList } from '@shared/TicketConfig';

import { equalsObj } from '@utils/helper';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryMoreList: [],
      currentProductId: 0,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'product/getUserProduct' }); //获取当前可用产品列表
    this.props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: this.props.productid } });

    this.getQueryMoreList();

    const { detail } = this.props;
    if (detail.product && detail.product.id) { //获取默认产品和子产品数据
      this.setState({ currentProductId: detail.product.id });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.detail, nextProps.detail)) {
      this.setState({ currentProductId: nextProps.detail.product.id });
    }
  }

  setQueryMoreList = (data, list) => {
    let newQueryMoreList = list;

    data.map((it) => {
      newQueryMoreList.push({
        key: `customfield_${it.id}`,
        value: `${it.name}`,
        status: it.type
      });
    });
    this.setState({ queryMoreList: newQueryMoreList });
  }

  getQueryMoreList = () => {
    const { type, productid } = this.props;
    const params = {
      productid: productid
    };
    if (type === 'advise') {

      getAdviseCustomList(params).then((res) => { //建议
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(aQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (type === 'requirement') {

      getRequirementCustomList(params).then((res) => { //需求
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(rQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (type === 'task') {

      getTaskCustomList(params).then((res) => { //任务
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(tQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if (type === 'bug') {

      getBugCustomList(params).then((res) => { //缺陷
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(bQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if(type === 'objective') {

      getObjectiveCustomList(params).then((res) => { //目标
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(oQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    } else if(type === 'ticket') {

      getTicketCustomList(params).then((res) => { //目标
        if (res.code !== 200) { return message.error(res.msg) }
        const queryMoreList = JSON.parse(JSON.stringify(ticketQueryMoreList));
        this.setQueryMoreList(res.result, queryMoreList);
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  currentUpdateFilter = (key, value) => {
    this.props.updateFilter(key, value);
    this.setState({ currentProductId: value });
  }

  changeQueryMore = (arr) => {

  }

  render() {
    const { productByUser, type, productid, parentParams, detail } = this.props;
    const defaultProductId = (detail && detail.product && detail.product.id) || 0;
    const defaultProductName = (detail && detail.product && detail.product.name) || '';
    const defaultProductList = [{name: defaultProductName, id: defaultProductId}];

    const subProductId = (detail && detail.subproduct && detail.subproduct.id) || 0;
    const { queryMoreList, currentProductId } = this.state;
    const changeProductId = detail.product && Number(currentProductId) !== Number(detail.product.id);

    return (<span className='f-jcsb-aic'>
      <span className="m-query">
        <span className="f-ib f-vam grayColor">产品：</span>
        <FilterSelect
          onChange={(value) => this.currentUpdateFilter('productid', value)}
          dataSource={defaultProductList.map(item => ({
            label: item.name, value: item.id,
          }))}
          defaultValue={[defaultProductId]}
          readOnly={true}
        />
        {type === 'advise' &&
          <AdviseArea
            type={'advise'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        {type === 'requirement' &&
          <RequirementArea
            type={'requirement'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        {type === 'task' &&
          <TaskArea
            type={'task'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        {type === 'bug' &&
          <BugArea
            type={'bug'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        {type === 'objective' &&
          <ObjectiveArea
            type={'objective'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        {type === 'ticket' &&
          <TicketArea
            type={'ticket'}
            updateFilter={this.props.updateFilter}
            productid={productid}
            subProductId={changeProductId ? 0 : [subProductId]}
            subProductList={this.props.subProductAll}
            isNotList={true}
          />
        }
        <span style={{ position: 'relative', top: '2px' }}>
          <QueryMore
            type={type}
            isNotList={true}
            updateFilter={this.props.updateFilter}
            dataSource={queryMoreList}
            changeQueryMore={this.changeQueryMore}
            productid={currentProductId}
            parentParams={parentParams}
          />
        </span>
      </span>
      <span>
        <SearchNameId
          updateFilter={this.props.updateFilter}
          defaultValue={''}
          type={type} />
      </span>
    </span>);
  }
}

const mapStateToProps = (state) => {
  return {
    productByUser: state.product.productList,
    subProductAll: state.product.subProductAll,
  };
};

export default connect(mapStateToProps)(index);
