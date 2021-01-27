import React from 'react';
import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import MyIcon from '@components/MyIcon';

describe('MyIcon', () => {
  mountTest(MyIcon);

  it('should has test class', () => {
    const mountWrapper = mount(<MyIcon className="test" />);
    expect(mountWrapper.hasClass('test')).toBe(true);
  })
})
