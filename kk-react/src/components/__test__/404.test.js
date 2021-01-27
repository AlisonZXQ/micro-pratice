import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import NotFound from '../404';

describe('404', () => {
  mountTest(NotFound);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<NotFound />);
    expect(shallowWrapper).toMatchSnapshot();
  });

  it('should have div', () => {
    const shallowWrapper = shallow(<NotFound />);
    expect(shallowWrapper.find('div').exists()).toBe(true);
  });

  it('should have 4 div tags', () => {
    const shallowWrapper = shallow(<NotFound />);
    expect(shallowWrapper.find('div').length).toBe(4)
  });
})

