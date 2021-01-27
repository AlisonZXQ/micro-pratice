import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { CaretDownOutlined } from '@ant-design/icons';
import { Spin, Empty, Card, Button } from 'antd';
import { connect } from 'dva';
import useDeepCompareEffect from 'use-deep-compare-effect';
import IssueCard from '@pages/receipt/components/issue_card';
import { deepCopy, drawerDelayFun } from '@utils/helper';
import { MonthToTextMap, MonthArr, MonthToNumberMap } from '@shared/RequirementConfig';
import CreateRequirement from '@pages/receipt/components/create_requirement';
import PlanMap from '../plan_map';
import styles from './index.less';

function Index(props) {
  const { productid } = props.location.query;
  const { time, planDate, loading } = props;
  const [collapseObj, setCollapseObj] = useState({});
  const currentMonth = Number(moment().format('M'));
  const currentMonthRef = useRef(null);

  useDeepCompareEffect(() => {
    const currentMonth = Number(moment().format('M'));
    const left = (currentMonth - 2) * 240;
    if (currentMonthRef.current) {
      currentMonthRef.current.scrollLeft = left;
    }
  }, [planDate]);

  useEffect(() => {
    const currentMonth = Number(moment().format('M'));
    if (currentMonthRef.current && currentMonth > 2) {
      const left = (currentMonth - 2) * 240;
      currentMonthRef.current.scrollLeft = left;
    }
  }, [currentMonthRef, productid, time]);

  useDeepCompareEffect(() => {
    const newCollapseObj = deepCopy(collapseObj);
    planDate.forEach((item) => {
      newCollapseObj[item.id] = false;
    });
    setCollapseObj(newCollapseObj);
  }, [planDate]);

  const setObjectiveCollapse = (item) => {
    const newCollapseObj = deepCopy(collapseObj);
    newCollapseObj[item.id] = !newCollapseObj[item.id];
    setCollapseObj(newCollapseObj);
  };

  // 精准计算出高度
  const getLeftContents = (item, index) => {
    const bottom = getMaxChildren(item) > 1 ? ((getMaxChildren(item) - 1) * 106 + 30) : 30;
    const marginBottom = collapseObj[item.id] ? 30 : bottom;

    return (
      <div>
        <CaretDownOutlined
          className={collapseObj[item.id] ? styles.collapseIcon : styles.expandIcon}
          onClick={() => setObjectiveCollapse(item)} />

        <div
          className={styles.objective}
          style={{ marginBottom: marginBottom }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              drawerDelayFun(() => {
                props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${item.issueKey}` });
              }, 200);
            }}
          >
            <IssueCard data={item} />
          </span>
          <div className={styles.opt}>
            <CreateRequirement
              parentIssueId={item.id}
              productid={productid}
              refreshFun={props.refreshFun}
              trigger={<Button type="dashed" size="small" className="u-mgr10" >创建</Button>}
            />
            <PlanMap data={item} />
          </div>
        </div>

      </div >
    );
  };

  const getRightContents = (item) => {
    return <div className={styles.content}>
      <div>
        {
          MonthArr.map(month => getRequirementColumn(item, month))
        }
      </div>
    </div>;
  };

  const getRequirementColumn = (item, month) => {
    const requirementMap = item.children || {};
    const requirementArr = collapseObj[item.id] ? [] : (requirementMap[MonthToNumberMap[month]] || []);

    return (<div className={styles.requirementColumn}>
      {
        (collapseObj[item.id] || !getMaxChildren(item)) && <div
          className={styles.collaseCard}>
        </div>
      }

      {
        requirementArr.map(it =>
          <div
            className={styles.requirement}>
            <span
              onClick={(e) => { e.stopPropagation(); props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: `${it.issueKey}` }) }}
            >
              <IssueCard data={it} />
            </span>
          </div>)
      }
    </div>);
  };

  const getMaxChildren = (item) => {
    const requirementMap = item.children || {};
    let max = 0;
    MonthArr.forEach(it => {
      const columnsArr = requirementMap[MonthToNumberMap[it]] || [];
      if (columnsArr && columnsArr.length && columnsArr.length > max) {
        max = columnsArr.length;
      }
    });
    return max;
  };

  const hasAllCollapse = () => {
    let flag = true;
    for (let i in collapseObj) {
      if (!collapseObj[i]) {
        flag = false;
      }
    }
    return flag;
  };

  const setAllCollapseOrExpand = (flag) => {
    const newCollapseObj = deepCopy(collapseObj);
    for (let i in newCollapseObj) {
      newCollapseObj[i] = flag;
    }
    setCollapseObj(newCollapseObj);
  };

  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        {
          !!planDate.length &&
          <div>
            <div className={styles.left}>
              <div className={styles.objectiveTitle}>
                全部目标
                <CaretDownOutlined
                  className={hasAllCollapse() ? styles.allCollapseIcon : styles.allExpandIcon}
                  onClick={() => setAllCollapseOrExpand(!hasAllCollapse())} />
              </div>
              {
                planDate.map((item, index) => getLeftContents(item, index))
              }
            </div>

            <div className={styles.right} ref={currentMonthRef}>
              {
                MonthArr.map(it =>
                  <span
                    className={`${styles.requirementTitle} ${MonthToNumberMap[it] === currentMonth ? 'i-primary' : ''}`}
                  >
                    {moment(time).format('YYYY')}年{MonthToTextMap[it]}
                  </span>)
              }

              {
                planDate.map(item => getRightContents(item))
              }
            </div>
          </div>
        }

        {
          !planDate.length && <Card><Empty /></Card>
        }
      </Spin>
    </div >
  );
}

const mapStateToProps = (state) => {
  return {
    planDate: state.requirementPlan.planDate,
    loading: state.loading.effects[`requirementPlan/getRequirementPlanDate`]
  };
};

export default withRouter(connect(mapStateToProps)(Index));
