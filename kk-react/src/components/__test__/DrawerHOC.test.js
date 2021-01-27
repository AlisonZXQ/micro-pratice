import React from 'react';
import { mount } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import DrawerHOC from '../DrawerHOC';

describe('DrawerHOC', () => {
  mountTest(DrawerHOC);

  const setup = () => {
    const mountWrapper = mount(<DrawerHOC />);

    return {
      mountWrapper,
    }
  }

  test('DrawerHOC should contain Drawer', () => {
    const { mountWrapper } = setup();
    expect(mountWrapper).toMatchSnapshot();
  })
})
