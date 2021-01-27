import React from 'react';
import { mount, shallow } from 'enzyme';
import { Badge } from 'antd';
import mountTest from '@tests/shared/mountTest';
import { requirementNameMap, requirementColorDotMap } from '@shared/CommonConfig';
import { REQUIREMENT_STATUS_MAP } from '@shared/RequirementConfig';;
import { jiraStatusMap } from '@shared/ProjectConfig';
import DefineDot from '../index';

describe('DefineDot', () => {
  mountTest(DefineDot);

  const props = {
    statusMap: requirementNameMap,
    statusColor: requirementColorDotMap,
  }

  it('should have badge', () => {
    const shallowed = shallow(<DefineDot />);
    expect(shallowed.find(Badge).exists()).toBe(true);
  })

  it('pass new or reopen status should has ant-badge-status-success className', () => {
    const mounted = mount(
      <DefineDot
        text={REQUIREMENT_STATUS_MAP.NEW}
        {...props}
      />);
    expect(mounted.find('span').at(3).hasClass('ant-badge-status-success')).toBe(true);
  })

  it('pass todo status should has ant-badge-status-processing className', () => {
    const mounted = mount(
      <DefineDot
        text={REQUIREMENT_STATUS_MAP.DEVELOPMENT}
        {...props}
      />);
    expect(mounted.find('span').at(3).hasClass('ant-badge-status-processing')).toBe(true);
  })

  it('pass close status should has ant-badge-status-default className', () => {
    const mounted = mount(
      <DefineDot
        text={REQUIREMENT_STATUS_MAP.CLOSE}
        {...props}
      />);
    expect(mounted.find('span').at(3).hasClass('ant-badge-status-default')).toBe(true);
  })

  it('when statusMap do not exist should pass displayText argument', () => {
    const mounted = mount(
      <DefineDot
        text={'开始'}
        displayText={'开始'}
        statusColor={jiraStatusMap}
      />);
    expect(mounted.find('span').at(5).text()).toBe('开始');
  })
})
