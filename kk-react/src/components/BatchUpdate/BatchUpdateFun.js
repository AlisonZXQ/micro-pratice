import { bathIssueMap, bathNameMap, requiredArr } from '@shared/ReceiptConfig';
import { arrDeduplication } from '@utils/helper';

const getUpdateKeysArr = (data) => {
  let allUpdateKeys = []; // 并集
  let updateKeysArr = []; // 定义每一个key的状态
  const issueTypeArr = []; // issuetype的数据集
  const isSameSubProduct = getIsSameSubProduct(data);
  data.forEach(it => {
    const issuetype = it.issueKey && it.issueKey.split('-')[0].toLowerCase();
    if (!issueTypeArr.includes(issuetype)) {
      issueTypeArr.push(issuetype);
      allUpdateKeys = allUpdateKeys.concat(bathIssueMap[issuetype]);
    }
  });

  allUpdateKeys = arrDeduplication(allUpdateKeys);
  allUpdateKeys.forEach(item => {
    let disabled = false;
    issueTypeArr.forEach(it => {
      if (!bathIssueMap[it].includes(item)) {
        disabled = true;
      }
    });
    if ((item === 'fixVersionId' || item === 'findVersionId') && !isSameSubProduct) {
      disabled = true;
    }
    updateKeysArr.push({
      key: item,
      name: bathNameMap[item],
      disabled: disabled,
      required: requiredArr.includes(item),
    });
  });
  return updateKeysArr;
};

const getIsSameSubProduct = (data) => {
  let flag = true;
  let firstSubProductVO = data && data[0] && data[0].subProductVO;
  data.forEach((it, index) => {
    const subProductVO = it.subProductVO || {};
    if (index !== 0 && firstSubProductVO.id !== subProductVO.id) {
      flag = false;
    }
  });
  return flag;
};

export {
  getUpdateKeysArr,
  getIsSameSubProduct
};
