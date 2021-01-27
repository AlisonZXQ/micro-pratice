import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import BusinessHOC from '../BusinessHOC';

describe('BusinessHOC', () => {
  function Index() {
    return <span>test</span>
  }

  const Com = BusinessHOC()(Index)

  mountTest(Com);

  it('should contain Index and span value should be test', () => {
    const mountWrapper = mount(<Com />);
    const instance = mountWrapper.instance();
    expect(mountWrapper.find(Index).exists()).toBe(true);
    expect(mountWrapper.find('span').text()).toBe('test');
    expect(instance.state.isBusiness).toBe(false);
  })

  it('isBusiness value should be false when change setState isBusiness value should be change', () => {
    const mountWrapper = mount(<Com />);
    const instance = mountWrapper.instance();
    expect(instance.state.isBusiness).toBe(false);
    instance.setState({ isBusiness: true });
    expect(instance.state.isBusiness).toBe(true);
  })
})
