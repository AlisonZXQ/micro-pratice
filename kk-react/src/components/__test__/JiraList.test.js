import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import { ISSUE_TYPE_JIRA_MAP } from '@shared/ReceiptConfig';
import JiraList from '../JiraList';

describe('JiraList', () => {
  const connectProps = { form: { getFieldValue: jest.fn() } };
  mountTest(JiraList, null, { ...connectProps });

  const setup = (props) => {
    const mountWrapper = mount(<JiraList {...props} {...connectProps} />);
    return {
      mountWrapper
    }
  }

  it('when issuetype is REQUIREMENT', () => {
    const { mountWrapper } = setup({ issuetype: ISSUE_TYPE_JIRA_MAP.REQUIREMENT });
    expect(mountWrapper.contains(<span>从已有JIRA需求单中选择</span>)).toBe(true);
  })

  it('when issuetype is OBJECTIVE', () => {
    const { mountWrapper } = setup({ issuetype: ISSUE_TYPE_JIRA_MAP.OBJECTIVE });
    expect(mountWrapper.contains(<span>从已有JIRA目标单中选择</span>)).toBe(true);
  })

  it('when issuetype is TASK', () => {
    const { mountWrapper } = setup({ issuetype: ISSUE_TYPE_JIRA_MAP.TASK });
    expect(mountWrapper.contains(<span>从已有JIRA任务/子任务单中选择</span>)).toBe(true);
  })

  it('when issuetype is SUBTASK', () => {
    const { mountWrapper } = setup({ issuetype: ISSUE_TYPE_JIRA_MAP.SUBTASK });
    expect(mountWrapper.contains(<span>从已有JIRA任务/子任务单中选择</span>)).toBe(true);
  })

  it('when issuetype is BUG', () => {
    const { mountWrapper } = setup({ issuetype: ISSUE_TYPE_JIRA_MAP.BUG });
    expect(mountWrapper.contains(<span>从已有JIRA缺陷单中选择</span>)).toBe(true);
  })
})
