import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import Error from '@components/Error';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {

  mountTest(ErrorBoundary, null, { children: <span>test</span> });

  it('first hasError should be false', () => {
    const shallowWrapper = shallow(<ErrorBoundary children={<span>test</span>} />);
    const instance = shallowWrapper.instance();
    expect(instance.state.hasError).toBe(false);
    expect(shallowWrapper.find(Error).exists()).toBe(false);
  })

  it('when change hasError state there shoud has Error Component', () => {
    const shallowWrapper = shallow(<ErrorBoundary children={<span>test</span>} />);
    const instance = shallowWrapper.instance();
    expect(instance.state.hasError).toBe(false);
    instance.setState({ hasError: true })
    expect(instance.state.hasError).toBe(true);
    expect(shallowWrapper.find(Error).exists()).toBe(true);
  })
})
