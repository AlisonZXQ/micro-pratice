import React from 'react';
import { aimNameMap, aimColorDotMap } from '@shared/CommonConfig';
import DefineDot from '@components/DefineDot';
import BugTaskStatus from './components/BugTaskStatus';
import RequirementStatus from './components/RequirementStatus';

const EditStatus = ({ record }) => {
  const issueTypeMap = {
    '任务': 'task',
    '子任务': 'task',
    '缺陷': 'bug',
    '需求': 'requirement',
    '目标': 'objective',
  };

  const getEditContent = () => {
    const type = issueTypeMap[record.issuetype];

    switch (type) {
      case 'objective':
        return <DefineDot
          text={record.statusid}
          statusColor={aimColorDotMap}
          statusMap={aimNameMap}
        />;
      case 'task':
      case 'bug':
        return <BugTaskStatus
          record={record}
          type={type}
        />;
      case 'requirement':
        return <RequirementStatus
          record={record}
          type={type}
        />;
      default:
        return null;
    }
  };

  return (<span>
    {getEditContent()}
  </span>);

};

export default EditStatus;
