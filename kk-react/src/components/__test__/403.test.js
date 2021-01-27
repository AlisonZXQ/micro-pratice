import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import NoPermission from '../403';

describe('403', () => {
  mountTest(NoPermission);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<NoPermission />);
    expect(shallowWrapper).toMatchSnapshot();
  });

  it('should have div', () => {
    const shallowWrapper = shallow(<NoPermission />);
    expect(shallowWrapper.find('div').exists()).toBe(true);
  });

  it('should have 4 div tags', () => {
    const shallowWrapper = shallow(<NoPermission />);
    expect(shallowWrapper.find('div').length).toBe(4)
  });

  it('should have h1 tags and its name 403', () => {
    const shallowWrapper = shallow(<NoPermission />);
    expect(shallowWrapper.find('h1').text()).toBe('403')
  });
})

