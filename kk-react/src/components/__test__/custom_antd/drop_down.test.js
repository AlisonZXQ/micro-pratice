import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import DropDown from '../../CustomAntd/drop_down';

describe('drop_down', () => {
  mountTest(DropDown);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<DropDown />);
    expect(shallowWrapper).toMatchSnapshot();
  });
})

