import { mount } from 'enzyme';
import { DatePicker } from 'antd';
import moment from 'moment';
import mountTest from '@tests/shared/mountTest';
import YearPicker from '../YearPicker';

describe('YearPicker', () => {

  mountTest(YearPicker);
  const setup = () => {
    const today = moment().format('YYYY-MM-DD');
    const mountWrapper = mount(<YearPicker />);
    return {
      mountWrapper,
      today
    }
  }

  it('should contain DatePicker', () => {
    const { mountWrapper, today } = setup({});
    expect(mountWrapper.find(DatePicker).exists()).toBe(true);
    expect(mountWrapper.find(DatePicker).prop('value').format('YYYY-MM-DD')).toEqual(today);
  })

  it('when simulate change action then time should be null', () => {
    const { mountWrapper, today } = setup({});
    expect(mountWrapper.find(DatePicker).simulate('change').prop('value').format('YYYY-MM-DD')).toBe(today);
  })
})
