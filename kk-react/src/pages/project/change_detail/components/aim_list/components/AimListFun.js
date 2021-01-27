import moment from "moment";

const isEmpty = (text) => {
  return text ? text : '-';
};

const getProductCustomField = (dataSource) => {
  const arr = [];
  const valueList = dataSource.objectiveCustomFieldRelationInfoList || [];
  valueList.forEach(it => {
    const productCustomField = it.productCustomField || {};
    if (!arr.some(it => it.id === productCustomField.id)) {
      arr.push(productCustomField);
    }
  });
  return arr;
};

const getDisplayCustomField = (dataSource) => {
  // arr, valueList, selectMap
  const arr = getProductCustomField(dataSource);
  
  const valueList = dataSource.objectiveCustomFieldRelationInfoList || [];
  const selectMap = dataSource.customFieldValueidMap || [];

  const data = [];

  arr.forEach(it => {
    const filterArr = valueList.filter(item => item.productCustomField && item.productCustomField.id === it.id) || [];
    const type = it.type;
    let str = '';
    if (type === 1 || type === 3 || type === 6) {
      // 1 2 3 filterArr长度为1
      const firstObjRelation = filterArr[0].objectiveCustomFieldRelation || {};
      str = isEmpty(firstObjRelation.customvalue);
    } else if (type === 9 || type === 10) {
      const firstObjRelation = filterArr[0].objectiveCustomFieldRelation || {};
      str = `${isEmpty(firstObjRelation.customvalue)}（${filterArr[0] && filterArr[0].unit ? filterArr[0].unit : '-'}）`;
    } else if (type === 8) {
      const firstObjRelation = filterArr[0].objectiveCustomFieldRelation || {};
      str = firstObjRelation.customvalue ? moment(firstObjRelation.customvalue).format('YYYY-MM-DD') : '-';
    } else if (type === 2) {
      const firstObjRelation = filterArr[0].objectiveCustomFieldRelation || {};
      str = isEmpty(selectMap[firstObjRelation.customfieldvalueid] && selectMap[firstObjRelation.customfieldvalueid].customlabel);
    } else if (type === 4) {
      // 对于多选的4来说不确定
      let multiSelectValue = [];
      filterArr.forEach(item => {
        const itemMap = selectMap[item.objectiveCustomFieldRelation.customfieldvalueid] || {};
        if (Object.keys(itemMap).length) {
          multiSelectValue.push(itemMap.customlabel);
        }
      });
      str = isEmpty(multiSelectValue.join(','));
    } else if (type === 5) {
      // 对于5来说filterArr长度为1or2
      if (filterArr.length === 1) {
        const firstObjRelation = filterArr[0].objectiveCustomFieldRelation || {};
        str = isEmpty(selectMap[firstObjRelation.customfieldvalueid].customlabel);
      } else if (filterArr.length === 2) {
        const cascadeValue = [];
        filterArr.forEach(item => {
          const itemMap = selectMap[item.objectiveCustomFieldRelation.customfieldvalueid] || {};
          cascadeValue.push(itemMap);
        });
        const firstObj = cascadeValue[0];
        const secondObj = cascadeValue[1];
        if (Object.keys(firstObj).length && Object.keys(secondObj).length) {
          if (firstObj.parentid) {
            str = `${secondObj.customlabel},${firstObj.customlabel}`;
          } else {
            str = `${firstObj.customlabel},${secondObj.customlabel}`;
          }
        }
      }
    }
    data.push({
      ...it,
      changeData: str,
    });
  });
  return data;
};

const getDiffData = (newData, oldData) => {

  const diffData = [];
  newData.forEach(it => {
    // 新增的
    if (!oldData.some(item => item.id === it.id)) {
      diffData.push({
        action: 'add',
        ...it,
        oldData: {},
      });
    } else if (oldData.some(item => item.id === it.id)) {
      const obj = oldData.find(item => item.id === it.id) || {};
      if (it.changeData === obj.changeData) {
        diffData.push({
          action: 'noChange',
          ...it,
        });
      } else {
        diffData.push({
          action: 'update',
          ...it,
          oldData: obj,
        });
      }
    }
  });

  oldData.forEach(it => {
    if (!newData.some(item => item.id === it.id)) {
      diffData.push({
        action: 'delete',
        ...it,
        oldData: it,
      });
    }
  });
  return diffData;
};

const getCustomStyle = (it) => {
  if (it.action === 'delete') {
    return {
      borderBottom: '2px #FFAE00 solid',
      textDecoration: 'line-through'
    };
  } else if (it.action === 'add' || it.action === 'update') {
    return {
      borderBottom: '2px #FFAE00 solid',
    };
  } else {
    return {};
  }
};

export {
  getDisplayCustomField,
  getDiffData,
  getCustomStyle,
};