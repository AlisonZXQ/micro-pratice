import { deepCopy } from '@utils/helper';

export function getSelectData(selectObj) {
  const obj = deepCopy(selectObj);
  const { selectData, defaultSelectData } = obj;
  let newData = [];

  defaultSelectData.forEach(it => {
    if (!selectData.some(i => i.id === it.id)) {
      newData.push({
        action: 'DELETE',
        customvalueid: it.id,
        customlabel: it.customlabel,
        customvalue: it.customvalue,
      });
    }
  });

  selectData.forEach((item) => {
    const obj = defaultSelectData.find(i => i.id === item.id) || {};
    if (Object.keys(obj).length) {
      if (item.customlabel === obj.customlabel) {
        newData.push({
          action: 'none',
          customvalueid: item.id,
          customlabel: item.customlabel,
          customvalue: item.customvalue,
        });
      } else {
        newData.push({
          action: 'UPDATE',
          customvalueid: item.id,
          customlabel: item.customlabel,
          customvalue: item.customvalue,
        });
      }
    } else {
      newData.push({
        action: "ADD",
        customlabel: item.customlabel,
        customvalue: item.customvalue,
      });
    }
  });

  newData = newData.filter(i => i.action !== 'none');

  return newData;
}

export function getCascaderData(cascaderObj) {
  const obj = deepCopy(cascaderObj);
  const { cascaderData, defaultCascaderData } = obj;
  const defaultData = defaultCascaderData;

  let newData = [];
  let addData = [];
  let updateData = [];
  let deleteData = [];

  cascaderData.forEach((item) => {
    newData.push(item);
    item.child && item.child.forEach((it) => {
      if (it.name) {
        it.parentid = item.id;
        newData.push(it);
      }
    });
  });

  defaultData.forEach(it => {
    if (!newData.some(i => i.id === it.id)) {
      deleteData.push({
        uuid: it.id,
        action: 'DELETE',
        customlabel: it.customlabel,
        customvalue: it.customlabel,
        customvalueid: it.id,
        parentid: it.parentid,
      });
    }
  });

  newData.forEach(it => {
    if (!defaultData.some(i => i.id === it.id)) {
      addData.push(it);
    } else {
      updateData.push(it);
    }
  });

  addData.forEach((item) => {
    item.action = 'ADD';
    item.customlabel = item.name;
    item.customvalue = item.name;
    item.uuid = item.id;
    item.parentid = item.child ? 0 : item.parentid;
    item.customvalueid = item.id;
    delete item.active;
    delete item.child;
    delete item.type;
  });

  updateData.forEach((it) => {
    const item = defaultData.find(i => i.id === it.id) || {};
    if (it.name !== item.customlabel) {
      it.action = 'UPDATE';
      it.customvalueid = it.id;
      it.uuid = it.id;
      it.customlabel = it.name;
    } else {
      it.customvalueid = it.id;
      it.uuid = it.id;
      it.action = 'none';
    }
    delete item.active;
    delete item.child;
    delete item.type;
  });

  updateData = updateData.filter((it) => it.action !== 'none');
  let lastData = [...deleteData, ...addData, ...updateData];
  lastData = lastData.filter(it => it.customlabel);

  return lastData;
}

export function getMaxValue(data) {
  let max = 0;
  data.forEach(it => {
    if (it.sortvalue > max) {
      max = it.sortvalue;
    }
  });
  return max;
}
