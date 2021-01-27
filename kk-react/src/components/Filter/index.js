import React, { Component } from 'react';
import { Button, Dropdown, message, Modal, Input, Popover } from 'antd';
import { connect } from 'dva';
import { history } from 'umi';
import MyIcon from '@components/MyIcon';
import { getFilterList, filterConditionList, filterDelete, filterAdd, filterUpdate } from '@services/advise';
import { getAllSubProductList } from '@services/product';
import { deleteModal } from '@shared/CommonFun';
import { RECEIPT_LOG_TYPE } from '@shared/ReceiptConfig';
import styles from './index.less';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterList: [],
      visible: false,
      filterValue: '',
      filterName: '全部',
      filterid: 'all',
      filterType: {
        advise: RECEIPT_LOG_TYPE.ADVISE,
        requirement: RECEIPT_LOG_TYPE.REQUIREMENT,
        task: RECEIPT_LOG_TYPE.TASK,
        bug: RECEIPT_LOG_TYPE.BUG,
        objective: RECEIPT_LOG_TYPE.OBJECTIVE,
        ticket: RECEIPT_LOG_TYPE.TICKET
      },
      isChangeFilter: false,
      defaultValue: 'all',
    };
  }

  componentDidMount() {
    const { productid, filterid } = this.props.location.query;
    if (productid) {
      const filter = filterid ? { id: Number(filterid) } :
        JSON.parse(localStorage.getItem(`filter_${this.props.type}_${productid}`)) || { id: 'all' };
      this.getFilterList(productid);
      this.setFilterCondition(filter, productid);
      this.setDefault(filter.id, null, productid);
    }

    const sessionChangeFilter = JSON.parse(sessionStorage.getItem(`${this.props.type}ChangeFilter_${productid}`));
    if (sessionChangeFilter) {
      this.setState({ isChangeFilter: sessionChangeFilter })
    }
  }

  componentWillReceiveProps(nextProps) {
    const propsId = this.props.lastProduct.id;
    const nextPropsId = nextProps.lastProduct.id;

    if (this.props.isChangeFilter !== nextProps.isChangeFilter) {
      this.setState({ isChangeFilter: nextProps.isChangeFilter });
    }
    if (propsId !== nextPropsId) {
      if (propsId) { //解决刷新时，调用两次接口的问题
        const filter = JSON.parse(localStorage.getItem(`filter_${this.props.type}_${nextPropsId}`)) || { id: 'all' };
        this.getFilterList(nextPropsId);
        this.setFilterCondition(filter, nextPropsId);
        this.setDefault(filter.id, null, nextPropsId);
      }
    }
  }

  getFilterList = (id) => {
    const productid = id || this.props.location.query.productid;
    const { type } = this.props;
    const { filterType } = this.state;
    const params = {
      type: filterType[type],
      productid,
    };
    if (productid && productid !== 'undefined') {
      getFilterList(params).then((res) => { //获取过滤器列表
        if (res.code !== 200) { return message.error(res.msg) }
        this.setState({ filterList: res.result });
      }).catch((err) => {
        return message.error(err || err.message);
      });
    }
  }

  setFilterCondition = (item, productid) => {
    let itemId = (item === 'all' || item === 'allOpen') ? item : item.id;
    itemId = itemId || 'all';
    this.setState({ filterid: itemId });
    this.setState({ isChangeFilter: false });
    if (itemId === 'all' || itemId === 'allOpen') {
      this.getSubproductList(itemId, productid);
      return;
    }

    const params = {
      id: itemId,
    };
    filterConditionList(params).then((res) => { //获取单据过滤器列表
      if (res.code !== 200) { return message.error(res.msg) }
      const data = res.result;
      this.setState({ filterName: data && data.filter.name });
      this.props.queryCondition(res.result, productid);

    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  getSubproductList = (itemId, productid) => {
    const queryProductId = this.props.location.query.productid;
    const productId = productid || queryProductId;
    getAllSubProductList(productId).then((res) => {
      if (res.code !== 200) return message.error('查询子产品失败', res.message);
      if (res.result) {
        this.filterAllCondition(itemId, productid, res.result);
      }
    }).catch((err) => {
      return message.error('查询子产品异常', err || err.message);
    });
  }

  filterAllCondition = (name, nextPropsId, subProductList) => {
    this.setState({ filterName: name === 'all' ? '全部' : '全部打开的' });
    localStorage.removeItem(`qcl_${this.props.type}`);
    localStorage.removeItem(`${this.props.type}Order`);

    const productid = nextPropsId || this.props.location.query.productid;
    history.push(`/manage/product${this.props.type}/?productid=${productid}&filterid=${name}`);
    this.props.queryCondition(name, nextPropsId, subProductList);
  }

  setDefault = (name, isHandle, nextPropsId) => {
    const newName = name ? name : 'all';
    this.setState({ defaultValue: newName });
    const filter = {
      newName: newName === 'all' ? '全部' : newName === 'allOpen' ? '全部打开的' : '自定义',
      id: newName,
    }

    const productid = nextPropsId || this.props.location.query.productid;
    localStorage.setItem(`filter_${this.props.type}_${productid}`, JSON.stringify(filter));
    history.push(`/manage/product${this.props.type}/?productid=${productid}&filterid=${filter.id}`);

    if (isHandle === 'handle') {
      return message.success('设置成功');
    }
  }

  save = () => {
    const { filterValue } = this.state;
    if (!filterValue) {
      return message.warning('名称必填！');
    }
    let data = {};
    try {
      data = localStorage.getItem(`${this.props.type}ListQuery`) ?
        JSON.parse(localStorage.getItem(`${this.props.type}ListQuery`)) : {};
    } catch {
      console.log('异常')
    }

    const dataMore = JSON.parse(localStorage.getItem(`qcl_${this.props.type}`));
    const { productid } = this.props.location.query;
    const { filterType } = this.state;
    const params = {
      productid,
      type: filterType[this.props.type],
      name: filterValue,
      data: [JSON.stringify({
        key: `qcl_${this.props.type}`,
        value: JSON.stringify(dataMore),
      })]
    };
    for (let key in data) {
      if (key === 'customfield' && data[key].length !== 0) {
        const dataKey = JSON.parse(data[key]);
        dataKey.map((item) => {
          params.data.push(JSON.stringify({
            key: `qcl_customfield_${item.customfieldid}_${this.props.type}`,
            value: item.values,
          }));
        });
      } else if (data[key] !== '' && data[key].length !== 0) {
        params.data.push(JSON.stringify({
          key: `qcl_${key}_${this.props.type}`,
          value: data[key],
        }));
      }
    }
    params.data = `[${params.data}]`;

    filterAdd(params).then((res) => {
      if (res.code !== 200) { return message.error(res.msg) }
      message.success('添加成功');
      this.setState({ visible: false });
      this.setFilterCondition(res.result);
      this.getFilterList();
    }).catch((err) => {
      return message.error(err || err.message);
    });
  }

  handleDelete = (item) => {
    const _this = this;
    deleteModal({
      title: '提示',
      content: `您确认要删除过滤器【${item.name}】吗?`,
      okCallback: () => {
        const params = {
          id: item.id,
        };
        filterDelete(params).then((res) => { //删除过滤器
          if (res.code !== 200) { return message.error(res.msg) }
          const { productid } = _this.props.location.query;
          const filter = JSON.parse(localStorage.getItem(`filter_${_this.props.type}_${productid}`)) || {};
          if (item.id === filter.id) {
            _this.setFilterCondition('all');
          }
          message.success('删除成功');
          localStorage.removeItem(`filter_${_this.props.type}_${productid}`);
          _this.setDefault('all', null, productid);
          _this.getFilterList();
        }).catch((err) => {
          return message.error(err || err.message);
        });
      }
    })
  }

  resetSession = () => {
    const { productid } = this.props.location.query;
    sessionStorage.removeItem(`${this.props.type}ListQuery_${productid}`);
    sessionStorage.removeItem(`qcl_${this.props.type}_${productid}`);
    sessionStorage.removeItem(`${this.props.type}ChangeFilter_${productid}`);
  }

  handleReset = () => {
    this.resetSession();
    const { filterid } = this.state;
    const { productid } = this.props.location.query;
    if (filterid === 'all' || filterid === 'allOpen') {
      this.setFilterCondition(filterid, productid);
    } else {
      const item = {
        id: filterid,
      };
      this.setFilterCondition(item);
    }
  }

  menu = () => {
    const { filterList, filterName, defaultValue } = this.state;
    return (
      <div className={styles.filterMenu}>
        <div className={filterName === '全部打开的' ? styles.allOpen : {}}>
          <div
            className={styles.menuItem}
            onClick={() => {
              this.setFilterCondition('allOpen');
              this.resetSession();
            }}>
            <span>全部打开的</span>
            <span className={`${defaultValue === 'allOpen' ? '' : styles.delete} f-fr`}>
              <Popover overlayStyle={{ zIndex: '9999' }} content={<span>设为默认</span>}>
                <MyIcon
                  onClick={(e) => { e.stopPropagation(); this.setDefault('allOpen', 'handle') }}
                  type="icon-morengou"
                  className={defaultValue === 'allOpen' ? styles.activeDefaultIcon : styles.defaultIcon}
                  style={{ fontSize: '12px', paddingLeft: '5px' }} />
              </Popover>
            </span>
          </div>
        </div>
        <div style={filterName === '全部' ? { background: '#E6F5FF' } : {}}>
          <div
            className={styles.menuItem}
            onClick={() => {
              this.setFilterCondition('all');
              this.resetSession();
            }}>
            <span>全部</span>
            <span className={`${defaultValue === 'all' ? '' : styles.delete} f-fr`}>
              <Popover content={<span>设为默认</span>} overlayStyle={{ zIndex: '9999' }}>
                <MyIcon
                  onClick={(e) => { e.stopPropagation(); this.setDefault('all', 'handle') }}
                  type="icon-morengou"
                  className={defaultValue === 'all' ? styles.activeDefaultIcon : styles.defaultIcon} />
              </Popover>
            </span>
          </div>
        </div>
        {filterList.length > 0 && <div className={styles.hr}></div>}
        {filterList.map((item) => (
          <div className={item.name === filterName ? styles.allOpen : {}}>
            <div
              className={styles.menuItem}
              onClick={() => {
                this.setFilterCondition(item);
                this.resetSession();
              }}>
              <span className='f-ib f-toe' style={{ width: '120px' }}>{item.name}</span>
              <span className={`${defaultValue === item.id ? '' : styles.delete} f-fr`}
                onClick={(e) => { e.stopPropagation(); this.handleDelete(item) }}>
                <span style={{ color: 'red', marginRight: '5px' }}>删除</span>
                <Popover content={<span>设为默认</span>} overlayStyle={{ zIndex: '9999' }}>
                  <MyIcon
                    onClick={(e) => { e.stopPropagation(); this.setDefault(item.id, 'handle') }}
                    type="icon-morengou"
                    className={defaultValue === item.id ? styles.activeDefaultIcon : styles.defaultIcon} />
                </Popover>
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { visible, filterName, isChangeFilter } = this.state;
    return (<span className='u-mgl20'>
      <Dropdown overlay={this.menu()} trigger={['click']}>
        <span
          onClick={e => e.preventDefault()}
          className={`f-fs3 f-csp ${styles.title}`}
        >
          <span>{filterName}</span>
          {isChangeFilter && <span>(已修改)</span>}
          <MyIcon type="icon-xia" style={{ fontSize: '9px', paddingLeft: '5px', display: 'table-cell', }} />
        </span>
      </Dropdown>
      {isChangeFilter ?
        <span>
          <Button type='primary' className='u-mgl10' onClick={() => this.setState({ visible: true })}>保存为</Button>
          <Button className='u-mgl10' onClick={() => this.handleReset()}>重置</Button>
        </span> :
        <Button className='u-mgl10' onClick={() => this.setState({ visible: true })}>保存为</Button>
      }

      <Modal
        title="创建过滤器"
        visible={visible}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.save()}
        maskClosable={false}
      >
        <div className='u-mgt20'>
          <span className='needIcon'>*</span>名称：
          <Input
            placeholder="请输入过滤器名称"
            onChange={(e) => this.setState({ filterValue: e.target.value })}
            style={{ width: '280px' }} />
        </div>
      </Modal>
    </span>);
  }
}

export default connect()(Filter);
