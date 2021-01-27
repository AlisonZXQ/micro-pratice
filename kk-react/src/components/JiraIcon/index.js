import React from 'react';
import MyIcon from '@components/MyIcon';
import { issueJiraIconMap } from '@shared/ReceiptConfig';
import { style } from './index.less';

const typeMap = {
  '故事': issueJiraIconMap['requirement'],
  '任务': issueJiraIconMap['task'],
  '子任务': issueJiraIconMap['subTask'],
  '缺陷': issueJiraIconMap['bug'],
  '目标': issueJiraIconMap['objective'],
  '建议': issueJiraIconMap['feature'],

  // 英文
  'requirement': issueJiraIconMap['requirement'],
  'task': issueJiraIconMap['task'],
  'subTask': issueJiraIconMap['subTask'],
  'bug': issueJiraIconMap['bug'],
  'objective': issueJiraIconMap['objective'],
  'advise': issueJiraIconMap['feature'],


  // 需求和epic是ep单据对应关系
  '需求': issueJiraIconMap['requirement'],
  'Epic': issueJiraIconMap['objective'],
};

const index = ({ type, className }) => {
  return (
    <MyIcon type={typeMap[type]} className={`${style} ${type} ${className || ''}`} />
  );
};

export default index;
