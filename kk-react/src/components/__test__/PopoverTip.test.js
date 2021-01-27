import { shallow } from 'enzyme';
import mountTest from '@tests/shared/mountTest';
import { Popover } from 'antd';
import PopoverTip from '../PopoverTip';

describe('PopoverTip', () => {
  mountTest(PopoverTip);

  it('when content is test PopoverTip content should be test', () => {
    const shallowWrapper = shallow(<PopoverTip content='test' />)
    expect(shallowWrapper.find(Popover).prop('content')).toBe('test');
  })

})
