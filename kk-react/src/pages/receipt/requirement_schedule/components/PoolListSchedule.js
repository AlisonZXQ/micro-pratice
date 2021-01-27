import React from 'react';
import { Empty } from 'antd';
import { Droppable } from 'react-beautiful-dnd';
import { getDraggableContent, getTitle } from './CommonScheduleFun';
import styles from '../index.less';

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#E6F5FF' : '', // @color-blue-1
  margin: '0px',
  width: '99%',
});

function PoolList(props) {
  const { requirementPoolList, settingRule } = props;
  const ruleType = settingRule.type;

  return (<span>
    <Droppable
      droppableId={`droppable-left`}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          {
            !requirementPoolList.length ?
              <div className="f-jcc-aic" style={{ height: 'calc(100vh - 250px)' }}>
                <Empty
                  description={
                    <span className={styles.emptyTip}>
                      暂无需求
                    </span>
                  }>
                </Empty>
              </div>
              :
              <div>
                <div className={styles.title}>{getTitle('pool')}</div>
                {requirementPoolList.map((item, index) => (
                  getDraggableContent(item, index, props.dispatch, 'pool', ruleType)
                ))}
              </div>
          }
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </span>);
}

export default PoolList;
