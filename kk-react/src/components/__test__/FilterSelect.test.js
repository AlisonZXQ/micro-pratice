import React from 'react';
import { mount, shallow } from 'enzyme';
import { Dropdown, Popover } from 'antd';
import configureStore from 'redux-mock-store';
import mountTest from '@tests/shared/mountTest';
import MyIcon from '@components/MyIcon';
import { FilterSelect } from '../FilterSelect';

describe('FilterCascader', () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({
    createProject: {}
  });
  mountTest(FilterSelect, store, {});

  const setup = (props) => {
    const mountWrapper = mount(<FilterSelect store={store} {...props} dispatch={jest.fn()}/>)

    return {
      mountWrapper
    }
  }

  it('should contains Dropdown', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
  })

  it('when readOnly is true there should be Popover', () => {
    const { mountWrapper } = setup({ readOnly: true });
    expect(mountWrapper.find(Popover).exists()).toBe(true);
  })

  it('when readOnly is false there should not be Popover and could be change selections', () => {
    const onChangeCallback = jest.fn();
    const { mountWrapper } = setup({
      readOnly: false,
      onChange: onChangeCallback,
      dataSource: [{ value: 1, label: '选项一' }, { value: 2, label: '选项二' }],
      defaultValue: [1]
    });
    const instance = mountWrapper.instance();
    expect(mountWrapper.find(Popover).exists()).toBe(false);
    expect(mountWrapper.find(Icon).exists()).toBe(true);
    expect(instance.state.selectArr).toEqual([1]);
    mountWrapper.find('.u-icon-close').simulate('click', { stopPropagation: jest.fn() })
    expect(instance.state.selectArr).toEqual([]);
    expect(onChangeCallback).toHaveBeenCalledWith([]);

    mountWrapper.find(Dropdown).simulate('click')
    mountWrapper.find('a').at(0).simulate('click', { stopPropagation: jest.fn() })
    expect(instance.state.selectArr).toEqual([1, 2]);
    expect(onChangeCallback).toHaveBeenCalledWith([1, 2]);
  })

})
