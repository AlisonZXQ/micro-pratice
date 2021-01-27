import { arrDeduplication } from '@utils/helper';

const getGroupData = (data) => {
  let deptNameArr = data.map(it => it.deptName);
  deptNameArr = arrDeduplication(deptNameArr);
  const groupData = deptNameArr.map((deptName, index) => ({ deptName, id: index + 1 }));

  const newData = [...data];
  newData.forEach(it => {
    const obj = groupData.find(i => i.deptName === it.deptName);
    obj.children = obj.children || [];
    obj.children.push(it);
  });
  return groupData;
};

export {
  getGroupData,
};
