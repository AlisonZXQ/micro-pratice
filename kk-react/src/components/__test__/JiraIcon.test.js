import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import { issueJiraIconMap } from '@shared/ReceiptConfig';
import JiraIcon from '../JiraIcon';

describe('JiraIcon', () => {
  mountTest(JiraIcon);

  const setup = (props) => {
    const shallowWrapper = shallow(<JiraIcon {...props} />);

    return {
      shallowWrapper,
    }
  }

  it('type is requirement', () => {
    const { shallowWrapper } = setup({ type: 'requirement' });
    expect(shallowWrapper.prop('type')).toEqual(issueJiraIconMap['requirement']);
  })

  it('type is task', () => {
    const { shallowWrapper } = setup({ type: 'task' });
    expect(shallowWrapper.prop('type')).toEqual(issueJiraIconMap['task']);
  })
  it('type is subTask', () => {
    const { shallowWrapper } = setup({ type: 'subTask' });
    expect(shallowWrapper.prop('type')).toEqual(issueJiraIconMap['subTask']);
  })
  it('type is objective', () => {
    const { shallowWrapper } = setup({ type: 'objective' });
    expect(shallowWrapper.prop('type')).toEqual(issueJiraIconMap['objective']);
  })
  it('type is advise', () => {
    const { shallowWrapper } = setup({ type: 'advise' });
    expect(shallowWrapper.prop('type')).toEqual(issueJiraIconMap['feature']);
  })

})
