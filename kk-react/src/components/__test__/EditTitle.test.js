import React from 'react';
import { mount, shallow } from 'enzyme';
import { Input } from 'antd';
import mountTest from '@tests/shared/mountTest';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import MyIcon from '@components/MyIcon';
import EditTitle from '../EditTitle';

describe('EditTitle', () => {
  mountTest(EditTitle, null, { value: 'zhangxueqing01@corp.netease.com' });

  const setup = (props) => {
    const shallowWrapper = shallow(<EditTitle {...props} />)
    const mountWrapper = shallow(<EditTitle {...props} />)

    return {
      shallowWrapper,
      mountWrapper
    }
  }

  describe('has manage role', () => {
    const callback = jest.fn();

    const { shallowWrapper, mountWrapper } = setup({
      issueRole: ISSUE_ROLE_VALUE_MAP.MANAGE,
      handleSave: callback,
    });
    const instance = mountWrapper.instance();
    it('edit state should change when we click editIcon', () => {
      expect(instance.state.edit).toBe(false);
      mountWrapper.find(MyIcon).simulate('click', { stopPropagation: jest.fn() });
      expect(instance.state.edit).toBe(true);
    })

    it('when edit there should be input, check and close element', () => {
      expect(mountWrapper.find(Input).at(0)).toBeDefined();
      expect(mountWrapper.find(Icon).exists()).toBeDefined();
    })

    it('when input testValue and click check icon handleSave function should be called with testValue', () => {
      mountWrapper.find(Input).simulate('change', { target: { value: 'testValue' } })
      mountWrapper.find('.checkButton').at(0).simulate('click', { stopPropagation: jest.fn() })
      expect(callback).toHaveBeenCalledWith('testValue');
    })
  })

  it('when issueRole is read then we can not edit', () => {
    const { mountWrapper } = setup({ issueRole: ISSUE_ROLE_VALUE_MAP.READ });
    expect(mountWrapper.find(MyIcon).exists()).toBe(false);
  })
})
