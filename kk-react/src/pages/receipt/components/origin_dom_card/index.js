import { nameMap, colorDotMap } from '@shared/CommonConfig';
import { BUG_LEVER_NAME } from '@shared/BugConfig';
import { ISSUE_TYPE_NAME_MAP, LEVER_NAME, issueParentMap, issueRelationMap, detailUrlMap, issueTextColorMap, LEVER_MAP, LEVER_COLOR } from '@shared/ReceiptConfig';
import { calculateDwm } from '@utils/helper';
import requirement from '@assets/requirement.png';
import objective from '@assets/objective.png';
import task from '@assets/task.png';
import subTask from '@assets/subTask.png';
import advise from '@assets/advise.png';
import bug from '@assets/bug.png';
import ticket from '@assets/ticket.png';

import estimate from '@assets/estimate.png';
import importance from '@assets/importance.png';
import P0 from '@assets/P0.png';
import P1 from '@assets/P1.png';
import P2 from '@assets/P2.png';

import styles from './index.less';

const imgsMap = {
  'requirement': requirement,
  'objective': objective,
  'task': task,
  'subTask': subTask,
  'advise': advise,
  'bug': bug,
  'ticket': ticket
};

const LEVER_ICON = {
  [LEVER_MAP.P0]: P0,
  [LEVER_MAP.P1]: P1,
  [LEVER_MAP.P2]: P2,
};

function getIssueCard(data, issueKey) {
  const responseUser = data.responseUser || {};
  const name = responseUser.name;
  const lastTwoWord = name && name.slice(name.length - 2);
  const issueName = ISSUE_TYPE_NAME_MAP[data.issueType];
  const issueNameMap = nameMap[issueName] || {};
  const issueColorMap = colorDotMap[issueName] || {};
  const dwManpower = data.dwManpower || {};

  const LevelNameMap = issueName === 'bug' ? BUG_LEVER_NAME : LEVER_NAME;

  const issueParentArr = issueParentMap[issueName] || [];
  const issueRelationArr = issueRelationMap[issueName] || [];

  const getIssueCount = (arr) => {
    let str = '';
    arr.forEach(item => {
      str += `<span class=${styles.item}>
      <img alt=${item} class=${styles.img} src=${imgsMap[item]} />
      <span style="color: ${issueTextColorMap[item]}">${data[`${item}Count`] || 0}</span>
      </span>`;
    });
    return str;
  };

  return `
  <div class=${issueKey === data.issueKey ? styles.issueActiveCard : styles.issueCommonCard} style="height: ${data.size[1] - 5}px;" onclick="window.open('${window.location.origin}/v2${detailUrlMap[issueName]}/${data.issueKey}')">
  <div style="padding: 5px">
  <div class=${styles.rowStyle}>
      <span class=${styles.firstLineLeft}>
        <img alt="img" class=${styles.icon} src=${imgsMap[issueName]} />
        <span class=${styles.overName}>${data.name}</span>
      </span>
      <span class=${styles.firstLineRight}>
        <span class=${styles.name}>${lastTwoWord}</span>
      </span>
  </div>

    <div class=${styles.secondLine}>
      <span class=${styles.item}>
        <img src=${issueName === 'bug' ? importance : LEVER_ICON[data.level]} alt="priority" />
        <span style="color: ${LEVER_COLOR[data.level]}">${LevelNameMap[data.level]}</span>
      </span>
      <span class=${styles.item}>
        <img src=${estimate} alt="estimate" />
        ${calculateDwm(dwManpower.estimate || 0)}人天
      </span>
      <span class=${styles.item}>
        <span class=${styles[issueColorMap[data.state]]}></span>
        ${issueNameMap[data.state]}
      </span>
    </div>
  </div>
    <div class=${styles.thirdLine}>
       <span>
         ${getIssueCount(issueParentArr)}
       </span>
      <span class=${(!!issueParentArr.length && !!issueRelationArr.length) ? styles.divider : '' }></span>
       <span>
       ${getIssueCount(issueRelationArr)}
       </span>
    </div>
  </div>
  `;
}

function getClassifyCard(data) {
  return `
  <div class=${styles.issueClassifyCard}>
  ${data.name}
 </div>`;
}

export {
  getIssueCard,
  getClassifyCard,
};
