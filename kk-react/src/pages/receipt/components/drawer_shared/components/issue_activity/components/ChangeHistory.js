import React, { useEffect } from 'react';
import { connect } from 'dva';
import AdviseHistory from '@pages/receipt/advise/advise_detail/components/history/components/ChangeHistory';
import RequirementHistory from '@pages/receipt/requirement/requirement_detail/components/history/components/ChangeHistory';
import ObjectiveHistory from '@pages/receipt/objective/objective_detail/components/history/components/ChangeHistory';
import TaskHistory from '@pages/receipt/task/task_detail/components/history/components/ChangeHistory';
import BugHistory from '@pages/receipt/bug/bug_detail/components/history/components/ChangeHistory';
import TicketHistory from '@pages/receipt/ticket/ticket_detail/components/history/components/ChangeHistory';

function Index(props) {
  const { type, id } = props;

  let Com;
  if (type === 'advise') {
    Com = AdviseHistory;
  } else if (type === 'requirement') {
    Com = RequirementHistory;
  } else if (type === 'objective') {
    Com = ObjectiveHistory;
  } else if (type === 'bug') {
    Com = BugHistory;
  } else if (type === 'task' || type === 'subTask') {
    Com = TaskHistory;
  } else if (type === 'ticket') {
    Com = TicketHistory;
  }

  useEffect(() => {
    if (type === 'advise') {
      props.dispatch({ type: 'advise/getAdviseHistory', payload: { adviseid: id } });
    } else if (type === 'requirement') {
      props.dispatch({ type: 'requirement/getReqHistory', payload: { requirementid: id } });
    } else if (type === 'objective') {
      props.dispatch({ type: 'objective/getObjectiveHistory', payload: { objectiveid: id } });
    } else if (type === 'task' || type === 'subTask') {
      props.dispatch({ type: 'task/getTaskHistory', payload: { taskid: id } });
    } else if (type === 'bug') {
      props.dispatch({ type: 'bug/getBugHistory', payload: { bugid: id } });
    } else if (type === 'ticket') {
      props.dispatch({ type: 'ticket/getTicketHistory', payload: { ticketId: id } });
    }
  }, [id, type]);

  return (<>
    <Com history={props[`${type}History`] || []} />
  </>);
}

const mapStateToProps = (state) => {
  return {
    adviseHistory: state.advise.adviseHistory,
    requirementHistory: state.requirement.reqHistory,
    objectiveHistory: state.objective.objectiveHistory,
    bugHistory: state.bug.bugHistory,
    taskHistory: state.task.taskHistory,
    subTaskHistory: state.task.taskHistory,
    ticketHistory: state.ticket.ticketHistory,
  };
};

export default connect(mapStateToProps)(Index);
