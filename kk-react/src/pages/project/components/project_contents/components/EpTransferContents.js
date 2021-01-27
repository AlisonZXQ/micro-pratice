import React, { Component } from 'react';
import { Table, message, Pagination } from 'antd';
import debounce from 'lodash/debounce';
import { queryEpList } from '@services/project';
import { getSubProductList } from '@services/product';
import { equalsObj } from '@utils/helper';
import EpIcon from '@components/EpIcon';
import { SUB_PRODUCT_ENABLE } from '@shared/ProductSettingConfig';
import EpQueryArea from './EpQueryArea';

class EpTransferContents extends Component {
  state = {
    filterObj: {
      pageNo: 1,
      pageSize: 10,
      productIdList: [],
      subProductIdList: [],
    },
    activeValue: [],
    data: [],
    total: 0,
    loading: false,
    subProductList: [],
  };
  columns = [
    {
      title: '主题',
      dataIndex: 'summary',
      render: (text, record) => <span>
        <EpIcon type={record.issuetype} />
        <a className='u-mgl10'>{text}</a>
      </span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
    },
  ];

  componentDidMount() {
    const { projectContents, data } = this.props;
    let activeValue = projectContents.map((it) => {
      return it.issueKey;
    });
    this.props.handleEpItems(activeValue);
    this.setState({ activeValue });
    if (data) {
      this.getDefaultList(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      this.getDefaultList(nextProps.data);
    }
  }

  getDefaultList = (data) => {
    const params = {
      ...this.state.filterObj,
      subProductIdList: [data.subProductVO.id],
      productIdList: [data.products[0].id],
    };
    this.setState({ filterObj: params }, () => { this.getData(); this.getSubProductList() });
  }

  getData = debounce(() => {
    this.setState({ loading: true });
    const params = {
      ...this.state.filterObj,
    };
    queryEpList(params).then((res) => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);

      this.setState({
        data: res.result && res.result.list,
        total: res.result && res.result.total,
      });

    }).catch((err) => {
      this.setState({ loading: false });
      return message.error('查询单据异常', err || err.message);
    });
  }, 300)

  getSubProductList = (value) => {
    const productid = value || this.state.filterObj.productIdList[0];
    const params = {
      productIdList: productid,
    };
    getSubProductList(params).then((res) => {
      if (res.code !== 200) return message.error('查询子产品失败', res.message);
      if (res.result) {
        this.setState({ subProductList: res.result });
      }
    }).catch((err) => {
      return message.error('查询子产品异常', err || err.message);
    });
  }

  updateFilter = (key, value) => {
    const { data } = this.props;
    const { filterObj } = this.state;

    if (key === 'productIdList') {
      this.getSubProductList(value);
      if (data.products[0].id !== value) { //子产品没有默认值
        const newObj = {
          ...filterObj,
          [key]: value,
          subProductIdList: [],
          pageNo: 1,
        };
        this.setState({ filterObj: newObj }, () => this.getData());
        return;
      }
    }

    const newObj = {
      ...filterObj,
      [key]: value,
      pageNo: 1,
    };
    this.setState({ filterObj: newObj }, () => this.getData());
  }

  handlePageChange = (pageNo) => {
    const newParams = {
      ...this.state.filterObj,
      pageNo: pageNo,
    };
    this.setState({ data: [] });
    this.setState({ filterObj: newParams }, () => this.getData());
  }

  onShowSizeChange = (current, pageSize) => {
    const newParams = {
      ...this.state.filterObj,
      pageSize: pageSize,
    };
    this.setState({ data: [] });
    this.setState({ filterObj: newParams }, () => this.getData());
  }

  render() {
    const { issueCondition, productByUser } = this.props;
    const { data, filterObj: { pageSize, pageNo, productIdList, subProductIdList },
      total, loading, activeValue, subProductList } = this.state;

    const enableSubProductList = subProductList.filter(it => it.isEnable === SUB_PRODUCT_ENABLE.ENABLE) || [];

    const rowSelection = {
      onSelectAll: (selected) => {
        let newActiveValue = activeValue;
        if (!selected) { //清空则删除当前列表对应值
          data && data.map((it) => {
            if (newActiveValue.indexOf(it.issueKey) > 0) {
              newActiveValue.splice(newActiveValue.indexOf(it.issueKey), 1);
            }
          });
        } else {
          data && data.map((it) => {
            newActiveValue.push(it.issueKey);
            newActiveValue = [...new Set(newActiveValue)];
          });
        }
        this.props.handleEpItems(newActiveValue);
      },
      onSelect: (record) => {
        let newActiveValue = activeValue;
        if (activeValue.indexOf(record.issueKey) > -1) { //存在则删除
          newActiveValue.splice(newActiveValue.indexOf(record.issueKey), 1);
        } else {
          newActiveValue.push(record.issueKey);
        }
        this.props.handleEpItems(newActiveValue);
      },
      getCheckboxProps: record => ({
        defaultChecked: activeValue.includes(record.issueKey),
      }),
    };

    return (<span>
      <EpQueryArea
        issueTypes={issueCondition.issueTypes}
        statuses={issueCondition.statuses}
        productByUser={productByUser}
        updateFilter={this.updateFilter}
        subProductList={enableSubProductList}
        productIdList={productIdList}
        subProductIdList={subProductIdList}
      />
      <div style={{ height: 'calc(100vh - 190px)', overflow: 'auto' }}>
        <Table
          loading={loading}
          rowKey={record => record.issueKey}
          className='u-mgt10'
          rowSelection={rowSelection}
          columns={this.columns}
          pagination={false}
          dataSource={data} />
      </div>
      <Pagination
        className='u-mgt10'
        pageSize={pageSize}
        current={pageNo}
        showSizeChanger
        onShowSizeChange={this.onShowSizeChange}
        onChange={this.handlePageChange}
        total={total}
        showTotal={total => <span>共{total}个</span>}
      />
    </span>);
  }
}

export default EpTransferContents;
