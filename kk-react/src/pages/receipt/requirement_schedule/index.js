import React, { useCallback, useState, useEffect } from 'react';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { message, Spin, Row, Col, Card, Checkbox, Empty, Button } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { DragDropContext } from 'react-beautiful-dnd';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { calculateDwm } from '@utils/helper';
import MyIcon from '@components/MyIcon';
import DrawerHOC from '@components/DrawerHOC';
import DrawerShared from '@pages/receipt/components/drawer_shared';
import { updateSortValue, updateSameVerisonSort, addIssueToVersion, back2RequirementPool, getRequirementLevelSetting } from '@services/requirement_pool';
import { switchVersion } from '@services/version';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';
import { VERSION_PLAN_CONNTYPE_ENUM, EXCLUDE_PUBLISH, REQUIREMENT_LEVEL_SETTING } from '@shared/ReceiptConfig';
import PopoverTip from '@components/PopoverTip';
import VersionForm from '@pages/receipt/components/VersionForm';
import PoolListSchedule from './components/PoolListSchedule';
import VersionListSchedule from './components/VersionListSchedule';
import QueryAreaSchedule from './components/QueryAreaSchedule';
import { getPlanRules } from './components/CommonScheduleFun';
import RequirementLevelSetting from './components/RequirementLevelSetting';
import styles from './index.less';

const DrawerComponent = DrawerHOC()(DrawerShared);

function Index(props) {
  const { dispatch, drawerIssueId, lastProduct, requirementPoolList, requirementPoolLoading,
    currentUser, subProductAll,
    planVerisonDwInfo, planVersionList, planVersionLoading } = props;
  const { productid } = props.location.query;
  const [filterObj, setFilterObj] = useState();
  const [settingRule, setSettingRule] = useState('');
  let localFilter = {};
  let currentLocalFilter = {};
  // 目前只恢复子产品
  try {
    localFilter = localStorage.getItem('requirement_schedule_filter') ? JSON.parse(localStorage.getItem('requirement_schedule_filter')) : {}
    currentLocalFilter = localFilter[productid] || {};
    currentLocalFilter = {
      subProductIdList: currentLocalFilter.subProductIdList || []
    }
  } catch {
    console.log('json转换错误');
  }

  const getSettingRule = async () => {
    const params = {
      productId: productid,
    };
    return await getRequirementLevelSetting(params).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      setSettingRule(res.result);
      return res || {};
    }).catch(err => {
      return message.error(err || err.message);
    });
  };

  const getRequirementPool = useCallback((id, currentLocalFilter) => {
    const filter = currentLocalFilter || filterObj;
    const params = {
      ...filter,
      productid: id || productid
    };
    if (params.productid && filter) {
      dispatch({ type: 'requirement_pool/getRequirementPool', payload: params });
    }
  }, [dispatch, filterObj, productid]);

  const getPlanVersionList = useCallback((id, currentLocalFilter) => {
    const filter = currentLocalFilter || filterObj;
    const params = {
      ...filter,
      productId: id || productid,
      state: EXCLUDE_PUBLISH,
    };
    if (params.productId && filter) {
      dispatch({ type: 'requirement_pool/getPlanVersion', payload: params });
    }
  }, [dispatch, productid, filterObj]);

  useEffect(() => {
    if (productid) {
      getSettingRule(); // 获取设置规则

      setFilterObj(currentLocalFilter);
      getRequirementPool(productid, currentLocalFilter);
      getPlanVersionList(productid, currentLocalFilter);
      props.dispatch({ type: 'product/getAllSubProductList', payload: { productid: productid } });
      props.dispatch({
        type: 'requirement_pool/getVersionDwInfo',
        payload: {
          productId: productid,
          subProductIdList: [],
        }
      });
    }
  }, [productid]);

  const updateFilter = (key, value) => {
    const newFilterObj = {
      ...filterObj,
      [key]: value
    };
    if (key === 'subProductIdList') {
      props.dispatch({
        type: 'requirement_pool/getVersionDwInfo',
        payload: {
          productId: productid,
          subProductIdList: value || []
        }
      });
    }
    setFilterObj(newFilterObj);
    getRequirementPool(productid, newFilterObj);
    getPlanVersionList(productid, newFilterObj);
    const newLocalFilter = {
      ...localFilter,
      [productid]: newFilterObj
    }
    localStorage.setItem('requirement_schedule_filter', JSON.stringify(newLocalFilter));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    const { index: endIndex, droppableId: endDroppableId } = destination;
    const { index: startIndex, droppableId: startDroppableId } = source;

    // 没有发生移动return
    if ((startIndex === endIndex && endDroppableId === startDroppableId) || !destination) return;

    // 1.需求池排序
    if (endDroppableId === startDroppableId && startDroppableId.includes('left')) {
      let beforeObj = {};
      let afterObj = {};
      if (startIndex > endIndex) {
        beforeObj = requirementPoolList[endIndex - 1] || {};
        afterObj = requirementPoolList[endIndex] || {};
      } else {
        beforeObj = requirementPoolList[endIndex] || {};
        afterObj = requirementPoolList[endIndex + 1] || {};
      }

      const beforeRequirement = beforeObj.requirement || {};
      const afterRequirement = afterObj.requirement || {};

      const params = {
        beforeId: beforeRequirement.id ? beforeRequirement.id : 0,
        afterId: afterRequirement.id ? afterRequirement.id : 0,
        currentId: Number(draggableId.split('-')[1]),
      };

      updateSortValue(params).then(res => {
        if (res.code !== 200) { return message.error(res.msg) }
        message.success('排序成功！');
        getRequirementPool();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
    // 2.同一版本排序
    if (endDroppableId === startDroppableId && startDroppableId.includes('right')) {
      const versionId = startDroppableId.split('-')[3];
      const verisonObj = planVersionList.find(it => it.versionId === Number(versionId)) || {};
      const versionContent = verisonObj.content || [];
      const requirementId = Number(draggableId.split('-')[1]);
      const currentVersion = versionContent.find(it => it.requirement && it.requirement.id === requirementId);

      let beforeObj = {};
      let afterObj = {};
      if (startIndex > endIndex) {
        beforeObj = versionContent[endIndex - 1] || {};
        afterObj = versionContent[endIndex] || {};
      } else {
        beforeObj = versionContent[endIndex] || {};
        afterObj = versionContent[endIndex + 1] || {};
      }

      const beforeRequirement = beforeObj.versionPlan || {};
      const afterRequirement = afterObj.versionPlan || {};

      const params = {
        beforeId: beforeRequirement.id ? beforeRequirement.id : 0,
        afterId: afterRequirement.id ? afterRequirement.id : 0,
        currentId: currentVersion.versionPlan && currentVersion.versionPlan.id,
      };
      updateSameVerisonSort(params).then(res => {
        if (res.code !== 200) { return message.error(res.msg) }
        message.success('排序成功！');
        getPlanVersionList();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
    // 3.需求池移动到折叠版本
    // 4.需求池移动到展开版本
    if (endDroppableId !== startDroppableId && startDroppableId.includes('left') && endDroppableId.includes('right')) {
      const versionId = endDroppableId.split('-')[3];
      const requirementId = draggableId.split('-')[1];
      const verisonObj = planVersionList.find(item => item.versionId === Number(versionId)) || {};
      const versionContent = verisonObj.content || [];
      let params = {};
      if (endDroppableId.includes('collapse')) {
        params = {
          versionid: Number(versionId),
          conntype: VERSION_PLAN_CONNTYPE_ENUM.REQUIREMENT,
          connid: Number(requirementId),
          beforeId: versionContent[versionContent.length - 1] ? versionContent[versionContent.length - 1].versionPlan.id : 0,
          afterId: 0,
        };
      } else {
        const beforeRequirement = versionContent[endIndex - 1] || {};
        const afterRequirement = versionContent[endIndex] || {};

        params = {
          versionid: Number(versionId),
          conntype: VERSION_PLAN_CONNTYPE_ENUM.REQUIREMENT,
          connid: requirementId,
          beforeId: beforeRequirement.versionPlan ? beforeRequirement.versionPlan.id : 0,
          afterId: afterRequirement.versionPlan ? afterRequirement.versionPlan.id : 0,
        };
      }
      addIssueToVersion(params).then(res => {
        if (res.code !== 200) { return message.error(res.msg) }
        message.success('排序成功！');
        getPlanVersionList();
        getRequirementPool();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
    // 5.版本移动到需求池
    if (endDroppableId !== startDroppableId && startDroppableId.includes('right') && endDroppableId.includes('left')) {
      const requirementId = Number(draggableId.split('-')[1]);
      const versionId = startDroppableId.split('-')[3];
      const verisonObj = planVersionList.find(item => item.versionId === Number(versionId)) || {};
      const versionContent = verisonObj.content || [];
      const startCurrentVersion = versionContent.find(it => it.requirement && it.requirement.id === requirementId) || {};
      const beforeRequirement = requirementPoolList[endIndex - 1] || {};
      const afterRequirement = requirementPoolList[endIndex] || {};

      let params = {};
      params = {
        currentId: startCurrentVersion.versionPlan && startCurrentVersion.versionPlan.id,
        beforeId: beforeRequirement.requirement ? beforeRequirement.requirement.id : 0,
        afterId: afterRequirement.requirement ? afterRequirement.requirement.id : 0,
      };
      back2RequirementPool(params).then(res1 => {
        if (res1.code !== 200) { return message.error(res1.msg) }
        message.success('排序成功！');
        getPlanVersionList();
        getRequirementPool();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
    // 6.版本之间相互移动
    if (endDroppableId !== startDroppableId && startDroppableId.includes('right') && endDroppableId.includes('right')) {
      const requirementId = Number(draggableId.split('-')[1]);
      const endVersionId = endDroppableId.split('-')[3];
      const startVersionId = startDroppableId.split('-')[3];
      const startVersionObj = planVersionList.find(item => item.versionId === Number(startVersionId)) || {};
      const endVerisonObj = planVersionList.find(item => item.versionId === Number(endVersionId)) || {};
      const startVersionContent = startVersionObj.content || [];
      const endVersionContent = endVerisonObj.content || [];
      const startCurrentVersion = startVersionContent.find(it => it.requirement && it.requirement.id === requirementId) || {};

      const beforeRequirement = endVersionContent[endIndex - 1] || {};
      const afterRequirement = endVersionContent[endIndex] || {};

      let params = {};
      params = {
        id: startCurrentVersion.versionPlan && startCurrentVersion.versionPlan.id,
        toversion: Number(endDroppableId.split('-')[3]),
        beforeId: beforeRequirement.versionPlan ? beforeRequirement.versionPlan.id : 0,
        afterId: afterRequirement.versionPlan ? afterRequirement.versionPlan.id : 0,
      };
      switchVersion(params).then(res2 => {
        if (res2.code !== 200) { return message.error(res2.msg) }
        message.success('排序成功！');
        getPlanVersionList();
      }).catch(err => {
        return message.error(err || err.message);
      });
    }
  };

  /**打印用 */
  useDeepCompareEffect(() => {
    console.table(requirementPoolList.map(it => ({
      name: it.requirement.name,
      sortValue: it.requirement.sortValue,
      autoSortValue: it.requirement.autoSortValue,
    })))
  }, [requirementPoolList])

  return (<div>
    <div className={`${styles.container}`}>
      <div className='f-jcsb-aic u-mgb15 f-pr'>
        <span className='f-aic'>
          <span className={styles.requirementPoolIcon}>
            <MyIcon type="icon-xuqiupaiqi" className={styles.icon} />
          </span>
          <span className='u-mgl10 f-fs3 font-pfm'>需求排期
          </span>
        </span>
        <span className={planVersionList.length ? styles.rule : styles.ruleAlone}>
          <span className={styles.timeBegin}>生效时间：{settingRule.updateTime ? moment(settingRule.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
          <RequirementLevelSetting
            refreshFun={getRequirementPool}
            productId={productid}
            getSettingRule={getSettingRule}
          />
        </span>
      </div>

      <Card className="u-mgb10">
        <div className={`f-jcsb-aic ${styles.header}`}>
          <span>
            <QueryAreaSchedule
              subProductAll={subProductAll}
              requirementPoolList={requirementPoolList}
              updateFilter={updateFilter}
              currentLocalFilter={currentLocalFilter}
            />
          </span>
          <span>
            <span>月吞吐量：</span>
            <span className={styles.count}>{planVerisonDwInfo.requirementCount || 0}</span>
            <PopoverTip
              trigger={<MyIcon type="icon-tishi" className={styles.tip} />}
              content={<span>
                <span className="f-fwb">月度吞吐量：</span>近三个月，所选子产品下，排入版本（已发布且发布时间在当月）的需求个数平均值；</span>}
            />
            <span>月度容量：</span>
            <span className={styles.count}>{planVerisonDwInfo.capacityEstimate ? calculateDwm(planVerisonDwInfo.capacityEstimate) : 0}</span>
            <span className="u-mgr5">人天</span>
            <PopoverTip
              trigger={<MyIcon type="icon-tishi" className={styles.tip} />}
              content={<span>
                <span className="f-fwb">月度容量：</span>近三个月，该子产品下，排入版本（已发布且发布时间在当月）的需求的工作量的算术平均值；
              </span>}
            />
            <span>
              <span>计算规则：</span>
              <PopoverTip
                trigger={<MyIcon type="icon-tishi" className={`${styles.tip}`} />}
                content={<span>
                  {getPlanRules()}
                </span>}
              />
            </span>
          </span>
        </div>

      </Card>

      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={8}>
          <Col span={12}>
            <Spin spinning={requirementPoolLoading}>
              <div className={styles.requirementPoolSchedule}>
                <div className="f-jcsb-aic">
                  <span className={styles.requiremenTitle}>
                    需求池
                    {
                      settingRule && settingRule.type &&
                      <span className={styles.currentDragType}>
                        （{settingRule.type === REQUIREMENT_LEVEL_SETTING.DRAG ? '拖拽排序' : '自动排序'}）
                      </span>
                    }
                  </span>
                  <span style={{ position: 'relative', top: '-5px' }}>
                    <Checkbox
                      onChange={(e) => updateFilter('onlyProductRequirement', e.target.checked)}
                      checked={filterObj ? filterObj.onlyProductRequirement : false}
                    >
                      仅看非项目需求
                    </Checkbox>
                  </span>
                </div>
                <PoolListSchedule requirementPoolList={requirementPoolList} {...props} settingRule={settingRule} />
              </div>
            </Spin>
          </Col>
          <Col span={12}>
            <Spin spinning={planVersionLoading} style={{ marginTop: '25vh' }}>
              {
                planVersionList.length
                  ?
                  <VersionListSchedule
                    productid={productid}
                    {...props}
                    getPlanVersionList={getPlanVersionList}
                    getRequirementPool={getRequirementPool}
                  />
                  :
                  <div className={styles.emptyCard}>
                    <Empty
                      description="暂无版本"
                    >
                      <VersionForm
                        dispatch={dispatch}
                        productId={productid}
                        okCallback={(newVersionId) => {
                          getPlanVersionList();
                        }}
                        subProductAll={subProductAll}
                        create
                        trigger={<Button type='primary'>创建版本</Button>}
                      />
                    </Empty>
                  </div>
              }
            </Spin>
          </Col>
        </Row>
      </DragDropContext>
      {
        drawerIssueId &&
        <DrawerComponent
          refreshFun={(params) => {
            let newParams = params || {};
            const state = newParams.state;
            const fixversionid = newParams.fixversionid;
            if ((state && (state === REQUIREMENT_STATUS_MAP.CANCLE || state === REQUIREMENT_STATUS_MAP.CLOSE)) ||
              (fixversionid)) {
              props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: '' });
            }
            getRequirementPool();
            getPlanVersionList();
          }}
        />
      }

    </div>

  </div>);
}

const mapStateToProps = (state) => {
  return {
    requirementPoolList: state.requirement_pool.requirementPoolList || [],
    drawerIssueId: state.receipt.drawerIssueId,
    lastProduct: state.product.lastProduct,
    requirementPoolLoading: state.loading.effects[`requirement_pool/getRequirementPool`],
    planVersionLoading: state.loading.effects[`requirement_pool/getPlanVersion`],

    currentUser: state.user.currentUser,
    subProductAll: state.product.enableSubProductList, // 产品下的所有子产品
    userProductFlag: state.product.userProductFlag,
    planVerisonDwInfo: state.requirement_pool.planVerisonDwInfo,
    planVersionList: state.requirement_pool.planVersionList,
  };
};

export default connect(mapStateToProps)(Form.create()(Index));
