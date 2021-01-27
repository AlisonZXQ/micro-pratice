import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import sinon from 'sinon';
import mountTest from '@tests/shared/mountTest';
import Rates from '../Rates';

describe('Rates', () => {
  mountTest(Rates);

  const setup = (props) => {
    const mountWrapper = mount(<Rates {...props} />);
    return {
      mountWrapper
    }
  }
  it('rates should be change correctly', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({ total: 10, onChange: callback });
    const instance = mountWrapper.instance();
    expect(mountWrapper.find('.unSelect').length).toBe(10);
    expect(instance.state.current).toBe(0);
    mountWrapper.find('.unSelect').at(1).simulate('click');
    expect(instance.state.current).toBe(2);
    expect(callback).toHaveBeenCalledWith(2)
  })
})
