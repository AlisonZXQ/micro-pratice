import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import { issueEpIconMap } from '@shared/ReceiptConfig';
import EpIcon from '../EpIcon';

describe('EpIcon', () => {
  mountTest(EpIcon);

  const setup = (props) => {
    const shallowWrapper = shallow(<EpIcon {...props} />);

    return {
      shallowWrapper,
    }
  }

  it('type is requirement', () => {
    const { shallowWrapper } = setup({ type: 'requirement' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['requirement']);
  })

  it('type is task', () => {
    const { shallowWrapper } = setup({ type: 'task' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['task']);
  })
  it('type is subTask', () => {
    const { shallowWrapper } = setup({ type: 'subTask' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['subTask']);
  })
  it('type is objective', () => {
    const { shallowWrapper } = setup({ type: 'objective' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['objective']);
  })
  it('type is advise', () => {
    const { shallowWrapper } = setup({ type: 'advise' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['advise']);
  })
  it('type is ticket', () => {
    const { shallowWrapper } = setup({ type: 'ticket' });
    expect(shallowWrapper.prop('type')).toEqual(issueEpIconMap['ticket']);
  })

})
