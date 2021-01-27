import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import Modal from '../../CustomAntd/modal';

describe('modal', () => {
  mountTest(Modal);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<Modal />);
    expect(shallowWrapper).toMatchSnapshot();
  });
})

