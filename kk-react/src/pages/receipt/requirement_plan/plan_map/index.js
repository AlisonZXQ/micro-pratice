import React, { useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import uuid from 'uuid';
import { connect } from 'dva';
import { REQUIREMENT_ROADMAP } from '@shared/RequirementConfig';
import { deepCopy } from '@utils/helper';
import usePrevious from '@components/CustomHooks/usePrevious';
import TreeRender from './components/TreeRender';
import styles from './index.less';

const getStyle = () => {
  return {
    fontSize: "14px",
    fontWeight: "normal",
    marginLeft: "20px",
  };
};

function Index(props) {
  const { data, planMap, className } = props;
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState(REQUIREMENT_ROADMAP.TARGET_USER);
  const typePrevious = usePrevious(type);

  const getPlanMap = useCallback(() => {
    props.dispatch({
      type: 'requirementPlan/getRequirementPlanMap',
      payload: {
        objectiveId: data.id,
        type: type,
      }
    });
  }, [data.id, type]);

  useEffect(() => {
    if (typePrevious !== type && typePrevious) {
      getPlanMap();
    }
  }, [type, getPlanMap, typePrevious]);

  const getData = () => {
    const newObj = deepCopy(planMap);
    if (Object.keys(planMap)) {
      newObj.id = newObj.issueKey;
      const childrenMap = newObj.children || {};
      const childrenArr = [];
      for (let i in childrenMap) {
        const obj = {
          id: `${uuid()}`,
          issueType: 'classify',
          name: i || '未分类',
          children: childrenMap[i] || [],
        };
        childrenArr.push(obj);
      }
      newObj.children = childrenArr || [];
    }
    return newObj;
  };

  return (<span onClick={e => e.stopPropagation()}>
    <Modal
      title={<span>需求地图
        <span style={getStyle()}>
          <span
            className={`u-mgr10 f-csp ${type === REQUIREMENT_ROADMAP.TARGET_USER ? styles.tab : ''}`}
            onClick={() => { setType(REQUIREMENT_ROADMAP.TARGET_USER) }}
          >按用户</span>
          <span
            className={`f-csp ${type !== REQUIREMENT_ROADMAP.TARGET_USER ? styles.tab : ''}`}
            onClick={() => { setType(REQUIREMENT_ROADMAP.MODULE) }}
          >按模块</span>
        </span>
      </span>}
      visible={visible}
      width={1000}
      onCancel={() => {
        setVisible(false); props.dispatch({
          type: 'requirementPlan/saveRequirementPlanMap',
          payload: {}
        });
      }}
      footer={null}
      maskClosable={false}
      destroyOnClose
    >
      <TreeRender
        data={getData()}
        issueKey={`Objective-${data.id}`}
      />
    </Modal>
    <a
      onClick={(e) => {
        e.stopPropagation(); getPlanMap(); setVisible(true);
      }}
      className={className}
    >需求地图</a>
  </span>);
}

const mapStateToProps = (state) => {
  return {
    planMap: state.requirementPlan.planMap,
  };
};

export default withRouter(connect(mapStateToProps)(Index));
