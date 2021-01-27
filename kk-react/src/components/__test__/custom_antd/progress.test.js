import React from 'react';
import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import Progress from '../../CustomAntd/progress';

describe('progress', () => {
  mountTest(Progress);

  it('should snapshot correctly', () => {
    const shallowWrapper = shallow(<Progress />);
    expect(shallowWrapper).toMatchSnapshot();
  });
})

