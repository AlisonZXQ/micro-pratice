import React, { useState } from 'react';
import { Radio } from 'antd';
import { colorMap, nameMap } from '@shared/CommonConfig';
import StatusHistory from './StatusHistory';
import ChangeHistory from './ChangeHistory';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

// type advise/requirement/objective/task/bug
function History(props) {
  const { detail, type } = props;
  const [state, setState] = useState('dinary');

  return (<>
    <RadioGroup
      value={state}
      onChange={(e) => setState(e.target.value)}>
      <RadioButton value={'dinary'}>活动日志</RadioButton>
      <RadioButton value={'history'}>状态历史</RadioButton>
    </RadioGroup>

    <div style={{ margin: '15px 15px 0px 15px' }}>
      {
        state === 'dinary' &&
        <ChangeHistory id={detail && detail[type] && detail[type].id} type={type} />
      }
    </div>

    <div>
      {
        state === 'history' &&
        <StatusHistory
          connid={detail[type].id}
          type={type}
          nameMap={nameMap[type]}
          colorMap={colorMap[type]}
        />
      }
    </div>

  </>);
}

export default History;
