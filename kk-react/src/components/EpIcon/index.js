import React from 'react';
import MyIcon from '@components/MyIcon';
import { issueEpIconMap } from '@shared/ReceiptConfig';
import { style } from './index.less';

const typeMap = {
  '故事': issueEpIconMap['requirement'],
  '任务': issueEpIconMap['task'],
  '子任务': issueEpIconMap['subTask'],
  '缺陷': issueEpIconMap['bug'],
  '目标': issueEpIconMap['objective'],
  '建议': issueEpIconMap['advise'],
  '工单': issueEpIconMap['ticket'],

  // 英文
  'requirement': issueEpIconMap['requirement'],
  'feature': issueEpIconMap['requirement'],
  'task': issueEpIconMap['task'],
  'subTask': issueEpIconMap['subTask'],
  'bug': issueEpIconMap['bug'],
  'objective': issueEpIconMap['objective'],
  'advise': issueEpIconMap['advise'],
  'ticket': issueEpIconMap['ticket'],

  // 需求和epic是ep单据对应关系
  '需求': issueEpIconMap['requirement'],
  'Epic': issueEpIconMap['objective']
};

const index = ({ type, className }) => {
  return (
    <MyIcon type={typeMap[type]} className={`${style} ${type} ${className || ''}`} />
  );
};

export default index;
