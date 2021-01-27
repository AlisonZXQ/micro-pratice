import React from 'react';
import { mount, shallow } from 'enzyme';
import { Dropdown, Menu } from 'antd';
import configureStore from 'redux-mock-store';
import mountTest from '@tests/shared/mountTest';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import EditSelectUser from '../EditSelectUser';

describe('EditSelectUser', () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({
    receipt: {},
    product: {
      lastProduct: {
        id: 1
      }
    },
    advise: {},
    bug: {},
    task: {},
    requirement: {},
    objective: {},
    user: {},
  });
  mountTest(EditSelectUser, store, { value: 'zhangxueqing01@corp.netease.com' });

  const setup = (props) => {

    const mountWrapper = mount(
      <EditSelectUser store={store} {...props} />
    );
    return {
      mountWrapper,
    };
  };

  it('when issueRole is manage and edit then we can edit', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({
      issueRole: ISSUE_ROLE_VALUE_MAP.MANAGE,
      handleSearch: callback,
    });
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    expect(mountWrapper.find(Menu).exists()).toBe(false);
    mountWrapper.find(Dropdown).simulate('click');
    expect(mountWrapper.find(Menu).exists()).toBe(true);
    mountWrapper.find('input').simulate('change', { target: { value: 'test' }});
    expect(callback).toHaveBeenCalledWith('test');
  })

  it('when issueRole is read then we can not edit', () => {
    const { mountWrapper } = setup({ issueRole: ISSUE_ROLE_VALUE_MAP.READ });
    expect(mountWrapper.find(Dropdown).exists()).toBe(false);
  })
})
