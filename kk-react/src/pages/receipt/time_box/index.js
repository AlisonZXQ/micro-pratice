import React, { useEffect, useState, useCallback, useMemo } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Dropdown, Menu, Spin, message } from 'antd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import MyIcon from '@components/MyIcon';
import TimeFilter from '@components/TimeFilter';
import { dateDiff, getTodayInWeek } from '@utils/helper';
import PopoverTip from '@components/PopoverTip';
import { timeBoxColorMap, monthArr } from '@shared/ReceiptConfig';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import TimeBoxTable from './components/TimeBoxTable';
import TimeBoxQueryArea from './components/TimeBoxQueryArea';
import TimeBoxRule from './components/TimeBoxRule';
import { getTotalDwm, getCurrentBox, getBoxStyle } from './components/TimeBoxFun';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

function Index(props) {
  const { timeBoxList, loading, timeBoxIssue, drawerIssueId, enableSubProductList, lastProduct } = props;
  const { productid } = props.location.query;
  const [viewType, setViewType] = useState('issueType');
  const [filterObj, setFilterObj] = useState({});
  const [time, setTime] = useState(moment().format('YYYY-MM-DD'));
  const [left, setLeft] = useState(0);
  let localFilter = {};
  let currentLocalFilter = {};
  try {
    localFilter = localStorage.getItem('time_box_filter') ? JSON.parse(localStorage.getItem('time_box_filter')) : {};
    currentLocalFilter = localFilter[productid] || {};
  } catch {
  }
  const currentBox = useMemo(() => {
    return getCurrentBox(timeBoxList, time) || {};
  }, [timeBoxList, time]);

  const headerWidth = document.getElementById('time_box_header') ? document.getElementById('time_box_header').offsetWidth : 1224;
  const containerHalf = headerWidth / 2;
  const currentIndex = timeBoxList.findIndex(it => it.id === currentBox.id);
  const currentHalf = currentBox.dateList && currentBox.dateList.length * 56 / 2;

  useEffect(() => {
    if (document.getElementById('currentBox')) {
      let leftOffset = document.getElementById('currentBox').offsetLeft;
      leftOffset += currentHalf;
      setLeft(- leftOffset + containerHalf);
    }
  });

  const getTimeBox = useCallback((conveyTime) => {
    const time = conveyTime || moment().format('YYYY-MM-DD');
    const params = {
      productId: productid,
      time: time,
    };
    props.dispatch({
      type: 'timeBox/getTimeBoxByTime', payload: params,
    });
  }, [productid]);

  const getTimeBoxContent = useCallback(() => {
    const params = {
      productId: productid,
      timeBegin: currentBox.timeBegin,
      timeEnd: currentBox.timeEnd,
    };
    if (currentBox.timeBegin && currentBox.timeEnd) {
      props.dispatch({
        type: 'timeBox/getTimeBoxIssueByTime', payload: params,
      });
    }
  }, [productid, currentBox]);

  useEffect(() => {
    getTimeBox();
    setTime(moment().format('YYYY-MM-DD'));
  }, [productid]);

  useEffect(() => {
    props.dispatch({ type: 'product/getAllSubProductList', payload: { productid } });
  }, [productid]);

  useEffect(() => {
    if (currentLocalFilter) {
      setFilterObj(currentLocalFilter);
    }
  }, [productid]);

  useDeepCompareEffect(() => {
    getTimeBoxContent();
  }, [currentBox]);

  const updateFilter = (key, value) => {
    setFilterObj({
      ...filterObj,
      [key]: value,
    });

    localStorage.setItem('time_box_filter', JSON.stringify({
      ...localFilter,
      [productid]: {
        ...currentLocalFilter,
        [key]: value
      }
    }));
  };

  const getSingleBox = (it, item, index) => {
    const month = Number(it.split('-')[1]);
    const day = Number(it.split('-')[2]);
    const today = moment().format('YYYY-MM-DD');
    const currentBoxIsLast = index === item.dateList.length - 1;
    const marginRightPx = currentBoxIsLast ? 6 : 24;

    if (today === it) {
      return <span
        className={day === 1 ? styles.firstToday : styles.today}
        style={{ marginRight: `${marginRightPx}px` }}
      >
        {
          day === 1 ?
            <span>
              <span>今天</span>
              <br />
              <span>{monthArr[month]}</span>
            </span>
            :
            <span className={styles.text}>今天</span>
        }
      </span>;
    } else if (getTodayInWeek(it) === '周六' || getTodayInWeek(it) === '周日') {
      return (<span
        className={day === 1 ? styles.firstWeekend : styles.weekend}
        style={{ marginRight: `${marginRightPx}px` }}
      >
        {
          day === 1 ?
            <span>
              <span>{day}</span>
              <br />
              <span>{monthArr[month]}</span>
            </span>
            :
            <span>{day}</span>
        }
      </span>);
    } else {
      return (<span
        className={day === 1 ? styles.firstDay : styles.day}
        style={{ marginRight: `${marginRightPx}px` }}
      >
        {
          day === 1 ?
            <span>
              <span>{day}</span>
              <br />
              <span>{monthArr[month]}</span>
            </span>
            :
            <span>
              <span>{day}</span>
            </span>
        }
      </span>);
    }
  };

  // 超过最大宽度处于中间否则自适应
  const getPlacement = (item) => {
    const data = item.dateList || [];
    if (data.length * 56 > headerWidth) {
      return 'bottom';
    } else {
      return '';
    }
  }

  const getDateContent = (item) => {
    if ((item.id === currentBox.id && item.id !== 0) || item.dateList.includes(time)) {
      return (
        <PopoverTip
          trigger={
            <li
              id={"currentBox"}
              className={`${styles[`timeBoxActive`]} ${styles[`${timeBoxColorMap[item.state]}`]}`}
              style={{
                paddingLeft: `${6}px`,
                ...getBoxStyle(item),
                marginRight: '12px',
              }}
              onClick={() => setTime(item.dateList[0])}
            >{item.dateList.map((it, index) => getSingleBox(it, item, index))}
            </li>
          }
          content={<span>共<span className="u-primary">{dateDiff(item.timeBegin, item.timeEnd) + 1}</span>天</span>}
          placement={getPlacement(item)}
        >
        </PopoverTip>
      );
    } else {
      return (
        <PopoverTip
          trigger={
            <li
              id={`${item.id}-timeBox`}
              className={`${styles[`timeBox`]} ${styles[`${timeBoxColorMap[item.state]}`]}`}
              style={{
                paddingLeft: `${6}px`,
                ...getBoxStyle(item),
                marginRight: '12px',
              }}
              onClick={() => setTime(item.dateList[0])}
            >
              {item.dateList.map((it, index) => getSingleBox(it, item, index))}
            </li>}
          content={<span>共<span className="u-primary">{dateDiff(item.timeBegin, item.timeEnd) + 1}</span>天</span>}
          placement={getPlacement(item)}
        >
        </PopoverTip>
      );
    }
  };

  const processData = () => {
    const { subProductIdList, responseUidList, stateList, name } = filterObj;
    return timeBoxIssue
      .filter(it => !subProductIdList || !subProductIdList.length || (it.subProductVO && it.subProductVO.id && subProductIdList.includes(it.subProductVO.id)))
      .filter(it => !responseUidList || !responseUidList.length || (it.responseUser && it.responseUser.id && responseUidList.includes(it.responseUser.id)))
      .filter(it => !stateList || !stateList.length || (it.state && stateList.includes(it.state)))
      .filter(it => !name || (it.name && it.name.includes(name)));
  };

  const handleChangeTime = (time) => {
    getTimeBox(time);
    setTime(time);
  };

  // 点击>
  const handleToLeft = () => {
    // 下一个盒子存在
    if (timeBoxList[currentIndex + 1]) {
      setTime(timeBoxList[currentIndex + 1].dateList[0]);
    } else {
      message.warn('请重新选择日期！');
    }
  };

  // 点击<
  const handleToRight = () => {
    // 上一个盒子存在
    if (timeBoxList[currentIndex - 1]) {
      setTime(timeBoxList[currentIndex - 1].dateList[0]);
    } else {
      message.warn('请重新选择日期！');
    }
  };

  return (<div className={`f-pr ${styles.container}`}>
    <Spin spinning={false}>
      <div className='f-aic u-mgb15 f-jcsb-aic'>
        <span>
          <span className={styles.timeBoxIcon}>
            <MyIcon type="icon-xuqiuguanli" className={styles.icon} />
          </span>
          <span className='u-mgl10 f-fs3 font-pfm'>计划时间盒</span>
        </span>

        <span>
          <TimeBoxRule
            productid={productid}
            getTimeBoxContent={getTimeBoxContent}
            getTimeBox={getTimeBox}
            productAdmin={lastProduct.productAdmin}
          />
        </span>
      </div>

      <div className={styles.header} style={{ position: 'relative' }} id="time_box_header">
        <div className={styles.dateRange}>
          <span onClick={() => { handleToRight() }}>
            <MyIcon type="icon-fanhuitubiao" className={styles.leftIcon} />
          </span>
          <span className={styles.date}>{currentBox.timeBegin} ~ {currentBox.timeEnd}</span>
          <span onClick={() => { handleToLeft() }}>
            <MyIcon type="icon-fanhuitubiao" className={styles.rightIcon} />
          </span>
          <span className={styles.rightDatePicker}>
            <a className="u-mgr10" onClick={() => { handleChangeTime(moment().format('YYYY-MM-DD')); message.success('操作成功！') }}>回到今天</a>

            <TimeFilter
              children={<a>选择日期</a>}
              onChange={(value) => { handleChangeTime(moment(value).format('YYYY-MM-DD')); message.success('操作成功！') }}
            />
          </span>
        </div>
        <div
          className={styles.dateContent}
        >
          <div className={styles.middle}>
            <ul style={{ marginBottom: '0px', left: `${left}px` }}>
              {
                timeBoxList.map(item => getDateContent(item))
              }
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={`u-mgb10 f-jcsb-aic`}>
          <TimeBoxQueryArea
            issueList={timeBoxIssue || []}
            updateFilter={updateFilter}
            enableSubProductList={enableSubProductList}
            currentLocalFilter={currentLocalFilter}
          />
          <span>
            <Dropdown
              overlay={<Menu>
                <Menu.Item key="issueType">
                  <a onClick={() => setViewType('issueType')}>工作项视图</a>
                </Menu.Item>
                <Menu.Item key="user">
                  <a onClick={() => setViewType('user')}>人员视图</a>
                </Menu.Item>
              </Menu>}
            >
              <a>
                {viewType === 'issueType' ? '工作项视图' : '人员视图'}
                <MyIcon type="icon-gengduozhankai" className={styles.icon} />
              </a>
            </Dropdown>
          </span>
        </div>
        <TimeBoxTable
          issueList={timeBoxIssue || []}
          filterIssueList={processData()}
          viewType={viewType}
          dispatch={props.dispatch}
          productid={productid}
          getTimeBoxContent={getTimeBoxContent}
          totalDwm={getTotalDwm(processData())}
          time={time}
        />
      </div>
      {
        drawerIssueId &&
        <DrawerComponent
          refreshFun={() => {
            getTimeBoxContent();
          }}
        />
      }
    </Spin>
  </div>);
}

const mapStateToProps = (state) => {
  return {
    timeBoxList: state.timeBox.timeBoxList,
    timeBoxIssue: state.timeBox.timeBoxIssue,
    lastProduct: state.product.lastProduct,
    loading: state.loading.effects[`timeBox/getTimeBoxByTime`],
    drawerIssueId: state.receipt.drawerIssueId,
    enableSubProductList: state.product.enableSubProductList,
  };
};
export default connect(mapStateToProps)(Index);

