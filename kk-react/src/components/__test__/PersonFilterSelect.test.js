import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { Dropdown, Checkbox } from 'antd';
import PersonFilterSelect from '@components/PersonFilterSelect';
import mountTest from '@tests/shared/mountTest';

describe('PersonFilterSelect', () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({
    createProject: {},
    user: {
      currentUser: {
        id: 1,
        name: '张雪晴',
        email: 'xxx'
      }
    }
  })
  const setup = (props) => {
    const mountWrapper = mount(<PersonFilterSelect store={store} {...props} />);
    return {
      mountWrapper
    }
  }
  mountTest(PersonFilterSelect, store, { orderFieldData: [] });

  it('should has Dropdown and can select or cancel', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    mountWrapper.find(Dropdown).simulate('click')
  })
})
