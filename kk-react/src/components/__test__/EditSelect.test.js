import React from 'react';
import { mount } from 'enzyme';
import { Dropdown } from 'antd';
import mountTest from '@tests/shared/mountTest';
import EditSelect from '../EditSelect/index';

describe('EditSelect', () => {
  mountTest(EditSelect);

  const setup = ({ ...props }) => {
    const wrapper = mount(<EditSelect {...props} />);
    return {
      props,
      wrapper,
    };
  };

  it('should contains Dropdown', () => {
    const { wrapper } = setup({});
    console.log('wrapper', wrapper.instance());
    expect(wrapper.find(Dropdown).exists()).toBe(true);
  })

  it('state and action should render and work correctly', () => {
    const { wrapper } = setup({})
    expect(wrapper.instance().state.isBusiness).toBe(false)
  })

  it('dropdown menu exist after click the dorpdown', () => {
    const { wrapper } = setup({})
    expect(wrapper.find('.ant-dropdown-menu').exists()).toBe(false);
    wrapper.find(Dropdown).simulate('click');
    expect(wrapper.find('.ant-dropdown-menu').exists()).toBe(true);
  })
})
