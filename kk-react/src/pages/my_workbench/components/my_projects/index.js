import React, { Component } from 'react';
import { Radio, message, Pagination, Spin, Empty, Row, Input } from 'antd';
import debounce from 'lodash/debounce';
import OrderTime from '@components/OrderTime';
import { cancelCollectProject } from '@services/project';
import DefineDot from '@components/DefineDot';
import MyIcon from '@components/MyIcon';
import TextOverFlow from '@components/TextOverFlow';
import FilterSelect from '@components/FilterSelect';
import { getMyOwnerPro, getMyParticipatePro, getMyCollectPro, getMyOwnerProduct, getMyParticipateProduct, getMyCollectProduct, getProjectWorkbenchDetail } from '@services/my_workbench';
import TreeSelect from '@components/TreeSelect';
import { statusMap, statusColor, projectStatusArr } from '@shared/ProjectConfig';
import { orderFieldProjectData, orderData, orderFieldProjectByMap, orderProjectNameMap } from '@shared/WorkbenchConfig';
import PojectCard from './project_card';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;
const notCloseStatus = [1, 2, 3, 4, 7, 8];

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterObj: {
        orderby: 1, // create_time，update_time
        orderType: 2, // desc，asc
        type: 'own',
        current: 1,
        product: [],
        status: [],
      },
      subProductList: [], // 用户有权限的项目子产品列表
      datasource: {},
      datasourceDetailArr: [],
      productList: [],
      loading: false,
    };
    this.queryProjectList = debounce(this.queryProjectList, 800);
    this.columns = [{
      title: '项目名称',
      dataIndex: 'title',
      width: '20vw',
      render: (text, record) => {
        return (<span className='f-aic'>
          <MyIcon className="u-mgr10" type='icon-xiangmuliebiaoicon' style={{ fontSize: '38px' }} />
          <div className='f-ib'>
            <div className='f-fs2' style={{ paddingBottom: '1px' }}><TextOverFlow content={text} maxWidth={'20vw'} /></div>
            <div className='grayColor f-fs1' style={{ paddingTop: '1px' }}>
              <TextOverFlow content={record.description ? record.description : '-'} maxWidth={'20vw'} />
            </div>
          </div>
        </span>);
      }
    }, {
      title: '状态',
      dataIndex: 'status',
      render: (text) => {
        return (
          <DefineDot
            text={text}
            statusMap={statusMap}
            statusColor={statusColor}
          />
        );
      },
    }, {
      title: '优先级',
      dataIndex: 'priority',
      render: (text) => {
        return text ? text : '-';
      }
    }, {
      title: '起止时间',
      dataIndex: 'timeRange',
      width: '16vw',
      render: (text, record) => {
        return (<div>
          {(record && !!record.startTime && !!record.endTime) ?
            <span>{record.startTime}~{record.endTime}</span>
            : '-'
          }
        </div>);
      }
    }, {
      title: '所属子产品',
      dataIndex: 'subProductVO',
      width: 200,
      render: (text) => {
        return text ?
          <TextOverFlow content={text.subProductName} maxWidth={200} /> : '-';
      }
    }];
  }

  componentDidMount() {
    this.getDefaultFilter();
  }

  getDefaultFilter = () => {
    const { filterObj } = this.state;
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const projectFilter = storageFilter.projectV2 || {};
    const newFilterObj = {
      ...filterObj,
      ...projectFilter,
    };

    this.setState({ filterObj: newFilterObj }, () => {
      this.queryProjectList();
    });
  }

  queryProjectList = () => {
    const { filterObj } = this.state;
    const productV2 = filterObj.productV2 || [];
    const status = filterObj.status || [];
    const name = filterObj.name || '';

    let productIdList = [];
    let subProductIdList = [];
    productV2.forEach(it => {
      const ids = it.split('-');
      ids[0] && productIdList.push(ids[0]);
      ids[1] && subProductIdList.push(ids[1]);
    });

    const obj = {
      stateList: status,
      orderType: orderProjectNameMap[filterObj.orderType],
      orderby: orderFieldProjectByMap[filterObj.orderby],
      productIdList: productIdList,
      subProductIdList: subProductIdList,
      name: name
    };

    const params = {
      ...obj,
      offset: (filterObj.current - 1) * 10,
      limit: 10,
    };
    let promiseProject = null;
    let promiseProduct = null;
    if (filterObj.type === 'own') {
      promiseProject = getMyOwnerPro(params);
      promiseProduct = getMyOwnerProduct();
    } else if (filterObj.type === 'paticipate') {
      promiseProject = getMyParticipatePro(params);
      promiseProduct = getMyParticipateProduct();
    } else if (filterObj.type === 'collect') {
      promiseProject = getMyCollectPro(params);
      promiseProduct = getMyCollectProduct();
    }
    this.setState({ loading: true });
    promiseProject.then(res => {
      this.setState({ loading: false });
      if (res.code !== 200) return message.error(res.msg);
      this.setState({
        datasource: res.result,
      });
      const list = filterObj.type === 'collect' ? this.getCollectList(res.result.list || []) : res.result.list;
      const projectIdList = list.map(it => it.projectId) || [];
      if (projectIdList.length) {
        getProjectWorkbenchDetail({ projectIdList }).then(res => {
          if (res.code !== 200) return message.error(res.msg);
          this.setState({ datasourceDetailArr: res.result || [] });
        }).catch(err => {
          return message.error(err || err.message);
        });
      }
    }).catch(err => {
      this.setState({ loading: false });
      return message.error(err || err.message);
    });

    promiseProduct.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      let arr = res.result;
      arr.forEach(it => {
        it.id = it.productId;
        it.children = it.subProductVOList || [];
        it.children.forEach(child => {
          child.name = child.subProductName;
        });
      });
      this.setState({ productList: arr || [] });
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  // 切换产品
  updateProduct = (key, value) => {
    const { filterObj } = this.state;
    const type = filterObj.type;

    // state中的productV2始终是最后选择的tab的关联产品
    const newFilterObj = {
      ...filterObj,
      [`${type}-productV2`]: value,
      [key]: value,
      current: 1,
    };

    this.setState({
      filterObj: newFilterObj,
    }, () => {
      this.queryProjectList();
      this.setLocal(newFilterObj);
    });
  }

  // 切换类型(需要从local中获取当前类型下的产品条件)
  updateType = (key, value) => {
    const { filterObj } = this.state;

    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    let projectV2 = oldStorageFilter.projectV2 || {};
    const product = projectV2[`${value}-product`] || [];

    const newFilterObj = {
      ...filterObj,
      type: value,
      product: product,
      current: 1,
    };

    this.setState({
      filterObj: newFilterObj,
    }, () => {
      this.queryProjectList();
      this.setLocal(newFilterObj);
    });
  }

  // 切换项目状态，排序，页码
  updateFilter = (key, value) => {
    const { filterObj } = this.state;
    let NewFilterObj = {
      ...filterObj,
      [key]: value,
    };

    // 切换非页码的过滤器需要从第一页重新加载
    if (key !== 'current') {
      NewFilterObj = {
        ...NewFilterObj,
        current: 1,
      };
    }

    this.setLocal(NewFilterObj, key);

    this.setState({
      filterObj: NewFilterObj,
    }, () => this.queryProjectList());
  }

  setLocal = (NewFilterObj) => {
    const oldStorageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    let projectV2 = oldStorageFilter.projectV2 || {};

    const newStorageFilter = {
      ...oldStorageFilter,
      projectV2: {
        ...projectV2,
        ...NewFilterObj,
      },
    };
    localStorage.setItem('my_workbench_filter', JSON.stringify(newStorageFilter));
  }

  getDefaultOrder = (type) => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const projectFilter = storageFilter.project || {};
    if (type === 'orderField') {
      return projectFilter.orderField || 1;
    } else {
      return projectFilter.order || 2;
    }
  }

  getDefaultStatus = () => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const projectFilter = storageFilter.projectV2 || {};
    return projectFilter.status || notCloseStatus;
  }

  getDefaultName = () => {
    const storageFilter = localStorage.getItem('my_workbench_filter') ? JSON.parse(localStorage.getItem('my_workbench_filter')) : {};
    const projectFilter = storageFilter.projectV2 || {};
    return projectFilter.name || '';
  }

  getProductDisplay = () => {
    const { filterObj } = this.state;
    return filterObj.productV2 || [];
  }

  cancelCollect = (projectId) => {
    let promise = cancelCollectProject({ projectId: projectId });
    promise.then(res => {
      if (res.code !== 200) return message.error(res.msg);
      message.success('取消收藏成功！');
      this.queryProjectList();
    }).catch(err => {
      return message.error(err || err.message);
    });
  }

  getCollectList = (list) => {
    const arr = [];
    list.forEach(it => {
      if (it.projectWorkbenchVO) {
        arr.push(it.projectWorkbenchVO);
      }
    });
    return arr;
  };


  render() {
    const { filterObj, datasource, loading, productList, datasourceDetailArr } = this.state;
    const list = datasource.list || [];

    const data = filterObj.type === "collect" ? this.getCollectList(list) : list;

    return (<div>

      <div className="u-mg10">
        <div>
          <RadioGroup
            onChange={(e) => this.updateType('type', e.target.value)}
            value={filterObj.type}
          >
            <RadioButton key={'own'} value={'own'}>我负责的</RadioButton>
            <RadioButton key={'paticipate'} value={'paticipate'}>我参与的</RadioButton>
            <RadioButton key={'collect'} value={'collect'}>我收藏的</RadioButton>
          </RadioGroup>

          <span className="m-query u-mgl20">
            <span className='queryHover'>
              <span className="f-ib f-vam grayColor">项目状态：</span>
              <FilterSelect
                onChange={(value) => this.updateFilter('status', value)}
                dataSource={projectStatusArr && projectStatusArr.map((item) => ({
                  label: item.value, value: item.key,
                }))}
                defaultValue={this.getDefaultStatus()}
              />
            </span>

            <span className="queryHover">
              <span className="f-ib f-vam grayColor">关联产品：</span>
              <TreeSelect
                productList={productList}
                defaultData={this.getProductDisplay()}
                updateFilter={(data) => this.updateProduct('productV2', data)}
                style={{ width: "300px" }}
              />
            </span>


            <span className="f-ib f-vam u-mgl20 grayColor">标题：</span>
            <span style={{ display: 'inline-block', width: '150px' }}>
              <Search allowClear placeholder="输入标题搜索"
                onSearch={(value) => this.updateFilter('name', value)}
                defaultValue={this.getDefaultName()}
              />
            </span>

          </span>

          {
            filterObj.type !== 'collect' &&
            <span className="f-fr">
              <span className='grayColor'>排序：</span>
              <OrderTime
                changeOrderField={(value) => this.updateFilter('orderField', value)}
                changeOrder={(value) => this.updateFilter('order', value)}
                orderFieldData={orderFieldProjectData}
                orderData={orderData}
                defaultOrderField={this.getDefaultOrder('orderField')}
                defaultOrder={this.getDefaultOrder('order')}
                from="my_workbench"
              />
            </span>
          }
        </div>
        <Spin spinning={loading}>
          {
            data && !!data.length ? <Row className="u-mgt20">
              {
                data.map((item, index) =>
                  <PojectCard
                    data={filterObj.type === "collect" ?
                      this.getCollectList(list) :
                      list}
                    type={filterObj.type}
                    cancelCollect={this.cancelCollect}
                    item={item}
                    index={index}
                    itemDetailObj={datasourceDetailArr.find(it => it.projectId === item.projectId) || {}}
                    {...this.props}
                  />)
              }
            </Row>
              :
              <Empty className="u-mgt20" />
          }

          {
            datasource.list && !!datasource.list.length &&
            <div className="f-tar">
              <Pagination
                current={filterObj.current}
                onChange={(num) => this.updateFilter('current', num)}
                total={datasource.total}
                className="u-mgb10"
              />
            </div>
          }
        </Spin>
      </div>
    </div >);
  }
}

export default index;

