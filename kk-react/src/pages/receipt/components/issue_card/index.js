import React from 'react';
import { connect } from 'dva';
import { Popover, Divider } from 'antd';
import EpIcon from '@components/EpIcon';
import MyIcon from '@components/MyIcon';
import DefineDot from '@components/DefineDot';
import { nameMap, colorDotMap } from '@shared/CommonConfig';
import { BUG_LEVER_NAME } from '@shared/BugConfig';
import { LEVER_NAME, ISSUE_TYPE_NAME_MAP, issueParentMap, issueRelationMap, issueTextColorMap, LEVER_ICON, LEVER_COLOR } from '@shared/ReceiptConfig';
import { calculateDwm } from '@utils/helper';
import styles from './index.less';

function Index(props) {

  const { data, className, style } = props;
  const responseUser = data.responseUser || {};
  const dwManpower = data.dwManpower || {};
  const name = responseUser.name;
  const lastTwoWord = name && name.slice(name.length - 2);
  const issueName = ISSUE_TYPE_NAME_MAP[data.issueType];
  const issueParentArr = issueParentMap[issueName] || [];
  const issueRelationArr = issueRelationMap[issueName] || [];
  const LevelNameMap = issueName === 'bug' ? BUG_LEVER_NAME : LEVER_NAME;
  const estimate = `${calculateDwm(dwManpower.estimate || 0)}人天`;

  const getRelateIssue = (arr) => {
    return arr.map(item => <span className={styles.epIcon}>
      <EpIcon type={item} className={styles.icon} />
      <span style={{ color: issueTextColorMap[item] }}>{data[`${item}Count`] || 0}</span>
    </span>);
  };

  return (<span className={`${styles.container} ${className}`} style={style}>
    <div style={{ padding: '6px' }}>
      <div className={`f-jcsb-aic ${styles.firstLine}`}>
        <span className={styles.left}>
          <EpIcon type={issueName} className={styles.icon} />
          <Popover
            content={data.name}
          >
            <span className={`f-ib f-toe ${styles.leftName}`}>
              {data.name}
            </span>
          </Popover>
        </span>
        <span className={styles.right}>
          <span className={styles.name}>{lastTwoWord}</span>
        </span>
      </div>

      <div>
        <span className="u-mgr10">
          <MyIcon type={issueName === 'bug' ? 'icon-jinjichengdu' : LEVER_ICON[data.level]} className={styles.icon} />
          <span style={{ color: issueName === 'bug' ? '' : LEVER_COLOR[data.level]}}>{LevelNameMap[data.level]}</span>
        </span>
        <span className="u-mgr10">
          <MyIcon type="icon-yugugongshi" className={styles.icon} />
          {estimate}
        </span>
        <span style={{ position: 'relative', top: '-1px' }}>
          <DefineDot
            text={data.state}
            statusMap={nameMap[issueName]}
            statusColor={colorDotMap[issueName]}
          />
        </span>

      </div>
    </div>

    <div className={`${styles.thirdLine}`} >
      <span>{getRelateIssue(issueParentArr)}</span>
      {
        !!issueParentArr.length && !!issueRelationArr.length &&
        <span>
          <Divider type="vertical" />
        </span>
      }
      <span>{getRelateIssue(issueRelationArr)}</span>

    </div>
  </span>);
}

export default connect()(Index);
