import React from 'react';
import { mount, shallow } from 'enzyme';
import { Dropdown, Menu } from 'antd';
import mountTest from '@tests/shared/mountTest';
import DefineDot from '@components/DefineDot';
import { TASK_STATUS_MAP } from '@shared/TaskConfig';
import { ISSUE_ROLE_VALUE_MAP } from '@shared/CommonConfig';
import EditSelectStatus from '../EditSelectStatus';

describe('EditSelectStatus', () => {
  mountTest(EditSelectStatus, null, { type: 'task', value: TASK_STATUS_MAP.NEW });

  const setup = ({ ...props }) => {
    const mountWrapper = mount(
      <EditSelectStatus {...props} value={TASK_STATUS_MAP.NEW} type="task" />
    );
    return {
      mountWrapper,
    };
  };

  it('when issueRole is manage and edit then we can edit', () => {
    const { mountWrapper } = setup({ issueRole: ISSUE_ROLE_VALUE_MAP.MANAGE });
    expect(mountWrapper.find(Dropdown).exists()).toBe(true);
    expect(mountWrapper.find(DefineDot).exists()).toBe(true);
  })

  it('when issueRole is manage and edit when we click dropdown there should be menu list', () => {
    const callback = jest.fn();
    const { mountWrapper } = setup({ issueRole: ISSUE_ROLE_VALUE_MAP.MANAGE, handleUpdate: callback });
    expect(mountWrapper.find(Menu).exists()).toBe(false);

    mountWrapper.find(Dropdown).simulate('click');
    expect(mountWrapper.find(Menu).exists()).toBe(true);
    mountWrapper.find('.m-item').at(0).simulate('click');
    expect(callback).toHaveBeenCalledWith(TASK_STATUS_MAP.NEW);
  })

  it('when issueRole is read then we can not edit', () => {
    const { mountWrapper } = setup({ issueRole: ISSUE_ROLE_VALUE_MAP.READ });
    expect(mountWrapper.find(Dropdown).exists()).toBe(false);
    expect(mountWrapper.find(DefineDot).exists()).toBe(true);
  })
})
