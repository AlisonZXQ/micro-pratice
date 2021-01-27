import React, { useEffect } from 'react';
import { connect } from 'dva';
import { issueTypeMap } from '@shared/ReceiptConfig';
import Advise from './advise';
import Requirement from './requirement';
import Objective from './objective';
import Bug from './bug';
import Task from './task';
import Ticket from './ticket';
import styles from './index.less';

function Index(props) {
  const { issueId } = props;
  const issueArr = issueId && issueId.split('-');
  const type = issueTypeMap[issueArr[0]];

  useEffect(() => {
    if (document.querySelector(".drawerBodyTop")) {
      document.querySelector(".drawerBodyTop").scrollIntoView();
    }
  }, [issueId]);

  return (<div className={styles.outContainer}>
    {
      type === 'advise' && <Advise {...props} type={type} />
    }
    {
      type === 'requirement' && <Requirement {...props} type={type} />
    }
    {
      type === 'objective' && <Objective {...props} type={type} />
    }
    {
      type === 'bug' && <Bug {...props} type={type} />
    }
    {
      (type === 'task' || type === 'subTask') && <Task {...props} type={type} />
    }
    {
      type === 'ticket' && <Ticket {...props} type={type} />
    }
  </div>);
}

const mapStateToProps = (state) => {
  return {
    issueId: state.receipt.drawerIssueId,
  };
};

export default connect(mapStateToProps)(Index);
