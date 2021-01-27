function setTreeData(arr) {

  let map = {}; 
  arr.forEach(i => {
    map[i.key] = i; 
  });

  let treeData = [];
  arr.forEach(child => {
    const mapItem = map[child.parentKey];
    if (mapItem) {
      mapItem.children = mapItem.children || [];
      mapItem.children.push(child);
    }

    treeData.push(child);
    
  });
  
  return treeData;
}

export {
  setTreeData
};