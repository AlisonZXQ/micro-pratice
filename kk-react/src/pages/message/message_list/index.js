import React, { Component } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Table, message } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { queryMessageList, queryMessageDetail, updateState, updateAllState, deleteMessage, deleteAllMessage, getProductUser } from '@services/message';
import { getLinkableContent } from '@utils/helper';
import { deleteModal, warnModal } from '@shared/CommonFun';
import QueryArea from './components/QueryArea';
import styles from './index.less';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      size: '0',
      expandedRowKeys: [],
      filterObj: {
        state: '',
        productid: [],
        type: [],
      },
      pagination: {
        current: 1
      },
      loading: false,
      visible: false,
      record: {}, // 结项用
      content: '', //消息详细内容
      productUserArr: [], //子产品列表
    };
  }

  componentDidMount() {
    this.getMessageList();
    this.getProductList();
  }

  componentWillReceiveProps(nextProps) {
    const propsId = this.props.lastProduct && this.props.lastProduct.id;
    const nextPropsId = nextProps.lastProduct && nextProps.lastProduct.id;
    if (propsId !== nextPropsId) {
      this.getProductList(nextPropsId);
    }
  }

  getProductList = (id) => {
    getProductUser(id).then((res) => {
      if (res.code !== 200) return message.error('查询产品失败', res.message);
      if (res.result) {
        this.setState({ productUserArr: res.result });
      }
    }).catch((err) => {
      return message.error('查询产品异常', err || err.message);
    });
  }

  open = (record) => {
    const { id: key } = record; //展开列表
    let filtered = this.state.expandedRowKeys;
    if (this.state.expandedRowKeys.includes(key)) {
      filtered.splice(filtered.findIndex(element => element === key), 1);
      this.setState({
        expandedRowKeys: filtered,
      });
      return;
    } else {
      this.setState({ loading: true });
    }
    const params = {
      id: record.id
    };
    queryMessageDetail(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询消息详情失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      this.setState({
        content: getLinkableContent(res.result.content),
      });
      if (this.state.expandedRowKeys.includes(key)) {
        filtered.splice(filtered.findIndex(element => element === key), 1);
      } else {
        filtered = [key];
      }
      this.setState({
        expandedRowKeys: filtered,
      });

      updateState(params).then((res) => { //改变消息状态
        if (res.code === 200) {
          let arr = this.state.listData;
          arr.map(item => {
            if (item.id === record.id) {
              item.state = 1;
            }
          });
          this.setState({
            listData: arr,
          });
          this.props.dispatch({ type: 'message/getCurrentMessageCount' });
        }
      });
    });
  }


  allClick = (type) => {
    var params = this.state.filterObj;
    if (type === 'delete') {
      deleteModal({
        title: '你确认删除当前产品下所有消息么？',
        okCallback: () => {
          deleteAllMessage(params).then((res) => {
            if (res.code !== 200) {
              return message.error(`删除失败, ${res.msg}`);
            }
            this.getMessageList();
            this.props.dispatch({ type: 'message/getCurrentMessageCount' });
            return message.success('删除成功');
          }).catch((error) => {
            return message.error(`删除异常, ${error || error.message}`);
          });
        }
      });
    } else {
      warnModal({
        title: '你确认当前产品下所有消息设为已读么？',
        okCallback: () => {
          updateAllState(params).then((res) => {
            if (res.code !== 200) {
              return message.error(`设置失败, ${res.msg}`);
            }
            this.getMessageList();
            this.props.dispatch({ type: 'message/getCurrentMessageCount' });
            return message.success('设置成功');
          }).catch((error) => {
            return message.error(`设置异常, ${error || error.message}`);
          });
        }
      });
    }
  }

  updateFilter = (key, value) => {
    let newValue = value;
    if (key === 'state' && value === '2') {
      this.setState({ size: value });
    } else if (key === 'state' && value === '0') {
      newValue = '';
      this.setState({ size: '0' });
    }
    const { filterObj } = this.state;
    const newObj = {
      ...filterObj,
      [key]: newValue,
    };
    const newPage = {
      current: 1
    };
    this.setState({ pagination: newPage });
    this.setState({ filterObj: newObj }, () => this.getMessageList());
  }

  handlePageChange = (pageNum) => {
    const { pagination } = this.state;
    const newObj = {
      ...pagination,
      current: pageNum
    };
    this.setState({ pagination: newObj }, () => this.getMessageList());
  }

  getMessageList = () => {
    const { pagination: { current }, filterObj } = this.state;
    const params = {
      ...filterObj,
      limit: 10,
      offset: current - 1,
    };
    if (params.offset !== 0) {
      params.offset = params.offset * 10;
    }
    this.setState({ loading: true });
    queryMessageList(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`查询项目列表失败, ${res.msg}`);
      }
      this.setState({ loading: false });
      let pagination = {
        ...this.state.pagination,
        total: res.result.totalCount,
        current,
      };
      this.setState({
        listData: res.result.list || [],
        pagination
      });
    }).catch((err) => {
      this.setState({ loading: false });
      return message.error(`查询项目列表异常, ${err || err.message}`);
    });
  }

  Delete = (id) => {
    const params = {
      id: id,
    };
    deleteMessage(params).then((res) => {
      if (res.code !== 200) {
        return message.error(`删除失败,${res.msg}`);
      }
      if (this.state.listData.length % 10 === 1 && this.state.pagination.total !== 1) {
        let pagination = {
          current: this.state.pagination.current - 1
        };
        this.setState({ pagination });
      }
      this.getMessageList();
      this.props.dispatch({ type: 'message/getCurrentMessageCount' });
      return message.success('删除成功');
    });
  }
  getDetails = (record) => {
    return (
      <div style={{ paddingLeft: '10px' }}>
        <p style={{ margin: '0px' }}>{record.title}</p>
        <p dangerouslySetInnerHTML={{ __html: this.state.content }} style={{ marginTop: '10px' }}></p>
      </div>
    );
  }

  render() {
    const columns = [
      {
        title: 'Action',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => {
          if (record.state === 2) {
            return (
              <span className={`f-csp ${styles.unread}`} onClick={() => this.open(record)}><span className={styles.circle}></span>{text}</span>
            );
          } else {
            return (
              <span className={`f-csp`} onClick={() => this.open(record)}><span></span>{text}</span>
            );
          }
        }
      },
      {
        title: 'Addtime',
        dataIndex: 'addtime',
        key: 'addtime',
        render: (text, record) => {
          return (
            <span className={styles.time}>{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          );
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        key: '',
        render: (record) => <a onClick={() => this.Delete(record.id)} className='delColor'>删除</a>,
      },
    ];
    const { pagination: { total, current },
      loading, size, expandedRowKeys, listData, productUserArr } = this.state;
    return (
      <div>
        <div className={styles.head}>消息中心</div>
        <div className={styles.msgContent}>
          <QueryArea
            updateFilter={this.updateFilter}
            size={size}
            allClick={this.allClick}
            productUserArr={productUserArr}
          />
          <Table
            className={`u-mgt20 ${styles.table}`}
            loading={loading}
            columns={columns}
            rowKey={(record) => record.id}
            expandedRowRender={this.getDetails}
            dataSource={listData}
            expandIconAsCell={false}
            expandIconColumnIndex={-1}
            expandedRowKeys={expandedRowKeys}
            showHeader={false}
            pagination={{
              pageSize: 10,
              current: current,
              onChange: this.handlePageChange,
              defaultCurrent: 1,
              total: total,
              showTotal: (total) => `总条数: ${total}`
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lastProduct: state.product.lastProduct,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));

