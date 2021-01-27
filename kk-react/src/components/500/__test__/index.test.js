import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import Error from '../index';

describe('500', () => {
  mountTest(Error);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<Error />);
    expect(shallowWrapper).toMatchSnapshot();
  });

  it('should have div', () => {
    const shallowWrapper = shallow(<Error />);
    expect(shallowWrapper.find('div').exists()).toBe(true);
  });

  it('should have 4 div tags', () => {
    const shallowWrapper = shallow(<Error />);
    expect(shallowWrapper.find('div').length).toBe(4)
  });
})

