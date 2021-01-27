import React from 'react';
import { message } from 'antd';
import { Draggable } from 'react-beautiful-dnd';
import { filterConditionList } from '@services/advise';
import { getRequirementCustomList } from '@services/requirement';
import { drawerDelayFun } from '@utils/helper';
import { drawerDispatch } from '@shared/ReceiptConfig';
import IssueCard from '@pages/receipt/components/issue_card';
import styles from '../index.less';

async function getFilterParams(filterId, productid) {
  const filterList =
    await filterConditionList({ id: filterId }).then(res => {
      if (res.code !== 200) return message.error(res.msg);
      return res.result || [];
    }).catch(err => {
      return message.error(err || err.message);
    });
  const customList = await getRequirementCustomList({ productid }).then(res => {
    if (res.code !== 200) return message.error(res.msg);
    return res.result || [];
  }).catch(err => {
    return message.error(err || err.message);
  });

  return serverFilterData(filterList, customList);
}

function serverFilterData(data, newQueryMoreList) { //转换从服务端获取的过滤器数据
  const conditionList = data && data.filterConditionList ? data.filterConditionList : [];
  const newObj = {};
  let customValue = [];
  conditionList && conditionList.forEach((item) => {
    const arr = item.name.split('_');
    if (arr[1] === 'customfield') {
      const it = newQueryMoreList.find(x => x.key === `customfield_${arr[2]}`) || {};
      customValue.push({
        customfieldid: arr[2],
        customfieldvalueid: [1, 3, 6, 8, 9, 10].indexOf(it && it.status) > -1 ? '0' : '',
        values: item.value.indexOf('[') > -1 ? JSON.parse(item.value) : item.value,
      });
      newObj[arr[1]] = JSON.stringify(customValue);
    } else {
      newObj[arr[1]] = item.value.indexOf('[') > -1 ? JSON.parse(item.value) : item.value;
    }
  });
  delete newObj.productid;
  return newObj;
}

function getBoardData(kanbanIssue) {
  const issues = kanbanIssue || [];
  const requirementStateArr = [1, 2, 3, 4, 5, 6, 9, 10, 11, 15, 16];
  let data = {};
  requirementStateArr.forEach(it => {
    data[it] = [];
  });
  issues.forEach(it => {
    if (it.state) {
      data[it.state].push(it);
    }
  });
  return data;
}

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
});

const getDrag = (it, index, props) => {
  return (<Draggable
    key={`${it.requirementId}`}
    draggableId={`${it.requirementId}`}
    index={index}>
    {(provided, snapshot) => (
      <div
        className={styles.itemStyle}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getItemStyle(
          snapshot.isDragging,
          provided.draggableProps.style
        )}
        onClick={() => {
          drawerDelayFun(() => {
            props.dispatch({ type: drawerDispatch, payload: it.issueKey });
          }, 200);
        }}
      >
        <IssueCard data={it} style={{ border: 'unset' }} />
      </div>
    )}
  </Draggable>);
};

export {
  getFilterParams,
  serverFilterData,
  getBoardData,
  getDrag,
};
