import React, { useCallback, useEffect, useState } from 'react';
import { Input } from 'antd';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'dva';
// import useDeepCompareEffect from 'use-deep-compare-effect';
import MyIcon from '@components/MyIcon';
import StyleYearPicker from '@components/CustomAntd/StyleYearPicker';
import DrawerHOC from '@components/DrawerHOC';
import FilterSelect from '@components/FilterSelect';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import PopoverTip from '@components/PopoverTip';
import CreateObjective from './create_objective';
import PlanList from './plan_list_v2';
import PlanDate from './plan_date';
import styles from './index.less';

const { Search } = Input;

const DrawerComponent = DrawerHOC()(DrawerShared);

function Index(props) {
  const { drawerIssueId, subProductAll } = props;
  const [activeKey, setActiveKey] = useState();
  const [time, setTime] = useState(moment());
  const [subProductIdList, setSubProductIdList] = useState([]);
  const [name, setName] = useState('');
  const [filterObj, setFilterObj] = useState({});
  const productid = props.location.query.productid;
  let localFilter = {};
  let currentLocalFilter = {};
  try {
    localFilter = localStorage.getItem('requirement_plan_filter') ? JSON.parse(localStorage.getItem('requirement_plan_filter')) : {}
    currentLocalFilter = localFilter[productid] || {};
  } catch {
    console.log('json转换错误');
  }

  const getUnLinkedList = useCallback(() => {
    const params = {
      ...filterObj,
      limit: 10,
      offset: ((filterObj.current || 1) - 1) * 10,
      productId: productid,
    };
    props.dispatch({ type: 'requirementPlan/getUnLinkedList', payload: params });
  }, [filterObj, productid]);

  const drawerRefreshFun = () => {
    getPlanOrDateList();
    getUnLinkedList();
  };

  /**
   * productId改变时直接传入conveySubproduct
   * 其他情况在筛选中改变时调用接口
   */
  const getPlanOrDateList = useCallback((conveySubproduct) => {
    const subProductList = conveySubproduct || subProductIdList;
    let dispatchType = '';
    if (activeKey === 'list') {
      dispatchType = 'requirementPlan/getRequirementPlanList';
    } else if (activeKey === 'date') {
      dispatchType = 'requirementPlan/getRequirementPlanDate';
    }
    if (dispatchType) {
      props.dispatch({
        type: dispatchType,
        payload: {
          productId: productid,
          subProductIdList: subProductList,
          year: moment(time).format('YYYY'),
          name,
        }
      });
    }
  }, [activeKey, name, productid, subProductIdList, time, currentLocalFilter]);

  useEffect(() => {
    setSubProductIdList([]);
    const localStorageKey = localStorage.getItem('requirement_plan');
    setActiveKey(localStorageKey || 'list');
    setSubProductIdList(currentLocalFilter.subProductIdList || [])
    getPlanOrDateList(currentLocalFilter.subProductIdList || [])

    // 获取子产品
    if (productid) {
      props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: productid } });
    }
  }, [productid]);

  useEffect(() => {
    getPlanOrDateList();
  }, [time, name, activeKey]);

  return (<div className={styles.container}>
    <div className='f-jcsb-aic u-mgb15'>
      <span className='f-aic'>
        <span className={styles.requirementPlanIcon}>
          <MyIcon type="icon-xuqiuguihua" className={styles.icon} />
        </span>
        <span className='u-mgl10 f-fs3 font-pfm'>需求规划</span>
      </span>
      <span>
        <CreateObjective
          refreshFun={(data) => {
            getPlanOrDateList();
            if (data && data.id) {
              props.dispatch({ type: 'requirementPlan/saveJumpId', payload: data.id });
            }
          }}
          productId={productid}
        />
      </span>
    </div>

    <div className={styles.tabsStyle}>
      <span>
        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">子产品：</span>
          <FilterSelect
            onChange={(value) => {
              setSubProductIdList(value);
              const newLocalFilter = {
                ...localFilter,
                [productid]: {
                  ...currentLocalFilter,
                  subProductIdList: value,
                }
              }
              getPlanOrDateList(value);
              localStorage.setItem('requirement_plan_filter', JSON.stringify(newLocalFilter))
            }}
            dataSource={subProductAll.map(item => ({
              label: item.subProductName, value: item.id,
            }))}
            defaultValue={currentLocalFilter.subProductIdList || []}
          />
        </span>

        <span className='queryHover'>
          <span className="f-ib f-vam grayColor">目标周期：</span>
          <StyleYearPicker
            defaultValue={moment()}
            onChange={(value) => { setTime(value) }} allowClear={false}
          />
        </span>
        <Search
          style={{ width: '150px', marginLeft: '10px' }}
          placeholder="请输入目标标题"
          onSearch={value => setName(value)}
        />
      </span>
      <span>
        <span
          className={activeKey === 'list' ? styles.activeIcon : styles.icon}
          onClick={() => { setActiveKey('list'); localStorage.setItem('requirement_plan', 'list') }}
        >
          <MyIcon
            type="icon-suofang"
            className="u-mgr5"
          />列表
        </span>
        <span
          className={activeKey === 'date' ? styles.activeIcon : styles.icon}
          onClick={() => { setActiveKey('date'); localStorage.setItem('requirement_plan', 'date') }}
        >
          <MyIcon
            type="icon-riqi"
            className="u-mgr5"
          />日历
        </span>
        <PopoverTip
          trigger={<MyIcon type="icon-tishi" className={styles.tip} />}
          content={<span>注：仅显示有到期日的需求</span>}
        />
      </span>
    </div>
    {
      activeKey === 'list' &&
      <PlanList
        time={time}
        refreshFun={drawerRefreshFun}
        productid={productid}
        getUnLinkedList={getUnLinkedList}
        filterObj={filterObj}
        setFilterObj={setFilterObj}
        getPlanOrDateList={getPlanOrDateList}
      />
    }

    {
      activeKey === 'date' &&
      <PlanDate
        time={time}
        refreshFun={drawerRefreshFun}
        getPlanOrDateList={getPlanOrDateList}
      />
    }

    {
      drawerIssueId &&
      <DrawerComponent
        refreshFun={() => {
          drawerRefreshFun();
        }}
      />
    }
  </div>);
}

const mapStateToProps = (state) => {

  return {
    drawerIssueId: state.receipt.drawerIssueId,
    lastProduct: state.product.lastProduct,
    subProductAll: state.product.enableSubProductList
  };
};

export default withRouter(connect(mapStateToProps)(Index));
