import { arrDeduplication } from '@utils/helper';

const getGroupData = (data) => {
  let deptNameArr = data.map(it => it.deptFullPath);
  deptNameArr = arrDeduplication(deptNameArr);
  const groupData = deptNameArr.map((deptFullPath, index) => ({ deptFullPath, id: index + 1 }));

  const newData = [...data];
  newData.forEach(it => {
    const obj = groupData.find(i => i.deptFullPath === it.deptFullPath);
    obj.children = obj.children || [];
    obj.children.push(it);
  });
  return groupData;
};

export {
  getGroupData,
};
