import React from 'react';
import { mount, shallow } from 'enzyme';
import { Cascader } from 'antd';
import mountTest from '@tests/shared/mountTest';
import MyIcon from '@components/MyIcon';
import FilterCascader from '../FilterCascader';

describe('FilterCascader', () => {
  mountTest(FilterCascader, null, {});

  const setup = (props) => {
    const mountWrapper = shallow(<FilterCascader {...props} />)

    return {
      mountWrapper
    }
  }

  it('should contains Cascader', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find(Cascader).exists()).toBe(true);
  })

  it('when defaultData does not exists there should be no clear icon', () => {
    const { mountWrapper } = setup({});
    expect(mountWrapper.find('.closeIcon').exists()).toBe(false);
  })

  it('when defaultData exists there should be clear icon', () => {
    const { mountWrapper } = setup({ defaultData: [{ id: '1', name: '节点一' }] });
    expect(mountWrapper.find('.closeIcon').exists()).toBe(true);
  })

  it('when click Cascader updateFilter should be called with data', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({ updateFilter: callback });
    mountWrapper.find(Cascader).simulate('change', { value: 1, name: 'test' })
    expect(callback).toHaveBeenCalledWith({ value: 1, name: 'test' });
  })
})
