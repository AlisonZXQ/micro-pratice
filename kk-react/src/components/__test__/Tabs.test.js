import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import { Badge } from 'antd';
import Tabs from '../Tabs';

describe('Tabs', () => {
  mountTest(Tabs);

  const setup = (props) => {
    const mountWrapper = mount(<Tabs {...props} />);
    return {
      mountWrapper
    }
  }

  it('div count should be equals to tabsData', () => {
    const { mountWrapper } = setup({ tabsData: [{ key: 1, name: 'tab1' }, { key: 2, name: 'tab2', badge: 10 }] });
    expect(mountWrapper.find('.tabTodo').length).toBe(2)
  })

  it('when click first div activeKey should be changed', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({
      tabsData: [{ key: 1, name: 'tab1' }, { key: 2, name: 'tab2', badge: 10 }],
      callback: callback,
    });
    const instance = mountWrapper.instance();
    expect(mountWrapper.find('.tabTodo').length).toBe(2)
    expect(instance.state.activeKey).not.toBeDefined()
    mountWrapper.find('.tabTodo').at(0).simulate('click')
    expect(mountWrapper.find('.tabTodo').length).toBe(1)
    expect(mountWrapper.find('.tabActive').length).toBe(1)
    expect(instance.state.activeKey).toBe(1)
    expect(callback).toBeCalledWith(1);
  })

  it('when has badge there should be badge', () => {
    const { mountWrapper } = setup({ tabsData: [{ key: 1, name: 'tab1' }, { key: 2, name: 'tab2', badge: 10 }] });
    expect(mountWrapper.find(Badge).exists()).toBe(true)
  })

  it('when has extra should display', () => {
    const { mountWrapper } = setup({
      tabsData: [{ key: 1, name: 'tab1' }, { key: 2, name: 'tab2', badge: 10 }],
      extra: <span>test</span>
    });
    expect(mountWrapper.contains(<span>test</span>)).toBe(true)
  })

  it('when nextProps.defaultKey change should callback setState', () => {
    const { mountWrapper } = setup({
      tabsData: [{ key: 1, name: 'tab1' }, { key: 2, name: 'tab2', badge: 10 }],
    });
    const instance = mountWrapper.instance();
    mountWrapper.setProps({ defaultKey: 2 });
    expect(instance.state.activeKey).toBe(2);
  })
})
