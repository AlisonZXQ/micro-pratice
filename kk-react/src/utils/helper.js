import moment from 'moment';
import { REG_FOR_LINK } from '@shared/CommonConfig';
import { CUSTOME_TYPE_MAP, CUSTOME_SYSTEM } from '@shared/ReceiptConfig';

/**
* 获取cookie
* @param {String} str
* @return {undefined/String/Number} 对应的cookie值
*/
function getCookie() {
  const cookieObject = {};
  const cookie = document.cookie;
  if (cookie === '') {
    return undefined;
  }
  const cookieArr = cookie.split('; ');
  for (let i = 0; i < cookieArr.length; i += 1) {
    const item = cookieArr[i];
    const index = item.indexOf('=');
    const name = item.substring(0, index);
    const value = item.substring(index + 1);
    cookieObject[name] = value;
  }
  return cookieObject;
}

/**
 * 数组去重
 * @param {Array} arr
 */
function arrDeduplication(arr) {
  return [...new Set(arr)];
}

/**
 * 判断当前平台是否是windows
 */
function isWindows() {
  return window.navigator.appVersion.toLowerCase().includes('windows');
}

/** 生成列标签和内容的layout函数 */
function getFormLayout(labelCol, wrapperCol) {
  return (
    {
      labelCol: {
        xs: { span: 24 },
        sm: { span: labelCol },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: wrapperCol },
      },
    }
  );
}

function obj2query(data) {
  let query = '';
  if (!data) return query;
  for (const i in data) {
    if (hasOwnProperty.call(data, i)) {
      query += `${i}=${encodeURIComponent(data[i])}&`;
    }
  }
  // remove last `&`
  return query.replace(/&$/, '');
}

// 日期不包含今天
function dateDiff(startDateString, endDateString) {

  const separator = "-"; //日期分隔符
  const startDates = startDateString.split(separator);
  const endDates = endDateString.split(separator);
  const startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
  const endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);

  return parseInt((endDate - startDate) / 1000 / 60 / 60 / 24);//把相差的毫秒数转换为天数
}

/**
  * 判断此对象是否是Object类型
  * @param {Object} obj
  */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * 判断此类型是否是Array类型
 * @param {Array} arr
 */
function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
}

/**
  *  深度比较两个对象是否相同
  * @param {Object} oldData
  * @param {Object} newData
  */
function equalsObj(oldData, newData) {
  // 类型为基本类型时,如果相同,则返回true
  if (oldData === newData) return true;

  if (isObject(oldData) && isObject(newData) && oldData && newData && Object.keys(oldData).length === Object.keys(newData).length) {
    // 类型为对象并且元素个数相同

    // 遍历所有对象中所有属性,判断元素是否相同
    for (const key in oldData) {
      // 对象中具有不相同属性 返回false
      if (oldData.hasOwnProperty(key) && !equalsObj(oldData[key], newData[key])) {
        return false;
      }
    }
  } else if (isArray(oldData) && oldData && newData && oldData.length === newData.length) {
    // 类型为数组并且数组长度相同
    for (let i = 0, length = oldData.length; i < length; i++) {
      if (!equalsObj(oldData[i], newData[i]))
        // 如果数组元素中具有不相同元素,返回false
        return false;
    }
  } else {
    // 其它类型,均返回false
    return false;
  }
  // 走到这里,说明数组或者对象中所有元素都相同,返回true
  return true;
}

const getContainer = () => document.getElementById('container');

function dateToTime(m) {
  return new Date(m).getTime();
}

function deepCopy(p, type) {
  // type可以是[]or{}
  let c = type || {};
  for (let i in p) {
    if (!p.hasOwnProperty(i)) {
      continue;
    }
    if (typeof p[i] === 'object') {
      c[i] = (p[i].constructor === Array) ? [] : {};
      deepCopy(p[i], c[i]);
    } else {
      c[i] = p[i];
    }
  }
  return c;
}

/**
 * 生成人类友好时间
 * @param  {Number} _time 毫秒级时间戳
 * @return {String} 人类友好的相对时间显示
 */
function getHumanTime(_time) {
  var _now = parseInt(+new Date() / 1000),
    _apart = _now - parseInt(_time / 1000);

  //年
  if (_apart >= 60 * 60 * 24 * 365) {
    return parseInt(_apart / (60 * 60 * 24 * 365)) + "年前";
  }
  //月
  else if (_apart >= 60 * 60 * 24 * 31) {
    return parseInt(_apart / (60 * 60 * 24 * 31)) + "月前";
  }
  //周
  else if (_apart >= 60 * 60 * 24 * 7) {
    return parseInt(_apart / (60 * 60 * 24 * 7)) + "周前";
  }
  //天
  else if (_apart >= 60 * 60 * 24) {
    return parseInt(_apart / (60 * 60 * 24)) + "天前";
  }
  //小时
  else if (_apart >= 60 * 60) {
    return parseInt(_apart / (60 * 60)) + "小时前";
  }
  //分钟
  else if (_apart >= 60) {
    return parseInt(_apart / 60) + "分钟前";
  }
  //秒
  else {
    return parseInt(_apart) + "秒前";
  }
}

/**
 * 将字节大小转换为人类可读的保留一位小数的大小表示
 * @param  {Number} _size 字节大小
 */
function getHumanSize(_size) {
  if (_size < 1024) {
    return _size + "B";
  } else if (_size >= 1024 && _size < 1024 * 1024) {
    return Number(_size / 1024).toFixed(1) + "KB";
  } else if (_size >= 1024 * 1024 && _size < 1024 * 1024 * 1024) {
    return Number(_size / (1024 * 1024)).toFixed(1) + "MB";
  } else {
    return Number(_size / (1024 * 1024 * 1024)).toFixed(1) + "GB";
  }
}

function isProduction() {
  const { hostname } = window.location;
  return !!hostname.includes('kk.hz.netease.com') || !!hostname.includes('ep.netease.com');
}

function isBusinessFun() {
  const { hostname } = window.location;
  return !!hostname.includes('njdiip');
}

function isZero(text) {
  return text ? text : 0;
}

function isEmpty(text) {
  return text ? text : '';
}

function getTextRelationId(valueList, customfieldid) {
  if (!valueList || !valueList.length) {
    return 0;
  } else {
    const obj = valueList.find(it => it.productCustomField && it.productCustomField.id === Number(customfieldid)) || {};
    const relationObj = obj.objectiveCustomFieldRelation || {};
    return isZero(relationObj.id);
  }
}

function getSelectRelationId(valueList, customfieldvalueid) {
  if (!valueList || !valueList.length || !customfieldvalueid) {
    return 0;
  } else {
    const obj = valueList.find(it => it.objectiveCustomFieldRelation && it.objectiveCustomFieldRelation.customfieldvalueid === customfieldvalueid) || {};
    const relationObj = obj.objectiveCustomFieldRelation || {};
    return isZero(relationObj.id || relationObj.tempId);
  }
}

function getIssueCustom(values, customSelect, valueList) {
  const custom_field_values = [];

  for (let i in values) {
    if (i.includes('custom')) {
      const arr = i.split('-');
      const type = arr[2];
      const customfieldid = arr[1];
      // 单行或者多行文本，整数，小数，成员
      if (type === `${CUSTOME_TYPE_MAP.INPUT}` || type === `${CUSTOME_TYPE_MAP.TEXTAREA}` || type === `${CUSTOME_TYPE_MAP.INTERGER}` || type === `${CUSTOME_TYPE_MAP.DECIMAL}` || type === `${CUSTOME_TYPE_MAP.USERSELECT}`) {
        custom_field_values.push({
          customfieldid: customfieldid,
          value: [{
            customfieldRelationId: getTextRelationId(valueList, customfieldid),
            customfieldvalueid: 0,
            customvalue: values[i] ? values[i].toString() : '',
          }]
        });
      } else if (type === `${CUSTOME_TYPE_MAP.DATEPICKER}`) {
        const newDate = values[i] ? moment(values[i]).format('YYYY-MM-DD') : '';
        custom_field_values.push({
          customfieldid: customfieldid,
          value: [{
            customfieldRelationId: getTextRelationId(valueList, customfieldid),
            customfieldvalueid: 0,
            customvalue: isEmpty(newDate),
          }]
        });
      } else if (type === `${CUSTOME_TYPE_MAP.SELECT}`) {// 单选
        const data = customSelect[customfieldid] || [];
        const item = data.find(it => it.id === values[i]) || {};
        custom_field_values.push({
          customfieldid: customfieldid,
          value: [{
            customfieldRelationId: getSelectRelationId(valueList, values[i]),
            customfieldvalueid: isZero(values[i]),
            customvalue: isEmpty(item.customvalue),
          }]
        });
        // 多选 or 级联
      } else if (type === `${CUSTOME_TYPE_MAP.MULTISELECT}` || type === `${CUSTOME_TYPE_MAP.CASCADER}`) {
        let valueArr = [];
        values[i] && values[i].forEach((item) => {
          const data = customSelect[arr[1]] || [];
          data.forEach((it) => {
            if (item === it.id) {
              valueArr.push({
                customfieldRelationId: getSelectRelationId(valueList, it.id),
                customfieldvalueid: isZero(it.id),
                customvalue: isEmpty(it.customvalue),
              });
            }
          });
        });
        custom_field_values.push({
          customfieldid: customfieldid,
          value: valueArr,
        });
      }
    }
  }

  return custom_field_values;
}

function getDisplayCustomField(it, record, issueType) {
  const nameMap = {
    'requirement': 'requirementCustomFieldRelation',
    'bug': 'bugCustomFieldRelation',
    'advise': 'adviseCustomFieldRelation',
    'task': 'taskCustomFieldRelation',
    'objective': 'objectiveCustomFieldRelation',
    'ticket': 'ticketCustomFieldRelation',
  };

  const listMap = {
    'requirement': 'requirementCustomFieldRelationInfoList',
    'bug': 'bugCustomFieldRelationInfoList',
    'advise': 'adviseCustomFieldRelationInfoList',
    'task': 'taskCustomFieldRelationInfoList',
    'objective': 'objectiveCustomFieldRelationInfoList',
    'ticket': 'ticketCustomFieldRelationInfoList',
  };
  const selectMap = record.customFieldValueidMap || {};
  const valueList = record[listMap[issueType]] || [];
  const filterArr = valueList.filter(item => item.productCustomField && item.productCustomField.id === it.id) || [];
  const type = it.type;

  if (type === CUSTOME_TYPE_MAP.INPUT || type === CUSTOME_TYPE_MAP.TEXTAREA || type === CUSTOME_TYPE_MAP.SELECT || type === CUSTOME_TYPE_MAP.USERSELECT || type === CUSTOME_TYPE_MAP.INTERGER || type === CUSTOME_TYPE_MAP.DECIMAL) {
    // 1 2 3 filterArr长度为1
    const firstObjRelation = (filterArr[0] && filterArr[0][nameMap[issueType]]) || {};
    const firstUnit = (filterArr[0] && filterArr[0].unit) || '';
    const value = firstObjRelation.customvalue || firstObjRelation.customValue;
    if (type === CUSTOME_TYPE_MAP.INTERGER || type === CUSTOME_TYPE_MAP.DECIMAL) {
      return value ? value + firstUnit : '--';
    } else {
      return isEmpty(value);
    }
  } else if (type === CUSTOME_TYPE_MAP.SELECT) {
    const firstObjRelation = (filterArr[0] && filterArr[0][nameMap[issueType]]) || {};
    const valueid = firstObjRelation.customfieldvalueid || firstObjRelation.customFieldValueId;
    return isEmpty(selectMap[valueid] && selectMap[valueid].customlabel);
  } else if (type === CUSTOME_TYPE_MAP.MULTISELECT) {
    // 对于多选的4来说不确定
    const multiSelectValue = [];
    filterArr.forEach(item => {
      const itemMap = selectMap[item[nameMap[issueType]].customfieldvalueid] || selectMap[item[nameMap[issueType]].customFieldValueId] || {};
      multiSelectValue.push(itemMap.customlabel);
    });
    return isEmpty(multiSelectValue.join(','));
  } else if (type === CUSTOME_TYPE_MAP.CASCADER) {
    // 对于5来说filterArr长度为1or2
    if (filterArr.length === 1) {
      const firstObjRelation = filterArr[0][nameMap[issueType]] || {};
      const valueid = firstObjRelation.customfieldvalueid || firstObjRelation.customFieldValueId;
      return isEmpty(selectMap[valueid].customlabel);
    } else if (filterArr.length === 2) {
      const cascadeValue = [];
      filterArr.forEach(item => {
        const itemMap = selectMap[item[nameMap[issueType]].customfieldvalueid] || selectMap[item[nameMap[issueType]].customFieldValueId] || {};
        cascadeValue.push(itemMap);
      });
      const firstObj = cascadeValue[0];
      const secondObj = cascadeValue[1];
      if (firstObj.parentid) {
        return `${secondObj.customlabel},${firstObj.customlabel}`;
      } else {
        return `${firstObj.customlabel},${secondObj.customlabel}`;
      }
    }
  } else if (type === CUSTOME_TYPE_MAP.DATEPICKER) {
    const firstObjRelation = (filterArr[0] && filterArr[0][nameMap[issueType]]) || {};
    const value = firstObjRelation.customvalue || firstObjRelation.customValue;
    return value ? value : '';
  }
}

function setTreeData(arr, idType, parentIdType) {
  const idName = idType || 'id';
  const parentIdName = parentIdType || 'parentid';
  arr.forEach(item => {
    item.children = null;
  });

  let map = {}; // 构建map
  arr.forEach(i => {
    map[i[idName]] = i; // 构建以key为键 当前数据为值
  });
  let treeData = [];
  arr.forEach(child => {
    const mapItem = map[child[parentIdName]];
    if (mapItem) {
      mapItem.children = mapItem.children || [];
      mapItem.children.push(child);
    } else {
      treeData.push(child);
    }
  });
  return treeData;
}

function estimateCost(estimate_cost) {
  return !/^([\d|\.]{1,}w)?([\d|\.]{1,}d)?([\d|\.]{1,}h)?([\d|\.]{1,}m)?$/.test(estimate_cost);
}

function getStartTime(date) {
  return date ? new Date(date).setHours(0, 0, 0, 0) : '';
}

function getEndTime(date) {
  return date ? new Date(date).setHours(23, 59, 59, 999) : '';
}

const setCollapseObj = (key, value) => {
  let isCollapseObj = localStorage.getItem(`isCollapseObj`) ? JSON.parse(localStorage.getItem(`isCollapseObj`)) : {};
  let newIsCollapseObj = {
    ...isCollapseObj,
    [key]: value,
  };

  localStorage.setItem(`isCollapseObj`, JSON.stringify(newIsCollapseObj));
};

const getCollapseObj = (key) => {
  let isCollapseObj = localStorage.getItem(`isCollapseObj`) ? JSON.parse(localStorage.getItem(`isCollapseObj`)) : {};
  return isCollapseObj[key] || false;
};

function compareFilter(obj, dObj) { //比较过滤器
  const newObj = obj;
  const defaultObj = dObj;
  let isChangeFilter = false;
  let newData = {};
  let newDefaultObj = {};
  for (let key in newObj) {
    if (newObj[key] !== '' && newObj[key] && newObj[key].toString() !== '') {
      newData[key] = newObj[key];
    }
  }
  delete newData.offset;
  delete newData.limit;
  delete newData.productid;
  delete newData.nosub; //任务单据的

  for (let key in defaultObj) {
    if (defaultObj[key] !== '' && defaultObj[key].toString() !== '') {
      newDefaultObj[key] = defaultObj[key];
    }
  }
  delete newDefaultObj.offset;
  delete newDefaultObj.limit;
  if (Object.keys(newData).length !== Object.keys(newDefaultObj).length) {
    isChangeFilter = true;
  } else {
    let flag = false;
    for (let i in newData) {
      if (typeof newData[i] === 'object' && newData[i]) { //数组类型
        if ((newData[i] ? newData[i].sort().toString() : 'undefined') !== (newDefaultObj[i] ? newDefaultObj[i].sort().toString() : 'undefined')) {
          flag = true;
        }
      } else if (newData[i] !== newDefaultObj[i]) { //其他类型
        flag = true;
      }
    }
    isChangeFilter = flag;
  }
  return isChangeFilter;
}

const getIssueKey = () => {
  const pathname = window.location.pathname;
  const pathArr = pathname.split('/');
  if (!pathArr[4]) {
    return '';
  }
  const idArr = pathArr[4].split('-');
  return idArr[1] || '';
};

function filterCustom(key, value, type, newParams) { //筛选时有自定义字段的处理
  let newValue = JSON.parse(JSON.stringify(value));
  if (type === CUSTOME_TYPE_MAP.CASCADER) { //级联只传最后一项
    newValue = newValue && [newValue.pop()];
  }
  const idArr = key.split('_');
  const pushData = {
    customfieldid: idArr[1],
    customfieldvalueid: [CUSTOME_TYPE_MAP.INPUT, CUSTOME_TYPE_MAP.TEXTAREA, CUSTOME_TYPE_MAP.USERSELECT, CUSTOME_TYPE_MAP.DATEPICKER, CUSTOME_TYPE_MAP.INTERGER, CUSTOME_TYPE_MAP.DECIMAL].indexOf(type) > -1 ? '0' : '',
    values: [CUSTOME_TYPE_MAP.INPUT, CUSTOME_TYPE_MAP.TEXTAREA, CUSTOME_TYPE_MAP.USERSELECT, CUSTOME_TYPE_MAP.DATEPICKER, CUSTOME_TYPE_MAP.INTERGER, CUSTOME_TYPE_MAP.DECIMAL].indexOf(type) > -1 ? [value] : newValue,
  };
  let data = newParams.customfield ? JSON.parse(newParams.customfield) : [];
  if (data.some(it => it.customfieldid === idArr[1])) {
    const index = data.findIndex(item => item.customfieldid === idArr[1]);
    if (value && value.toString().length) {
      data.splice(index, 1, pushData);
    } else {
      data.splice(index, 1);
    }
  } else if (value && value.toString().length) {
    data.push(pushData);
  } else {
    data = [];
  }
  return JSON.stringify(data);
}

function serverFilterData(data, listQuery, newQueryMoreList, type) { //转换从服务端获取的过滤器数据
  const conditionList = data && data.filterConditionList ? data.filterConditionList : [];
  const newObj = {};
  let customValue = [];
  conditionList && conditionList.forEach((item) => {
    const arr = item.name.split('_');
    if (arr[1] === type) {
      localStorage.setItem(`${item.name}`, item.value);
    } else if (arr[1] === 'customfield') {
      const it = newQueryMoreList.find(x => x.key === `customfield_${arr[2]}`) || {};
      customValue.push({
        customfieldid: arr[2],
        customfieldvalueid: [CUSTOME_TYPE_MAP.INPUT, CUSTOME_TYPE_MAP.TEXTAREA, CUSTOME_TYPE_MAP.USERSELECT, CUSTOME_TYPE_MAP.DATEPICKER, CUSTOME_TYPE_MAP.INTERGER, CUSTOME_TYPE_MAP.DECIMAL].indexOf(it && it.status) > -1 ? '0' : '',
        values: item.value.indexOf('[') > -1 ? JSON.parse(item.value) : item.value,
      });
      newObj[arr[1]] = JSON.stringify(customValue);
    } else {
      newObj[arr[1]] = item.value.indexOf('[') > -1 ? JSON.parse(item.value) : item.value;
    }
  });
  delete newObj.productid;
  newObj.limit = listQuery.limit || 10;
  newObj.offset = listQuery.offset || 0;
  return newObj;
}

function hasPermission(checkPermissionKey, permissionKeyList) {
  const list = permissionKeyList || [];
  const found = list.find(item => checkPermissionKey === item);
  return found !== undefined;
}

function drawerDelayFun(fn, delay) {
  return setTimeout(fn, delay);
}

function calculateDwm(s) {
  return (s / (60 * 60 * 8)).toFixed(2);
}

function getLinkableContent(value) {
  return value.replace(REG_FOR_LINK, function (a) {
    return '<a href="' + a + '" target=_blank>' + a + '</a>';
  });
}

function getMentionUsers(description) {
  const reg = /<a href="([^"]+)" target="([^"]+)" rel="([^"]+)">(.*?)<\/a>/gi;
  let mentionsArr = [];
  let result;

  while ((result = reg.exec(description)) != null) {
    const nameAndEmail = result[4];
    const nameAndEmailArr = nameAndEmail.split(' ');
    mentionsArr.push({
      name: nameAndEmailArr[0],
      email: nameAndEmailArr[1],
    });
  }
  return mentionsArr;
}

function isEpIssue(issueKey) {
  return isObjective(issueKey)
    || isAdvise(issueKey)
    || isRequirement(issueKey)
    || isTask(issueKey)
    || isSubTask(issueKey)
    || isBug(issueKey);
}
function isObjective(issueKey) {
  return issueKey.indexOf('Objective-') === 0;
}
function isAdvise(issueKey) {
  return issueKey.indexOf('Feedback-') === 0;
}
function isRequirement(issueKey) {
  return issueKey.indexOf('Feature-') === 0;
}
function isTask(issueKey) {
  return issueKey.indexOf('Task-') === 0;
}
function isSubTask(issueKey) {
  return issueKey.indexOf('Subtask-') === 0;
}
function isBug(issueKey) {
  return issueKey.indexOf('Bug-') === 0;
}
function generateEpUrl(prefix, issueKey) {
  return prefix + '/' + issueKey;
}
function generateJiraUrl(issueKey) {
  return 'http://jira.netease.com/browse/' + issueKey;
}

const getSystemDescription = (data) => {
  const customList = data || [];
  return customList.find(it => it.system === CUSTOME_SYSTEM.SYSTEM && it.name === '描述') || {};
};

const getSystemDescriptionEditValue = (data) => {
  const relationList = data || [];
  const descriptionObj = relationList.find(it => it.productCustomField && it.productCustomField.system === CUSTOME_SYSTEM.SYSTEM && it.productCustomField.name === '描述') || {};
  let key = '';
  for (let i in descriptionObj) {
    if (i.includes('CustomFieldRelation')) {
      key = i;
    }
  }
  const customFieldRelation = descriptionObj[key] || {};
  return customFieldRelation.customvalue || customFieldRelation.customValue;
};

function getCloudccRichValue(value) {
  return value + '【<a >查看cloudcc信息详情</a>】';
}

function isHasByList(id, list, label) {
  if (list.find(it => it[label].id === id)) {
    return id;
  } else {
    return undefined;
  }
}

// dataURL转blob文件流
function dataURLtoBlob(baseurl) {
  let arr = baseurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}

// obj里面的key值转换为小写
function objKeysToLower(obj) {
  let newObj = {};
  for (let i in obj) {
    newObj[i.toLocaleLowerCase()] = obj[i];
  }
  return newObj || {};
}

/**
 * 将img图片标签为可点击直接查看的元素
 */
function addClickForImage(content) {
  // 匹配img元素
  const _img = /<img\b.*?(?:\>|\/>)/gi;
  return content.replace(_img, (str) => {
    // 获取img的href元素
    const _href = /\bsrc\b\s*=\s*[\'\"]?([^\'\"]*)[\'\"]?/i;
    const newStr = _href.exec(str);
    const href = newStr[1];
    return (
      `<a href=${href} target="_blank" rel="noopener noreferrer">` +
      `<img src=${href} />` +
      `</a>`
    );
  });
}

/**
 * @description - 获取传入的日期是周几
 */
function getTodayInWeek(date) {
  return '周' + "日一二三四五六".charAt(new Date(date).getDay());
}

/**
 * 首字母大写
 */
function firstWordToUpperCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * @description - 深度优先遍历
 * @param {*} node
 * @param {*} childProp
 */
const depthSearch = (node, childProp = 'children') => {
  const nodeList = [];
  const depthEach = (item) => {
    if (!item.id.includes('hidden') && item.children && !!item.children.length) {
      item.collapsed = true;
    }
    if (item[childProp]) {
      for (let k in item[childProp]) {
        depthEach(item[childProp][k]);
      }
    }
  };
  depthEach(node);
  return nodeList;
};

const getDeptLayerTreeData = (conveyData) => {
  let data = conveyData || [];
  data = data.map(it => ({
    key: it.deptId,
    title: it.deptName
  }));
  if (data) {
    let i = 0;
    while (i < data.length && data[i + 1]) {
      data[i].children = [data[i + 1]];
      i++;
    }
    return data[0] ? [data[0]] : [];
  }
};

export {
  isObject,
  isArray,
  arrDeduplication,
  isWindows,
  getFormLayout,
  obj2query,
  getCookie,
  dateDiff,
  equalsObj,
  getContainer,
  dateToTime,
  deepCopy,
  getHumanTime,
  isProduction,
  isBusinessFun,
  getHumanSize,
  getIssueCustom,
  getDisplayCustomField,
  setTreeData,
  estimateCost,
  getStartTime,
  getEndTime,
  setCollapseObj,
  getCollapseObj,
  compareFilter,
  getIssueKey,
  filterCustom,
  serverFilterData,
  hasPermission,
  drawerDelayFun,
  calculateDwm,
  getLinkableContent,
  getMentionUsers,
  isEpIssue,
  isObjective,
  isAdvise,
  isRequirement,
  isTask,
  isSubTask,
  isBug,
  generateEpUrl,
  generateJiraUrl,
  getSystemDescription,
  getSystemDescriptionEditValue,
  getCloudccRichValue,
  isHasByList,
  dataURLtoBlob,
  objKeysToLower,
  addClickForImage,
  getTodayInWeek,
  firstWordToUpperCase,
  depthSearch,
  getDeptLayerTreeData,
};
